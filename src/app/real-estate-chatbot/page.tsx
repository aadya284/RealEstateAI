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
  const [messages, setMessages] = useState<Message[]>([]);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [hasUploadedData, setHasUploadedData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get backend URL from environment or default to current origin
  const BACKEND_URL = "";

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
    const sessionId = localStorage.getItem("sessionId") || `session-${Date.now()}`;
    if (!localStorage.getItem("sessionId")) {
      localStorage.setItem("sessionId", sessionId);
    }

    // Update uploaded file if new file is provided
    if (file) {
      setUploadedFile(file);
      setHasUploadedData(true);
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
      let uploadedDataId: number | null = null;

      // Step 1: Upload file if provided
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("session_id", sessionId);

        const uploadResponse = await axios.post(
          "/api/upload",
          uploadFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedDataId = uploadResponse.data.id;
      }

      // Step 2: Send chat message
      const chatPayload: any = {
        message: messageText,
        session_id: sessionId,
      };

      const chatResponse = await axios.post(
        "/api/chatbot",
        chatPayload
      );

      console.log("Chat response data:", chatResponse.data);

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatResponse.data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      // Only show results if file was uploaded
      if (hasUploadedData || file) {
        const resultsData: any = {
          summary: chatResponse.data.response,
          chart: chatResponse.data.chart || {
            years: [2021, 2022, 2023, 2024],
            prices: [250000, 300000, 350000, 400000],
            demand: [6, 7, 8, 9],
          },
          table: chatResponse.data.table || [
            { location: "Wakad", price: "₹45L - ₹65L", demand: "8/10" },
            { location: "Aundh", price: "₹40L - ₹60L", demand: "7/10" },
            { location: "Viman Nagar", price: "₹50L - ₹70L", demand: "9/10" },
          ],
        };
        console.log("Updated results:", resultsData);
        setResults(resultsData);
      } else {
        setResults(null);
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.response?.data?.message || err.message
        : "An unexpected error occurred";

      setError(errorMessage);

      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${errorMessage}. Please make sure the backend server is running at ${BACKEND_URL}.`,
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
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center text-muted-foreground">
                    <div className="rounded-lg bg-primary/5 p-6 border border-primary/20">
                      <MessageSquare className="h-12 w-12 text-primary/40 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to Real Estate AI</h3>
                      <p className="text-sm max-w-xs">
                        Upload an Excel file and ask me to analyze locations, show demand trends, or get market insights.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
            {hasUploadedData ? (
              <ResultsPanel results={results} />
            ) : (
              <Card className="h-full shadow-lg border-border/50 flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-lg bg-muted p-8 mb-6">
                  <FileSpreadsheet className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Data Uploaded Yet</h3>
                <p className="text-muted-foreground max-w-xs">
                  Upload an Excel file to unlock charts, data analysis, and insights about real estate markets.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}