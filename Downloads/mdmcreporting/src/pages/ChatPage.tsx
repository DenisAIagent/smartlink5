import React from 'react';
import PremiumAIChatInterface from '@/components/premium/PremiumChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatPage() {
  return (
    <div className="h-full p-6">
      <Card className="h-full bg-transparent border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-2xl">
            Assistant IA MDMC - Intelligence Conversationnelle
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 h-[calc(100vh-140px)]">
          <PremiumAIChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}