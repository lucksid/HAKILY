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

// Game Lobby Component
function GameLobby({ username, onLogout }: { username: string, onLogout: () => void }) {
  return (
    <div className="max-w-4xl w-full mx-auto">
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
      
      <main className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Game Lobby</h2>
        <p className="text-gray-600 mb-6">
          Choose a game to play from the options below:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
            <div className="text-4xl mb-2">📝</div>
            <h3 className="font-bold">Word Challenge</h3>
            <p className="text-sm text-gray-500">Create words from 7 letters</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
            <div className="text-4xl mb-2">🔢</div>
            <h3 className="font-bold">Math Wizards</h3>
            <p className="text-sm text-gray-500">Solve math problems</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
            <div className="text-4xl mb-2">❓</div>
            <h3 className="font-bold">Quiz Masters</h3>
            <p className="text-sm text-gray-500">Test your knowledge</p>
          </div>
        </div>
      </main>
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
