"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Lightbulb,
  Calculator,
  TrendingUp
} from "lucide-react";
import { useExplainInvoice, usePickTopDiscounts } from "@/hooks/use-api";
import { copy } from "@/lib/i18n";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotDrawer({ isOpen, onClose }: ChatbotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const explainInvoiceMutation = useExplainInvoice();
  const pickTopDiscountsMutation = usePickTopDiscounts();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      let response: string = "";

      // Handle different types of queries
      if (message.toLowerCase().includes("explain") && message.includes("#")) {
        // Extract invoice ID from message
        const invoiceId = message.match(/#(\w+)/)?.[1];
        if (invoiceId) {
          const result = await explainInvoiceMutation.mutateAsync(invoiceId);
          response = `**${result.insight}**\n\n**Steps:**\n${result.steps.map(step => `• ${step}`).join('\n')}`;
        }
      } else if (message.toLowerCase().includes("top discounts") || message.toLowerCase().includes("best discounts")) {
        // Extract budget
        const budgetMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        const budget = budgetMatch ? parseFloat(budgetMatch[1].replace(/,/g, '')) : 15000;
        
        const result = await pickTopDiscountsMutation.mutateAsync(budget);
        response = `**Top Discounts for $${budget.toLocaleString()} Budget:**\n\n`;
        result.selection.forEach((item, index) => {
          response += `${index + 1}. Invoice ${item.invoiceId}: ${item.impliedAprPct.toFixed(1)}% APR\n`;
          response += `   • Take: $${item.takeAmount.toLocaleString()}\n`;
          response += `   • Savings: $${item.savings.toLocaleString()}\n\n`;
        });
        response += `**Total Take:** $${result.totalTake.toLocaleString()}\n`;
        response += `**Total Savings:** $${result.totalSavings.toLocaleString()}`;
      } else {
        // Generic response
        response = "I can help you with:\n\n• **Explain invoices**: \"Explain invoice #123\"\n• **Find top discounts**: \"Show me the best discounts for $10,000 budget\"\n• **General questions** about invoice optimization\n\nWhat would you like to know?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-end p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{copy.chat.title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Ask questions about your invoices and get instant insights
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Quick Prompts */}
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt("Which discounts should I take this week with limited cash?")}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Top Discounts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt("Explain invoice #123")}
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Explain Invoice
                </Button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-lg p-3
                    ${message.type === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                    }
                  `}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === "assistant" && (
                      <Bot className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    )}
                    {message.type === "user" && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.content)
                        }}
                        className="text-sm"
                      />
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your invoices..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              <Lightbulb className="h-3 w-3 inline mr-1" />
              {copy.chat.guardrails}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
