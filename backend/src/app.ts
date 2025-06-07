import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/Account.routes';
import emailRoutes from './routes/Emails.routes';
import cors from 'cors';


dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());


// Route for adding or syncing accounts...
app.use('/api/accounts', accountRoutes);


//setting routes for search mails using folder, account, text....
app.use('/api/emails', emailRoutes);

// just adding a check to check backend is running...
app.get('/', (_req, res) => {
    res.send('Backend is running');
});

export default app;