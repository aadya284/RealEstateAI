"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ChatMessage from "@/components/chatbot/ChatMessage";
import ChatInput from "@/components/chatbot/ChatInput";
import ResultsPanel from "@/components/chatbot/ResultsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Moon, Sun, FileSpreadsheet, MessageSquare, ArrowLeft, Home } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AnalysisResult {
  summary: string;
  chart: {
    years: number[];
    prices: number[];
    demand: number[];
  };
  table: Record<string, any>[];
}

export default function RealEstateChatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Real Estate Analysis Assistant. Upload an Excel file and ask me to analyze any location or show demand trends. For example, try 'Analyze Wakad' or 'Show demand trend for Aundh'.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText: string, file?: File) => {
    // Update uploaded file if new file is provided
    if (file) {
      setUploadedFile(file);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("query", messageText);
      
      // Use the newly uploaded file or the previously uploaded one
      const fileToSend = file || uploadedFile;
      if (fileToSend) {
        formData.append("file", fileToSend);
      }

      // Call the backend API
      const response = await axios.post("http://localhost:8000/api/analyze/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I've analyzed your query. Check the results panel on the right for detailed insights including summary, demand trends chart, and filtered data table.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      // Update results panel
      setResults(data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "An unexpected error occurred";

      setError(errorMessage);

      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${errorMessage}. Please make sure the backend server is running on http://localhost:8000 and you've uploaded a valid Excel file.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Button + Logo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 hover:bg-muted/80 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              <div className="h-6 w-px bg-border hidden sm:block" />
              
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Real Estate Analysis
                  </h1>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    AI-powered property insights & market trends
                  </p>
                </div>
              </div>
            </div>

            {/* Right: File Indicator + Theme Toggle + Home */}
            <div className="flex items-center gap-3">
              {uploadedFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <span className="text-foreground max-w-[120px] sm:max-w-[150px] truncate font-medium">{uploadedFile.name}</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="rounded-lg transition-all hover:scale-105"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="rounded-lg transition-all hover:scale-105 hidden sm:flex"
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
          {/* Left Panel - Chat */}
          <Card className="flex flex-col shadow-lg border-border/50 animate-in fade-in slide-in-from-left-4 duration-500">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-base font-semibold text-foreground">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-6">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <ChatMessage
                      message={message.text}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                    />
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground animate-in fade-in duration-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing your query...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t pt-4 bg-background">
                <ChatInput onSend={handleSendMessage} disabled={loading} />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Results */}
          <div className="overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: "100ms" }}>
            <ResultsPanel results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}