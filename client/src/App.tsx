import { useState, useEffect, useRef } from "react";
import { generateRandomLetters } from "./lib/utils";
import { isValidWord, checkWordWithAPI } from "./lib/dictionary";
import { calculateWordScore } from "./lib/gameUtils";

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

// Enhanced Chat Component with Support for In-Game Chat
interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface ChatBoxProps {
  gameId?: string;
  username: string;
  inGame?: boolean;
}

function ChatBox({ gameId, username = "You", inGame = false }: ChatBoxProps) {
  // Different initial messages based on context (lobby vs game)
  const getInitialMessages = () => {
    const baseMessages = [
      { 
        id: 1, 
        sender: "System", 
        content: inGame 
          ? `Game chat started. Good luck and have fun!` 
          : "Welcome to the lobby chat!", 
        timestamp: new Date(),
        isSystem: true 
      }
    ];
    
    if (!inGame) {
      // Add some example messages in the lobby chat
      return [
        ...baseMessages,
        { id: 2, sender: "Alice", content: "Hi everyone! Who wants to play a word game?", timestamp: new Date(Date.now() - 5 * 60000) },
        { id: 3, sender: "Bob", content: "I prefer math games. Anyone interested?", timestamp: new Date(Date.now() - 3 * 60000) }
      ];
    }
    
    return baseMessages;
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Reload messages when switching between lobby and game
  useEffect(() => {
    setMessages(getInitialMessages());
  }, [inGame, gameId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        sender: username,
        content: newMessage.trim(),
        timestamp: new Date()
      };
      
      // In a real implementation, we would send this to the server
      // socket.emit('chat', { gameId, message, sender: username });
      
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white font-medium">
        {inGame ? `Game Chat${gameId ? ` - Game #${gameId}` : ''}` : "Lobby Chat"}
      </div>
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === username ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-lg px-4 py-2 ${
              message.isSystem
                ? "bg-gray-200 text-gray-800"
                : message.sender === username 
                ? "bg-blue-100 text-blue-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              <div className="text-xs font-medium mb-1">
                {message.sender} · {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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

// Import GameHistory component
import GameHistory from './components/GameHistory';

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
  // State for active tab
  const [activeTab, setActiveTab] = useState<'games' | 'history'>('games');

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
      
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-6 py-2 font-medium ${
            activeTab === 'games' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('games')}
        >
          Play Games
        </button>
        <button
          className={`px-6 py-2 font-medium ${
            activeTab === 'history' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Game History
        </button>
      </div>
      
      {/* Games Tab */}
      {activeTab === 'games' && (
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
            <ChatBox username={username} />
          </div>
        </div>
      )}
      
      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 gap-6">
          <GameHistory limit={10} />
        </div>
      )}
    </div>
  );
}

// Enhanced Word Game Component with Single/Multiplayer Options
function WordGame({ username, onBack }: { username: string, onBack: () => void }) {
  // Game phases
  const [gamePhase, setGamePhase] = useState<"setup" | "playing">("setup");
  // Game type (single or multiplayer)
  const [playMode, setPlayMode] = useState<"single" | "multi">("single");
  const [targetScore, setTargetScore] = useState<number>(100);
  const [gameLetters, setGameLetters] = useState<string[]>(generateRandomLetters(7));
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [submittedWords, setSubmittedWords] = useState<{word: string, score: number, isValid: boolean}[]>([]);
  const [timeLeft, setTimeLeft] = useState(30); // Increased to 30 seconds
  const [roundEnded, setRoundEnded] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string>(`word-${Date.now()}`);
  
  // Handle letter selection
  const selectLetter = (letter: string, index: number) => {
    // Only add if not already selected and round not ended and hasn't submitted yet
    if (!selectedLetters.includes(letter + index) && !roundEnded && !hasSubmitted) {
      setSelectedLetters([...selectedLetters, letter + index]);
    }
  };
  
  // Clear selected letters
  const clearSelection = () => {
    if (!hasSubmitted) {
      setSelectedLetters([]);
    }
  };
  
  // Submit current word
  const submitWord = async () => {
    // Only allow submission if time hasn't elapsed and player hasn't submitted yet
    if (roundEnded || hasSubmitted) return;
    
    const word = selectedLetters.map(l => l.charAt(0)).join("");
    
    if (word.length < 3) {
      setFeedback({
        message: "Word must be at least 3 letters long",
        type: "error"
      });
      setTimeout(() => setFeedback(null), 3000);
      
      // Mark as submitted even if the word is too short
      setHasSubmitted(true);
      return;
    }
    
    // Show "checking" feedback
    setFeedback({
      message: `Checking "${word}"...`,
      type: "info"
    });
    
    // Set loading state
    setHasSubmitted(true); // Prevent multiple submissions
    
    try {
      // First try checking our cache via the synchronous method
      let valid = isValidWord(word.toLowerCase());
      
      // If not in our cache/fallback list, check with the API
      if (!valid) {
        valid = await checkWordWithAPI(word);
      }
      
      // Calculate score (only if word is valid)
      let score = 0;
      
      if (valid) {
        // Add points for each letter (vowels=1, consonants=2)
        for (const letter of word) {
          if (/[AEIOU]/i.test(letter)) {
            score += 1; // Vowels are worth 1 point
          } else {
            score += 2; // Consonants are worth 2 points
          }
        }
        
        // Add bonus for longer words
        if (word.length > 5) score += 3;
        else if (word.length > 3) score += 1;
      }
      
      // Always add the word to submitted words with valid flag
      setSubmittedWords([...submittedWords, { word, score, isValid: valid }]);
      setSelectedLetters([]);
      
      // Show appropriate feedback based on validation result
      if (valid) {
        setFeedback({
          message: `"${word}" accepted! +${score} points`,
          type: "success"
        });
      } else {
        setFeedback({
          message: `"${word}" is not a valid English word. No points earned.`,
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error validating word:", error);
      
      // If there's an error with the API, give the user the benefit of the doubt
      // and accept the word with the basic calculation
      const score = calculateWordScore(word);
      
      setSubmittedWords([...submittedWords, { 
        word, 
        score, 
        isValid: true // Accept the word if the API fails
      }]);
      
      setFeedback({
        message: `"${word}" accepted! +${score} points`,
        type: "success"
      });
    }
    
    setTimeout(() => setFeedback(null), 3000);
  };
  
  // Reset the game for a new round
  const startNewRound = () => {
    setTimeLeft(30);
    setRoundEnded(false);
    setSelectedLetters([]);
    setHasSubmitted(false); // Reset submission state
    setGameLetters(generateRandomLetters(7)); // Generate new letters for the new round
    setFeedback({
      message: "New round started! You have 30 seconds",
      type: "info"
    });
    setTimeout(() => setFeedback(null), 3000);
  };
  
  // Simulate countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up!
      setRoundEnded(true);
    }
  }, [timeLeft]);
  
  // Update total score when submitted words change
  useEffect(() => {
    const newTotal = submittedWords.reduce((total, entry) => total + entry.score, 0);
    setTotalScore(newTotal);
    
    // Check if player reached the target score
    if (gamePhase === "playing" && newTotal >= targetScore) {
      setFeedback({
        message: `Congratulations! You've reached the target score of ${targetScore} points!`,
        type: "success"
      });
      setTimeout(() => {
        if (confirm(`You've reached the target score of ${targetScore} points! Play again?`)) {
          // Reset game for a new game
          setGamePhase("setup");
          setSubmittedWords([]);
          setTotalScore(0);
        }
      }, 1000);
    }
  }, [submittedWords]);
  
  // Start the game with selected target score
  const startGame = () => {
    setGamePhase("playing");
    setSubmittedWords([]);
    setTotalScore(0);
    startNewRound();
  };
  
  // Game Setup Screen
  if (gamePhase === "setup") {
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
          <div className="text-sm">
            <span className="text-gray-500">Player:</span>
            <span className="ml-1 font-medium">{username}</span>
          </div>
        </header>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Game Setup</h2>
          
          <div className="max-w-md mx-auto space-y-6">
            {/* Play Mode Selection */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Game Mode</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`p-4 rounded-lg border-2 text-center ${
                    playMode === 'single'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPlayMode('single')}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-medium">Single Player</div>
                  <div className="text-xs text-gray-500 mt-1">Play solo and challenge yourself</div>
                </button>
                
                <button
                  className={`p-4 rounded-lg border-2 text-center ${
                    playMode === 'multi'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPlayMode('multi')}
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium">Multiplayer</div>
                  <div className="text-xs text-gray-500 mt-1">Play with friends online</div>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Target Score to Win</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {[100, 150, 200, 250, 300, 350, 400, 450, 500].map(score => (
                  <button
                    key={score}
                    className={`px-4 py-2 rounded-md ${
                      targetScore === score 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setTargetScore(score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-bold text-blue-800 mb-2">Game Overview</h3>
              <p className="text-sm text-blue-700 mb-2">
                Try to reach {targetScore} points {playMode === 'multi' ? 'before your opponents!' : 'to win!'}
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Create words using the given letters</li>
                <li>Vowels are worth 1 point, consonants are worth 2 points</li>
                <li>Longer words earn bonus points</li>
                <li>You have 30 seconds per round to submit a word</li>
                {playMode === 'multi' && <li>Chat with other players during the game</li>}
              </ul>
            </div>
            
            <button 
              className="w-full py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
              onClick={() => {
                setGamePhase("playing");
                setSubmittedWords([]);
                setTotalScore(0);
                startNewRound();
              }}
            >
              {playMode === 'single' ? 'Start Game' : 'Create Multiplayer Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main Game Screen
  return (
    <div className="max-w-4xl w-full mx-auto">
      <header className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => {
              // Show warning dialog if game is in progress and target not reached
              if (gamePhase === "playing" && totalScore < targetScore) {
                setShowExitWarning(true);
              } else {
                onBack();
              }
            }}
            className="mr-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Word Challenge</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            timeLeft > 10 
              ? "bg-blue-100 text-blue-800" 
              : timeLeft > 5 
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}>
            Time: {timeLeft}s
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Player:</span>
            <span className="ml-1 font-medium">{username}</span>
          </div>
        </div>
      </header>
      
      {/* Exit Warning Dialog */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">Warning: Game in Progress</h3>
            <p className="mb-6 text-gray-700">
              You're about to leave the game before reaching the target score of {targetScore} points. 
              Your current progress will be lost and you won't be able to return to this game.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExitWarning(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Continue Playing
              </button>
              <button
                onClick={() => {
                  setShowExitWarning(false);
                  onBack();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-8">
              <h2 className="text-center text-xl font-bold mb-2">
                {roundEnded 
                  ? "Time's up! Round complete" 
                  : "Create a word using these letters"}
              </h2>
              <p className="text-center text-gray-600 mb-4">
                {roundEnded 
                  ? `You made ${submittedWords.length} word${submittedWords.length !== 1 ? 's' : ''}!` 
                  : "Select letters to form a word, then click Submit"}
              </p>
              
              {/* Feedback message */}
              {feedback && (
                <div className={`mb-2 p-2 rounded-md text-center ${
                  feedback.type === 'success' ? 'bg-green-100 text-green-800' :
                  feedback.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {feedback.message}
                </div>
              )}
              
              {/* Game status */}
              {hasSubmitted && !roundEnded && (
                <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded-md text-center">
                  Word submitted! Waiting for next round...
                </div>
              )}
              
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
                ) : roundEnded ? (
                  <span className="text-gray-600 font-medium">Round complete</span>
                ) : hasSubmitted ? (
                  <span className="text-gray-600">Already submitted for this round</span>
                ) : (
                  <span className="text-gray-400">Your word will appear here</span>
                )}
              </div>
              
              {/* Letter tiles */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {gameLetters.map((letter, index) => (
                  <button
                    key={index}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg text-2xl font-bold border-2 
                      ${selectedLetters.includes(letter + index) || roundEnded || hasSubmitted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                    onClick={() => selectLetter(letter, index)}
                    disabled={selectedLetters.includes(letter + index) || roundEnded || hasSubmitted}
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
                {roundEnded ? (
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={startNewRound}
                  >
                    Start New Round
                  </button>
                ) : (
                  <>
                    <button
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={clearSelection}
                      disabled={selectedLetters.length === 0 || hasSubmitted}
                    >
                      Clear
                    </button>
                    <button
                      className={`px-6 py-2 rounded-md ${
                        selectedLetters.length >= 3 && !hasSubmitted
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-200 text-blue-500 cursor-not-allowed"
                      }`}
                      onClick={submitWord}
                      disabled={selectedLetters.length < 3 || hasSubmitted}
                    >
                      {hasSubmitted ? "Already Submitted" : "Submit Word"}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Game Rules</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Create words using the provided letters</li>
                <li>Vowels are worth 1 point, consonants are worth 2 points</li>
                <li>Words must be at least 3 letters long</li>
                <li>Words must be valid English words</li>
                <li>You can only submit one word per round</li>
                <li>Longer words earn bonus points</li>
                <li>You have 30 seconds for each round</li>
                <li>First to reach {targetScore} points wins!</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-blue-600 text-white font-medium flex justify-between items-center">
              <span>Submitted Words</span>
              <span className="bg-white text-blue-800 px-2 py-1 rounded-md text-sm font-bold">
                Target: {targetScore}
              </span>
            </div>
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {submittedWords.length > 0 ? (
                submittedWords.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{entry.word}</span>
                    {entry.isValid ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                        +{entry.score} pts
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                        Invalid
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No words submitted yet
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-blue-600 text-white font-medium">
              Score Progress
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded mb-2">
                <span className="font-medium">{username} (You)</span>
                <span className="font-bold">
                  {totalScore} / {targetScore} pts
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${Math.min(100, (totalScore / targetScore) * 100)}%` }}
                />
              </div>
              
              <div className="text-center text-sm text-gray-500">
                {totalScore >= targetScore 
                  ? "Target score reached!" 
                  : `${targetScore - totalScore} points to win`}
              </div>
            </div>
          </div>
          
          {/* In-game chat - only show in multiplayer mode */}
          {playMode === 'multi' && (
            <ChatBox 
              username={username} 
              gameId={gameId}
              inGame={true}
            />
          )}
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
