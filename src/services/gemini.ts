import { GoogleGenAI, Type } from "@google/genai";
import { SearchFilters } from "../types";
import { fetchCars } from "./carsService";

const apiKey = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";

function createGenAI() {
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

function buildSystemInstruction(inventory: string) {
  return `
Eres el asistente de búsqueda de autos de Millcars.
Tu misión es guiar a los usuarios a través de nuestro inventario de autos de manera conversacional, profunda y útil.

CAPACIDADES ESTILO RUFUS:
1. RESPUESTAS DETALLADAS: No solo filtres, explica POR QUÉ un auto es bueno para el usuario.
2. COMPARACIONES: Si el usuario duda entre dos modelos, compáralos resaltando ventajas y desventajas. Si comparas marcas o modelos, incluye ambos en los filtros separados por coma (ej: brand: "Toyota,Honda").
3. RECOMENDACIONES POR ESTILO DE VIDA: Recomienda autos según las necesidades del usuario. Usa el campo "query" para términos generales como "SUV", "familiar", "deportivo", "económico".
4. PRECIOS Y CONTACTO (CRÍTICO):
   - NO publiques precios numéricos ni rangos de precios en el chat.
   - Si el usuario pregunta por precio, responde que debe iniciar sesión/registrarse para ver el precio o contactar por WhatsApp para confirmación y oferta.
   - Puedes usar el precio internamente para filtrar, pero no lo muestres.
5. CONOCIMIENTO TÉCNICO: Responde preguntas sobre transmisiones, combustible y más. Usa los campos "fuelType" y "transmission" para filtrar.
6. PLACAS: Si el usuario busca un auto por el fin de la placa, usa el campo "plateEnd".

INVENTARIO ACTUAL (Úsalo para responder preguntas específicas):
${inventory}

REGLAS DE RESPUESTA:
- Responde siempre en ESPAÑOL.
- Mantén un tono servicial, experto y ágil.
- NO INVENTES vehículos, versiones, disponibilidad ni precios. Solo menciona autos que estén en el INVENTARIO ACTUAL.
- Si el INVENTARIO ACTUAL está vacío o no contiene coincidencias, dilo explícitamente y pide 1-2 aclaraciones (presupuesto, año, transmisión, tipo de auto).
- Si encuentras autos en inventario, NO des descripciones amplias. Responde solo con una lista numerada corta (máximo 3) en formato:
  1. Marca Modelo (Año)
  2. Marca Modelo (Año)
- Después de la lista, conserva EXACTAMENTE este texto:
  "Respecto al precio, por políticas de seguridad y para brindarte la mejor oferta del día, te invito a iniciar sesión o registrarte en nuestro portal. También puedes contactarnos directamente por WhatsApp desde la tarjeta del vehículo para recibir atención inmediata de uno de nuestros asesores. ¿Te gustaría coordinar una visita para verla en persona?"
- Extrae todos los filtros relevantes del mensaje del usuario. Si menciona tipo de vehículo, uso, presupuesto o transmisión, intenta reflejarlo en "filters".
- Tu salida DEBE ser un objeto JSON con:
   - "message": Tu respuesta conversacional detallada (puedes usar Markdown para negritas o listas).
   - "filters": Un objeto con los criterios de búsqueda extraídos para actualizar la vista del usuario.

Ejemplo de respuesta de comparación:
{
  "message": "1. Toyota Corolla (2022)\n2. Honda Civic (2019)\n\nRespecto al precio, por políticas de seguridad y para brindarte la mejor oferta del día, te invito a iniciar sesión o registrarte en nuestro portal. También puedes contactarnos directamente por WhatsApp desde la tarjeta del vehículo para recibir atención inmediata de uno de nuestros asesores. ¿Te gustaría coordinar una visita para verla en persona?",
  "filters": { "brand": "Toyota,Honda" }
}
`;
}

export async function chatWithAgent(message: string, history: any[] = []) {
  const model = "gemini-3-flash-preview";

  const genAI = createGenAI();

  if (!genAI) {
    return {
      message: "El asistente IA no está configurado todavía. Define `GEMINI_API_KEY` en tu entorno para habilitar respuestas con Gemini.",
      filters: {}
    };
  }

  // Build the system instruction with real-time inventory from Supabase
  let inventoryJson = "[]";
  let inventoryCount = 0;
  try {
    const cars = await fetchCars();
    inventoryCount = cars.length;
    inventoryJson = JSON.stringify(
      cars.map(c => ({
        id: c.id,
        brand: c.brand,
        model: c.model,
        price: c.price,
        year: c.year,
        mileage: c.mileage,
        features: c.features,
        description: c.description,
      })),
      null,
      2
    );
  } catch {
    console.warn("[gemini] Could not fetch live inventory, agent will have no context.");
  }

  if (inventoryCount === 0) {
    return {
      message:
        "Ahora mismo no puedo acceder al inventario para darte modelos específicos. Dime 2–3 detalles (presupuesto, año aproximado y si lo quieres automático o manual) y te ayudo a armar la búsqueda.",
      filters: {}
    };
  }

  const systemInstruction = buildSystemInstruction(inventoryJson);

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: [
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            filters: {
              type: Type.OBJECT,
              properties: {
                brand: { type: Type.STRING, description: "Marca(s) separadas por coma" },
                model: { type: Type.STRING, description: "Modelo(s) separados por coma" },
                minPrice: { type: Type.NUMBER },
                maxPrice: { type: Type.NUMBER },
                minYear: { type: Type.NUMBER },
                maxYear: { type: Type.NUMBER },
                maxMileage: { type: Type.NUMBER },
                color: { type: Type.STRING },
                condition: { type: Type.STRING },
                plateEnd: { type: Type.NUMBER },
                owners: { type: Type.NUMBER },
                fuelType: { type: Type.STRING, description: "gasolina, diesel, eléctrico, híbrido" },
                transmission: { type: Type.STRING, description: "automático, manual" },
                query: { type: Type.STRING, description: "Búsqueda general (ej: SUV, familiar, deportivo)" }
              }
            }
          },
          required: ["message", "filters"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return data;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return {
      message: "Lo siento, tuve un problema técnico. ¿Podrías repetirme lo que buscas?",
      filters: {}
    };
  }
}
