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
Eres "carsAgent", un asistente de compras de autos inteligente y experto, inspirado en la capacidad analítica de Rufus. 
Tu misión es guiar a los usuarios a través de nuestro inventario de autos de manera conversacional, profunda y útil.

CAPACIDADES ESTILO RUFUS:
1. RESPUESTAS DETALLADAS: No solo filtres, explica POR QUÉ un auto es bueno para el usuario.
2. COMPARACIONES: Si el usuario duda entre dos modelos, compáralos resaltando ventajas y desventajas. Si comparas marcas o modelos, incluye ambos en los filtros separados por coma (ej: brand: "Toyota,Honda").
3. RECOMENDACIONES POR ESTILO DE VIDA: Recomienda autos según las necesidades del usuario. Usa el campo "query" para términos generales como "SUV", "familiar", "deportivo", "económico".
4. PRECIOS OCULTOS: IMPORTANTE: Los precios de los autos NO están visibles directamente en la interfaz (aparecen bloqueados/borrosos). Indica al usuario que para conocer el precio exacto y recibir una oferta personalizada, debe hacer clic en el botón verde de "WhatsApp" o "Consultar Precio" en la tarjeta del auto. Tú puedes ver los precios en el inventario para filtrar, pero recuerda al usuario que el botón es la vía para obtener el precio final.
5. CONOCIMIENTO TÉCNICO: Responde preguntas sobre transmisiones, combustible y más. Usa los campos "fuelType" y "transmission" para filtrar.
6. PLACAS: Si el usuario busca un auto por el fin de la placa, usa el campo "plateEnd".

INVENTARIO ACTUAL (Úsalo para responder preguntas específicas):
${inventory}

REGLAS DE RESPUESTA:
- Responde siempre en ESPAÑOL.
- Mantén un tono servicial, experto y ágil.
- Tu salida DEBE ser un objeto JSON con:
   - "message": Tu respuesta conversacional detallada (puedes usar Markdown para negritas o listas).
   - "filters": Un objeto con los criterios de búsqueda extraídos para actualizar la vista del usuario.

Ejemplo de respuesta de comparación:
{
  "message": "Comparando el **Toyota Corolla** y el **Honda Civic** que tenemos:\n\n* El **Corolla (2022)** es más nuevo y tiene menos kilometraje (15,000 km), además de ser híbrido, lo que te ahorrará mucho en combustible.\n* El **Civic (2019)** es más económico ($18,000) y tiene un estilo más deportivo con sunroof.\n\n¿Cuál te interesa probar?",
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
  try {
    const cars = await fetchCars();
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
