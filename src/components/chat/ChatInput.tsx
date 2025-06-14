
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
    <div className="border-t p-3">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about matches or players..."
          className="bg-transparent flex-grow focus:outline-none"
        />
        <button 
          onClick={handleSendMessage}
          className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
          disabled={isLoading}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
