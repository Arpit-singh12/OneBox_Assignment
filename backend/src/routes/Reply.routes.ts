import express, { Request, Response, NextFunction } from 'express';
import { generateReply } from '../controllers/Reply.controller';

const router = express.Router();


// route for the AI suggested reply 
// POST /api/reply/suggest path for the inegration...

router.post('/suggest' , generateReply as (req: Request, res: Response, next: NextFunction) => any);


export default router;
