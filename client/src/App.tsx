import { useState, useEffect, useRef, createContext, useContext } from "react";
import { generateRandomLetters } from "./lib/utils";
import { isValidWord, checkWordWithAPI } from "./lib/dictionary";
import { calculateWordScore } from "./lib/gameUtils";
import { generateMathProblem, MathProblem } from "./lib/mathProblems";
import { QuizQuestion, QuizCategory, getRandomQuestion } from "./lib/quizQuestions";

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
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Hakily</h1>
      <p className="text-gray-600 mb-4 text-center">
        Challenge yourself. Challenge your pals!
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
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
    // If new message is not from current user, increment unread count when minimized
    const lastMessage = messages[messages.length - 1];
    if (isMinimized && lastMessage && lastMessage.sender !== username && !lastMessage.isSystem) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isMinimized, username]);
  
  // Reload messages when switching between lobby and game
  useEffect(() => {
    setMessages(getInitialMessages());
    setUnreadCount(0);
  }, [inGame, gameId]);

  // Toggle chat minimization
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    // Clear unread count when opening the chat
    if (isMinimized) {
      setUnreadCount(0);
    }
  };

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
      
      // Simulate receiving a message reply after 2 seconds
      if (!inGame) {
        setTimeout(() => {
          const autoReply: Message = {
            id: messages.length + 2,
            sender: "Alice",
            content: "Thanks for your message! Would you like to join a word game?",
            timestamp: new Date()
          };
          setMessages(msgs => [...msgs, autoReply]);
        }, 2000);
      }
      
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden chat-box">
      <div className="p-3 bg-blue-600 text-white font-medium flex justify-between items-center">
        <div className="flex items-center">
          {inGame ? `Game Chat${gameId ? ` - Game #${gameId}` : ''}` : "Lobby Chat"}
          {unreadCount > 0 && (
            <div className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {unreadCount}
            </div>
          )}
        </div>
        <button 
          onClick={toggleMinimize}
          className="p-1 hover:bg-blue-700 rounded"
        >
          {isMinimized ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9A.5.5 0 0 1 8 3"/>
              <path d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.143 0H.5a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-.5.5H.143a.5.5 0 0 1-.5-.5v-15a.5.5 0 0 1 .5-.5M2.286 1h13.571v14H2.286z"/>
              <path d="M3 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
            </svg>
          )}
        </button>
      </div>
      
      {!isMinimized && (
        <>
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
        </>
      )}
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
  const lobbyContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-6xl w-full mx-auto" ref={lobbyContainerRef}>
      <header className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Hakily</h1>
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
          onClick={() => {
            setActiveTab('games');
            // Force window to scroll to top when switching tabs
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
        >
          Play Games
        </button>
        <button
          className={`px-6 py-2 font-medium ${
            activeTab === 'history' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('history');
            // Force window to scroll to top when switching tabs
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
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
                  onClick={() => onStartGame("math")}
                >
                  <div className="text-4xl mb-2">🔢</div>
                  <h3 className="font-bold">Math Wizards</h3>
                  <p className="text-sm text-gray-500">Solve math problems</p>
                </div>
                
                <div 
                  className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => onStartGame("quiz")}
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
  const [showChat, setShowChat] = useState<boolean>(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(3);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  
  // Ref for game container to scroll to top
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
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
    
    // In single-player mode, immediately end the round to show the Next button
    if (playMode === 'single') {
      setRoundEnded(true);
    }
    // In multiplayer mode, mark as submitted but don't immediately end the round
    // This allows other players to still submit their words until time runs out
    else if (playMode === 'multi') {
      // Only show feedback about submitting
      setFeedback({
        message: `Word submitted! Waiting for round to complete...`,
        type: "info"
      });
      
      // Clear feedback after a few seconds
      setTimeout(() => setFeedback(null), 3000);
    }
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
    
    // Force window to scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  // Simulate countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up!
      setRoundEnded(true);
      
      // In multiplayer mode, automatically advance to next round after 5 seconds
      if (playMode === 'multi') {
        // Update feedback to inform player of auto-advance
        setFeedback({
          message: `Time's up! Next round in 5 seconds...`,
          type: "info"
        });
        
        // Start countdown from 5
        setAutoAdvanceCountdown(5);
        
        // Create a 5-second countdown
        const countdownInterval = setInterval(() => {
          setAutoAdvanceCountdown(prevCount => {
            if (prevCount === null || prevCount <= 1) {
              clearInterval(countdownInterval);
              return null;
            }
            return prevCount - 1;
          });
        }, 1000);
        
        // Advance to next round after 5 seconds
        setTimeout(() => {
          clearInterval(countdownInterval);
          setAutoAdvanceCountdown(null);
          startNewRound();
        }, 5000);
      }
    }
  }, [timeLeft, playMode]);
  
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
      <div className="max-w-4xl w-full mx-auto" ref={gameContainerRef}>
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
                  onClick={() => {
                    setPlayMode('single');
                    // Force window to scroll to top
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
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
                  onClick={() => {
                    setPlayMode('multi');
                    // Force window to scroll to top
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
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
                    onClick={() => {
                      setTargetScore(score);
                      // Force window to scroll to top
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }}
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
                
                // Force window to scroll to top
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
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
    <div className="max-w-4xl w-full mx-auto" ref={gameContainerRef}>
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
          
          {/* Chat notification icon in multiplayer mode */}
          {playMode === 'multi' && (
            <button 
              className="relative p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center justify-center"
              onClick={() => {
                // Toggle chat visibility
                setShowChat(!showChat);
                
                // If opening chat, reset unread count
                if (!showChat) {
                  setUnreadChatCount(0);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
              </svg>
              
              {/* Notification badge */}
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}
          
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
        <div className="md:col-span-3">
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
              {hasSubmitted && roundEnded && (
                <div className="mb-2 p-2 bg-green-100 text-green-800 rounded-md text-center">
                  {playMode === 'multi' ? 
                    "Round complete! Next round will appear automatically →" : 
                    "Round complete! Click \"Start New Round\" to continue →"
                  }
                </div>
              )}
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
                  autoAdvanceCountdown ? (
                    <div className="px-6 py-3 bg-gray-500 text-white rounded-md text-lg font-medium flex items-center space-x-2">
                      <span>Next round in</span>
                      <span className="bg-gray-700 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                        {autoAdvanceCountdown}
                      </span>
                      <span>seconds</span>
                    </div>
                  ) : playMode === 'single' && (
                    <button
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={startNewRound}
                    >
                      Start New Round
                    </button>
                  )
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
                {playMode === 'multi' && (
                  <li className="text-blue-800 font-medium">Next round auto-advances after 5 seconds!</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
          </div>
        </div>
        
        <div className="md:col-span-1">
          {/* In-game chat - only show in multiplayer mode when chat is toggled on */}
          {playMode === 'multi' ? (
            showChat ? (
              <ChatBox 
                username={username} 
                gameId={gameId}
                inGame={true}
              />
            ) : (
              <div 
                className="bg-white rounded-lg shadow-md p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setShowChat(true);
                  setUnreadChatCount(0);
                }}
              >
                <div className="text-2xl mb-3">💬</div>
                <h3 className="font-bold text-lg mb-1">Game Chat Hidden</h3>
                <p className="text-sm text-gray-600">
                  Click here or use the chat icon in the header to show chat
                  {unreadChatCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {unreadChatCount} new
                    </span>
                  )}
                </p>
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl mb-3">👤</div>
              <h3 className="font-bold text-lg mb-1">Single Player Mode</h3>
              <p className="text-sm text-gray-600">
                You're playing in single player mode. Switch to multiplayer to chat with other players!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Global Chat Notification Context
import React from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const [newChatCount, setNewChatCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  
  // Reset chat notification count
  const resetChatCount = () => {
    setNewChatCount(0);
    setShowNotification(false);
  };
  
  // Helper function to scroll to top of the app container
  const scrollToTop = () => {
    // Use window.scrollTo for consistent scrolling behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (name: string) => {
    setUsername(name);
    setIsLoggedIn(true);
    // Scroll to top when signing in
    setTimeout(scrollToTop, 100);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setCurrentGame(null);
  };
  
  const startGame = (gameType: string) => {
    setCurrentGame(gameType);
    // Scroll to top when entering a game
    setTimeout(scrollToTop, 100);
  };
  
  const backToLobby = () => {
    setCurrentGame(null);
    // Scroll to top when returning to lobby
    setTimeout(scrollToTop, 100);
  };

  // Main content based on login state and current game
  let content;
  if (!isLoggedIn) {
    content = <LoginForm onLogin={handleLogin} />;
  } else if (currentGame === "word") {
    content = <WordGame username={username} onBack={backToLobby} />;
  } else if (currentGame === "math") {
    content = <MathGame username={username} onBack={backToLobby} />;
  } else if (currentGame === "quiz") {
    content = <QuizGame username={username} onBack={backToLobby} />;
  } else {
    content = (
      <GameLobby 
        username={username} 
        onLogout={handleLogout} 
        onStartGame={startGame}
      />
    );
  }

  // Simulate new chat message for demo purposes
  useEffect(() => {
    if (isLoggedIn && !currentGame) {
      // Show a notification after 5 seconds
      const timer = setTimeout(() => {
        setNewChatCount(prev => prev + 1);
        setShowNotification(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, currentGame]);

  return (
    <div 
      ref={appContainerRef}
      className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center relative"
    >
      {/* Chat notification at top of screen */}
      {showNotification && (
        <div 
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-bounce cursor-pointer"
          onClick={() => {
            resetChatCount();
            // Scroll to chat if needed
            const chatElement = document.querySelector('.chat-box');
            if (chatElement) {
              chatElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
          </svg>
          <span className="font-medium">{newChatCount} new message{newChatCount !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      {content}
    </div>
  );
}

// Math Game Component
function MathGame({ username, onBack }: { username: string, onBack: () => void }) {
  // Game phases
  const [gamePhase, setGamePhase] = useState<"setup" | "playing">("setup");
  // Game type (single or multiplayer)
  const [playMode, setPlayMode] = useState<"single" | "multi">("single");
  const [targetScore, setTargetScore] = useState<number>(100);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per problem
  const [roundEnded, setRoundEnded] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<{problem: string, userAnswer: string, correctAnswer: number, isCorrect: boolean, score: number}[]>([]);
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string>(`math-${Date.now()}`);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(2);
  const [currentRound, setCurrentRound] = useState(1);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  
  // Ref for game container to scroll to top
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate a new math problem
  const generateNewProblem = () => {
    try {
      // Map the UI difficulty to the actual difficulty type
      const problemDifficulty = 
        difficulty === 'easy' ? 'easy' :
        difficulty === 'hard' ? 'hard' : 'medium';
      
      // Create a new problem based on the selected difficulty
      const problem = generateMathProblem(problemDifficulty);
      console.log(`Generated new ${problemDifficulty} difficulty problem:`, problem);
      
      // Update the state with the new problem
      setCurrentProblem(problem);
      
      return problem;
    } catch (error) {
      console.error("Error generating math problem:", error);
      
      // Fallback problem in case of error
      const fallbackProblem = {
        problem: "5 + 5",
        answer: 10
      };
      setCurrentProblem(fallbackProblem);
      return fallbackProblem;
    }
  };
  
  // Submit current answer
  const submitAnswer = () => {
    // Only allow submission if time hasn't elapsed and player hasn't submitted yet
    if (roundEnded || hasSubmitted || !currentProblem) return;
    
    const userNumericAnswer = Number(userAnswer);
    const isCorrect = !isNaN(userNumericAnswer) && userNumericAnswer === currentProblem.answer;
    
    // Calculate score (only if answer is correct)
    let score = 0;
    if (isCorrect) {
      // Base score for correct answer
      score = 10;
      
      // Bonus points based on time left
      if (timeLeft > 20) score += 5;
      else if (timeLeft > 10) score += 3;
    }
    
    // Add the answer to submitted answers
    setSubmittedAnswers([...submittedAnswers, {
      problem: currentProblem.problem,
      userAnswer: userAnswer,
      correctAnswer: currentProblem.answer,
      isCorrect,
      score
    }]);
    
    // Show appropriate feedback
    if (isCorrect) {
      setFeedback({
        message: `Correct! +${score} points`,
        type: "success"
      });
      // Update total score
      setTotalScore(prev => prev + score);
    } else {
      setFeedback({
        message: `Incorrect. The answer was ${currentProblem.answer}.`,
        type: "error"
      });
    }
    
    // Set submitted state
    setHasSubmitted(true);
    
    // In single-player mode, immediately end the round to show the Next button
    if (playMode === 'single') {
      setRoundEnded(true);
    }
    // In multiplayer mode, mark as submitted but don't immediately end the round
    // This allows other players to still submit their answers until time runs out
    else if (playMode === 'multi') {
      // Only show feedback about submitting
      setFeedback({
        message: `Answer submitted! Waiting for round to complete...`,
        type: "info"
      });
      
      // Clear feedback after a few seconds
      setTimeout(() => setFeedback(null), 3000);
    }
    
    // Log that the round has ended for debugging
    console.log("Round ended after answer submission");
  };
  
  // Start a new round
  const startNewRound = () => {
    // Force window to scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Set time based on difficulty
    const timeForDifficulty = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20;
    
    // Update game state
    setTimeLeft(timeForDifficulty);
    setRoundEnded(false);
    setUserAnswer("");
    setHasSubmitted(false);
    const problem = generateNewProblem();
    console.log("New round problem:", problem);
    setCurrentRound(prev => prev + 1);
    setFeedback({
      message: `New problem! You have ${timeForDifficulty} seconds to solve it.`,
      type: "info"
    });
    setTimeout(() => setFeedback(null), 3000);
    
    // Force window to scroll to top again after UI has updated
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  // Effect to make sure problem is generated if it's missing
  useEffect(() => {
    if (gamePhase === "playing" && !currentProblem) {
      console.log("No problem found, generating a new one");
      generateNewProblem();
    }
  }, [gamePhase, currentProblem]);

  // Simulate countdown timer
  useEffect(() => {
    // In multiplayer mode, continue the timer even after submission
    // In single player mode, stop the timer after submission
    if (gamePhase === "playing" && timeLeft > 0 && (playMode === 'multi' || !hasSubmitted)) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !roundEnded) {
      // Time's up!
      setRoundEnded(true);
      if (currentProblem) {
        setFeedback({
          message: `Time's up! The answer was ${currentProblem.answer}.`,
          type: "error"
        });
        setTimeout(() => setFeedback(null), 3000);
        
        // In multiplayer mode, automatically advance to next round after 5 seconds
        if (playMode === 'multi') {
          // Update feedback briefly
          setTimeout(() => {
            setFeedback({
              message: `Next problem in 5 seconds...`,
              type: "info"
            });
          }, 2000);
          
          // Start countdown from 5
          setTimeout(() => {
            setAutoAdvanceCountdown(5);
            
            // Create a 5-second countdown
            const countdownInterval = setInterval(() => {
              setAutoAdvanceCountdown(prevCount => {
                if (prevCount === null || prevCount <= 1) {
                  clearInterval(countdownInterval);
                  return null;
                }
                return prevCount - 1;
              });
            }, 1000);
            
            // Advance to next problem after 5 seconds
            setTimeout(() => {
              clearInterval(countdownInterval);
              setAutoAdvanceCountdown(null);
              startNewRound();
            }, 5000);
          }, 2500);
        }
      }
    }
  }, [timeLeft, hasSubmitted, roundEnded, gamePhase, currentProblem, playMode]);
  
  // Check if player reached the target score
  useEffect(() => {
    if (gamePhase === "playing" && totalScore >= targetScore) {
      setFeedback({
        message: `Congratulations! You've reached the target score of ${targetScore} points!`,
        type: "success"
      });
      setTimeout(() => {
        if (confirm(`You've reached the target score of ${targetScore} points! Play again?`)) {
          // Reset game for a new game
          setGamePhase("setup");
          setSubmittedAnswers([]);
          setTotalScore(0);
          setCurrentRound(1);
        }
      }, 1000);
    }
  }, [totalScore, targetScore, gamePhase]);
  
  // Start the game
  const startGame = () => {
    setGamePhase("playing");
    setSubmittedAnswers([]);
    setTotalScore(0);
    setCurrentRound(1);
    const problem = generateNewProblem();
    console.log("Initial problem generated:", problem);
    
    // Set time based on difficulty
    const timeForDifficulty = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20;
    setTimeLeft(timeForDifficulty);
    
    setRoundEnded(false);
    setHasSubmitted(false);
    
    // Scroll to top of the page immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also schedule another scroll after a brief delay to ensure UI has updated
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  // Game Setup Screen
  if (gamePhase === "setup") {
    return (
      <div className="max-w-4xl w-full mx-auto" ref={gameContainerRef}>
        <header className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={onBack}  
              className="mr-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-blue-600">Math Wizards</h1>
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
                  onClick={() => {
                    setPlayMode('single');
                    // Force window to scroll to top
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
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
                  onClick={() => {
                    setPlayMode('multi');
                    // Force window to scroll to top
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium">Multiplayer</div>
                  <div className="text-xs text-gray-500 mt-1">Play with friends online</div>
                </button>
              </div>
            </div>
            
            {/* Difficulty Selection */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Difficulty</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  className={`p-3 rounded-lg border-2 text-center ${
                    difficulty === 'easy'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDifficulty('easy')}
                >
                  <div className="font-medium">Easy</div>
                  <div className="text-xs text-gray-500 mt-1">Small numbers (1-100)</div>
                </button>
                
                <button
                  className={`p-3 rounded-lg border-2 text-center ${
                    difficulty === 'medium'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDifficulty('medium')}
                >
                  <div className="font-medium">Medium</div>
                  <div className="text-xs text-gray-500 mt-1">3-digit numbers</div>
                </button>
                
                <button
                  className={`p-3 rounded-lg border-2 text-center ${
                    difficulty === 'hard'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDifficulty('hard')}
                >
                  <div className="font-medium">Hard</div>
                  <div className="text-xs text-gray-500 mt-1">Up to 4-digit numbers</div>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Target Score to Win</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {[50, 100, 150, 200, 250, 300].map(score => (
                  <button
                    key={score}
                    className={`px-4 py-2 rounded-md ${
                      targetScore === score 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      setTargetScore(score);
                      // Force window to scroll to top
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }}
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
                <li>Solve addition, subtraction, multiplication, and division problems</li>
                <li>Each correct answer earns 10 base points</li>
                <li>Faster answers earn more bonus points (up to +5)</li>
                <li>Time limit depends on difficulty: 
                  <span className={difficulty === 'easy' ? 'font-semibold text-green-700' : ''}>Easy (30s)</span>, 
                  <span className={difficulty === 'medium' ? 'font-semibold text-yellow-700' : ''}> Medium (25s)</span>, 
                  <span className={difficulty === 'hard' ? 'font-semibold text-red-700' : ''}> Hard (20s)</span>
                </li>
                {playMode === 'multi' && (
                  <>
                    <li>Chat with other players during the game</li>
                    <li>Next problem auto-advances after 5 seconds</li>
                  </>
                )}
              </ul>
              
              <div className="mt-2 p-2 bg-blue-100 rounded-md text-xs text-blue-800">
                <p className="font-semibold">Difficulty: {difficulty}</p>
                <p>{
                  difficulty === 'easy' ? 'Simple problems with smaller numbers (1-100)' :
                  difficulty === 'medium' ? 'Moderate problems with 3-digit numbers' :
                  'Challenging problems with numbers up to 4 digits'
                }</p>
              </div>
            </div>
            
            <button 
              className="w-full py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
              onClick={startGame}
            >
              {playMode === 'single' ? 'Start Game' : 'Create Multiplayer Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Game Playing Screen
  return (
    <div className="max-w-4xl w-full mx-auto" ref={gameContainerRef}>
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
          <h1 className="text-2xl font-bold text-blue-600">Math Wizards</h1>
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
          
          {/* Chat notification icon in multiplayer mode */}
          {playMode === 'multi' && (
            <button 
              className="relative p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center justify-center"
              onClick={() => {
                // Toggle chat visibility
                setShowChat(!showChat);
                
                // If opening chat, reset unread count
                if (!showChat) {
                  setUnreadChatCount(0);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
              </svg>
              
              {/* Notification badge */}
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}
          
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
        <div className="md:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-8">
              <h2 className="text-center text-xl font-bold mb-2">
                {roundEnded 
                  ? "Time's up! Round complete" 
                  : "Solve this math problem"}
              </h2>
              <p className="text-center text-gray-600 mb-4">
                {roundEnded 
                  ? `You've completed ${submittedAnswers.length} problem${submittedAnswers.length !== 1 ? 's' : ''}!` 
                  : "Enter your answer below, then click Submit"}
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
              {hasSubmitted && roundEnded && (
                <div className="mb-2 p-2 bg-green-100 text-green-800 rounded-md text-center">
                  {playMode === 'multi' ? 
                    "Round complete! Next problem will appear automatically →" : 
                    "Round complete! Click \"Next Problem\" to continue →"
                  }
                </div>
              )}
              {hasSubmitted && !roundEnded && (
                <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded-md text-center">
                  Answer submitted! Waiting for next round...
                </div>
              )}
              
              {/* Math problem display */}
              <div className="my-8 text-center">
                <div className="text-3xl font-bold mb-4">
                  {currentProblem ? (
                    <>{currentProblem.problem} = ?</>
                  ) : (
                    "Loading problem..."
                  )}
                </div>
                {/* Debug info - will be removed in production */}
                <div className="text-xs text-gray-400 mb-2">
                  Round: {currentRound} | Problem ID: {currentProblem ? Date.now() % 1000 : 'none'} 
                </div>
                
                {/* Answer input */}
                <div className="flex justify-center mb-6">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => !hasSubmitted && !roundEnded && setUserAnswer(e.target.value)}
                    className="w-40 px-4 py-2 text-xl font-medium text-center border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="Your answer"
                    disabled={hasSubmitted || roundEnded}
                  />
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-center space-x-4">
                  {roundEnded ? (
                    autoAdvanceCountdown ? (
                      <div className="px-6 py-3 bg-gray-500 text-white rounded-md text-lg font-medium flex items-center space-x-2">
                        <span>Next problem in</span>
                        <span className="bg-gray-700 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                          {autoAdvanceCountdown}
                        </span>
                        <span>seconds</span>
                      </div>
                    ) : playMode === 'single' && (
                      <button
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-lg font-medium animate-pulse"
                        onClick={startNewRound}
                      >
                        Next Problem →
                      </button>
                    )
                  ) : (
                    <button
                      className={`px-6 py-2 rounded-md ${
                        userAnswer && !hasSubmitted
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-200 text-blue-500 cursor-not-allowed"
                      }`}
                      onClick={submitAnswer}
                      disabled={!userAnswer || hasSubmitted}
                    >
                      {hasSubmitted ? "Already Submitted" : "Submit Answer"}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">Game Rules</h3>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Solve addition, subtraction, multiplication, and division problems</li>
                  <li>Complete each problem within the time limit: 
                    <span className={difficulty === 'easy' ? 'font-semibold text-green-700' : ''}> Easy (30s)</span>,
                    <span className={difficulty === 'medium' ? 'font-semibold text-yellow-700' : ''}> Medium (25s)</span>,
                    <span className={difficulty === 'hard' ? 'font-semibold text-red-700' : ''}> Hard (20s)</span>
                  </li>
                  <li>Each correct answer is worth 10 base points</li>
                  <li>Answering quickly earns you bonus points (up to +5)</li>
                  <li>You can only submit one answer per problem</li>
                  <li>First to reach {targetScore} points wins!</li>
                  {playMode === 'multi' && (
                    <li className="text-blue-800 font-medium">Next problem auto-advances after 5 seconds!</li>
                  )}
                  <li className="text-xs mt-1 text-blue-600">Playing on {difficulty} difficulty ({
                    difficulty === 'easy' ? 'smaller numbers' :
                    difficulty === 'medium' ? 'medium-sized numbers' :
                    'large numbers up to 4 digits'
                  })</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-600 text-white font-medium flex justify-between items-center">
                <span>Answer History</span>
                <span className="bg-white text-blue-800 px-2 py-1 rounded-md text-sm font-bold">
                  Round: {currentRound}
                </span>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {submittedAnswers.length > 0 ? (
                  submittedAnswers.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{entry.problem} = {entry.correctAnswer}</span>
                        <div className="text-xs text-gray-500">Your answer: {entry.userAnswer}</div>
                      </div>
                      {entry.isCorrect ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                          +{entry.score} pts
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                          Incorrect
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No answers submitted yet
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
          </div>
        </div>
        
        <div className="md:col-span-1">
          {/* In-game chat - only show in multiplayer mode when chat is toggled on */}
          {playMode === 'multi' ? (
            showChat ? (
              <ChatBox 
                username={username} 
                gameId={gameId}
                inGame={true}
              />
            ) : (
              <div 
                className="bg-white rounded-lg shadow-md p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setShowChat(true);
                  setUnreadChatCount(0);
                }}
              >
                <div className="text-2xl mb-3">💬</div>
                <h3 className="font-bold text-lg mb-1">Game Chat Hidden</h3>
                <p className="text-sm text-gray-600">
                  Click here or use the chat icon in the header to show chat
                  {unreadChatCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {unreadChatCount} new
                    </span>
                  )}
                </p>
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl mb-3">👤</div>
              <h3 className="font-bold text-lg mb-1">Single Player Mode</h3>
              <p className="text-sm text-gray-600">
                You're playing in single player mode. Switch to multiplayer to chat with other players!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quiz Game Component
function QuizGame({ username, onBack }: { username: string, onBack: () => void }) {
  // Game phases
  const [gamePhase, setGamePhase] = useState<"setup" | "playing">("setup");
  // Game type (single or multiplayer)
  const [playMode, setPlayMode] = useState<"single" | "multi">("single");
  const [targetScore, setTargetScore] = useState<number>(100);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [roundEnded, setRoundEnded] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<{question: string, selectedOption: number, correctOption: number, isCorrect: boolean, score: number}[]>([]);
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string>(`quiz-${Date.now()}`);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(2);
  const [currentRound, setCurrentRound] = useState(1);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<QuizCategory[]>(["science", "history", "geography", "entertainment"]);
  
  // Ref for game container to scroll to top
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate a new quiz question
  const generateNewQuestion = () => {
    try {
      // Get a random question from the selected categories
      const question = getRandomQuestion();
      console.log("Generated new quiz question:", question);
      
      // Update the state with the new question
      setCurrentQuestion(question);
      
      return question;
    } catch (error) {
      console.error("Error generating quiz question:", error);
      
      // Fallback question in case of error
      const fallbackQuestion = {
        question: "What is the capital of France?",
        options: ["Berlin", "London", "Paris", "Madrid"],
        correctOption: 2
      };
      setCurrentQuestion(fallbackQuestion);
      return fallbackQuestion;
    }
  };
  
  // Submit the selected answer
  const submitAnswer = () => {
    if (roundEnded || hasSubmitted || selectedOption === null || !currentQuestion) return;
    
    const isCorrect = selectedOption === currentQuestion.correctOption;
    
    // Calculate score: 10 points for correct answer, 0 for incorrect
    // Add difficulty bonus: easy=0, medium=5, hard=10
    const difficultyBonus = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 5 : 10;
    const score = isCorrect ? 10 + difficultyBonus : 0;
    
    // Add to submitted answers
    setSubmittedAnswers([
      ...submittedAnswers,
      {
        question: currentQuestion.question,
        selectedOption,
        correctOption: currentQuestion.correctOption,
        isCorrect,
        score
      }
    ]);
    
    // Update total score
    setTotalScore(prevScore => prevScore + score);
    
    // Mark as submitted
    setHasSubmitted(true);
    
    // Show feedback
    setFeedback({
      message: isCorrect 
        ? `Correct! +${score} points` 
        : `Incorrect. The correct answer was: ${currentQuestion.options[currentQuestion.correctOption]}`,
      type: isCorrect ? 'success' : 'error'
    });
    
    setTimeout(() => setFeedback(null), 3000);
    
    // In single-player mode, immediately end the round to show the Next button
    if (playMode === 'single') {
      setRoundEnded(true);
    }
    // In multiplayer mode, mark as submitted but don't immediately end the round
    // This allows other players to still submit their answers until time runs out
    else if (playMode === 'multi') {
      // Only show feedback about submitting
      setFeedback({
        message: `Answer submitted! Waiting for round to complete...`,
        type: "info"
      });
      
      // Clear feedback after a few seconds
      setTimeout(() => setFeedback(null), 3000);
    }
  };
  
  // Reset the game for a new round
  const startNewRound = () => {
    // Set time based on difficulty
    const timeForDifficulty = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20;
    
    // Generate new question before showing it
    const newQuestion = generateNewQuestion();
    
    // Update game state
    setTimeLeft(timeForDifficulty);
    setRoundEnded(false);
    setSelectedOption(null);
    setHasSubmitted(false); // Reset submission state
    setCurrentRound(prevRound => prevRound + 1);
    
    setFeedback({
      message: `Round ${currentRound + 1} started! You have ${timeForDifficulty} seconds`,
      type: "info"
    });
    setTimeout(() => setFeedback(null), 3000);
    
    // Force window to scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  // Simulate countdown timer
  useEffect(() => {
    // In multiplayer mode, continue the timer even after submission
    // In single player mode, stop the timer after submission
    if (timeLeft > 0 && (playMode === 'multi' || !hasSubmitted)) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up!
      setRoundEnded(true);
      
      // In multiplayer mode, automatically advance to next round after 5 seconds
      if (playMode === 'multi') {
        // Don't modify the current question - just show feedback message
        // This prevents the question text from jumping around
        
        // Update feedback to inform player of auto-advance
        setFeedback({
          message: `Time's up! Next question in 5 seconds...`,
          type: "info"
        });
        
        // Start countdown from 5
        setAutoAdvanceCountdown(5);
        
        // Create a 5-second countdown
        const countdownInterval = setInterval(() => {
          setAutoAdvanceCountdown(prevCount => {
            if (prevCount === null || prevCount <= 1) {
              clearInterval(countdownInterval);
              return null;
            }
            return prevCount - 1;
          });
        }, 1000);
        
        // Advance to next round after 5 seconds
        setTimeout(() => {
          clearInterval(countdownInterval);
          setAutoAdvanceCountdown(null);
          startNewRound();
        }, 5000);
      }
    }
  }, [timeLeft, playMode, currentQuestion, hasSubmitted]);
  
  // Initialize the game with the first question
  useEffect(() => {
    if (gamePhase === "playing" && !currentQuestion) {
      generateNewQuestion();
    }
  }, [gamePhase]);
  
  // Check if player reached the target score
  useEffect(() => {
    if (gamePhase === "playing" && totalScore >= targetScore) {
      setFeedback({
        message: `Congratulations! You've reached the target score of ${targetScore} points!`,
        type: "success"
      });
      setTimeout(() => {
        if (confirm(`You've reached the target score of ${targetScore} points! Play again?`)) {
          // Reset game for a new game
          setGamePhase("setup");
          setSubmittedAnswers([]);
          setTotalScore(0);
          setCurrentRound(1);
        }
      }, 1000);
    }
  }, [totalScore, targetScore, gamePhase]);
  
  // Game Setup Screen
  if (gamePhase === "setup") {
    return (
      <div className="max-w-4xl w-full mx-auto" ref={gameContainerRef}>
        <header className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={onBack}  
              className="mr-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-blue-600">Quiz Challenge</h1>
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
                  onClick={() => {
                    setPlayMode('single');
                    // Force window to scroll to top
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
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
                  onClick={() => {
                    setPlayMode('multi');
                    // Force window to scroll to top
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium">Multiplayer</div>
                  <div className="text-xs text-gray-500 mt-1">Play with friends online</div>
                </button>
              </div>
            </div>
            
            {/* Difficulty Selection */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Difficulty</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`p-3 rounded-lg border-2 text-center ${
                    difficulty === 'easy'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDifficulty('easy')}
                >
                  <div className="font-medium">Easy</div>
                  <div className="text-xs text-gray-500 mt-1">30 seconds</div>
                </button>
                
                <button
                  className={`p-3 rounded-lg border-2 text-center ${
                    difficulty === 'medium'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDifficulty('medium')}
                >
                  <div className="font-medium">Medium</div>
                  <div className="text-xs text-gray-500 mt-1">25 seconds</div>
                </button>
                
                <button
                  className={`p-3 rounded-lg border-2 text-center ${
                    difficulty === 'hard'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDifficulty('hard')}
                >
                  <div className="font-medium">Hard</div>
                  <div className="text-xs text-gray-500 mt-1">20 seconds</div>
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
                    onClick={() => {
                      setTargetScore(score);
                      // Force window to scroll to top
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }}
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
                <li>Answer questions from various categories</li>
                <li>Each correct answer is worth 10 points</li>
                <li>Difficulty bonus: Medium (+5), Hard (+10)</li>
                <li>You have {difficulty === 'easy' ? '30' : difficulty === 'medium' ? '25' : '20'} seconds per question</li>
                {playMode === 'multi' && <li>Chat with other players during the game</li>}
              </ul>
            </div>
            
            <button 
              className="w-full py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
              onClick={() => {
                setGamePhase("playing");
                setSubmittedAnswers([]);
                setTotalScore(0);
                setCurrentRound(1);
                
                // Force window to scroll to top
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
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
    <div className="max-w-4xl w-full mx-auto" ref={gameContainerRef}>
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
          <h1 className="text-2xl font-bold text-blue-600">Quiz Challenge</h1>
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
          
          {/* Chat notification icon in multiplayer mode */}
          {playMode === 'multi' && (
            <button 
              className="relative p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center justify-center"
              onClick={() => {
                // Toggle chat visibility
                setShowChat(!showChat);
                
                // If opening chat, reset unread count
                if (!showChat) {
                  setUnreadChatCount(0);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
              </svg>
              
              {/* Notification badge */}
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}
          
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
        <div className="md:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            {/* Feedback message display */}
            {feedback && (
              <div className={`mb-4 p-3 rounded-md text-center font-medium ${
                feedback.type === 'success' ? 'bg-green-100 text-green-800' :
                feedback.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {feedback.message}
              </div>
            )}
            
            <div className="mb-8">
              <h2 className="text-center text-xl font-bold mb-2">
                Quiz - Round {currentRound}
              </h2>
              <div className="w-full bg-gray-200 h-2 rounded-full mb-1">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (totalScore / targetScore) * 100)}%` }}
                />
              </div>
              <div className="text-center text-sm text-gray-500">
                {totalScore} / {targetScore} points
              </div>
            </div>
            
            {/* Question display */}
            {currentQuestion && (
              <div className="mb-6">
                <div className="text-lg font-bold mb-4 text-gray-800 p-4 bg-blue-50 rounded-md">
                  {currentQuestion.question}
                </div>
                
                {/* Answer options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      className={`w-full p-3 text-left rounded-md transition-colors ${
                        hasSubmitted
                          ? index === currentQuestion.correctOption
                            ? "bg-green-100 border-2 border-green-500 text-green-800"
                            : selectedOption === index
                              ? "bg-red-100 border-2 border-red-500 text-red-800"
                              : "bg-gray-100 text-gray-700"
                          : selectedOption === index
                            ? "bg-blue-100 border-2 border-blue-500 text-blue-800"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                      onClick={() => {
                        if (!hasSubmitted && !roundEnded) {
                          setSelectedOption(index);
                        }
                      }}
                      disabled={hasSubmitted || roundEnded}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                      
                      {/* Show indicators once submitted */}
                      {hasSubmitted && (
                        <span className="float-right">
                          {index === currentQuestion.correctOption ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="inline-block text-green-600" viewBox="0 0 16 16">
                              <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"/>
                            </svg>
                          ) : selectedOption === index ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="inline-block text-red-600" viewBox="0 0 16 16">
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                          ) : null}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Game status */}
                {hasSubmitted && roundEnded && (
                  <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md text-center">
                    {playMode === 'multi' ? 
                      "Round complete! Next question will appear automatically →" : 
                      "Round complete! Click \"Next Question\" to continue →"
                    }
                  </div>
                )}
                {hasSubmitted && !roundEnded && (
                  <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded-md text-center">
                    Answer submitted! Waiting for next round...
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex justify-center mt-6">
                  {roundEnded ? (
                    autoAdvanceCountdown ? (
                      <div className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-medium flex items-center space-x-2 shadow-lg">
                        <span>Next question in</span>
                        <span className="bg-blue-800 text-white px-4 py-2 rounded-full font-bold text-xl animate-pulse">
                          {autoAdvanceCountdown}
                        </span>
                        <span>seconds</span>
                      </div>
                    ) : playMode === 'single' && (
                      <button
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        onClick={startNewRound}
                      >
                        Next Question
                      </button>
                    )
                  ) : (
                    <button
                      className={`px-6 py-2 rounded-md ${
                        selectedOption !== null && !hasSubmitted
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-200 text-blue-500 cursor-not-allowed"
                      }`}
                      onClick={submitAnswer}
                      disabled={selectedOption === null || hasSubmitted}
                    >
                      {hasSubmitted ? "Already Submitted" : "Submit Answer"}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Game Rules</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Select the correct answer to each question</li>
                <li>Correct answers are worth 10 points</li>
                <li>Difficulty bonus: Medium (+5), Hard (+10)</li>
                <li>First to reach {targetScore} points wins!</li>
                <li>You have {difficulty === 'easy' ? '30' : difficulty === 'medium' ? '25' : '20'} seconds to answer each question</li>
                <li>You can only submit one answer per question</li>
                {playMode === 'multi' && (
                  <li className="text-blue-800 font-medium">Next question auto-advances after 5 seconds!</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-600 text-white font-medium flex justify-between items-center">
                <span>Answered Questions</span>
                <span className="bg-white text-blue-800 px-2 py-1 rounded-md text-sm font-bold">
                  Target: {targetScore}
                </span>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {submittedAnswers.length > 0 ? (
                  submittedAnswers.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium truncate max-w-[160px]">{entry.question}</span>
                      {entry.isCorrect ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                          +{entry.score} pts
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                          Incorrect
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No questions answered yet
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
          </div>
        </div>
        
        <div className="md:col-span-1">
          {/* In-game chat - only show in multiplayer mode when chat is toggled on */}
          {playMode === 'multi' ? (
            showChat ? (
              <ChatBox 
                username={username} 
                gameId={gameId}
                inGame={true}
              />
            ) : (
              <div 
                className="bg-white rounded-lg shadow-md p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setShowChat(true);
                  setUnreadChatCount(0);
                }}
              >
                <div className="text-2xl mb-3">💬</div>
                <h3 className="font-bold text-lg mb-1">Game Chat Hidden</h3>
                <p className="text-sm text-gray-600">
                  Click here or use the chat icon in the header to show chat
                  {unreadChatCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {unreadChatCount} new
                    </span>
                  )}
                </p>
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl mb-3">👤</div>
              <h3 className="font-bold text-lg mb-1">Single Player Mode</h3>
              <p className="text-sm text-gray-600">
                You're playing in single player mode. Switch to multiplayer to chat with other players!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
