import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useSocket } from "@/lib/stores/useSocket";
import { useAuth } from "@/lib/stores/useAuth";
import { Message } from "@shared/types";

export default function MessageBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { socket } = useSocket();
  const { user } = useAuth();
  
  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    
    socket.on('message', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
      
      // If the chat is not open, increment unread count
      if (!isOpen && newMessage.sender !== user?.username) {
        setUnreadCount((prev) => prev + 1);
      }
    });
    
    // Get message history
    socket.on('messageHistory', (history: Message[]) => {
      setMessages(history);
    });
    
    // Request message history on first load
    socket.emit('getMessageHistory');
    
    return () => {
      socket.off('message');
      socket.off('messageHistory');
    };
  }, [socket, isOpen, user]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);
  
  // Reset unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!socket || !message.trim() || !user) return;
    
    socket.emit('sendMessage', {
      content: message.trim(),
    });
    
    setMessage("");
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-4 right-4 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                {unreadCount}
              </span>
            )}
          </div>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="flex flex-col h-full p-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Game Chat</h2>
        </div>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No messages yet. Be the first to send one!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === user?.username ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.sender === user?.username
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.sender !== user?.username && (
                      <div className="text-xs font-medium mb-1">{msg.sender}</div>
                    )}
                    <div className="break-words">{msg.content}</div>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim()}>
            Send
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// Helper function to format timestamp
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
