import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, RefreshCw, Download, FileText } from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  queryData?: GoogleAdsQuery;
}

interface GoogleAdsQuery {
  intent: string;
  reportType: string;
  dateRange: {
    startDate: string;
    endDate: string;
    period: string;
  };
  accounts: string[];
  metrics: string[];
  dimensions: string[];
  filters: any[];
  orderBy: {
    field: string;
    sortOrder: string;
  };
  limit: number;
  exportFormat: string | null;
}

interface ChatResponse {
  success: boolean;
  sessionId: string;
  query: GoogleAdsQuery;
  originalMessage: string;
  timestamp: string;
}

const BACKEND_URL = 'http://localhost:3001';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeAccount } = useAccount();

  useEffect(() => {
    // Vérifier la connexion au backend
    checkBackendConnection();
    
    // Message de bienvenue
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: `Bonjour ! 👋 Je suis votre assistant IA MDMC pour analyser vos campagnes Google Ads.

Je peux vous aider à :
• 📊 Analyser les performances de vos campagnes
• 📈 Comparer les métriques entre différentes périodes
• 🎯 Identifier les opportunités d'optimisation
• 📋 Créer des rapports personnalisés (PDF, Excel)
• ⚡ Extraire des données sur mesure

${activeAccount ? `✅ Compte actif : ${activeAccount.name} (${activeAccount.customerId})` : '⚠️ Sélectionnez d\'abord un compte Google Ads pour commencer.'}

**Exemples de requêtes :**
• "Montre-moi les campagnes des 6 derniers mois triées par ROAS"
• "Analyse des mots-clés les plus performants ce trimestre"
• "Export PDF des campagnes du compte X sur 18 mois"

Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [activeAccount]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Message de chargement temporaire
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      type: 'assistant',
      content: 'Analyse de votre requête en cours...',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          sessionId: sessionId
        })
      });

      const data: ChatResponse = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        
        // Générer une réponse explicative
        const explanationContent = generateExplanation(data.query);
        
        const assistantMessage: Message = {
          id: data.sessionId,
          type: 'assistant',
          content: explanationContent,
          timestamp: new Date(data.timestamp),
          queryData: data.query
        };

        // Remplacer le message de chargement
        setMessages(prev => prev.slice(0, -1).concat(assistantMessage));
      } else {
        throw new Error('Erreur de réponse du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `❌ **Erreur de connexion**

Je n'arrive pas à traiter votre requête pour le moment. Vérifiez que :
• Le serveur backend est démarré (http://localhost:3001)
• Votre connexion internet fonctionne

Essayez de reformuler votre demande ou contactez le support technique.`,
        timestamp: new Date()
      };

      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const generateExplanation = (query: GoogleAdsQuery): string => {
    const dateRange = formatDateRange(query.dateRange);
    const metrics = query.metrics.join(', ');
    const exportInfo = query.exportFormat ? `\n\n📄 **Export demandé :** ${query.exportFormat.toUpperCase()}` : '';
    
    return `✅ **Requête analysée avec succès !**

📋 **Type de rapport :** ${getReportTypeLabel(query.reportType)}
📅 **Période :** ${dateRange}
📊 **Métriques :** ${metrics}
🎯 **Tri :** ${query.orderBy.field} (${query.orderBy.sortOrder === 'DESC' ? 'décroissant' : 'croissant'})
📦 **Limite :** ${query.limit} résultats${exportInfo}

🔄 **Prochaine étape :** Cette requête sera utilisée pour interroger l'API Google Ads et récupérer vos données.

*Note : L'intégration complète avec Google Ads sera ajoutée dans la prochaine phase de développement.*`;
  };

  const formatDateRange = (dateRange: any): string => {
    if (dateRange.period === 'custom') {
      return `Du ${dateRange.startDate} au ${dateRange.endDate}`;
    }
    
    const periodLabels: { [key: string]: string } = {
      'today': 'Aujourd\'hui',
      'yesterday': 'Hier',
      'last_7_days': '7 derniers jours',
      'last_30_days': '30 derniers jours',
      'last_90_days': '90 derniers jours',
      'last_12_months': '12 derniers mois'
    };
    
    return periodLabels[dateRange.period] || dateRange.period;
  };

  const getReportTypeLabel = (reportType: string): string => {
    const labels: { [key: string]: string } = {
      'campaign_performance': 'Performance des campagnes',
      'adgroup_performance': 'Performance des groupes d\'annonces',
      'keyword_performance': 'Performance des mots-clés',
      'account_overview': 'Vue d\'ensemble du compte'
    };
    
    return labels[reportType] || reportType;
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusBadge = () => {
    switch (backendStatus) {
      case 'connected':
        return <Badge className="bg-green-500 text-white">🤖 IA Connectée</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500 text-white">❌ IA Déconnectée</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white">🔄 Vérification...</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="header-mdmc">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-[var(--mdmc-black)] flex items-center gap-2">
            <Bot className="h-6 w-6 text-[var(--mdmc-red)]" />
            Assistant IA MDMC
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="btn-mdmc-ghost"
            >
              <RefreshCw className="h-4 w-4" />
              Nouveau chat
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-240px)] scrollbar-mdmc">
          <div className="p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${message.type === 'user' 
                    ? 'bg-[var(--mdmc-red)] text-white' 
                    : 'bg-[var(--mdmc-gray-100)] text-[var(--mdmc-gray-600)]'
                  }
                `}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : message.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`
                  flex-1 max-w-[80%] rounded-2xl px-4 py-3
                  ${message.type === 'user'
                    ? 'chat-message-user'
                    : 'chat-message-ai'
                  }
                `}>
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  
                  {message.queryData && (
                    <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="text-xs opacity-75 mb-2">Données de requête générées :</div>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(message.queryData, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-[var(--mdmc-gray-200)]">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                backendStatus === 'connected'
                  ? "Tapez votre question sur Google Ads..."
                  : "Serveur IA déconnecté. Vérifiez la connexion..."
              }
              disabled={isLoading || backendStatus !== 'connected'}
              className="input-mdmc flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim() || backendStatus !== 'connected'}
              className="btn-mdmc-primary"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {backendStatus === 'disconnected' && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ Serveur backend non accessible. Assurez-vous qu'il est démarré sur le port 3001.
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}
