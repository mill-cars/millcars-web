import React from 'react';
import { Quote } from 'lucide-react';

interface QuoteCardProps {
  author: string;
  quote: string;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ author, quote }) => (
  <div className="rounded-2xl bg-surface-container-low p-6 shadow-sm flex flex-col items-center">
    <Quote className="text-primary w-6 h-6 mb-2" />
    <blockquote className="italic text-on-surface-variant text-center mb-2">“{quote}”</blockquote>
    <div className="text-xs font-bold uppercase tracking-[0.2em] text-outline">{author}</div>
  </div>
);
