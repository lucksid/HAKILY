import React, { useState, useRef, useEffect } from 'react';
import { educationApiService } from '../lib/educationApiService';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'bot',
    content: 'Hello! I am the Education Ministry Chatbot. How can I help you today?',
    timestamp: new Date(),
  },
];

const suggestedQuestions = [
  'What is the education system like in Côte d\'Ivoire?',
  'When does school registration begin?',
  'What are the main examinations in the education system?',
  'How can I apply for a scholarship?',
  'What is the current school calendar?',
];

interface EducationChatbotProps {
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

const EducationChatbot: React.FC<EducationChatbotProps> = ({ 
  minimized = false,
  onToggleMinimize = () => {}
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to handle sending a message
  const handleSendMessage = async (e: React.FormEvent | null, content?: string) => {
    if (e) e.preventDefault();

    const messageContent = content || inputValue;
    if (!messageContent.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: messageContent.trim(),
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get response from the API service
      const response = await educationApiService.searchInformation(messageContent);

      // Add bot's response after a small delay to simulate thinking
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          sender: 'bot',
          content: response,
          timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      // Handle error
      setTimeout(() => {
        const errorMessage: Message = {
          id: messages.length + 2,
          sender: 'bot',
          content: 'Sorry, I encountered an error while processing your request. Please try again later.',
          timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Function to handle suggested question click
  const handleSuggestedQuestionClick = (question: string) => {
    handleSendMessage(null, question);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-medium">Education Ministry Chatbot</span>
        </div>
        <button
          onClick={onToggleMinimize}
          className="p-1 hover:bg-blue-700 rounded"
        >
          {minimized ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {!minimized && (
        <>
          {/* Messages area */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className={`text-sm whitespace-pre-wrap ${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 text-right ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 rounded-lg px-4 py-2 border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 2 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestionClick(question)}
                    className="text-xs bg-white text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button
                type="submit"
                className={`bg-blue-600 text-white px-4 py-2 rounded-r-md ${
                  isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
                disabled={isTyping}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
            <a 
              href="https://www.education.gouv.ci" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Visit the official Ivory Coast Education Ministry website
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default EducationChatbot;