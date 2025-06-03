import express, { Request, Response, NextFunction } from 'express';
import { addAccount } from '../controllers/Account.controller';

const router = express.Router();

router.post('/', addAccount as (req: Request, res: Response, next: NextFunction) => any);     // router.post('/', addAccount);

export default router;
