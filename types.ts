
export interface Vector {
  magnitude: number;
  angle: number; // in degrees
}

export interface SimulationState {
  mass: number;
  force: number;
  friction: number;
  gravity: number;
  springK: number;
  springX: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
