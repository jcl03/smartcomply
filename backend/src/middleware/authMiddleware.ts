import { Request, Response, NextFunction } from 'express';
import { supabaseClient } from '../config/supabase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
      return; // Ensure void return
    }

    const { data, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !data.user) {
      res.status(401).json({ 
        error: 'Authentication failed',
        message: error?.message || 'Invalid token' 
      });
      return; // Ensure void return
    }

    req.user = data.user;
    next();
  } catch (error: any) {
    // Ensure a response is sent and then return void
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Server error during authentication',
        message: error.message 
      });
    }
    // Do not proceed further by calling next() in case of error here, response is sent.
  }
};
