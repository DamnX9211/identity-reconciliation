import prisma from "../db/prisma";

export const handleIdentity = async (
  email?: string,
  phoneNumber?: string
) => {

  // step 1 - Find contact mating email or phone
  const directMatches = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined }
      ]
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  // step 2 - If none exist, create primary
  if (directMatches.length === 0) {

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
    };
  }

  // step 3 - Collect all related contact IDs
  const relatedIds = new Set<number>();

  directMatches.forEach(c => {
    relatedIds.add(c.id);
    if (c.linkedId) relatedIds.add(c.linkedId);
  });

  // step 4 - Fetch all related contacts
  const relatedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: Array.from(relatedIds) } },
        { linkedId: { in: Array.from(relatedIds) } }
      ]
    }
  });

  // step 5 - ensure oldest contact becomes primary
  const primaries = relatedContacts.filter(c => c.linkPrecedence === "primary");

  primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const primary = primaries[0];

  // step 6 - Convert newer primaries to secondary
  for (const p of primaries.slice(1)) {

    await prisma.contact.update({
      where: { id: p.id },
      data: {
        linkedId: primary.id,
        linkPrecedence: "secondary"
      }
    });
  }

  // step 7 -  Refresh identity group
  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primary.id },
        { linkedId: primary.id }
      ]
    }
  });

  // step 8 - Detect new information
  const existingEmails = contacts.map(c => c.email).filter(Boolean);
  const existingPhones = contacts.map(c => c.phoneNumber).filter(Boolean);

  if (email && !existingEmails.includes(email) || phoneNumber && !existingPhones.includes(phoneNumber)) {

    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primary.id,
        linkPrecedence: "secondary"
      }
    });

    if (email) existingEmails.push(email);
    if (phoneNumber) existingPhones.push(phoneNumber);
  }

  // step 9 - Final contacts
  const finalContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primary.id },
        { linkedId: primary.id }
      ]
    }
  });

  const emails = [...new Set(finalContacts.map(c => c.email).filter(Boolean))];
  const phones = [...new Set(finalContacts.map(c => c.phoneNumber).filter(Boolean))];

  const secondaryIds = finalContacts
    .filter(c => c.linkPrecedence === "secondary")
    .map(c => c.id);

  return {
    contact: {
      primaryContactId: primary.id,
      emails,
      phoneNumbers: phones,
      secondaryContactIds: secondaryIds
    }
  };
};