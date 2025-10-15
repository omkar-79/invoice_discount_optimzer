export interface User {
  id: string;
  email: string;
  name: string;
  company: string | null;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Re-export for easier imports
export type { User as AuthenticatedUser };
