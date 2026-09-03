export interface Pageable {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
}

export interface Credit {
    creditCode: string;
    advisorCode: string;
    officeName: string;
    fullName: string;
    dueDate: string;
    telephone: string | null;
    cellphone: string | null;
    daysPastDue: number;
    guarantor1FullName: string | null;
    guarantor1Cellphone: string | null;
    guarantor1Telephone: string | null;
    guarantor2FullName: string | null;
    guarantor2Cellphone: string | null;
    guarantor2Telephone: string | null;
}

export interface CreditsResponse {
    content: Credit[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: Pageable;
    size: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    totalElements: number;
    totalPages: number;
}