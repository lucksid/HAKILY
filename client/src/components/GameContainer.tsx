import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import GameLobby from "./GameLobby";
import WordGame from "./WordGame";
import MathGame from "./MathGame";
import QuizGame from "./QuizGame";
import MessageBox from "./MessageBox";
import Leaderboard from "./Leaderboard";
import { GameType } from "@shared/types";

export default function GameContainer() {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [activeTab, setActiveTab] = useState("lobby");
  
  const handleGameStart = (gameType: GameType) => {
    setCurrentGame(gameType);
    setActiveTab("game");
  };
  
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="lobby" onClick={() => setActiveTab("lobby")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Lobby
            </TabsTrigger>
            <TabsTrigger value="game" disabled={!currentGame}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Active Game
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              Leaderboard
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="lobby" className="mt-0">
          <GameLobby onGameStart={handleGameStart} />
        </TabsContent>
        
        <TabsContent value="game" className="mt-0">
          {currentGame === "word" && <WordGame />}
          {currentGame === "math" && <MathGame />}
          {currentGame === "quiz" && <QuizGame />}
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-0">
          <Leaderboard />
        </TabsContent>
      </Tabs>
      
      <MessageBox />
    </div>
  );
}
