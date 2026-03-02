import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Car as CarIcon } from 'lucide-react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden">
      {/* Header - Professional Style */}
      <div className="p-6 bg-gradient-to-br from-[#1a1a1a] to-black text-white border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* Icon Container */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-[#D00000] via-[#B00000] to-[#8B0000] flex items-center justify-center shadow-[0_8px_32px_rgba(208,0,0,0.4)] border border-white/10 backdrop-blur-sm">
              <CarIcon size={26} className="text-white drop-shadow-lg" strokeWidth={2.5} />
            </div>
            {/* Online Status Badge */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-3 border-black rounded-full shadow-lg">
              <div className="absolute inset-0.5 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl tracking-tight font-display mb-0.5">carsAgent</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold font-display">Asesor Virtual Disponible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gradient-to-b from-gray-50 to-white"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#D00000]/10 to-[#D00000]/5 flex items-center justify-center backdrop-blur-sm border border-black/5">
                <CarIcon size={42} className="text-[#D00000]" strokeWidth={2} />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Bot size={14} className="text-white" />
              </div>
            </motion.div>
            <div className="space-y-3">
              <h3 className="font-bold text-2xl text-black font-display tracking-tight">¿En qué puedo ayudarte?</h3>
              <p className="text-sm text-black/60 max-w-[280px] mx-auto font-medium leading-relaxed">
                Soy tu asesor experto. Cuéntame qué tipo de vehículo buscas y te ayudaré a encontrar las mejores opciones.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full max-w-[300px]">
              {[
                "¿Qué SUV recomiendas para familias?",
                "Compara el Corolla vs Civic",
                "Busco un auto con placa terminada en 4",
                "¿Tienen opciones híbridas?"
              ].map((q, i) => (
                <button 
                  key={i}
                  onClick={() => onSendMessage(q)}
                  className="text-xs font-semibold p-4 rounded-2xl border-2 border-black/5 bg-white hover:border-[#D00000] hover:bg-[#D00000]/5 hover:text-[#D00000] text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-black/70 group"
                >
                  <span className="block mb-1 text-[10px] uppercase tracking-wider text-black/40 font-bold group-hover:text-[#D00000]/70">
                    Pregunta rápida
                  </span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700' 
                  : 'bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10'
              }`}>
                {msg.role === 'user' ? (
                  <User size={16} className="text-white" strokeWidth={2.5} />
                ) : (
                  <Bot size={16} className="text-white" strokeWidth={2.5} />
                )}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md font-body ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm' 
                  : 'bg-white text-black/90 border border-black/5 rounded-tl-sm'
              }`}>
                <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:font-bold prose-ul:my-2">
                  <ReactMarkdown>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 items-center bg-white border border-black/5 p-4 rounded-2xl rounded-tl-sm shadow-md">
              <div className="flex gap-1.5">
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} 
                  transition={{ repeat: Infinity, duration: 1.2 }} 
                  className="w-2 h-2 bg-[#D00000] rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} 
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} 
                  className="w-2 h-2 bg-[#D00000] rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} 
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} 
                  className="w-2 h-2 bg-[#D00000] rounded-full" 
                />
              </div>
              <span className="text-[10px] text-black/60 font-semibold uppercase tracking-wider">Analizando...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-black/5 bg-white">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe el vehículo que buscas..."
              className="w-full pl-5 pr-14 py-4 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D00000]/20 transition-all border border-black/5 focus:bg-white focus:border-[#D00000]/30 placeholder:text-black/40"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[#D00000] to-[#B00000] text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#D00000]/30 transition-all duration-300 active:scale-95"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full border border-black/5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[9px] text-black/50 font-bold uppercase tracking-widest">
              Asesoría Inteligente
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
