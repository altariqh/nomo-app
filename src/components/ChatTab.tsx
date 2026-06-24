import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Trip } from '../types';

interface ChatTabProps {
  chatMessages: Array<{ role: 'user' | 'model'; content: string }>;
  sendingChat: boolean;
  currentQuery: string;
  onQueryChange: (v: string) => void;
  onSubmitChat: (e?: React.FormEvent) => void;
  activeTrip: Trip | null;
}

export default function ChatTab({
  chatMessages,
  sendingChat,
  currentQuery,
  onQueryChange,
  onSubmitChat,
  activeTrip,
}: ChatTabProps) {

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] select-none">
      
      {/* Scrollable chat body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[8px] font-mono text-[#A8A29E] mb-1 font-bold uppercase tracking-wider">
              {msg.role === 'user' ? 'You' : 'Nomo'}
            </span>
            
            <div className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[90%] font-serif ${
              msg.role === 'user' 
                ? 'bg-[#5A5A40] text-white rounded-tr-none shadow-sm' 
                : 'bg-[#F3F2EE] text-[#3C3836] rounded-tl-none border border-[#E7E5E4] p-3 shadow-xs'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {sendingChat && (
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-mono text-[#A8A29E] mb-1 font-bold uppercase">Nomo</span>
            <div className="bg-[#F3F2EE] text-[#A8A29E] p-3 rounded-2xl text-[11px] rounded-tl-none border border-[#E7E5E4] italic animate-pulse">
              Consulting AI travel assistant...
            </div>
          </div>
        )}
      </div>

      {/* Helper prompts */}
      <div className="p-3 bg-[#FAF8F5] border-t border-[#F1EFE9] space-y-1.5 shrink-0 text-left">
        <p className="text-[8px] font-mono uppercase tracking-wider text-[#A8A29E] font-bold">Suggested questions</p>
        <div className="flex flex-wrap gap-1">
          <button 
            type="button"
            onClick={() => onQueryChange("Create a coffee-tasting budget plan.")}
            className="text-[9px] bg-white border border-[#E7E5E4] px-2.5 py-1 rounded-full text-[#5A5A40] hover:bg-[#F3F2EE] font-medium"
          >
            ☕ Café Budgets
          </button>
          <button 
            type="button"
            onClick={() => onQueryChange(`Calculate debt breakdown on ${activeTrip?.name || 'this trip'}`)}
            className="text-[9px] bg-white border border-[#E7E5E4] px-2.5 py-1 rounded-full text-[#5A5A40] hover:bg-[#F3F2EE] font-medium"
          >
            ⚖️ Check Splits
          </button>
          <button 
            type="button"
            onClick={() => onQueryChange(`Analyze my travel budget and spending patterns.`)}
            className="text-[9px] bg-white border border-[#E7E5E4] px-2.5 py-1 rounded-full text-[#5A5A40] hover:bg-[#F3F2EE] font-medium"
          >
            📊 Analyze Spending
          </button>
        </div>
      </div>

      {/* Submission block */}
      <form onSubmit={onSubmitChat} className="p-3 border-t border-[#F1EFE9] bg-white flex gap-1.5 shrink-0 items-center">
        <input
          type="text"
          value={currentQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Ask Nomo about budgets, expenses, or recommendations..."
          className="flex-1 bg-[#F3F2EE] border border-[#E7E5E4] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-[#3C3836]"
        />
        <button
          type="submit"
          disabled={sendingChat || !currentQuery.trim()}
          className="w-9 h-9 bg-[#5A5A40] text-white flex items-center justify-center rounded-full hover:bg-[#4a4a34] active:scale-95 transition-all disabled:opacity-40"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
