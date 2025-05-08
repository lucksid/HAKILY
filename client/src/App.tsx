import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "./lib/stores/useAuth";

// Simple Authentication Form
function SimpleAuthForm() {
  const [username, setUsername] = useState("");
  const { login } = useAuth();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // Simple login without server call for now
      login({
        id: 1,
        username: username,
        points: 0,
        createdAt: new Date().toISOString()
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">EduPlay</h1>
        <p className="text-gray-600 mb-4 text-center">
          Multiplayer Educational Game Platform
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
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
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// Simple Home/Lobby
function SimpleLobby() {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <header className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">EduPlay</h1>
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-sm text-gray-500">Welcome,</span>
              <span className="ml-1 font-medium">{user?.username}</span>
            </div>
            <button
              onClick={logout}
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
    </div>
  );
}

function App() {
  const { user, authChecked } = useAuth();

  // Wait for authentication check before rendering routes
  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/lobby" /> : <SimpleAuthForm />} />
          <Route path="/lobby" element={user ? <SimpleLobby /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
