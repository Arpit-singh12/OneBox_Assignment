import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/Account.routes';
import emailRoutes from './routes/Emails.routes';


dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/accounts', accountRoutes);


//setting routes for search mails using folder, account, text....

app.use('/api/emails', emailRoutes);

app.get('/', (_req, res) => {
    res.send('Backend is running');
});

export default app;