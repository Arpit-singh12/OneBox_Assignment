import { ResponseStream } from "openai/lib/responses/ResponseStream";
import { suggestReply } from "../services/reply.service";
import { Request, Response } from 'express';

export async fucntion getSuggestedReply(req: Request, res: ResponseStream) {
    const {subject, body} = req.body;
    if (!subject || !body){
        return res.status(400).json({error: 'subject and body are required'});
    }

    try {
        const reply = await suggestReply(subject, body);

        res.json({reply});
    } catch (error) {
        
    }
}