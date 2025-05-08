import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "@/lib/stores/useAuth";
import { Clock, Award, Brain, BookOpen, User } from "lucide-react";

export default function UserProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');

  // Sample statistics (in a real app, these would come from the API)
  const stats = {
    gamesPlayed: 23,
    wordsCreated: 67,
    mathProblems: 45,
    quizAnswers: 39,
    winRate: 62,
    bestWord: "QUESTION",
    fastestSolve: "3.2s",
    totalPlayTime: "5h 23m"
  };

  // Sample achievements (in a real app, these would come from the API)
  const achievements = [
    { id: 1, name: "First Victory", description: "Win your first game", earned: true, date: "2023-04-12" },
    { id: 2, name: "Wordsmith", description: "Create a word using all 7 letters", earned: true, date: "2023-04-15" },
    { id: 3, name: "Math Wizard", description: "Solve 10 math problems correctly in a row", earned: false },
    { id: 4, name: "Quiz Master", description: "Get a perfect score in a quiz game", earned: true, date: "2023-05-02" },
    { id: 5, name: "Speed Demon", description: "Answer within 3 seconds 5 times", earned: false },
    { id: 6, name: "Dedicated Learner", description: "Play at least 50 games", earned: false },
  ];

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p>User not logged in</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 rounded-full p-3">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{user.username}'s Profile</CardTitle>
                <CardDescription>Member since {new Date(user.createdAt).toLocaleDateString()}</CardDescription>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="font-bold text-lg">{user.points} Points</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeTab === 'stats' ? 'default' : 'outline'}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </Button>
            <Button
              variant={activeTab === 'achievements' ? 'default' : 'outline'}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </Button>
          </div>
          
          {activeTab === 'stats' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <BookOpen className="h-8 w-8 text-primary mb-2" />
                      <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
                      <div className="text-sm text-muted-foreground">Games Played</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <Award className="h-8 w-8 text-primary mb-2" />
                      <div className="text-2xl font-bold">{stats.winRate}%</div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <Brain className="h-8 w-8 text-primary mb-2" />
                      <div className="text-2xl font-bold">{stats.wordsCreated}</div>
                      <div className="text-sm text-muted-foreground">Words Created</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <Clock className="h-8 w-8 text-primary mb-2" />
                      <div className="text-2xl font-bold">{stats.totalPlayTime}</div>
                      <div className="text-sm text-muted-foreground">Play Time</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Game Stats Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="font-medium">Word Game</div>
                      <div>{stats.wordsCreated} words created</div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="font-medium">Math Game</div>
                      <div>{stats.mathProblems} problems solved</div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="font-medium">Quiz Game</div>
                      <div>{stats.quizAnswers} questions answered</div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="font-medium">Best Word</div>
                      <div>{stats.bestWord}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Fastest Solve</div>
                      <div>{stats.fastestSolve}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map(achievement => (
                <Card key={achievement.id} className={achievement.earned ? "border-green-200 bg-green-50" : "opacity-75"}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-full p-2 ${achievement.earned ? "bg-green-100" : "bg-gray-100"}`}>
                        {achievement.earned ? (
                          <Award className="h-6 w-6 text-green-600" />
                        ) : (
                          <Award className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                    
                    <div>
                      {achievement.earned ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Earned {new Date(achievement.date).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row sm:justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Keep playing to earn more points and unlock achievements!
          </p>
          <Button className="mt-4 sm:mt-0">
            View Game History
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
