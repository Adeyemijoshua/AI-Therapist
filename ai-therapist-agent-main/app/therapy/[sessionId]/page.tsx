"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  MessageSquare,
  Menu,
  LogOut,
  Sparkles,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  createChatSession,
  sendChatMessage,
  getChatHistory,
  ChatMessage,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SuggestedQuestion {
  id: string;
  text: string;
}

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?" },
  { text: "I've been feeling overwhelmed lately" },
  { text: "Can we talk about improving sleep?" },
  { text: "I need help with work-life balance" },
];

export default function TherapyPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(
    params.sessionId as string
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize chat session and load history
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        if (!sessionId || sessionId === "new") {
          const newSessionId = await createChatSession();
          setSessionId(newSessionId);
          window.history.pushState({}, "", `/therapy/${newSessionId}`);
        } else {
          try {
            const history = await getChatHistory(sessionId);
            if (Array.isArray(history)) {
              const formattedHistory = history.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }));
              setMessages(formattedHistory);
            } else {
              setMessages([]);
            }
          } catch (historyError) {
            console.error("Error loading chat history:", historyError);
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [sessionId]);

  // Load all chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await getAllChatSessions();
        const transformedSessions = allSessions.map((session: any) => ({
          sessionId: session.sessionId,
          messages: session.messages || [],
          createdAt: new Date(session.startTime),
          updatedAt: new Date(session.startTime),
        }));
        setSessions(transformedSessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
        setSessions([]);
      }
    };

    loadSessions();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();

    if (!currentMessage || isTyping || !sessionId) {
      return;
    }

    setMessage("");
    setIsTyping(true);

    try {
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const response = await sendChatMessage(sessionId, currentMessage);
      const aiResponse = typeof response === "string" ? JSON.parse(response) : response;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse.response || aiResponse.message || "I'm here to support you. Could you tell me more about what's on your mind?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      const newSessionId = await createChatSession();
      const newSession: ChatSession = {
        sessionId: newSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSessionId);
      setMessages([]);
      window.history.pushState({}, "", `/therapy/${newSessionId}`);
      setIsMobileMenuOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to create new session:", error);
      setIsLoading(false);
    }
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    try {
      setIsLoading(true);
      const history = await getChatHistory(selectedSessionId);
      if (Array.isArray(history)) {
        const formattedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedHistory);
        setSessionId(selectedSessionId);
        window.history.pushState({}, "", `/therapy/${selectedSessionId}`);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSuggestedQuestion = async (text: string) => {
    if (!sessionId) {
      const newSessionId = await createChatSession();
      setSessionId(newSessionId);
      router.push(`/therapy/${newSessionId}`);
    }

    const currentMessage = text.trim();
    if (!currentMessage || isTyping || !sessionId) return;

    setMessage("");
    setIsTyping(true);

    try {
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const response = await sendChatMessage(sessionId, currentMessage);
      const aiResponse = typeof response === "string" ? JSON.parse(response) : response;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse.response || aiResponse.message || "I'm here to support you. Could you tell me more about what's on your mind?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
    setTimeout(() => {
        window.location.reload();
    }, 100);
};

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading your therapy session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 flex-col bg-card border-r">
        {/* Brand Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Aura</h1>
              <p className="text-sm text-muted-foreground">Mental Wellness</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <Button
            onClick={handleNewSession}
            className="w-full justify-center gap-2 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            <Plus className="w-5 h-5" />
            New Session
          </Button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="w-4 h-4" />
              Recent Sessions
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div 
              className="space-y-1 p-2 max-h-[calc(100vh-300px)] overflow-y-auto" 
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--muted)) transparent'
              }}
            >
              {sessions.map((session, index) => {
                let timeText = "Recently";
                try {
                  const date = session.updatedAt || session.createdAt;
                  if (date) {
                    timeText = formatDistanceToNow(new Date(date), { addSuffix: true });
                  }
                } catch (error) {
                  console.log("Date error:", error);
                }

                return (
                  <div
                    key={session.sessionId}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                      session.sessionId === sessionId
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => handleSessionSelect(session.sessionId)}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      session.sessionId === sessionId 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        Session {sessions.length - index}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {timeText}
                      </div>
                    </div>
                    {session.sessionId === sessionId && (
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* User Profile Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">Welcome Back</div>
                <div className="text-xs text-muted-foreground">Ready to chat</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Leo</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
              >
                <Plus className="w-4 h-4" />
              </Button>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">Leo</div>
                          <div className="text-sm text-muted-foreground">Mental Wellness Companion</div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleNewSession}
                        className="w-full justify-center gap-2 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                      >
                        <Plus className="w-5 h-5" />
                        New Session
                      </Button>
                    </div>

                    {/* Mobile Chat History - App Features Section Removed */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                          <History className="w-4 h-4" />
                          Your Sessions
                        </div>
                        {sessions.map((session, index) => {
                          let timeText = "Recently";
                          try {
                            const date = session.updatedAt || session.createdAt;
                            if (date) {
                              timeText = formatDistanceToNow(new Date(date), { addSuffix: true });
                            }
                          } catch (error) {
                            console.log("Date error:", error);
                          }

                          return (
                            <div
                              key={session.sessionId}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                                session.sessionId === sessionId
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "hover:bg-accent/50"
                              )}
                              onClick={() => {
                                handleSessionSelect(session.sessionId);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                session.sessionId === sessionId 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted text-muted-foreground"
                              )}>
                                <MessageSquare className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  Session {sessions.length - index}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {timeText}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    {/* Logout Section */}
                    <div className="p-4 border-t">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-center gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-2xl w-full text-center space-y-8">
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Bot className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                      Leo
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Your compassionate AI mental health companion
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 max-w-md mx-auto">
                  {SUGGESTED_QUESTIONS.map((q, index) => (
                    <motion.div
                      key={q.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-4 px-6 text-left justify-start hover:bg-accent hover:border-primary/30 transition-all duration-200 rounded-xl"
                        onClick={() => handleSuggestedQuestion(q.text)}
                      >
                        <span className="text-base leading-relaxed">{q.text}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <ScrollArea className="flex-1">
              <div 
                className="max-w-4xl mx-auto py-6 px-4 sm:px-6"
                style={{
                  scrollBehavior: 'smooth'
                }}
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex gap-4 mb-6",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>

                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 mb-6 justify-start"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className="border-t bg-background/50 p-4">
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={handleSubmit}
                className="flex gap-3 items-end relative"
              >
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share what's on your mind..."
                    className={cn(
                      "w-full resize-none rounded-xl border border-input bg-background",
                      "px-4 py-3 pr-12 min-h-[56px] max-h-[120px]",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                      "transition-all duration-200 placeholder:text-muted-foreground text-sm",
                      isTyping && "opacity-50 cursor-not-allowed"
                    )}
                    rows={1}
                    disabled={isTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className={cn(
                      "absolute right-2 bottom-2 h-8 w-8",
                      "rounded-lg transition-all duration-200",
                      "bg-primary hover:bg-primary/90",
                      (isTyping || !message.trim()) && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isTyping || !message.trim()}
                  >
                    <Send className="w-4 h-4 text-primary-foreground" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}