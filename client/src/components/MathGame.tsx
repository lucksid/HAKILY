import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { MathSymbol } from "./ui/math-symbol";
import GameTimer from "./GameTimer";
import Chat from "./Chat";
import { useSocket } from "@/lib/stores/useSocket";
import { useAuth } from "@/lib/stores/useAuth";
import { useAudio } from "@/lib/stores/useAudio";
import { toast } from "sonner";
import { ArrowLeft, Send, Trophy, Check, X } from "lucide-react";

type MathGameState = {
  id: number;
  type: "math";
  players: { id: number; username: string; score: number }[];
  problem: string;
  answer: number;
  submissions: { playerId: number; answer: number; isCorrect: boolean }[];
  round: number;
  status: "waiting" | "playing" | "finished";
  timeLeft: number;
  winner?: { id: number; username: string; score: number };
};

export default function MathGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const { socket } = useSocket();
  const { user } = useAuth();
  const { playHit, playSuccess } = useAudio();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<MathGameState | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket || !gameId || !user) return;

    // Join the game room
    socket.emit("joinGameRoom", { gameId: parseInt(gameId), userId: user.id });

    // Request current game state
    socket.emit("getGameState", { gameId: parseInt(gameId) });

    // Listen for game state updates
    socket.on("gameState", (state) => {
      if (state.type !== "math") return;
      setGameState(state);
      
      // Reset answer when round changes
      if (state.status === "playing" && state.timeLeft === 15) {
        setAnswer("");
      }
      
      // Play sounds based on game events
      if (state.status === "playing" && state.timeLeft === 15) {
        // New round started
        playHit();
      } else if (state.status === "finished") {
        // Game ended
        playSuccess();
      }
    });

    // Listen for error messages
    socket.on("gameError", (error) => {
      toast.error(error.message);
    });

    return () => {
      // Leave the game room when component unmounts
      socket.emit("leaveGameRoom", { gameId: parseInt(gameId) });
      socket.off("gameState");
      socket.off("gameError");
    };
  }, [socket, gameId, user, playHit, playSuccess]);

  // Focus input when game starts
  useEffect(() => {
    if (gameState?.status === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState?.status]);

  const submitAnswer = () => {
    if (!socket || !user || !gameState || answer === "") return;
    
    const numericAnswer = parseFloat(answer);
    if (isNaN(numericAnswer)) {
      toast.error("Please enter a valid number!");
      return;
    }
    
    setIsSubmitting(true);
    
    socket.emit("submitMathAnswer", {
      gameId: gameState.id,
      playerId: user.id,
      answer: numericAnswer
    });
    
    // Reset input after submission
    setAnswer("");
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  };

  const exitGame = () => {
    navigate("/lobby");
  };

  const startGame = () => {
    if (!socket || !gameState) return;
    
    socket.emit("startGame", {
      gameId: gameState.id
    });
  };

  // Function to beautify the math problem for display
  const formatProblem = (problem: string) => {
    return problem
      .replace(/\*/g, " × ")
      .replace(/\//g, " ÷ ")
      .replace(/\+/g, " + ")
      .replace(/\-/g, " - ");
  };

  // Check if user has submitted an answer this round
  const hasSubmitted = (playerId: number) => {
    return gameState?.submissions.some(sub => sub.playerId === playerId);
  };

  if (!gameState) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold animate-pulse">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-4 top-4"
              onClick={exitGame}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <CardTitle className="text-center text-3xl text-primary">Math Wizards</CardTitle>
            <CardDescription className="text-center">
              Solve math problems as quickly as possible
            </CardDescription>
            
            {gameState.status === "playing" && (
              <div className="absolute right-4 top-4">
                <GameTimer timeLeft={gameState.timeLeft} totalTime={15} />
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-8">
            {gameState.status === "waiting" ? (
              <div className="text-center py-8">
                <h3 className="text-2xl font-bold mb-4">Waiting for players...</h3>
                <p className="mb-6 text-muted-foreground">
                  {gameState.players.length} player{gameState.players.length !== 1 ? 's' : ''} in the game
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {gameState.players.map(player => (
                    <span 
                      key={player.id} 
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        player.id === user?.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {player.username}
                    </span>
                  ))}
                </div>
                
                {gameState.players.length >= 2 && gameState.players[0].id === user?.id && (
                  <Button onClick={startGame} className="px-8 py-6 text-lg font-bold">
                    Start Game
                  </Button>
                )}
                
                {gameState.players.length < 2 && (
                  <p className="text-amber-500">Waiting for at least one more player to join...</p>
                )}
              </div>
            ) : gameState.status === "playing" ? (
              <>
                <div className="flex justify-center my-8">
                  <MathSymbol problem={formatProblem(gameState.problem)} />
                </div>
                
                <div className="flex items-center gap-2 max-w-md mx-auto">
                  <Input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-center text-2xl font-bold tracking-wider h-14"
                    placeholder="Your answer..."
                    disabled={hasSubmitted(user?.id || 0)}
                  />
                  
                  <Button 
                    className="h-14 w-14 p-0"
                    variant="ghost"
                    onClick={() => setAnswer("")}
                    disabled={answer.length === 0 || hasSubmitted(user?.id || 0)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  
                  <Button 
                    className="h-14 w-14 p-0"
                    onClick={submitAnswer}
                    disabled={answer === "" || isSubmitting || hasSubmitted(user?.id || 0)}
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Current Round: {gameState.round}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState.players.map(player => (
                      <Card key={player.id} className={`overflow-hidden border-2 ${
                        player.id === user?.id ? "border-primary" : "border-transparent"
                      }`}>
                        <div className="p-3 bg-muted/30 flex justify-between items-center">
                          <span className="font-medium">{player.username}</span>
                          <span className="font-bold">{player.score} points</span>
                        </div>
                        <div className="p-3">
                          {gameState.submissions
                            .filter(sub => sub.playerId === player.id)
                            .map((submission, index) => (
                              <div key={index} className="text-sm flex items-center">
                                <span className="mr-2">
                                  Answer: {submission.answer}
                                </span>
                                {submission.isCorrect ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                <span className="ml-auto">
                                  {submission.isCorrect ? "+10 points" : "0 points"}
                                </span>
                              </div>
                            ))}
                          
                          {!hasSubmitted(player.id) && (
                            <div className="text-sm text-muted-foreground italic">
                              Thinking...
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <Trophy className="h-16 w-16 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                
                {gameState.winner ? (
                  <p className="text-lg mb-6">
                    <span className="font-bold text-primary">{gameState.winner.username}</span> wins with {gameState.winner.score} points!
                  </p>
                ) : (
                  <p className="text-lg mb-6">It's a tie game!</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  {gameState.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div key={player.id} className={`flex items-center p-3 rounded-lg ${
                        index === 0 ? "bg-amber-100 text-amber-900" : "bg-muted"
                      }`}>
                        <span className="font-bold mr-2">{index + 1}.</span>
                        <span className="flex-grow">{player.username}</span>
                        <span className="font-bold">{player.score}</span>
                      </div>
                    ))}
                </div>
                
                <Button onClick={exitGame} className="mt-8">
                  Return to Lobby
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="text-sm text-muted-foreground text-center">
            <div className="w-full">Correct answers earn 10 points. First correct answer earns 5 bonus points!</div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <Chat gameId={parseInt(gameId || "0")} />
      </div>
    </div>
  );
}
