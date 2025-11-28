"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 transition-transform group-hover:scale-105">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-4 py-2.5 transition-all duration-200",
          isUser
            ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
            : "bg-muted/50 text-foreground border border-border/50 hover:bg-muted/70"
        )}
      >
        <p className="text-[13px] leading-relaxed">{message}</p>
        <span className={cn("text-[10px] mt-1.5 block", isUser ? "opacity-70" : "opacity-50")}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}