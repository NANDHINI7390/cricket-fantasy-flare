
import React, { useState } from "react";
import { Send } from "lucide-react";
import { ChatInputProps } from "./types";

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t p-4 bg-white">
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about matches, players, or fantasy suggestions..."
          className="bg-transparent flex-grow focus:outline-none text-gray-800 placeholder-gray-500"
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !inputValue.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
