
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
    <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 z-10">
      <div className="flex items-center bg-white border-2 border-gray-300 rounded-lg px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder="Ask about matches, players, or fantasy tips..."
          className="flex-grow focus:outline-none text-gray-900 placeholder-gray-400 text-base bg-white"
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          className="ml-3 text-blue-600 hover:text-blue-800 focus:outline-none disabled:text-gray-400 transition-colors p-2 rounded-full hover:bg-blue-50 flex-shrink-0"
          disabled={isLoading || !inputValue.trim()}
          title="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
