import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/Account.routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/accounts', accountRoutes);

app.get('/', (_req, res) => {
    res.send('Backend is running');
});

export default app;