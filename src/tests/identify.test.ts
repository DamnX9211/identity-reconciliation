import request from "supertest";
import app from "../app";
import prisma from "../db/prisma";

describe("POST /identify", () => {

    beforeEach(async () => {
        await prisma.contact.deleteMany();
    })
  it("should create a new primary contact", async () => {
    const res = await request(app).post("/identify").send({
      email: "test@example.com",
      phoneNumber: "111111",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.contact.primaryContactId).toBeDefined();
    expect(res.body.contact.emails).toContain("test@example.com");
  });

  it("should not create duplicate contact", async () => {
    const res = await request(app).post("/identify").send({
      email: "test@example.com",
      phoneNumber: "111111",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.contact.secondaryContactIds.length).toBe(0);
  });

  it("should create secondary contact with new email", async () => {
    const res = await request(app).post("/identify").send({
      email: "test2@example.com",
      phoneNumber: "111111",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.contact.emails).toContain("test2@example.com");
  });

  it("should merge identities through chain linking", async () => {
    const res = await request(app).post("/identify").send({
      email: "test@example.com",
      phoneNumber: "222222",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.contact.primaryContactId).toBeDefined();
  });
});
