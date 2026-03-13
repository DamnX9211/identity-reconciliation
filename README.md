# Identity Reconciliation API

A backend service that resolves and links multiple contact records belonging to the same customer.
It identifies when different emails or phone numbers actually belong to a single person and merges them into one unified identity.

This project was built to explore how real systems maintain consistent user identities when contact information changes across transactions.

## Problem

Customers may place orders using different emails or phone numbers.  
This service links multiple contact records belonging to the same customer.
The system needs to:

• detect when contacts belong to the same user

• link them together

• maintain a single primary identity

 ## Solution

This service reconciles identities by linking contact records using:

• email matches

• phone number matches

Each identity group has:

• Primary Contact – the earliest created contact

• Secondary Contacts – additional linked records

All related contacts are grouped under the same primary identity.

## Features

- Identity reconciliation based on email or phone matching
- Primary–secondary contact linking model
- Automatic merging of identities when connections are discovered
- Handles chain linking between contacts
- REST API endpoint for identity resolution
- Automated API tests
- Deployed backend service

## Tech Stack

Node.js  
Express  
TypeScript  
PostgreSQL  
Prisma ORM

Testing - 
Jest
Supertest

Deployment - 
Render

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

## Project Structure

--src
 ├ controllers
 │   identifyController.ts
 │
 ├ services
 │   identityService.ts
 │
 ├ routes
 │   identifyRoutes.ts
 │
 ├ db
 │   prisma.ts
 │
 ├ tests
 │   identify.test.ts
 │
 ├ app.ts
 └ server.ts


## Run locally

npm install  
npx prisma generate  
npm run dev

## Running test

npm test





## THANK YOU ##
