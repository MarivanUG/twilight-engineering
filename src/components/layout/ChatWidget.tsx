import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Bot, Send } from 'lucide-react';
import type { AppSettings } from '../../types';
import { sendMessage } from '../../lib/firestoreService'; // Import the firestore sendMessage

interface ChatWidgetProps {
  settings: AppSettings;
}

export const ChatWidget: React.FC<ChatWidgetProps> = (props) => {
  // @ts-expect-error
  const settings = props.settings;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: number, text: string, sender: 'user' | 'bot' }[]>([
    { id: 1, text: "Hello! How can we help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), text: inputValue, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Send message to Firestore
      await sendMessage({ from: 'website_chat_user', text: userMsg.text });

      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Thanks! We've received your message and will get back to you shortly.",
          sender: 'bot'
        }]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to send chat message:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Oops! Something went wrong. Please try again.",
        sender: 'bot'
      }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div><h3 className="font-bold">TECL Support</h3><p className="text-xs text-slate-300">Online</p></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-full"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                  msg.sender === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-slate-800 shadow-sm rounded-tl-none'
                }`}>{msg.text}</div>
              </div>
            ))}
            {isTyping && <div className="text-xs text-slate-400 ml-4">Agent is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 border-0 rounded-full py-3 px-4 focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
            <button type="submit" disabled={!inputValue.trim() || isTyping} className="p-3 rounded-full bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"><Send size={18} /></button>
          </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`p-4 rounded-full shadow-lg transition-all hover:scale-110 ${isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-orange-600 text-white'}`}>
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};