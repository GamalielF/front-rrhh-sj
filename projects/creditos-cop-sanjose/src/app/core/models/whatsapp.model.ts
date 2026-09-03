export type WhatsappTemplate = 'WELCOME_WHATSAPP' | 'SOCIO' | 'GARANTE';
export type WhatsappChannel = 'WHATSAPP';
export type WhatsappType = 'IMAGE';

// Maybe used later
export interface WhatsAppVariables {
    FirstName: string;
    CompanyName: string;
    UserName: string;
}

export interface WhatsappRequestFull {
    notifications: WhatsappRequest[];
}

export interface WhatsappRequest {
    channel: WhatsappChannel;
    destinatario: string;
    codigoPlantilla: WhatsappTemplate;
    mensaje: string;
    variables: WhatsAppVariables;
    media: {
        type: WhatsappType;
        url: string;
        mimeType: string;
        fileName: string;
    }
}

export interface WhatsappResponse {
    message: string,
    status: string,
    timestamp: string,
    success: boolean,
}