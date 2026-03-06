import { Request, Response } from "express";
import { handleIdentity } from "../services/indentityService";

export const identifyContact = async (req: Request, res: Response)=>{
    try {
        const { email, phoneNumber } = req.body;

        const result = await handleIdentity(email, phoneNumber);

        res.status(200).json(result);
    } catch (error) {
        console.error("Identify Error:", error);
        res.status(500).json({ error: "An error occurred while identifying the contact." });
    }
}