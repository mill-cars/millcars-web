import React, { useEffect, useRef, useId } from 'react';
// Material Icons reemplazan Lucide
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Message, SearchFilters } from '../types';
import { countActiveFilters } from '../lib/utils';

interface AssistantPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  input: string;
  onInputChange: (value: string) => void;
  filters: SearchFilters;
  clearFilters: () => void;
  mode?: 'desktop' | 'mobile' | 'embedded';
  onClose?: () => void;
}

const quickQuestions = [
  'SUV familiar automático menos de $15,000',
  'Pick-up 4x4 con bajo kilometraje',
  'Sedán económico para ciudad',
];

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  input,
  onInputChange,
  filters,
  clearFilters,
  mode = 'desktop',
  onClose,
}) => {
  const inputId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeFilterCount = countActiveFilters(filters as object);
  const hasActiveSearch = messages.length > 0 || activeFilterCount > 0;
  const visibleMessages = messages.slice(-2);
  const hiddenMessagesCount = Math.max(messages.length - visibleMessages.length, 0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const shellClass =
    mode === 'mobile'
      ? 'flex h-full min-h-0 flex-col bg-white'
      : mode === 'embedded'
        ? 'flex max-h-[calc(100vh-132px)] min-h-0 w-full flex-col overflow-hidden rounded-[1.9rem] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(17,28,45,0.08)]'
        : 'hidden h-screen flex-col border-r border-outline-variant/20 bg-white lg:flex lg:w-[336px] lg:sticky lg:top-0';
  const contentClass =
    mode === 'mobile'
      ? 'assistant-content flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f7f9fc_0%,#f3f6fb_100%)] p-4 lg:p-5'
      : mode === 'embedded'
        ? 'assistant-content overflow-y-auto bg-[linear-gradient(180deg,#f7f9fc_0%,#f3f6fb_100%)] p-4 lg:p-5'
      : 'assistant-content flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f7f9fc_0%,#f3f6fb_100%)] px-4 pb-4 pt-[94px] lg:px-5 lg:pb-5 lg:pt-[94px]';

  return (
    <section aria-label="Asistente de búsqueda" className={shellClass}>
      <div
        ref={scrollRef}
        className={contentClass}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <div className="space-y-4">
          <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-tertiary-fixed-dim" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-outline">Asistente IA</p>
                  <p className="text-sm font-semibold text-slate-900">Encuentra tu auto ideal</p>
                </div>
              </div>

              {mode === 'mobile' && onClose && (
                <button
                  type="button"
                  aria-label="Cerrar asistente"
                  onClick={onClose}
                  className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="rounded-[1.35rem] border border-primary/10 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-xl">filter_alt</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-outline">Filtros activos</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {activeFilterCount} criterio{activeFilterCount !== 1 ? 's' : ''} aplicado{activeFilterCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] font-black uppercase tracking-[0.25em] text-primary transition-colors hover:text-slate-900"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold tracking-tight text-slate-950">
                Encuentra autos más rápido
              </h3>
              <p className="text-[13px] leading-5 text-slate-500">
                Describe el auto que buscas o prueba una sugerencia:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => onSendMessage(question)}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md active:scale-[0.97]"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {hiddenMessagesCount > 0 && (
                <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500">
                  Mostrando la respuesta m&aacute;s reciente para mantener la lectura clara.
                </div>
              )}
              <AnimatePresence>
                {visibleMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-[1.1rem] p-3.5 text-sm shadow-sm ${
                        message.role === 'user'
                          ? 'rounded-br-md bg-primary text-on-primary'
                          : 'max-h-[260px] overflow-y-auto rounded-bl-md border border-slate-200 bg-white text-slate-900'
                      }`}
                    >
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-p:leading-6 prose-li:my-1 prose-li:leading-6 prose-strong:font-bold">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.15s' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline">Analizando...</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white p-4 lg:p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSendMessage(input);
          }}
          className="space-y-1"
        >
          <label className="block text-sm font-semibold text-slate-900" htmlFor={inputId}>
            Describe el vehículo que buscas
          </label>
          <div className="relative">
            <input
              id={inputId}
              type="text"
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="SUV familiar automático menos de $15,000"
              className="w-full rounded-[1.25rem] border border-outline-variant bg-surface-container-low px-4 py-3.5 pr-14 text-sm text-on-surface placeholder:text-outline/55 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none disabled:opacity-60"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-on-primary transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Enviar búsqueda"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
        </form>

      </div>
    </section>
  );
};
