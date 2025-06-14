
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

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-full px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder="Ask about matches, players, or fantasy tips..."
          className="bg-transparent flex-grow focus:outline-none text-gray-900 placeholder-gray-500 text-sm"
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none disabled:text-gray-400 transition-colors p-1 rounded-full hover:bg-blue-50"
          disabled={isLoading || !inputValue.trim()}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
