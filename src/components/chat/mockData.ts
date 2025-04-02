
import { Player } from "@/types/player";

// Mock data for player suggestions - in a real app, this would come from your API
export const mockPlayers: Player[] = [
  {
    id: "p1",
    name: "Virat Kohli",
    team: "Royal Challengers Bengaluru",
    role: "batsman",
    credits: 10.5,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/164.png",
    stats: { avg: 48.9, sr: 138.2, recent_form: [75, 82, 43, 61, 23] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: "p2",
    name: "Jasprit Bumrah",
    team: "Mumbai Indians",
    role: "bowler",
    credits: 9.5,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/1124.png",
    stats: { wickets: 145, economy: 7.4, recent_form: [3, 2, 4, 1, 3] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: "p3",
    name: "Ravindra Jadeja",
    team: "Chennai Super Kings",
    role: "allrounder",
    credits: 9.0,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/9.png",
    stats: { bat_avg: 32.6, bowl_avg: 24.8, recent_form: [45, 2, 38, 3, 29] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: "p4",
    name: "KL Rahul",
    team: "Lucknow Super Giants",
    role: "batsman",
    credits: 9.5,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/1125.png",
    stats: { avg: 47.2, sr: 134.5, recent_form: [68, 43, 91, 12, 55] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: "p5",
    name: "Rashid Khan",
    team: "Gujarat Titans",
    role: "bowler",
    credits: 9.0,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/2778.png",
    stats: { wickets: 138, economy: 6.8, recent_form: [3, 2, 1, 4, 2] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  }
];
