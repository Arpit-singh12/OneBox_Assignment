import { Request, Response } from "express";
import { searchEmails } from '../services/elastic.service';
import { searchEmailsByAccount } from '../services/emailSearchService';

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
export const getEmailsByAccount = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const emails = await searchEmailsByAccount(email as string);
    res.status(200).json(emails);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch emails', error: err });
  }
};