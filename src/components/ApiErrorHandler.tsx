import React from 'react';
import { AlertCircle, Wifi, Clock, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ApiErrorHandlerProps {
  error: Error | string;
  onRetry?: () => void;
  context?: string;
}

const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({ error, onRetry, context }) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const getErrorType = (): { icon: React.ReactNode; title: string; description: string; actionable: boolean } => {
    if (errorMessage.includes('rate limit')) {
      return {
        icon: <Clock className="h-4 w-4" />,
        title: 'API Rate Limit Exceeded',
        description: 'The CricAPI free plan has daily limits. Consider upgrading to a paid plan for unlimited access.',
        actionable: false
      };
    }
    
    if (errorMessage.includes('Invalid API key') || errorMessage.includes('401')) {
      return {
        icon: <Key className="h-4 w-4" />,
        title: 'API Authentication Error',
        description: 'Your CricAPI key appears to be invalid. Please check your API configuration.',
        actionable: false
      };
    }
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
      return {
        icon: <Wifi className="h-4 w-4" />,
        title: 'Network Connection Error',
        description: 'Unable to connect to the cricket data service. Please check your internet connection.',
        actionable: true
      };
    }
    
    return {
      icon: <AlertCircle className="h-4 w-4" />,
      title: 'API Error',
      description: errorMessage || 'An unexpected error occurred while fetching data.',
      actionable: true
    };
  };

  const errorInfo = getErrorType();

  return (
    <Alert className="border-red-200 bg-red-50">
      <div className="flex items-start space-x-2">
        <div className="text-red-600 mt-0.5">
          {errorInfo.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-red-800 font-medium text-sm">
            {errorInfo.title}
            {context && ` (${context})`}
          </h4>
          <AlertDescription className="text-red-700 text-sm mt-1">
            {errorInfo.description}
          </AlertDescription>
          
          {errorInfo.actionable && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2 border-red-300 text-red-800 hover:bg-red-100"
            >
              Try Again
            </Button>
          )}
          
          {errorMessage.includes('rate limit') && (
            <div className="mt-2">
              <Button 
                variant="link" 
                size="sm"
                className="p-0 h-auto text-red-800 hover:text-red-900"
                onClick={() => window.open('https://www.cricapi.com/pricing', '_blank')}
              >
                Upgrade CricAPI Plan →
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default ApiErrorHandler;