import React, { useState, useRef, useEffect } from 'react';
import { generateAssistantResponse } from '../utils/assistantLogic';
import { Send, Sparkles, MessageSquare } from 'lucide-react';

function TradingAssistant({ telemetry }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am your Institutional Trading Assistant. How can I help you analyze the market today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const aiResponse = await generateAssistantResponse(input, telemetry);
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        setIsTyping(false);
    };

    const runDecisionEngine = async () => {
        setIsTyping(true);
        setMessages(prev => [...prev, { role: 'user', content: 'SYSTEM: Generate Final Decision Response.' }]);
        
        const decision = await generateAssistantResponse(telemetry, telemetry);
        
        const decisionText = `
**ELITE DECISION: ${decision.decision || 'UNKNOWN'}**
Confidence: ${decision.confidence || 0}%
Rationale: ${Array.isArray(decision.reason) ? decision.reason.join(', ') : (decision.reason || 'No rationale provided')}
Trigger: ${decision.trigger || 'Awaiting structural confirmation'}
Summary: ${decision.summary || 'Executing institutional protocol.'}
        `;
        
        setMessages(prev => [...prev, { role: 'assistant', content: decisionText }]);
        setIsTyping(false);
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                       <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white">AI Assistant</span>
                       <span className="text-[8px] font-bold text-slate-500 uppercase">Neural Analysis V4</span>
                    </div>
                </div>
                <button 
                    onClick={runDecisionEngine}
                    disabled={isTyping}
                    className="flex items-center gap-2 text-[9px] font-black bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Sparkles className="w-3 h-3" />
                    {isTyping ? 'THINKING...' : 'ELITE DECISION'}
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-4 rounded-2xl text-[12px] leading-relaxed shadow-xl
                            ${m.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-none'}`}>
                            <div className="whitespace-pre-wrap">{m.content}</div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-black/20 border-t border-white/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Inquire institutional data..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TradingAssistant;
