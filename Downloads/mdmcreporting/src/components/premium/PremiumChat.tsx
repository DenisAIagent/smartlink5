import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Zap, 
  Brain, 
  TrendingUp,
  BarChart3,
  FileText,
  Download,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  RefreshCw,
  Clock,
  Target,
  Activity,
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const PremiumAIChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeModel, setActiveModel] = useState('gemini-2.5-pro');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const canvasRef = useRef(null);

  // Animation de particules pour l'IA
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const particles = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 300 // Purple to pink range
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
        ctx.fill();

        // Connect nearby particles
        particles.slice(index + 1).forEach(otherParticle => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) + 
            Math.pow(particle.y - otherParticle.y, 2)
          );
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initialMessages = [
    {
      id: '1',
      type: 'assistant',
      content: `🚀 **Bonjour ! Je suis votre Assistant IA MDMC**

Je suis propulsé par **Gemini 2.5 Pro** et spécialisé dans l'analyse de vos campagnes Google Ads.

**Mes capacités actuelles :**
• 📊 Analyse de performance en temps réel
• 🎯 Recommandations d'optimisation personnalisées  
• 📈 Prédictions basées sur vos données historiques
• 📋 Génération de rapports automatisés
• ⚡ Requêtes en langage naturel

**Exemples de ce que vous pouvez me demander :**
• "Quelles sont mes campagnes les plus performantes ce mois ?"
• "Recommande-moi des optimisations pour améliorer mon ROAS"
• "Génère un rapport PDF de mes performances trimestrielles"

Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date(),
      metrics: {
        confidence: 98,
        processingTime: '0.3s',
        sources: 4
      }
    }
  ];

  const [allMessages, setAllMessages] = useState(initialMessages);

  const suggestions = [
    {
      icon: TrendingUp,
      text: "Analyse mes campagnes les plus performantes",
      category: "Performance",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Target,
      text: "Optimise mes enchères pour améliorer le ROAS",
      category: "Optimisation", 
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: BarChart3,
      text: "Compare les performances mobile vs desktop",
      category: "Comparaison",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: FileText,
      text: "Génère un rapport mensuel en PDF",
      category: "Rapport",
      color: "from-orange-500 to-red-500"
    }
  ];

  const aiModels = [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', status: 'active', capabilities: 'Analyse avancée' },
    { id: 'claude-3', name: 'Claude 3 Opus', status: 'available', capabilities: 'Raisonnement complexe' },
    { id: 'gpt-4', name: 'GPT-4 Turbo', status: 'available', capabilities: 'Créativité' }
  ];

  const sendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setAllMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const aiResponse = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: generateAIResponse(text),
      timestamp: new Date(),
      metrics: {
        confidence: Math.floor(Math.random() * 20) + 80,
        processingTime: (Math.random() * 2 + 0.5).toFixed(1) + 's',
        sources: Math.floor(Math.random() * 5) + 2
      },
      attachments: generateAttachments(text)
    };

    setIsTyping(false);
    setAllMessages(prev => [...prev, aiResponse]);
  };

  const generateAIResponse = (query) => {
    const responses = {
      performance: `✅ **Analyse de Performance Complétée**

**Top 3 Campagnes Performantes :**

🥇 **Black Friday Premium**
• ROAS: **5.2x** (+15.8% vs objectif)
• Conversions: **284** (+18% vs mois précédent)  
• CPC moyen: **€2.14** (-12% optimisation réussie)

🥈 **Retargeting Elite** 
• ROAS: **4.6x** (+8.3% amélioration continue)
• Taux de conversion: **3.8%** (excellent)
• Budget utilisé: **78%** (marge d'optimisation)

🥉 **Search Brand**
• ROAS: **3.9x** (stable mais en dessous du target)
• Impressions: **67K** (+24% visibilité)
• CTR: **2.1%** (⚠️ nécessite attention)

**💡 Recommandations Immédiates :**
• Réallouer +€2,400 vers Black Friday Premium
• Réviser les mots-clés de Search Brand
• Tester de nouvelles audiences pour Retargeting Elite`,

      optimization: `🎯 **Plan d'Optimisation Intelligent**

**Analyse Prédictive Basée sur vos Données :**

**📈 Opportunités Détectées :**

1. **Enchères Automatiques** 
   • Passage au Smart Bidding recommandé
   • Gain estimé: **+22% conversions**
   • ROI projeté: **+€18,400/mois**

2. **Audiences Similaires**
   • 3 nouvelles audiences haute valeur identifiées
   • Taux de conversion prévu: **4.2%**
   • Budget recommandé: **€5,200**

3. **Extensions d'Annonces**
   • 7 extensions manquantes détectées
   • Impact CTR estimé: **+15%**
   • Coût d'implémentation: **€0**

**⚡ Actions Prioritaires :**
• [ ] Activer Target ROAS à 4.5x
• [ ] Implémenter audiences similaires  
• [ ] A/B tester nouveaux titres d'annonces
• [ ] Exclure placements sous-performants

**Timeline suggérée : 5 jours**`,

      comparison: `📊 **Analyse Comparative Mobile vs Desktop**

**Performance par Appareil (30 derniers jours) :**

**📱 Mobile (52% du trafic)**
• Conversions: **1,487** (58% du total)
• ROAS: **4.8x** ⬆️ (+0.3x vs Desktop)
• CPC: **€1.89** ⬇️ (-€0.45 vs Desktop)
• Taux de conversion: **3.9%** ⬆️
• Heures de pointe: **19h-22h**

**💻 Desktop (48% du trafic)**  
• Conversions: **1,152** (42% du total)
• ROAS: **4.5x** ⬇️ (-0.3x vs Mobile)
• CPC: **€2.34** ⬆️ (+€0.45 vs Mobile)
• Taux de conversion: **3.2%** ⬇️
• Heures de pointe: **14h-17h**

**🔍 Insights Clés :**
• Mobile surperforme dans toutes les métriques
• Opportunity: Réallouer +15% budget vers mobile
• Desktop nécessite optimisation UX landing pages
• Ajustements enchères par heure recommandés

**💰 Impact Financier Estimé :**
Réallocation optimale = **+€6,700/mois**`,

      rapport: `📋 **Rapport Mensuel Généré avec Succès**

**Résumé Exécutif - Novembre 2024**

**🎯 KPIs Principaux :**
• Revenue Total: **€247,850** (+18.2% MoM)
• ROAS Moyen: **4.6x** (+0.3x vs objectif)
• Conversions: **2,847** (+24.1% MoM)
• Coût par Conversion: **€28.40** (-15% optimisation)

**📈 Highlights :**
✅ Dépassement objectif revenue de +18%
✅ Tous les KPIs en zone verte
✅ 3 nouvelles campagnes lancées avec succès
⚠️ CTR mobile à surveiller (baisse de 2%)

**📊 Sections du Rapport :**
• Performance par campagne (détaillée)
• Analyse des audiences et démographics  
• Recommandations stratégiques Q4
• Prévisions décembre avec Black Friday
• Benchmark vs concurrence (estimation)

**Format :** PDF Premium (24 pages)
**Graphiques :** 12 visualisations interactives
**Prêt à télécharger** en 30 secondes`
    };

    // Simple keyword matching
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('performance') || lowerQuery.includes('campagne')) return responses.performance;
    if (lowerQuery.includes('optimis') || lowerQuery.includes('enchère') || lowerQuery.includes('roas')) return responses.optimization;
    if (lowerQuery.includes('compar') || lowerQuery.includes('mobile') || lowerQuery.includes('desktop')) return responses.comparison;
    if (lowerQuery.includes('rapport') || lowerQuery.includes('pdf') || lowerQuery.includes('export')) return responses.rapport;
    
    return responses.performance; // Default response
  };

  const generateAttachments = (query) => {
    if (query.toLowerCase().includes('rapport') || query.toLowerCase().includes('pdf')) {
      return [
        {
          type: 'pdf',
          name: 'Rapport_Mensuel_Nov2024.pdf',
          size: '2.4 MB',
          icon: FileText
        }
      ];
    }
    if (query.toLowerCase().includes('performance') || query.toLowerCase().includes('campagne')) {
      return [
        {
          type: 'excel', 
          name: 'Donnees_Campagnes.xlsx',
          size: '1.8 MB',
          icon: BarChart3
        }
      ];
    }
    return [];
  };

  const copyToClipboard = async (text, messageId) => {
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    const isAI = message.type === 'assistant';

    return (
      <div className={`flex items-start gap-4 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`relative flex-shrink-0 ${isUser ? 'ml-4' : 'mr-4'}`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30' 
              : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30'
          }`}>
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Brain className="w-5 h-5 text-white" />
            )}
          </div>
          {isAI && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
          <div className={`relative p-4 rounded-2xl ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ml-8' 
              : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white mr-8'
          }`}>
            {/* Message Header for AI */}
            {isAI && (
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span className="text-sm font-semibold text-purple-300">Gemini 2.5 Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/20"
                    onClick={() => copyToClipboard(message.content, message.id)}
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="w-3 h-3 text-emerald-300" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-300" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="space-y-2">
                  {message.attachments.map((attachment, index) => {
                    const Icon = attachment.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-400">{attachment.size}</p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Metrics */}
            {isAI && message.metrics && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Confiance</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        message.metrics.confidence > 90 ? 'bg-emerald-400' : 
                        message.metrics.confidence > 70 ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <span className="text-sm font-semibold text-white">{message.metrics.confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Traitement</p>
                    <p className="text-sm font-semibold text-white mt-1">{message.metrics.processingTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Sources</p>
                    <p className="text-sm font-semibold text-white mt-1">{message.metrics.sources}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timestamp & Actions */}
          <div className={`flex items-center gap-2 mt-2 text-xs text-gray-400 ${
            isUser ? 'flex-row-reverse' : ''
          }`}>
            <Clock className="w-3 h-3" />
            <span>{message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            {isAI && (
              <div className="flex items-center gap-1 ml-3">
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-white/20">
                  <ThumbsUp className="w-3 h-3 text-gray-400 hover:text-emerald-300" />
                </Button>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-white/20">
                  <ThumbsDown className="w-3 h-3 text-gray-400 hover:text-red-300" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 backdrop-blur-3xl" />

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Assistant IA MDMC</h2>
              <p className="text-sm text-gray-400">Propulsé par Gemini 2.5 Pro • {allMessages.length - 1} échanges</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Model Selector */}
            <div className="relative">
              <select className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50">
                {aiModels.map(model => (
                  <option key={model.id} value={model.id} className="bg-slate-800">
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Controls */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-10 h-10 rounded-xl border border-white/20 ${
                isListening ? 'bg-red-500/20 border-red-500/50' : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setIsListening(!isListening)}
            >
              {isListening ? <Mic className="w-4 h-4 text-red-300" /> : <MicOff className="w-4 h-4 text-gray-300" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-gray-300" /> : <Volume2 className="w-4 h-4 text-gray-300" />}
            </Button>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4 text-gray-300" /> : <Maximize2 className="w-4 h-4 text-gray-300" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40">
          <div className="p-6 space-y-6">
            {allMessages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mr-8">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-300">L'IA analyse votre demande...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && allMessages.length === 1 && (
        <div className="relative z-10 p-6 border-t border-white/10">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">💡 Suggestions Intelligentes</h3>
            <p className="text-sm text-gray-400">Cliquez sur une suggestion ou tapez votre propre question</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion.text)}
                  className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 text-left"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${suggestion.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300`} />
                  <div className="relative flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                        {suggestion.text}
                      </p>
                      <p className="text-xs text-gray-400">{suggestion.category}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="relative z-10 p-6 border-t border-white/10 backdrop-blur-xl">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-20" />
          <div className="relative flex items-end gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Posez votre question sur Google Ads... (Shift+Enter pour nouvelle ligne)"
                className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[60px] max-h-[120px]"
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20"
              >
                <Mic className="w-4 h-4 text-gray-300" />
              </Button>
              
              <Button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Latence: 0.8s</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Tokens: {inputValue.length}/4000</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>IA Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumAIChatInterface; 