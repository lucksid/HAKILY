import React, { useState } from 'react';
import EducationChatbot from '../components/EducationChatbot';

const ChatbotDemo: React.FC = () => {
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotMinimized(!isChatbotMinimized);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-blue-700">
          Ministry of National Education of Côte d'Ivoire
        </h1>
        <p className="text-gray-600 mt-2">
          Interactive Chatbot Demo
        </p>
      </header>

      <main className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Demo</h2>
          <p className="text-gray-600 mb-4">
            This page demonstrates a chatbot for the Ministry of National Education of Côte d'Ivoire.
            The chatbot can answer questions about the education system, school calendar, registration
            procedures, examinations, and more.
          </p>
          <p className="text-gray-600">
            Try asking questions about education in Côte d'Ivoire using the chat widget in the bottom
            right corner of the screen.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-blue-700 mb-2">Information on Education System</h3>
              <p className="text-gray-600">Get details about the structure of education in Côte d'Ivoire, from primary to higher education.</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-blue-700 mb-2">School Calendar</h3>
              <p className="text-gray-600">Learn about academic year dates, holiday periods, and important deadlines.</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-blue-700 mb-2">Examination Information</h3>
              <p className="text-gray-600">Find details about national examinations like CEPE, BEPC, and BAC.</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-blue-700 mb-2">Registration Procedures</h3>
              <p className="text-gray-600">Learn how and when to register for schools and educational programs.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p>This is a demo for educational purposes.</p>
        <p className="mt-1">For official information, please visit the <a href="https://www.education.gouv.ci" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">official website</a>.</p>
      </footer>

      {/* Chatbot component */}
      <EducationChatbot
        minimized={isChatbotMinimized}
        onToggleMinimize={toggleChatbot}
      />
    </div>
  );
};

export default ChatbotDemo;