import dotenv from 'dotenv';
import { EmailIndex } from './services/elastic.service';
import app from './app';
import cors from 'cors';

dotenv.config();

const PORT = process.env.PORT || 5000;
// to maintain flow with frontend
//app.use(cors({
  //  origin: 'http://localhost:5174/',
   // credentials: true
//}));

async function serverStart() {
    try {
        await EmailIndex();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log("Failed to start server:", error);
    }
}
serverStart();