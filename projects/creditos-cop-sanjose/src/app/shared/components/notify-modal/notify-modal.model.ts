import { Credit } from "@models";
import { RecipientData } from "@components/recipient-selector";

export interface CreditGroup {
    credit: Credit;
    recipients: RecipientData[];
}