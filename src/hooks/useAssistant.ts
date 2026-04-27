import { useState } from 'react';
import { Car, Message, SearchFilters } from '../types';
import { chatWithAgent } from '../services/gemini';
import { filterCarsByFilters, countActiveFilters } from '../lib/utils';

export const PRICE_POLICY_MESSAGE = `
*Nota: Los precios indicados son referenciales y están sujetos a verificación de disponibilidad y condiciones de financiamiento. Para recibir una cotización formal y conocer nuestras opciones de crédito vigentes, por favor contáctanos directamente a través del botón de WhatsApp.*
`.trim();

export const buildFiltersFromMentionedCars = (text: string, cars: Car[]): SearchFilters | null => {
  const normalizedText = text.toLowerCase();
  const mentionedCars = cars.filter(car => normalizedText.includes(`${car.brand} ${car.model}`.toLowerCase()));

  if (mentionedCars.length === 0) {
    return null;
  }

  const uniqueBrands = [...new Set(mentionedCars.map(car => car.brand))];
  const uniqueModels = [...new Set(mentionedCars.map(car => car.model))];

  return {
    brand: uniqueBrands.join(','),
    model: uniqueModels.join(','),
  };
};

export const buildConciseAssistantMessage = (cars: Car[]) => {
  const listedCars = cars.slice(0, 3);
  const lines = listedCars.map((car, index) => `${index + 1}. ${car.brand} ${car.model} (${car.year})`);
  return `${lines.join('\n')}\n\n${PRICE_POLICY_MESSAGE}`;
};

export const extractExplicitFiltersFromText = (text: string): Partial<SearchFilters> => {
  const normalized = text.toLowerCase();
  const explicitFilters: Partial<SearchFilters> = {};

  const maxPriceMatch = normalized.match(/(?:menos de|menor a|max(?:imo)?(?: de)?)\s*\$?\s*([\d.,]+)/i);
  if (maxPriceMatch?.[1]) {
    const parsed = Number(maxPriceMatch[1].replace(/[.,]/g, ''));
    if (!Number.isNaN(parsed) && parsed > 0) {
      explicitFilters.maxPrice = parsed;
    }
  }

  if (/\bautom[áa]tic[oa]s?\b/i.test(normalized)) {
    explicitFilters.transmission = 'automático';
  } else if (/\bmanual(?:es)?\b/i.test(normalized)) {
    explicitFilters.transmission = 'manual';
  }

  const yearMatches = [...normalized.matchAll(/\b(19|20)\d{2}\b/g)];
  if (yearMatches.length > 0) {
    const years = yearMatches.map(m => parseInt(m[0], 10));
    explicitFilters.minYear = Math.min(...years);
    explicitFilters.maxYear = Math.max(...years);
  }

  return explicitFilters;
};

export function useAssistant(carsData: Car[]) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [assistantAutoAdjusted, setAssistantAutoAdjusted] = useState(false);

  const clearFilters = () => {
    setFilters({});
    setMessages([]);
    setAssistantAutoAdjusted(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setInput('');
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatWithAgent(text, messages);

      const aiFilters = response.filters ?? {};
      let nextFilters = aiFilters;
      let adjustedByFallback = false;
      const resultsWithAiFilters = filterCarsByFilters(carsData, aiFilters);

      if (resultsWithAiFilters.length === 0) {
        const fallbackFilters = buildFiltersFromMentionedCars(response.message ?? '', carsData);
        if (fallbackFilters) {
          nextFilters = fallbackFilters;
          adjustedByFallback = true;
        } else if (countActiveFilters(aiFilters as object) > 0) {
          nextFilters = {};
          adjustedByFallback = true;
        }
      }

      // Enforce hard constraints explicitly written by the user
      const explicitFilters = extractExplicitFiltersFromText(text);
      nextFilters = { ...nextFilters, ...explicitFilters };

      let resultsForFinalFilters = filterCarsByFilters(carsData, nextFilters);

      // Final reconciliation
      if (resultsForFinalFilters.length === 0) {
        const finalFallbackFilters = buildFiltersFromMentionedCars(response.message ?? '', carsData);
        if (finalFallbackFilters) {
          const fallbackResults = filterCarsByFilters(carsData, finalFallbackFilters);
          if (fallbackResults.length > 0) {
            nextFilters = finalFallbackFilters;
            resultsForFinalFilters = fallbackResults;
            adjustedByFallback = true;
          }
        }
      }

      const assistantText =
        resultsForFinalFilters.length > 0
          ? buildConciseAssistantMessage(resultsForFinalFilters)
          : response.message;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: assistantText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
      setFilters(nextFilters);
      setAssistantAutoAdjusted(adjustedByFallback);
    } catch (error) {
      console.error(error);
      setAssistantAutoAdjusted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    filters,
    isLoading,
    input,
    setInput,
    assistantAutoAdjusted,
    handleSendMessage,
    clearFilters,
  };
}
