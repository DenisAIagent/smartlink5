import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/admin-chatbot.css';
import GeminiService from '../../services/geminiService';

const AdminChatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Ajouter un message de bienvenue au chargement
  useEffect(() => {
    addBotMessage(t('admin.chatbot.welcome_message'));
    
    // Ajouter des suggestions initiales après un court délai
    setTimeout(async () => {
      const initialSuggestions = await GeminiService.getSuggestions('fonctionnalités MDMC');
      addBotMessage(t('admin.chatbot.help_prompt'), initialSuggestions);
    }, 1000);
  }, [t]);

  // Faire défiler automatiquement vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mettre le focus sur l'input lorsque le chatbot est ouvert
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { type: 'user', text }]);
  };

  const addBotMessage = (text, suggestions = []) => {
    setMessages(prev => [...prev, { type: 'bot', text, suggestions }]);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Ajouter le message de l'utilisateur
    addUserMessage(inputValue);
    const userQuery = inputValue;
    setInputValue('');
    
    // Afficher l'indicateur de frappe
    setIsTyping(true);
    
    // Obtenir une réponse de Gemini
    (async () => {
      try {
        // Préparer l'historique de chat pour Gemini
        const chatHistory = messages.map(msg => ({
          type: msg.type,
          text: msg.text
        }));
        
        // Obtenir la réponse de Gemini
        const response = await GeminiService.getResponse(userQuery, chatHistory);
        
        // Obtenir des suggestions basées sur la réponse
        const suggestions = await GeminiService.getSuggestions(userQuery);
        
        // Masquer l'indicateur de frappe et ajouter la réponse
        setIsTyping(false);
        addBotMessage(response, suggestions);
      } catch (error) {
        console.error("Erreur lors de la communication avec Gemini:", error);
        setIsTyping(false);
        addBotMessage(t('admin.chatbot.error_message'), [
          t('admin.chatbot.suggestion_pixels'),
          t('admin.chatbot.suggestion_wordpress'),
          t('admin.chatbot.suggestion_landing_pages')
        ]);
      }
    })();
  };

  const handleSuggestionClick = (suggestion) => {
    // Ajouter la suggestion comme message de l'utilisateur
    addUserMessage(suggestion);
    
    // Afficher l'indicateur de frappe
    setIsTyping(true);
    
    // Obtenir une réponse de Gemini
    (async () => {
      try {
        // Préparer l'historique de chat pour Gemini
        const chatHistory = messages.map(msg => ({
          type: msg.type,
          text: msg.text
        }));
        
        // Obtenir la réponse de Gemini
        const response = await GeminiService.getResponse(suggestion, chatHistory);
        
        // Obtenir des suggestions basées sur la réponse
        const suggestions = await GeminiService.getSuggestions(suggestion);
        
        // Masquer l'indicateur de frappe et ajouter la réponse
        setIsTyping(false);
        addBotMessage(response, suggestions);
      } catch (error) {
        console.error("Erreur lors de la communication avec Gemini:", error);
        setIsTyping(false);
        addBotMessage(t('admin.chatbot.error_message'), [
          t('admin.chatbot.suggestion_pixels'),
          t('admin.chatbot.suggestion_wordpress'),
          t('admin.chatbot.suggestion_landing_pages')
        ]);
      }
    })();
  };

  // Cette fonction n'est plus utilisée car nous utilisons maintenant Gemini
  // Conservée pour référence ou comme fallback en cas d'erreur avec l'API
  const processUserMessageLegacy = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Réponses pour les pixels marketing
    if (lowerMessage.includes('pixel') || lowerMessage.includes('google analytics') || 
        lowerMessage.includes('gtm') || lowerMessage.includes('meta') || 
        lowerMessage.includes('tiktok') || lowerMessage.includes('facebook')) {
      
      if (lowerMessage.includes('google analytics') || lowerMessage.includes('ga')) {
        addBotMessage(t('admin.chatbot.google_analytics_help'), [
          t('admin.chatbot.suggestion_ga_id'),
          t('admin.chatbot.suggestion_ga_events')
        ]);
      } else if (lowerMessage.includes('gtm') || lowerMessage.includes('tag manager')) {
        addBotMessage(t('admin.chatbot.gtm_help'), [
          t('admin.chatbot.suggestion_gtm_id'),
          t('admin.chatbot.suggestion_gtm_setup')
        ]);
      } else if (lowerMessage.includes('meta') || lowerMessage.includes('facebook')) {
        addBotMessage(t('admin.chatbot.meta_pixel_help'), [
          t('admin.chatbot.suggestion_meta_events'),
          t('admin.chatbot.suggestion_meta_advanced')
        ]);
      } else if (lowerMessage.includes('tiktok')) {
        addBotMessage(t('admin.chatbot.tiktok_pixel_help'), [
          t('admin.chatbot.suggestion_tiktok_events'),
          t('admin.chatbot.suggestion_tiktok_api')
        ]);
      } else {
        addBotMessage(t('admin.chatbot.pixels_general_help'), [
          t('admin.chatbot.suggestion_google_analytics'),
          t('admin.chatbot.suggestion_meta_pixel'),
          t('admin.chatbot.suggestion_tiktok_pixel')
        ]);
      }
    }
    
    // Réponses pour WordPress
    else if (lowerMessage.includes('wordpress') || lowerMessage.includes('blog') || 
             lowerMessage.includes('wp') || lowerMessage.includes('article')) {
      
      if (lowerMessage.includes('connect') || lowerMessage.includes('setup') || 
          lowerMessage.includes('configur')) {
        addBotMessage(t('admin.chatbot.wordpress_setup_help'), [
          t('admin.chatbot.suggestion_wp_app_password'),
          t('admin.chatbot.suggestion_wp_sync')
        ]);
      } else if (lowerMessage.includes('sync') || lowerMessage.includes('import')) {
        addBotMessage(t('admin.chatbot.wordpress_sync_help'), [
          t('admin.chatbot.suggestion_wp_categories'),
          t('admin.chatbot.suggestion_wp_frequency')
        ]);
      } else {
        addBotMessage(t('admin.chatbot.wordpress_general_help'), [
          t('admin.chatbot.suggestion_wp_connect'),
          t('admin.chatbot.suggestion_wp_sync'),
          t('admin.chatbot.suggestion_wp_troubleshoot')
        ]);
      }
    }
    
    // Réponses pour les landing pages
    else if (lowerMessage.includes('landing') || lowerMessage.includes('page') || 
             lowerMessage.includes('template') || lowerMessage.includes('generator')) {
      
      if (lowerMessage.includes('template') || lowerMessage.includes('design')) {
        addBotMessage(t('admin.chatbot.landing_templates_help'), [
          t('admin.chatbot.suggestion_landing_customize'),
          t('admin.chatbot.suggestion_landing_sections')
        ]);
      } else if (lowerMessage.includes('publish') || lowerMessage.includes('deploy')) {
        addBotMessage(t('admin.chatbot.landing_publish_help'), [
          t('admin.chatbot.suggestion_landing_analytics'),
          t('admin.chatbot.suggestion_landing_domain')
        ]);
      } else {
        addBotMessage(t('admin.chatbot.landing_general_help'), [
          t('admin.chatbot.suggestion_landing_create'),
          t('admin.chatbot.suggestion_landing_publish'),
          t('admin.chatbot.suggestion_landing_analytics')
        ]);
      }
    }
    
    // Réponse générale si aucune correspondance spécifique
    else {
      addBotMessage(t('admin.chatbot.general_help'), [
        t('admin.chatbot.suggestion_pixels'),
        t('admin.chatbot.suggestion_wordpress'),
        t('admin.chatbot.suggestion_landing_pages')
      ]);
    }
  };

  return (
    <div className={`admin-chatbot ${isOpen ? 'open' : ''}`}>
      <button 
        className="chatbot-toggle"
        onClick={toggleChatbot}
        aria-label={isOpen ? t('admin.chatbot.close') : t('admin.chatbot.open')}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>{t('admin.chatbot.title')}</h3>
            <button 
              className="close-button"
              onClick={toggleChatbot}
              aria-label={t('admin.chatbot.close')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.type === 'bot' && (
                  <div className="bot-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="12" fill="var(--color-primary)" />
                      <path d="M16 8H8C6.89543 8 6 8.89543 6 10V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V10C18 8.89543 17.1046 8 16 8Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 12C10.5523 12 11 11.5523 11 11C11 10.4477 10.5523 10 10 10C9.44772 10 9 10.4477 9 11C9 11.5523 9.44772 12 10 12Z" fill="white"/>
                      <path d="M14 12C14.5523 12 15 11.5523 15 11C15 10.4477 14.5523 10 14 10C13.4477 10 13 10.4477 13 11C13 11.5523 13.4477 12 14 12Z" fill="white"/>
                      <path d="M9 15H15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className="message-content">
                  <p>{message.text}</p>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="message-suggestions">
                      {message.suggestions.map((suggestion, i) => (
                        <button 
                          key={i} 
                          className="suggestion-button"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="bot-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="12" fill="var(--color-primary)" />
                    <path d="M16 8H8C6.89543 8 6 8.89543 6 10V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V10C18 8.89543 17.1046 8 16 8Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12C10.5523 12 11 11.5523 11 11C11 10.4477 10.5523 10 10 10C9.44772 10 9 10.4477 9 11C9 11.5523 9.44772 12 10 12Z" fill="white"/>
                    <path d="M14 12C14.5523 12 15 11.5523 15 11C15 10.4477 14.5523 10 14 10C13.4477 10 13 10.4477 13 11C13 11.5523 13.4477 12 14 12Z" fill="white"/>
                    <path d="M9 15H15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={t('admin.chatbot.input_placeholder')}
              ref={inputRef}
            />
            <button 
              type="submit"
              aria-label={t('admin.chatbot.send')}
              disabled={!inputValue.trim()}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminChatbot;
