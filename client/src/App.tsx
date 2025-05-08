import { useState } from "react";

// Simple Login Form Component
function LoginForm({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };
  
  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">EduPlay</h1>
      <p className="text-gray-600 mb-4 text-center">
        Multiplayer Educational Game Platform
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your username"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

// Simple Chat Component
interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
}

function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "System", content: "Welcome to the chat!", timestamp: new Date() },
    { id: 2, sender: "Alice", content: "Hi everyone! Who wants to play a word game?", timestamp: new Date(Date.now() - 5 * 60000) },
    { id: 3, sender: "Bob", content: "I prefer math games. Anyone interested?", timestamp: new Date(Date.now() - 3 * 60000) }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        sender: "You",
        content: newMessage,
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white font-medium">
        Chat
      </div>
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "You" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-lg px-4 py-2 ${
              message.sender === "You" 
                ? "bg-blue-100 text-blue-800" 
                : message.sender === "System" 
                ? "bg-gray-200 text-gray-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              <div className="text-xs font-medium mb-1">
                {message.sender} · {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="border-t p-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Game Lobby Component
function GameLobby({ username, onLogout }: { username: string, onLogout: () => void }) {
  return (
    <div className="max-w-6xl w-full mx-auto">
      <header className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">EduPlay</h1>
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-sm text-gray-500">Welcome,</span>
            <span className="ml-1 font-medium">{username}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Game Lobby</h2>
            <p className="text-gray-600 mb-6">
              Choose a game to play from the options below:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transform transition-transform hover:scale-105">
                <div className="text-4xl mb-2">📝</div>
                <h3 className="font-bold">Word Challenge</h3>
                <p className="text-sm text-gray-500">Create words from 7 letters</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transform transition-transform hover:scale-105">
                <div className="text-4xl mb-2">🔢</div>
                <h3 className="font-bold">Math Wizards</h3>
                <p className="text-sm text-gray-500">Solve math problems</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transform transition-transform hover:scale-105">
                <div className="text-4xl mb-2">❓</div>
                <h3 className="font-bold">Quiz Masters</h3>
                <p className="text-sm text-gray-500">Test your knowledge</p>
              </div>
            </div>
            
            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">How to Play</h3>
              <p className="text-sm text-blue-700">
                Click on a game type to create a new game room or join an existing one.
                Invite friends to play with you by sharing the game link. Have fun!
              </p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const handleLogin = (name: string) => {
    setUsername(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <GameLobby username={username} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
