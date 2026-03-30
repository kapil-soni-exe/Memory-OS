import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, ExternalLink, X, MessageSquare, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { chatWithNexus } from '../../services/nexus.api';
import './NexusChat.css';

const MessageContent = ({ content, isAssistant, isNew }) => {
  const [displayedText, setDisplayedText] = useState(isAssistant && isNew ? '' : content);
  const [index, setIndex] = useState(isAssistant && isNew ? 0 : content.length);

  useEffect(() => {
    if (!isAssistant || !isNew) {
      setDisplayedText(content);
      return;
    }

    if (index < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + content[index]);
        setIndex((prev) => prev + 1);
      }, 8); // Slightly faster typewriter for longer synthesized answers
      return () => clearTimeout(timeout);
    }
  }, [index, content, isAssistant, isNew]);

  return <span>{displayedText}</span>;
};

const NexusChat = ({ isOpen, onClose, onSourceClick }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Yo! I'm your MemoryOS Buddy. I'm here to help you dig through your brain. What's up?" }
  ]);
  
  const [isResilientMode, setIsResilientMode] = useState(false);
  const chatEndRef = useRef(null);

  // Step 2: CREATE MUTATION
  const chatMutation = useMutation({
    mutationFn: chatWithNexus,
    onSuccess: (resp) => {
      setIsResilientMode(resp.isFallback || false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: resp.answer,
        sources: resp.sources || [],
        isNew: true
      }]);
    },
    onError: (err) => {
      console.error("Nexus Chat Error:", err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "My bad... I'm having trouble connecting to MemoryOS right now." 
      }]);
    }
  });

  // Step 5: USE MUTATION STATE
  const isTyping = chatMutation.isPending;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages(prev => prev.map(m => ({ ...m, isNew: false })));
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);

    // Step 3: REPLACE API CALL with Mutation
    chatMutation.mutate(userQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="nexus-floating-window animate-pop-in">
      <div className="nexus-chat-header">
        <div className="nexus-logo-orb">
          <Brain size={18} fill="white" />
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

              {/* ✅ New: Render Sources if available */}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="message-sources fade-in" style={{ animationDelay: '0.5s' }}>
                  <span className="nexus-source-label">Sources</span>
                  <div className="source-chips-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {msg.sources.map((src, sIdx) => (
                      <div
                        key={src._id || sIdx}
                        className="nexus-source-chip"
                        onClick={() => onSourceClick?.(src)}
                        title={src.title}
                      >
                        <Zap size={10} fill="currentColor" />
                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          [{sIdx + 1}] {src.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        {isResilientMode && (
          <div className="nexus-resilience-notice fade-in">
            <Zap size={12} fill="#FFD700" color="#FFD700" />
            <span>AI Capacity Limited. Serving best matches from memory keywords.</span>
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
