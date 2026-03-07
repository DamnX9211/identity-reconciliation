import "dotenv/config";
import prisma from "./db/prisma";
import express from "express";
import cors from "cors";
import { identifyContact } from "./controllers/identifyController";


const app = express();
app.use(express.json());
app.use(cors());
app.post("/identify", identifyContact);

app.get("/", (req, res) => {
    res.send("Bitespace Identity Reconciliation API is running!");
});
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});


app.get("/contacts", async (req, res) => {
    const contacts = await prisma.contact.findMany();
    res.json(contacts);
})

export default app;