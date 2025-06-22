import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User, Clock, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  data?: any;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageContent = (content: string) => {
    // Convert markdown-style formatting to JSX
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={index} className="font-semibold text-gray-900 mb-2">
            {line.slice(2, -2)}
          </h4>
        );
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="mb-2">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }
      
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={index} className="flex items-start mb-1 ml-4">
            <span className="text-[#E53E3E] mr-2 mt-1">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      
      // Numbered lists
      if (/^\d+\./.test(line)) {
        return (
          <div key={index} className="flex items-start mb-1 ml-4">
            <span className="text-[#E53E3E] mr-2 font-medium">
              {line.match(/^\d+/)?.[0]}.
            </span>
            <span>{line.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <Avatar className={`w-8 h-8 ${isUser ? 'bg-[#E53E3E]' : 'bg-gray-100'}`}>
        <AvatarFallback>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-gray-600" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Message Card */}
        <Card className={`${
          isUser 
            ? 'bg-[#E53E3E] text-white border-[#E53E3E]' 
            : 'bg-white border-gray-200'
        }`}>
          <CardContent className="p-4">
            {message.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyse en cours...</span>
              </div>
            ) : (
              <div className={`prose prose-sm max-w-none ${
                isUser ? 'text-white' : 'text-gray-900'
              }`}>
                {isUser ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="space-y-1">
                    {formatMessageContent(message.content)}
                  </div>
                )}
              </div>
            )}

            {/* Data visualization for assistant messages */}
            {!isUser && !message.isLoading && message.data?.campaigns && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {message.data.campaigns.map((campaign: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 text-sm mb-2">
                        {campaign.name}
                      </h5>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">ROAS:</span>
                          <span className="font-medium">{campaign.roas}x</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Dépensé:</span>
                          <span className="font-medium">€{campaign.spend}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Conv.:</span>
                          <span className="font-medium">{campaign.conversions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamp and Status */}
        <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${
          isUser ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          <Clock className="h-3 w-3" />
          <span>{formatTime(message.timestamp)}</span>
          {isUser && <Badge variant="secondary" className="text-xs">Envoyé</Badge>}
          {!isUser && !message.isLoading && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              IA
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}