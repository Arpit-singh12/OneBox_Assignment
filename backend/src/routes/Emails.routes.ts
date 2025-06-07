import express from 'express';
import { SearchEmailHandler } from '../controllers/Email.controller';
import { getEmailsByAccount } from '../controllers/Email.controller';


const router = express.Router();

// /api/emails?email=user@gmail.com
router.get('/', (req, res, next) => {
	getEmailsByAccount(req, res).catch(next);
});

//under GET  /api/emails/search?account=.....

router.post('/search', SearchEmailHandler);

export default router;
