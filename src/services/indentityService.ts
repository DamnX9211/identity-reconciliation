import prisma from "../db/prisma";

export const handleIdentity = async (
  email?: string,
  phoneNumber?: string
) => {

  // 1️⃣ Find direct matches
  const directMatches = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email },
        { phoneNumber: phoneNumber }
      ]
    }
  });

  // 2️⃣ If none exist → create primary
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

  // 3️⃣ Collect all related contact IDs
  const relatedIds = new Set<number>();

  directMatches.forEach(c => {
    relatedIds.add(c.id);
    if (c.linkedId) relatedIds.add(c.linkedId);
  });

  // 4️⃣ Fetch full identity group
  const identityGroup = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: Array.from(relatedIds) } },
        { linkedId: { in: Array.from(relatedIds) } }
      ]
    }
  });

  // 5️⃣ Determine oldest primary
  const primaries = identityGroup.filter(c => c.linkPrecedence === "primary");

  primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const primary = primaries[0];

  // 6️⃣ Convert newer primaries → secondary
  for (const p of primaries.slice(1)) {

    await prisma.contact.update({
      where: { id: p.id },
      data: {
        linkedId: primary.id,
        linkPrecedence: "secondary"
      }
    });
  }

  // 7️⃣ Refresh identity group
  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primary.id },
        { linkedId: primary.id }
      ]
    }
  });

  // 8️⃣ Detect new information
  const existingEmails = contacts.map(c => c.email).filter(Boolean);
  const existingPhones = contacts.map(c => c.phoneNumber).filter(Boolean);

  const emailExists = email && existingEmails.includes(email);
  const phoneExists = phoneNumber && existingPhones.includes(phoneNumber);

  if (!emailExists || !phoneExists) {

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

  // 9️⃣ Final contacts
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