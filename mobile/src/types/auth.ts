export type UserRole = 'FARMER' | 'SELLER' | 'TRANSPORTER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}
