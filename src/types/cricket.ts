
export interface TeamInfo {
  id: string;
  name: string;
  img: string;
}

export interface Score {
  r: number;
  w: number;
  o: number;
}

export interface Match {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: TeamInfo[];
  score: Score[];
}

export interface CricketApiResponse {
  status: boolean;
  data: Match[];
}

export interface Team {
  id: string;
  name: string;
  img: string;
}

export interface TeamsApiResponse {
  status: boolean;
  data: Team[];
}
