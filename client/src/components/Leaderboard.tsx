import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/stores/useAuth";
import { Trophy, Medal, Award, User, Crown } from "lucide-react";

type LeaderboardUser = {
  id: number;
  username: string;
  points: number;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/leaderboard");
        const data = await response.json();
        
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <User className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Crown className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-3xl text-primary">Leaderboard</CardTitle>
          <CardDescription>Top players ranked by points</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-lg animate-pulse">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg">No players yet! Start playing to earn points.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((player, index) => (
                <div 
                  key={player.id}
                  className={`flex items-center p-4 rounded-lg ${
                    index === 0 
                      ? "bg-amber-50 border border-amber-200" 
                      : index === 1
                      ? "bg-gray-50 border border-gray-200"
                      : index === 2
                      ? "bg-amber-50/50 border border-amber-100"
                      : "bg-white border"
                  } ${player.id === user?.id ? "ring-2 ring-primary/20" : ""}`}
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted mr-4">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {player.username}
                      {player.id === user?.id && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Rank #{index + 1}</p>
                  </div>
                  <div className="font-bold text-lg">
                    {player.points} {player.points === 1 ? "point" : "points"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
