import express, { Request, Response, NextFunction } from 'express';
import { addAccount, searchEmailsByCategory } from '../controllers/Account.controller';

const router = express.Router();

// router.post('/', addAccount);

router.post('/', addAccount as (req: Request, res: Response, next: NextFunction) => any);     


//route for search mails by category, folder or account
router.get('/search/category', searchEmailsByCategory as (req: Request, res: Response, next: NextFunction) => any);

export default router;
