import dotenv from 'dotenv';
import { EmailIndex } from './services/elastic.service';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;

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