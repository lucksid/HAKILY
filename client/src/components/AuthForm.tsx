import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { useAuth } from "@/lib/stores/useAuth";
import { useAudio } from "@/lib/stores/useAudio";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { playSuccess } = useAudio();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (username.trim().length < 3) {
        toast.error("Username must be at least 3 characters");
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }

      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await apiRequest("POST", endpoint, { username, password });
      const data = await response.json();

      if (data.user) {
        login(data.user);
        playSuccess();
        toast.success(isLogin ? "Login successful!" : "Registration successful!");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(isLogin ? "Login failed" : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-purple-100 p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {isLogin ? "Welcome Back!" : "Join the Fun!"}
          </CardTitle>
          <CardDescription className="text-lg">
            {isLogin
              ? "Login to continue your learning adventure"
              : "Create an account to start playing"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-2 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 focus:border-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-lg font-semibold py-6" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : isLogin ? "Login" : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Button 
              variant="link" 
              className="text-primary font-semibold" 
              onClick={toggleAuthMode}
            >
              {isLogin ? "Register" : "Login"}
            </Button>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
