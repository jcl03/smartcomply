"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface CompactAiChatProps {
  context?: string;
  placeholder?: string;
  height?: string;
  title?: string;
  className?: string;
}

export default function CompactAiChat({ 
  context, 
  placeholder = "Ask me about compliance...", 
  height = "400px",
  title = "SmartComply AI Assistant",
  className = ""
}: CompactAiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: context || 'Compliance assistance'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <Card className={`bg-white border border-sky-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-sky-200 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-lg">
        <Sparkles className="h-5 w-5" />
        <span className="font-semibold">{title}</span>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto p-4 space-y-4" style={{ height }}>
        {messages.length === 0 && (
          <div className="text-center text-sky-600 py-8">
            <Bot className="h-12 w-12 mx-auto mb-3 text-sky-400" />
            <p className="text-sm font-medium mb-1">Ready to assist!</p>
            <p className="text-xs text-sky-500">Ask me anything about compliance and audit matters.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`p-2 rounded-full ${
              message.sender === 'user' 
                ? 'bg-gradient-to-br from-sky-400 to-blue-500' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              {message.sender === 'user' ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
              />
              <div className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-sky-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Bot className="h-4 w-4 text-gray-600" />
            </div>
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing your question...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-sky-200 bg-sky-50">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 p-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-white"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white p-3 h-12 w-12"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
