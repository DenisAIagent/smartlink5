// src/services/websocket.ts
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  data?: Record<string, unknown>;
}

type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionHandler = (isConnected: boolean) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;

  private get wsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? 'api.mdmc-reporting.com' 
      : 'localhost:8000';
    return `${protocol}//${host}/ws`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.notifyMessageHandlers(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.notifyConnectionHandlers(false);
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  sendMessage(type: string, data: unknown): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
    };

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onConnection(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  private notifyMessageHandlers(message: WebSocketMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyConnectionHandlers(isConnected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }
}

export const wsService = new WebSocketService();

// React hook for WebSocket functionality
export function useWebSocket() {
  const sendMessage = (type: string, data: unknown) => {
    return wsService.sendMessage(type, data);
  };

  const connect = () => {
    return wsService.connect();
  };

  const disconnect = () => {
    wsService.disconnect();
  };

  const isConnected = () => {
    return wsService.isConnected();
  };

  return {
    sendMessage,
    connect,
    disconnect,
    isConnected,
    onMessage: wsService.onMessage.bind(wsService),
    onConnection: wsService.onConnection.bind(wsService),
  };
}