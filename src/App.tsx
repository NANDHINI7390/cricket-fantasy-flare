// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home"; // Your existing home page
import LeaguePage from "./pages/League"; // The LeaguePage we created
import Navbar from "./components/Navbar"; // Your navigation bar component
import JoinLeaguePage from "./pages/JoinLeague"; //your join league component
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/Profile";
import ContestsPage from "./pages/Contests";
import LeaderboardPage from "./pages/Leaderboard";
import MyTeamsPage from "./pages/MyTeams";
import WalletPage from "./pages/Wallet";
// ... import other pages ...

function App() {
  return (
    <Router>
      <Navbar /> {/* Your navigation bar */}
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Home route */}
        <Route path="/leagues" element={<LeaguePage />} /> {/* Leagues route */}
        <Route path="/join-league" element={<JoinLeaguePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contests" element={<ContestsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/my-teams" element={<MyTeamsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        {/* ... other routes ... */}
      </Routes>
    </Router>
  );
}

export default App;
