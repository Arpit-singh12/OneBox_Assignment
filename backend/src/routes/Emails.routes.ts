import express from 'express';
import { SearchEmailHandler } from '../controllers/Email.controller';
import { searchEmails } from '../services/elastic.service';

const router = express.Router();

//under GET  /api/emails/search?account=.....

router.post('/search', SearchEmailHandler);

export default router;
