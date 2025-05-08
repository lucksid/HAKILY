import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/stores/useAuth";
import { useSocket } from "@/lib/stores/useSocket";
import { ScrollArea } from "./ui/scroll-area";
import { User, Send, MessageSquare } from "lucide-react";

type Message = {
  id: number;
  senderId: number;
  senderUsername: string;
  content: string;
  createdAt: string;
  isGameMessage: boolean;
};

export default function Chat({ gameId }: { gameId?: number }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Request message history
    socket.emit("getMessages", { gameId });

    // Listen for message history
    socket.on("messageHistory", (msgs) => {
      setMessages(msgs);
    });

    // Listen for new messages
    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for game messages
    socket.on("gameMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, { ...message, isGameMessage: true }]);
    });

    return () => {
      socket.off("messageHistory");
      socket.off("newMessage");
      socket.off("gameMessage");
    };
  }, [socket, gameId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !user || inputMessage.trim() === "") return;

    socket.emit("sendMessage", {
      content: inputMessage,
      gameId
    });

    setInputMessage("");
    
    // Focus input after sending
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl gap-2">
          <MessageSquare className="h-5 w-5" />
          {gameId ? "Game Chat" : "Global Chat"}
        </CardTitle>
        <CardDescription>
          {gameId ? "Chat with players in this game" : "Chat with all online players"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isGameMessage
                      ? "justify-center"
                      : message.senderId === user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.isGameMessage ? (
                    <div className="bg-muted px-3 py-2 rounded-md text-sm text-center w-full">
                      {message.content}
                    </div>
                  ) : message.senderId === user?.id ? (
                    <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[80%]">
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1">{message.senderUsername}</p>
                        <div className="bg-muted px-3 py-2 rounded-lg">
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button size="icon" onClick={sendMessage} disabled={inputMessage.trim() === ""}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
