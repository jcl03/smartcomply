
// src/types/express.d.ts
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email?: string;
      // Add other user properties you expect from Supabase/your JWT
      [key: string]: any;
    };
  }
}
