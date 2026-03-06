import prisma from "../db/prisma"

export const handleIdentity = async (
    email?: string,
    phoneNumber?: string
) => {
        // step 1 - Findining matching contacts
        const matchedContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { email: email || undefined },
                    { phoneNumber: phoneNumber || undefined }
                ]
            }
        });

        // step 2 - If no matches, create new contact
        if(matchedContacts.length === 0) {

            const newContact = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: "primary"
                }
            });

            return {
                contact: {
                    primaryContactId: newContact.id,
                    emails: email ? [email] : [],
                    phoneNumbers: phoneNumber ? [phoneNumber] : [],
                    secondaryContactIds: []
                }
            }
        }

        // step 3 - If matches found, determine primary contact
        let primaryContact = matchedContacts.find(c => c.linkPrecedence === "primary") || matchedContacts[0];

        if(primaryContact.linkedId) {
            primaryContact = await prisma.contact.findUnique({
                where: { id: primaryContact.linkedId }
            }) as any;
        }

        // step 4 - Fetching full identity group
        const identityContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: primaryContact.id },
                    { linkedId: primaryContact.id }
                ]
            }
        });

        // step 5 - If new information exists
        const existingEmails = identityContacts.map(c => c.email).filter(Boolean);
        const existingPhones = identityContacts.map(c => c.phoneNumber).filter(Boolean);

        const emailExists = email && existingEmails.includes(email);
        const phoneExists = phoneNumber && existingPhones.includes(phoneNumber);

        if(!emailExists || !phoneExists) {
            await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkedId: primaryContact.id,
                    linkPrecedence: "secondary"
                }
            });

            identityContacts.push({
                id: -1,
                email,
                phoneNumber,
                linkedId: primaryContact.id,
                linkPrecedence: "secondary"
            } as any);
        }

        // step 6 - Prepare response
        const emails = [...new Set(identityContacts.map(c => c.email).filter(Boolean))];
        const phoneNumbers = [...new Set(identityContacts.map(c => c.phoneNumber).filter(Boolean))];
        const secondaryContactIds = identityContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.id);

        return {
            contact: {
                primaryContactId: primaryContact.id,
                emails,
                phoneNumbers,
                secondaryContactIds
            }
        }
    }
