import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, User, Award, Home, Volume, VolumeX } from "lucide-react";
import { useAuth } from "@/lib/stores/useAuth";
import { Button } from "./ui/button";
import { useAudio } from "@/lib/stores/useAudio";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMuted, toggleMute } = useAudio();

  // Check if we're in a game route
  const isGameRoute = location.pathname.includes('/games/');

  // If not authenticated, just render the outlet (which should redirect to login)
  if (!user) {
    return <Outlet />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation bar */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/lobby" className="flex items-center space-x-2">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="font-bold">E</span>
                </div>
                <span className="font-bold text-xl text-primary">EduPlay</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Sound toggle button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMute}
                title={isMuted ? "Unmute sound" : "Mute sound"}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume className="h-5 w-5" />}
              </Button>
              
              {/* Navigation links */}
              <nav className="hidden md:flex items-center space-x-4">
                <Link to="/lobby">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Home className="h-5 w-5" />
                    <span>Lobby</span>
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Leaderboard</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Button>
                </Link>
              </nav>
              
              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{user.username}</div>
                  <div className="text-xs text-muted-foreground">{user.points} points</div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile navigation (visible only on small screens) */}
      {!isGameRoute && (
        <div className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0 z-10">
          <div className="grid grid-cols-3 gap-1 p-2">
            <Link to="/lobby" className="flex flex-col items-center justify-center py-1">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Lobby</span>
            </Link>
            <Link to="/leaderboard" className="flex flex-col items-center justify-center py-1">
              <Award className="h-5 w-5" />
              <span className="text-xs mt-1">Leaderboard</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center justify-center py-1">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 py-6">
        <Outlet />
      </main>
      
      {/* Footer */}
      {!isGameRoute && (
        <footer className="bg-white border-t py-4 md:py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2023 EduPlay - Multiplayer Educational Games</p>
            <p className="mt-1">Learn together, play together</p>
          </div>
        </footer>
      )}
    </div>
  );
}
