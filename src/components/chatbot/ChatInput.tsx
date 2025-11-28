"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Upload, X } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim(), selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a valid Excel file (.xlsx, .xls, or .csv)');
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {selectedFile && (
        <div className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-lg text-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Upload className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="flex-1 truncate text-foreground font-medium">{selectedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive/10 transition-colors"
            onClick={removeFile}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something... e.g. Analyze Wakad"
          disabled={disabled}
          className="flex-1 transition-all focus:ring-2 focus:ring-primary/20"
        />
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Upload Excel file"
          className="transition-all hover:scale-105 hover:bg-primary/5"
        >
          <Upload className="h-4 w-4" />
        </Button>
        
        <Button 
          type="submit" 
          disabled={disabled || !message.trim()} 
          size="icon"
          className="transition-all hover:scale-105 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}