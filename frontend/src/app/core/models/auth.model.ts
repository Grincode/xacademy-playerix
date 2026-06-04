export interface User {
  id: number;
  email: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
}
