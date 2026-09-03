export interface RecipientData {
    id: string;
    fullName: string;
    rawPhones: string | null;
    roleLabel: string;
}

export interface RecipientSelection {
    recipientId: string;
    selectedPhones: string[];
    included: boolean;
}