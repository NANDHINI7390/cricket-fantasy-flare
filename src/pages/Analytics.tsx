
import React from "react";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import NotificationCenter from "@/components/NotificationCenter";

const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Advanced insights and performance metrics</p>
          </div>
          <NotificationCenter />
        </div>
        <AdvancedAnalytics />
      </div>
    </div>
  );
};

export default Analytics;
