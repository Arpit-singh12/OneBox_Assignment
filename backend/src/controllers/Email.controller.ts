import { Request, Response } from "express";
import { searchEmails } from '../services/elastic.service';

export async function SearchEmailHandler(req: Request, res: Response) {
    const { account, folder, query } = req.query;

    try {
        const results = await searchEmails(
            (query as string) || "",
            (account as string) || "",
            (folder as string) || ""
        );
        res.json(results);
    } catch (error) {
        console.log('Error searching emails:', error);
        res.status(500).json({error: 'Failed to search emails'});
    }
}