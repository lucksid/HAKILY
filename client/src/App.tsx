import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "./lib/stores/useAuth";
import { Toaster } from "./components/ui/sonner";
import { useSocket } from "./lib/stores/useSocket";
import { useAudio } from "./lib/stores/useAudio";

// Components
import Layout from "./components/Layout";
import AuthForm from "./components/AuthForm";
import GameLobby from "./components/GameLobby";
import WordGame from "./components/WordGame";
import MathGame from "./components/MathGame";
import QuizGame from "./components/QuizGame";
import UserProfile from "./components/UserProfile";
import Leaderboard from "./components/Leaderboard";
import NotFound from "./pages/not-found";

function App() {
  const { user, authChecked } = useAuth();
  const { initializeSocket, closeSocket } = useSocket();
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
  const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null);
  const { setBackgroundMusic: setAudioMusic, setHitSound: setAudioHit, setSuccessSound: setAudioSuccess } = useAudio();

  // Initialize audio
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;

    const hit = new Audio("/sounds/hit.mp3");
    const success = new Audio("/sounds/success.mp3");
    
    setBackgroundMusic(bgMusic);
    setHitSound(hit);
    setSuccessSound(success);
    
    setAudioMusic(bgMusic);
    setAudioHit(hit);
    setAudioSuccess(success);
    
    return () => {
      bgMusic.pause();
      hit.pause();
      success.pause();
    };
  }, [setAudioMusic, setAudioHit, setAudioSuccess]);
  
  // Initialize socket connection if user is authenticated
  useEffect(() => {
    if (user) {
      initializeSocket(user);
      
      return () => {
        closeSocket();
      };
    }
  }, [user, initializeSocket, closeSocket]);

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
          <Route path="/" element={<Layout />}>
            <Route index element={user ? <Navigate to="/lobby" /> : <AuthForm />} />
            <Route path="lobby" element={user ? <GameLobby /> : <Navigate to="/" />} />
            <Route path="profile" element={user ? <UserProfile /> : <Navigate to="/" />} />
            <Route path="leaderboard" element={user ? <Leaderboard /> : <Navigate to="/" />} />
            <Route path="games">
              <Route path="word/:gameId" element={user ? <WordGame /> : <Navigate to="/" />} />
              <Route path="math/:gameId" element={user ? <MathGame /> : <Navigate to="/" />} />
              <Route path="quiz/:gameId" element={user ? <QuizGame /> : <Navigate to="/" />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
