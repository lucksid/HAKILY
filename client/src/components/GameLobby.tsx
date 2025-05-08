import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useSocket } from "@/lib/stores/useSocket";
import { useAuth } from "@/lib/stores/useAuth";
import { GameCard } from "./ui/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Chat from "./Chat";
import { useAudio } from "@/lib/stores/useAudio";
import { toast } from "sonner";
import { UserPlus, Users, Timer } from "lucide-react";
import { GameType } from "@shared/schema";

type ActiveGame = {
  id: number;
  type: string;
  players: Array<{ id: number; username: string }>;
  createdAt: string;
};

export default function GameLobby() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playSuccess, playHit } = useAudio();
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<GameType>("word");

  useEffect(() => {
    if (!socket) return;

    // Get active games
    socket.emit("getActiveGames");

    // Listen for active games update
    socket.on("activeGames", (games) => {
      setActiveGames(games);
    });

    // When a game is created
    socket.on("gameCreated", (game) => {
      playSuccess();
      navigate(`/games/${game.type}/${game.id}`);
    });

    // When joined a game
    socket.on("joinedGame", (game) => {
      playSuccess();
      navigate(`/games/${game.type}/${game.id}`);
    });

    return () => {
      socket.off("activeGames");
      socket.off("gameCreated");
      socket.off("joinedGame");
    };
  }, [socket, navigate, playSuccess]);

  const createGame = () => {
    if (!socket || !user) return;
    
    setIsCreatingGame(true);
    playHit();
    
    socket.emit("createGame", {
      type: selectedGameType,
      creatorId: user.id
    });
    
    // Reset state after a delay
    setTimeout(() => {
      setIsCreatingGame(false);
    }, 2000);
  };

  const joinGame = (gameId: number) => {
    if (!socket || !user) return;
    
    playHit();
    socket.emit("joinGame", {
      gameId,
      userId: user.id
    });
  };

  const gameTypeTitles = {
    word: "Word Challenge",
    math: "Math Wizards",
    quiz: "Quiz Masters"
  };

  const gameTypeDescriptions = {
    word: "Create the longest word with 7 random letters. Vowels = 1 point, Consonants = 2 points.",
    math: "Solve math problems with addition, subtraction, multiplication, and division.",
    quiz: "Test your knowledge with general culture questions."
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Game Lobby</CardTitle>
            <CardDescription>
              Create a new game or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="create">Create Game</TabsTrigger>
                <TabsTrigger value="join">Join Game</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["word", "math", "quiz"] as GameType[]).map((type) => (
                    <GameCard
                      key={type}
                      title={gameTypeTitles[type]}
                      description={gameTypeDescriptions[type]}
                      type={type}
                      isSelected={selectedGameType === type}
                      onClick={() => setSelectedGameType(type)}
                    />
                  ))}
                </div>
                
                <Button 
                  onClick={createGame} 
                  className="w-full py-6 text-lg font-bold"
                  disabled={isCreatingGame}
                >
                  {isCreatingGame ? "Creating Game..." : `Create ${gameTypeTitles[selectedGameType]} Game`}
                </Button>
              </TabsContent>
              
              <TabsContent value="join">
                {activeGames.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-lg">No active games available</p>
                    <p className="text-sm mt-2">Create a new game to start playing!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeGames.map((game) => (
                      <Card key={game.id} className="overflow-hidden">
                        <div className="flex items-center p-4 border-b">
                          <div className="flex-grow">
                            <h3 className="font-bold text-lg capitalize">{game.type} Game</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{game.players.length} Players</span>
                              <Timer className="h-4 w-4 ml-4 mr-1" />
                              <span>15s per turn</span>
                            </div>
                          </div>
                          <Button 
                            onClick={() => joinGame(game.id)}
                            className="ml-auto"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                        </div>
                        <div className="p-4 bg-muted/50">
                          <p className="text-sm mb-2">Players:</p>
                          <div className="flex flex-wrap gap-2">
                            {game.players.map(player => (
                              <span key={player.id} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                                {player.username}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              All games have a 15-second time limit per round. Have fun!
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <Chat />
      </div>
    </div>
  );
}
