import { Request, Response } from 'express';
import { addImapAccount } from '../imap/iManager';



// creating controller function to handle adding accounts operations...
export async function addAccount(req: Request, res: Response){
    console.log("Incoming request body:", req.body);
    const { email, password, host, port, secure } = req.body;
    if (!email || !password || !host || !port || secure === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await addImapAccount({ email, password, host, port, secure });
        res.status(201).json({ message: `Account started syncing ${email}` });
    } catch (error) {
        console.error('Error adding account:', error);
        res.status(500).json({ error: 'Failed to add account' });
    }
}
