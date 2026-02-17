
import React, { useState, useRef, useEffect } from 'react';
import { askPhysicsTutor } from '../services/geminiService';
import { ChatMessage } from '../types';

const AITutor: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Hola! Soy tu tutor especializado de la Josefa Campos. ¿Cómo puedo ayudarte hoy con la física?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const context = `El estudiante está visualizando actualmente el módulo: ${activeTab}. Ayúdale con conceptos teóricos o cálculos relacionados.`;
    const response = await askPhysicsTutor(userMsg, context);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-[35px] shadow-2xl overflow-hidden border border-slate-800 border-b-[8px] border-b-indigo-700">
      <div className="p-6 bg-indigo-600 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center rotate-3 shadow-inner">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-base tracking-tight leading-none uppercase">Tutor IA</h3>
            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mt-1 opacity-80">Módulo: {activeTab}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">En línea</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 p-6 space-y-5 overflow-y-auto bg-slate-800/20 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] p-4 rounded-3xl text-xs font-medium leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700/50 flex gap-1.5">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800/50">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Dime tu duda..."
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-500 font-bold"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
