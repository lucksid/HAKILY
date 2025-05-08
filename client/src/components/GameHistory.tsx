import { useState, useEffect } from 'react';
import { fetchGameHistory, fetchGameHistoryByType } from '../lib/api';
import { GameHistoryItem } from '../../../shared/schema';

interface GameHistoryProps {
  userId?: number;
  gameType?: 'word' | 'math' | 'quiz';
  limit?: number;
}

export default function GameHistory({ userId, gameType, limit = 10 }: GameHistoryProps) {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'word' | 'math' | 'quiz'>(gameType || 'all');

  // Format date to a readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Load game history data
  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        
        let data: GameHistoryItem[];
        
        if (activeTab === 'all') {
          data = await fetchGameHistory(limit);
        } else {
          data = await fetchGameHistoryByType(activeTab, limit);
        }
        
        setHistory(data);
        setError(null);
      } catch (err) {
        setError('Failed to load game history. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadHistory();
  }, [activeTab, limit]);

  // Get game type badge color
  const getGameTypeBadge = (type: string) => {
    switch (type) {
      case 'word':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">Word</span>;
      case 'math':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">Math</span>;
      case 'quiz':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-600">Quiz</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Unknown</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Game History</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          All Games
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'word' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('word')}
        >
          Word Games
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'math' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('math')}
        >
          Math Games
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'quiz' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('quiz')}
        >
          Quiz Games
        </button>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* No data state */}
      {!loading && !error && history.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No game history available.
        </div>
      )}
      
      {/* Game history list */}
      {!loading && !error && history.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Players
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-2">
                        {getGameTypeBadge(game.gameType)}
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          Game #{game.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {game.participants.map((player, index) => (
                        <div key={player.userId} className="flex justify-between mb-1">
                          <span className="font-medium">{player.username}</span>
                          <span className="text-gray-600">{player.score} pts</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {game.winnerUsername ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {game.winnerUsername}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No winner</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(game.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}