import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">EduPlay</h1>
        <p className="text-gray-600 mb-4 text-center">
          Multiplayer Educational Game Platform
        </p>
        <div className="flex flex-col items-center">
          <p className="mb-4">
            Count: <span className="font-bold">{count}</span>
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setCount(count + 1)}
          >
            Increment
          </button>
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Basic application is working! This is a simple example to verify that React is rendering correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
