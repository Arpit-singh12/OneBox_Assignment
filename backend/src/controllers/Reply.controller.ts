import { suggestReply } from '../services/reply.service';
import { Request, Response } from 'express';

export async function generateReply(req: Request, res: Response){
    const { subject, body, email } = req.body;
    if(!subject || !body || !email) {
        return res.status(400).json({error: 'Missing field body,subject, email.'});
    }

    try {
        const reply = await suggestReply(subject, body, email);
        return res.status(200).json({reply});
    } catch (error) {
        console.log('failed generate reply.')
        return res.status(500).json({error: 'Failed to generate reply.'});
    }
}