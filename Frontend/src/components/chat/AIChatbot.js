import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiSend, FiMinus, FiMaximize2, FiX, FiUser, FiHelpCircle } from 'react-icons/fi';
import './AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI shopping assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Response Logic
  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Product-related queries
    if (message.includes('product') || message.includes('item') || message.includes('buy')) {
      return "I can help you find products! We have 900+ items across 9 categories including Electronics, Fashion, Sports, Health, Home, Books, Automotive, Grocery, and Baby products. What are you looking for?";
    }
    
    // Price-related queries
    if (message.includes('price') || message.includes('cost') || message.includes('cheap') || message.includes('expensive')) {
      return "Our products range from ₹200 to ₹200,000 with something for every budget. Would you like me to show you products in a specific price range?";
    }
    
    // Category-specific queries
    if (message.includes('electronics') || message.includes('phone') || message.includes('laptop')) {
      return "Great choice! Our Electronics category has 100+ products including smartphones, laptops, headphones, tablets, and smart watches from top brands like Apple, Samsung, Sony, and more.";
    }
    
    if (message.includes('fashion') || message.includes('clothes') || message.includes('shirt') || message.includes('jeans')) {
      return "Our Fashion collection includes trendy clothing, shoes, and accessories. We have t-shirts, jeans, dresses, jackets, and sneakers from popular brands.";
    }
    
    if (message.includes('sports') || message.includes('fitness') || message.includes('gym')) {
      return "Stay fit with our Sports & Fitness collection! We have yoga mats, dumbbells, running shoes, sports equipment, and more to help you achieve your fitness goals.";
    }
    
    // Order and shipping queries
    if (message.includes('order') || message.includes('shipping') || message.includes('delivery')) {
      return "We offer fast and reliable shipping! Orders are typically processed within 24 hours and delivered within 3-7 business days. Free shipping on orders above ₹500.";
    }
    
    // Return and refund queries
    if (message.includes('return') || message.includes('refund') || message.includes('exchange')) {
      return "We have a hassle-free 30-day return policy. If you're not satisfied with your purchase, you can return it for a full refund or exchange within 30 days of delivery.";
    }
    
    // Payment queries
    if (message.includes('payment') || message.includes('pay') || message.includes('card')) {
      return "We accept all major payment methods including credit/debit cards, UPI, net banking, and digital wallets. All transactions are secure and encrypted.";
    }
    
    // Support queries
    if (message.includes('help') || message.includes('support') || message.includes('problem')) {
      return "I'm here to help! You can ask me about products, prices, orders, shipping, returns, or anything else. Our customer support team is also available 24/7 for additional assistance.";
    }
    
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! Welcome to our store. I'm your AI shopping assistant. How can I help you find the perfect product today?";
    }
    
    // Thank you responses
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! I'm always here to help. Is there anything else you'd like to know about our products or services?";
    }
    
    // Default response
    return "I understand you're asking about that. Let me help you! You can ask me about our products, prices, shipping, returns, or any other questions you might have. What would you like to know more about?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: generateAIResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickResponses = [
    "Show me electronics",
    "What's on sale?",
    "Track my order",
    "Return policy"
  ];

  const handleQuickResponse = (response) => {
    setInputMessage(response);
  };

  if (!isOpen) {
    return (
      <div className="chatbot-trigger" onClick={() => setIsOpen(true)}>
        <FiMessageCircle size={24} />
        <div className="notification-badge">1</div>
      </div>
    );
  }

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-avatar">
          <FiHelpCircle size={20} />
        </div>
        <div className="chatbot-info">
          <h4>AI Shopping Assistant</h4>
          <span className="status">Online</span>
        </div>
        <div className="chatbot-controls">
          <button 
            className="control-btn"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <FiMaximize2 size={16} /> : <FiMinus size={16} />}
          </button>
          <button 
            className="control-btn"
            onClick={() => setIsOpen(false)}
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                {message.sender === 'bot' ? (
                  <div className="message-avatar">
                    <FiHelpCircle size={16} />
                  </div>
                ) : (
                  <div className="message-avatar">
                    <FiUser size={16} />
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">
                  <FiHelpCircle size={16} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-responses">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                className="quick-response-btn"
                onClick={() => handleQuickResponse(response)}
              >
                {response}
              </button>
            ))}
          </div>

          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
              className="message-input"
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              <FiSend size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatbot;
