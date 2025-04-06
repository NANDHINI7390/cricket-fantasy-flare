
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import CreateTeam from "./pages/CreateTeam";
import Contests from "./pages/Contests";
import Leaderboard from "./pages/Leaderboard";
import MyTeams from "./pages/MyTeams";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import JoinLeague from "./pages/JoinLeague";
import { useEffect } from "react";
import { initSentry } from "./integrations/sentry/config";
import * as Sentry from '@sentry/react';
import { AuthProvider } from './contexts/AuthContext';

// Initialize Sentry
initSentry();

const queryClient = new QueryClient();

// Create a Sentry error boundary component
const SentryErrorBoundary = Sentry.withErrorBoundary(({ children }) => <>{children}</>, {
  fallback: ({ error, componentStack, resetError }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1F2C] text-white p-4">
      <div className="max-w-md w-full bg-[#2A2F3C] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">There was an error in the application. Our team has been notified.</p>
        <pre className="bg-gray-800 p-3 rounded text-xs overflow-auto max-h-40 mb-4">
          {error.toString()}
        </pre>
        <button
          onClick={resetError}
          className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white px-4 py-2 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  ),
});

const App = () => (
  <SentryErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/create-team" element={<CreateTeam />} />
                  <Route path="/contests" element={<Contests />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/my-teams" element={<MyTeams />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/join-league/:code" element={<JoinLeague />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </SentryErrorBoundary>
);

export default App;
