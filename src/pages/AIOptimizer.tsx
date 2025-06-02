
import React from "react";
import AITeamOptimizer from "@/components/AITeamOptimizer";
import NotificationCenter from "@/components/NotificationCenter";

const AIOptimizer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <NotificationCenter />
        </div>
        <AITeamOptimizer />
      </div>
    </div>
  );
};

export default AIOptimizer;
