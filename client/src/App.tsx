import { useState, useEffect } from "react";

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
function GameLobby({ 
  username, 
  onLogout, 
  onStartGame 
}: { 
  username: string, 
  onLogout: () => void,
  onStartGame: (gameType: string) => void 
}) {
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
              <div 
                className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => onStartGame("word")}
              >
                <div className="text-4xl mb-2">📝</div>
                <h3 className="font-bold">Word Challenge</h3>
                <p className="text-sm text-gray-500">Create words from 7 letters</p>
              </div>
              
              <div 
                className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => alert("Math game coming soon!")}
              >
                <div className="text-4xl mb-2">🔢</div>
                <h3 className="font-bold">Math Wizards</h3>
                <p className="text-sm text-gray-500">Solve math problems</p>
              </div>
              
              <div 
                className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => alert("Quiz game coming soon!")}
              >
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

// Simple Word Game Component
function WordGame({ username, onBack }: { username: string, onBack: () => void }) {
  const letters = ["A", "E", "I", "R", "S", "T", "N"];
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [submittedWords, setSubmittedWords] = useState<{word: string, score: number}[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  
  // Handle letter selection
  const selectLetter = (letter: string, index: number) => {
    // Only add if not already selected
    if (!selectedLetters.includes(letter + index)) {
      setSelectedLetters([...selectedLetters, letter + index]);
    }
  };
  
  // Clear selected letters
  const clearSelection = () => {
    setSelectedLetters([]);
  };
  
  // Submit current word
  const submitWord = () => {
    const word = selectedLetters.map(l => l.charAt(0)).join("");
    if (word.length >= 3) {
      // Calculate a simple score (1 point per letter, bonus for longer words)
      let score = word.length;
      if (word.length > 5) score += 3;
      else if (word.length > 3) score += 1;
      
      setSubmittedWords([...submittedWords, { word, score }]);
      setSelectedLetters([]);
    }
  };
  
  // Simulate countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);
  
  return (
    <div className="max-w-4xl w-full mx-auto">
      <header className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Word Challenge</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Time: {timeLeft}s
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Player:</span>
            <span className="ml-1 font-medium">{username}</span>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-8">
              <h2 className="text-center text-xl font-bold mb-2">Create a word using these letters</h2>
              <p className="text-center text-gray-600 mb-4">
                Select letters to form a word, then click Submit
              </p>
              
              {/* Selected word display */}
              <div className="h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                {selectedLetters.length > 0 ? (
                  <div className="flex space-x-1">
                    {selectedLetters.map((letterWithIndex, i) => (
                      <div key={i} className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-md font-bold text-xl">
                        {letterWithIndex.charAt(0)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">Your word will appear here</span>
                )}
              </div>
              
              {/* Letter tiles */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {letters.map((letter, index) => (
                  <button
                    key={index}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg text-2xl font-bold border-2 
                      ${selectedLetters.includes(letter + index) 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                    onClick={() => selectLetter(letter, index)}
                    disabled={selectedLetters.includes(letter + index)}
                  >
                    {letter}
                    <span className="absolute bottom-1 right-1 text-xs">
                      {/[AEIOU]/.test(letter) ? '1' : '2'}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  onClick={clearSelection}
                >
                  Clear
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={submitWord}
                >
                  Submit Word
                </button>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Game Rules</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Create words using the provided letters</li>
                <li>Vowels are worth 1 point, consonants are worth 2 points</li>
                <li>Words must be at least 3 letters long</li>
                <li>Longer words earn bonus points</li>
                <li>You have 15 seconds for each round</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-blue-600 text-white font-medium">
              Submitted Words
            </div>
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {submittedWords.length > 0 ? (
                submittedWords.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{entry.word}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                      +{entry.score} pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No words submitted yet
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-blue-600 text-white font-medium">
              Players
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="font-medium">{username} (You)</span>
                <span className="font-bold">
                  {submittedWords.reduce((total, entry) => total + entry.score, 0)} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const handleLogin = (name: string) => {
    setUsername(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setCurrentGame(null);
  };
  
  const startGame = (gameType: string) => {
    setCurrentGame(gameType);
  };
  
  const backToLobby = () => {
    setCurrentGame(null);
  };

  // Main content based on login state and current game
  let content;
  if (!isLoggedIn) {
    content = <LoginForm onLogin={handleLogin} />;
  } else if (currentGame === "word") {
    content = <WordGame username={username} onBack={backToLobby} />;
  } else {
    content = (
      <GameLobby 
        username={username} 
        onLogout={handleLogout} 
        onStartGame={startGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      {content}
    </div>
  );
}

export default App;
