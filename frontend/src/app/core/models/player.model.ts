export interface PlayerSkill {
  id: number;
  playerId: number;
  fifaVersion: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  gkDiving?: number;
  gkHandling?: number;
  gkKicking?: number;
  gkPositioning?: number;
  gkReflexes?: number;
  gkSpeed?: number;
}

export interface Player {
  id: number;
  externalId?: number;
  name: string;
  longName?: string;
  nationality: string;
  club: string;
  position: string;
  nationalityId?: number;
  clubTeamId?: number;
  overallRating: number;
  potential?: number;
  age: number;
  gender: string;
  playerFaceUrl?: string;
  skills?: PlayerSkill[];
}

export interface PlayerListResponse {
  data: Player[];
  total: number;
  page: number;
  limit: number;
}
