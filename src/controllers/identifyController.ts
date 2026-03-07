import { Request, Response } from "express";
import { handleIdentity } from "../services/indentityService";

export const identifyContact = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({
          error: "At least one of email or phoneNumber must be provided",
        });
    }

    const result = await handleIdentity(email, phoneNumber);

    res.status(200).json(result);
  } catch (error) {
    console.error("Identify Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
