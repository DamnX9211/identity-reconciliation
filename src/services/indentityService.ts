export const handleIdentity = async (
    email?: string,
    phoneNumber?: string
) => {
    return {
        contact:{
            primaryContactId: null,
            emails: [],
            phoneNumbers: [],
            secondaryContactIds: []
        }
    }
}