import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, ExternalLink, X, MessageSquare, Zap } from 'lucide-react';
import { chatWithNexus } from '../../services/nexus.api';
import './NexusChat.css';

const MessageContent = ({ content, isAssistant, isNew }) => {
  // Clean the content by removing (ObjectID) from [Title](ObjectID)
  const cleanedContent = content.replace(/\[([^\]]+)\]\([a-f\d]{24}\)/g, '$1');

  // If not new, start with full text. If new assistant msg, start with empty for typewriter.
  const [displayedText, setDisplayedText] = useState(isAssistant && isNew ? '' : cleanedContent);
  const [index, setIndex] = useState(isAssistant && isNew ? 0 : cleanedContent.length);

  useEffect(() => {
    // If not meant to type, ensure full content is shown
    if (!isAssistant || !isNew) {
      setDisplayedText(cleanedContent);
      return;
    }

    if (index < cleanedContent.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + cleanedContent[index]);
        setIndex((prev) => prev + 1);
      }, 10); 
      return () => clearTimeout(timeout);
    }
  }, [index, cleanedContent, isAssistant, isNew]);

  return <span>{displayedText}</span>;
};

const NexusChat = ({ isOpen, onClose, onSourceClick }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Yo! I'm your MemoryOS Buddy. I'm here to help you dig through your brain. What's up?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // When the window opens, clear 'isNew' flag for all messages 
  // so that historical messages don't re-trigger the typewriter effect.
  useEffect(() => {
    if (isOpen) {
      setMessages(prev => prev.map(m => ({ ...m, isNew: false })));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsTyping(true);

    try {
      const resp = await chatWithNexus(userQuery);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: resp.answer,
        sources: resp.sources,
        isNew: true // Flag for typewriter
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "My bad... I'm having trouble connecting to MemoryOS right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="nexus-floating-window animate-pop-in">
      <div className="nexus-chat-header">
        <div className="nexus-logo-orb">
          <MessageSquare size={18} fill="white" />
        </div>
        <div className="nexus-header-text">
          <h3>MemoryOS Buddy</h3>
          <span className="ai-status">Online</span>
        </div>
        <div className="nexus-header-actions">
           <button className="nexus-action-btn" onClick={onClose} title="Minimize">
             <X size={20} />
           </button>
        </div>
      </div>

      <div className="nexus-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`nexus-message ${msg.role} fade-in`}>
            <div className="message-bubble glass-bubble">
              <MessageContent 
                content={msg.content} 
                isAssistant={msg.role === 'assistant'} 
                isNew={msg.isNew}
              />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="nexus-message assistant">
            <div className="message-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="nexus-input-area" onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Query your personal galaxy..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !query.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default NexusChat;
