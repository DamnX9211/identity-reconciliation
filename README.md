# BiteSpeed Identity Reconciliation API

This project implements the BiteSpeed backend task for identity reconciliation.

## Problem

Customers may place orders using different emails or phone numbers.  
This service links multiple contact records belonging to the same customer.

## Tech Stack

Node.js  
Express  
TypeScript  
PostgreSQL  
Prisma ORM

## API Endpoint

POST /identify

Request body:

{
  "email": "string?",
  "phoneNumber": "string?"
}

Response:

{
  "contact": {
    "primaryContactId": number,
    "emails": [],
    "phoneNumbers": [],
    "secondaryContactIds": []
  }
}

## Logic

- Find contacts matching email or phone
- Expand identity group
- Determine oldest primary contact
- Merge identities if multiple primaries exist
- Create secondary contact if new information appears
- Return consolidated identity

## Run locally

npm install  
npx prisma generate  
npm run dev

## Running test

npm test





## THANK YOU ##