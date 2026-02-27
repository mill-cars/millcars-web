import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
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
      {/* Header - Rufus Style */}
      <div className="p-5 bg-black text-white flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#D00000] to-[#800000] flex items-center justify-center shadow-[0_0_20px_rgba(208,0,0,0.3)] transform -rotate-2 border border-white/10">
              <img 
                src="https://picsum.photos/seed/ai-agent/100/100" 
                alt="AI Agent" 
                className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                referrerPolicy="no-referrer"
              />
              <Sparkles size={20} className="text-white absolute animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight font-display">carsAgent</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold font-display">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[#fafafa]"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-black/5 flex items-center justify-center rotate-3"
            >
              <Bot size={40} className="text-black/10" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-black font-display tracking-tight uppercase">¿Cómo puedo asistirte?</h3>
              <p className="text-xs text-black/40 max-w-[220px] mx-auto font-medium">Encuentra el auto perfecto mediante una conversación inteligente.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
              {[
                "¿Qué SUV recomiendas para familias?",
                "Compara el Corolla vs Civic",
                "Busco un auto con placa terminada en 4",
                "¿Tienen opciones híbridas?"
              ].map((q, i) => (
                <button 
                  key={i}
                  onClick={() => onSendMessage(q)}
                  className="text-[9px] font-bold p-3 rounded-xl border border-black/5 bg-white shadow-sm hover:border-[#D00000] hover:text-[#D00000] text-left transition-all duration-300 transform hover:scale-[1.01] font-display uppercase tracking-wider"
                >
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
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-[#0078FF]' : 'bg-black'}`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm font-body ${
                msg.role === 'user' 
                  ? 'bg-[#0078FF] text-white rounded-tr-none' 
                  : 'bg-white text-black border border-black/[0.03] rounded-tl-none'
              }`}>
                <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-inherit prose-ul:my-2">
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
            <div className="flex gap-3 items-center bg-white border border-black/[0.03] p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#D00000] rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#D00000] rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#D00000] rounded-full" />
              </div>
              <span className="text-[9px] text-black/40 font-bold uppercase tracking-widest font-display">Procesando</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-5 border-t border-black/5 bg-white">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="w-full pl-5 pr-12 py-4 bg-[#f8f9fa] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D00000]/10 transition-all border border-transparent focus:bg-white focus:border-black/5 font-body"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D00000] transition-all duration-300 shadow-md active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <p className="text-[8px] text-black/20 font-bold uppercase tracking-widest font-display">
            AI Sales Concierge
          </p>
        </div>
      </form>
    </div>
  );
};
