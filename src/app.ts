import "dotenv/config";
import prisma from "./db/prisma";
import express from "express";
import cors from "cors";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Bitespace Identity Reconciliation API is running!");
});

app.get("/contacts", async (req, res) => {
    const contacts = await prisma.contact.findMany();
    res.json(contacts);
})

export default app;