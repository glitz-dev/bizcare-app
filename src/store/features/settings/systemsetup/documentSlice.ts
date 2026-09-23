import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /DocumentM/GetAllDocuments?currentPage=...&rowsPerPage=...&searchStr=...
// Returns an envelope-wrapped array
export interface DocumentListItem {
    rowAscNum: number;
    rowDescNum: number;
    DocumentTypeName: string;
    DocumentID: number;
    DocumentName: string;
    Prefix: string | null;
    Suffix: string | null;
    StartingNo: number;
    SetDefault: boolean;
    CreditAccount: string;
    DebitAccount: string;
    Active: "Active" | "InActive";
}

export interface ApiResponseWrapper<T> {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: T;
        Id: number;
        Info: string | null;
        Approve: boolean | null;
    };
}

// GET /DocumentM/GetDocumentTypeStartWith?startWith=...
// Returns a flat array (no envelope wrapper)
export interface DocumentTypeStartWithItem {
    DocumentTypeID: number;
    DocumentTypeName: string;
}

// GET /Currency/GetCurrencyStartwith?startWith=...
// Returns an envelope-wrapped array
export interface CurrencyStartWithItem {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

// GET /AccountHead/GetAllAccHeadStartWith?startWith=...
// Returns a flat array (no envelope wrapper)
export interface AccHeadStartWithItem {
    HeadName: string;
    HeadID: number;
}

// GET /AccountHead/GetAllAccHeadsForDocs
// Returns a flat array (no envelope wrapper)
export interface AccHeadForDocsItem {
    GroupName: string;
    MajorGroupName: string;
    GroupID: number;
    MajorGroupID: number;
    OpBalance: number;
    HeadName: string;
    HeadCode: string | null;
    HeadID: number;
    DrOrCr: "Dr" | "Cr";
}

// GET /DocumentM/GetTaxMasterDetails?startWith=...
// Returns a flat array (no envelope wrapper)
export interface TaxMasterDetailsItem {
    TaxMasterID: number;
    TaxMasterName: string;
}

// GET /CommonUtility/GetAllInvoiceTaxTypes?taxMasterId=...
// Returns a flat array (no envelope wrapper)
export interface InvoiceTaxTypeItem {
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
}

// GET /AccountGroup/GetAccGroupStartWith?CompanyID=...&BranchID=...&startWith=...
// Returns a flat array (no envelope wrapper)
export interface AccGroupStartWithItem {
    GroupName: string;
    GroupID: number;
}

// GET /Item/GetServiceItemBySearch?searchStr=...
// Returns an envelope-wrapped array
export interface ServiceItemBySearchItem {
    ItemCode: string;
    ItemName: string;
    ItemID: number;
}

// POST /DocumentM/SaveChanges
// Returns an envelope-wrapped response with Data: null
export interface DocumentAddHead {
    InputAccHeadID: number;
    InputAccHeadName: string;
    OutputAccHeadID: number;
    OutputAccHeadName: string;
    ServiceItemID: number;
    ServiceItemName: string;
}

export interface SaveDocumentChangesPayload {
    BackgroundColor: string;
    Currency: string;
    DebitHeadID: number;
    DebitHeadName: string;
    DiscountHead: string;
    DiscountHeadID: number;
    DocumentName: string;
    DocumentTypeID: number;
    DocumentTypeName: string;
    GroupID: number;
    GroupName: string;
    InvoiceTaxType: string;
    InvoiceTaxTypeID: number;
    IsGST: boolean;
    IsVAT: boolean;
    LstDocumentAddHead: DocumentAddHead[];
    LstDocumentTaxDetails: unknown[];
    NotificationEmail: boolean;
    NotificationSms: boolean;
    PanelColor: string;
    Prefix: string;
    RoundoffHead: string;
    RoundoffHeadID: number;
    TaxMaster: string;
    TaxMasterID: number;
}

export interface SaveDocumentChangesResult {
    id: number;
    messageId: string | null;
}

// GET /DocumentM/GetSelectedDocument?documentId=...
// Returns an envelope-wrapped single object
export interface SelectedDocumentAddHead {
    DocumentAddID: number;
    DocumentID: number;
    DocumentM: unknown | null;
    ServiceItemID: number;
    CompanyID: number;
    BranchID: number;
    FinYearID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    DocumentAddHeadGUID: string;
    InputAccHeadID: number;
    OutputAccHeadID: number;
    IsAddition: boolean;
    Selected: boolean;
    ServiceItemName: string;
    InputAccHeadName: string;
    OutputAccHeadName: string;
}

export interface SelectedDocument {
    DocumentID: number;
    DocumentName: string;
    SetDefault: boolean;
    ShortName: string | null;
    DocumentTypeID: number;
    DocumentTypeM: unknown | null;
    Prefix: string | null;
    Suffix: string | null;
    StartingNo: number;
    Automation: boolean;
    CreditHeadID: number | null;
    CreditAccHeadM: unknown | null;
    DebitHeadID: number | null;
    DebitAccHeadM: unknown | null;
    PrintModID: number | null;
    PrintModuleM: unknown | null;
    PrintTitle: string | null;
    Declaration: string | null;
    PanelColor: string;
    BackgroundColor: string;
    CompanyID: number;
    BranchID: number;
    FinYearID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    DocumentGuid: string;
    IsGST: boolean;
    IsVAT: boolean;
    TaxMasterID: number;
    GroupID: number;
    PrefferedGroup: unknown | null;
    DiscountHeadID: number;
    NegativeStock: boolean | null;
    PrintAfterSave: boolean | null;
    NotificationEmail: boolean;
    NotificationSms: boolean | null;
    CessApplicable: boolean;
    EnableAddCharges: boolean | null;
    EnableDedCharges: boolean | null;
    GroupCode: string | null;
    CurrencyID: number | null;
    InvoiceTaxTypeID: number;
    RoundoffHeadID: number;
    Active: boolean;
    LstDocumentAddHead: SelectedDocumentAddHead[];
    LstDocumentTaxDetails: unknown[] | null;
    DocumentTypeName: string;
    CreditHeadName: string | null;
    DebitHeadName: string | null;
    PrintModName: string | null;
    GroupName: string;
    DiscountHead: string;
    RoundoffHead: string;
    TaxMaster: string;
    InvoiceTaxType: string;
    Currency: string | null;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchAllDocumentsParams {
    currentPage?: number;          // default 1
    rowsPerPage?: number;          // default 50
    searchStr?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchDocumentTypeStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchCurrencyStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchAccHeadStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchAccHeadsForDocsParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchTaxMasterDetailsParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchInvoiceTaxTypesParams {
    taxMasterId: number;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchAccGroupStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    branchId?: number;             // default 1
    finYearId?: number;            // default 2
}

export interface FetchServiceItemBySearchParams {
    searchStr?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface SaveDocumentChangesParams {
    payload: SaveDocumentChangesPayload;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchSelectedDocumentParams {
    documentId: number;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface DocumentState {
    documentList: DocumentListItem[];
    documentListLoading: boolean;
    documentListError: string | null;
    documentTypeStartWithList: DocumentTypeStartWithItem[];
    documentTypeStartWithLoading: boolean;
    documentTypeStartWithError: string | null;
    currencyStartWithList: CurrencyStartWithItem[];
    currencyStartWithLoading: boolean;
    currencyStartWithError: string | null;
    accHeadStartWithList: AccHeadStartWithItem[];
    accHeadStartWithLoading: boolean;
    accHeadStartWithError: string | null;
    accHeadsForDocsList: AccHeadForDocsItem[];
    accHeadsForDocsLoading: boolean;
    accHeadsForDocsError: string | null;
    taxMasterDetailsList: TaxMasterDetailsItem[];
    taxMasterDetailsLoading: boolean;
    taxMasterDetailsError: string | null;
    invoiceTaxTypesList: InvoiceTaxTypeItem[];
    invoiceTaxTypesLoading: boolean;
    invoiceTaxTypesError: string | null;
    accGroupStartWithList: AccGroupStartWithItem[];
    accGroupStartWithLoading: boolean;
    accGroupStartWithError: string | null;
    serviceItemBySearchList: ServiceItemBySearchItem[];
    serviceItemBySearchLoading: boolean;
    serviceItemBySearchError: string | null;
    documentSaveResult: SaveDocumentChangesResult | null;
    documentSaveLoading: boolean;
    documentSaveError: string | null;
    selectedDocument: SelectedDocument | null;
    selectedDocumentLoading: boolean;
    selectedDocumentError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: DocumentState = {
    documentList: [],
    documentListLoading: false,
    documentListError: null,
    documentTypeStartWithList: [],
    documentTypeStartWithLoading: false,
    documentTypeStartWithError: null,
    currencyStartWithList: [],
    currencyStartWithLoading: false,
    currencyStartWithError: null,
    accHeadStartWithList: [],
    accHeadStartWithLoading: false,
    accHeadStartWithError: null,
    accHeadsForDocsList: [],
    accHeadsForDocsLoading: false,
    accHeadsForDocsError: null,
    taxMasterDetailsList: [],
    taxMasterDetailsLoading: false,
    taxMasterDetailsError: null,
    invoiceTaxTypesList: [],
    invoiceTaxTypesLoading: false,
    invoiceTaxTypesError: null,
    accGroupStartWithList: [],
    accGroupStartWithLoading: false,
    accGroupStartWithError: null,
    serviceItemBySearchList: [],
    serviceItemBySearchLoading: false,
    serviceItemBySearchError: null,
    documentSaveResult: null,
    documentSaveLoading: false,
    documentSaveError: null,
    selectedDocument: null,
    selectedDocumentLoading: false,
    selectedDocumentError: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    const authState = state as RootState;
    let token = (authState.auth as any)?.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// 1. GetAllDocuments — envelope-wrapped array response
export const fetchAllDocuments = createAsyncThunk<
    DocumentListItem[],
    FetchAllDocumentsParams | void,
    { state: RootState; rejectValue: string }
>(
    "document/fetchAllDocuments",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const currentPage = params?.currentPage ?? 1;
        const rowsPerPage = params?.rowsPerPage ?? 50;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/DocumentM/GetAllDocuments?currentPage=${currentPage}&rowsPerPage=${rowsPerPage}&searchStr=${encodeURIComponent(
                searchStr
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<DocumentListItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch documents.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetDocumentTypeStartWith — flat array response (no envelope)
export const fetchDocumentTypeStartWith = createAsyncThunk<
    DocumentTypeStartWithItem[],
    FetchDocumentTypeStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "document/fetchDocumentTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/DocumentM/GetDocumentTypeStartWith?&startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: DocumentTypeStartWithItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetCurrencyStartwith — envelope-wrapped array response
export const fetchCurrencyStartWith = createAsyncThunk<
    CurrencyStartWithItem[],
    FetchCurrencyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "document/fetchCurrencyStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/GetCurrencyStartwith?startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<CurrencyStartWithItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currencies.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetAllAccHeadStartWith — flat array response (no envelope)
export const fetchAccHeadStartWith = createAsyncThunk<
    AccHeadStartWithItem[],
    FetchAccHeadStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "document/fetchAccHeadStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/GetAllAccHeadStartWith?startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: AccHeadStartWithItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. GetAllAccHeadsForDocs — flat array response (no envelope)
export const fetchAccHeadsForDocs = createAsyncThunk<
    AccHeadForDocsItem[],
    FetchAccHeadsForDocsParams | void,
    { state: RootState; rejectValue: string }
>(
    "document/fetchAccHeadsForDocs",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/GetAllAccHeadsForDocs`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: AccHeadForDocsItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. GetTaxMasterDetails — flat array response (no envelope)
export const fetchTaxMasterDetails = createAsyncThunk<
    TaxMasterDetailsItem[],
    FetchTaxMasterDetailsParams | void,
    { state: RootState; rejectValue: string }
>(
    "document/fetchTaxMasterDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/DocumentM/GetTaxMasterDetails?startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: TaxMasterDetailsItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 7. GetAllInvoiceTaxTypes — flat array response (no envelope)
export const fetchInvoiceTaxTypes = createAsyncThunk<
    InvoiceTaxTypeItem[],
    FetchInvoiceTaxTypesParams,
    { state: RootState; rejectValue: string }
>(
    "document/fetchInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/CommonUtility/GetAllInvoiceTaxTypes?taxMasterId=${params.taxMasterId}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: InvoiceTaxTypeItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 8. GetAccGroupStartWith — flat array response (no envelope)
export const fetchAccGroupStartWith = createAsyncThunk<
    AccGroupStartWithItem[],
    FetchAccGroupStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "document/fetchAccGroupStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const branchId = params?.branchId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/GetAccGroupStartWith?CompanyID=${companyId}&BranchID=${branchId}&startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: AccGroupStartWithItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 9. GetServiceItemBySearch — envelope-wrapped array response
export const fetchServiceItemBySearch = createAsyncThunk<
    ServiceItemBySearchItem[],
    FetchServiceItemBySearchParams | void,
    { state: RootState; rejectValue: string }
>(
    "document/fetchServiceItemBySearch",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Item/GetServiceItemBySearch?searchStr=${encodeURIComponent(
                searchStr
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<ServiceItemBySearchItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch service items.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 10. SaveChanges — envelope-wrapped response, Data is null; Id/MessageId carry the result
export const saveDocumentChanges = createAsyncThunk<
    SaveDocumentChangesResult,
    SaveDocumentChangesParams,
    { state: RootState; rejectValue: string }
>(
    "document/saveDocumentChanges",
    async ({ payload, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? 1;
        const resolvedFinYearId = finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/DocumentM/SaveChanges`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(resolvedCompanyId),
                    "x-finyear-id": String(resolvedFinYearId),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<null> = await response.json();

            if (json.Server?.Success) {
                return { id: json.Server.Id, messageId: json.Server.MessageId };
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to save document.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 11. GetSelectedDocument — envelope-wrapped single object response
export const fetchSelectedDocument = createAsyncThunk<
    SelectedDocument,
    FetchSelectedDocumentParams,
    { state: RootState; rejectValue: string }
>(
    "document/fetchSelectedDocument",
    async ({ documentId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? 1;
        const resolvedFinYearId = finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/DocumentM/GetSelectedDocument?documentId=${documentId}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(resolvedCompanyId),
                    "x-finyear-id": String(resolvedFinYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<SelectedDocument> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch document.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const documentSlice = createSlice({
    name: "document",
    initialState,
    reducers: {
        clearDocumentList(state) {
            state.documentList = [];
            state.documentListError = null;
        },
        clearDocumentTypeStartWithList(state) {
            state.documentTypeStartWithList = [];
            state.documentTypeStartWithError = null;
        },
        clearCurrencyStartWithList(state) {
            state.currencyStartWithList = [];
            state.currencyStartWithError = null;
        },
        clearAccHeadStartWithList(state) {
            state.accHeadStartWithList = [];
            state.accHeadStartWithError = null;
        },
        clearAccHeadsForDocsList(state) {
            state.accHeadsForDocsList = [];
            state.accHeadsForDocsError = null;
        },
        clearTaxMasterDetailsList(state) {
            state.taxMasterDetailsList = [];
            state.taxMasterDetailsError = null;
        },
        clearInvoiceTaxTypesList(state) {
            state.invoiceTaxTypesList = [];
            state.invoiceTaxTypesError = null;
        },
        clearAccGroupStartWithList(state) {
            state.accGroupStartWithList = [];
            state.accGroupStartWithError = null;
        },
        clearServiceItemBySearchList(state) {
            state.serviceItemBySearchList = [];
            state.serviceItemBySearchError = null;
        },
        clearDocumentSaveResult(state) {
            state.documentSaveResult = null;
            state.documentSaveError = null;
        },
        clearSelectedDocument(state) {
            state.selectedDocument = null;
            state.selectedDocumentError = null;
        },
        resetDocument() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllDocuments
            .addCase(fetchAllDocuments.pending, (state) => {
                state.documentListLoading = true;
                state.documentListError = null;
            })
            .addCase(fetchAllDocuments.fulfilled, (state, action) => {
                state.documentListLoading = false;
                state.documentList = action.payload;
            })
            .addCase(fetchAllDocuments.rejected, (state, action) => {
                state.documentListLoading = false;
                state.documentListError = action.payload ?? "Unknown error";
            })
            // GetDocumentTypeStartWith
            .addCase(fetchDocumentTypeStartWith.pending, (state) => {
                state.documentTypeStartWithLoading = true;
                state.documentTypeStartWithError = null;
            })
            .addCase(fetchDocumentTypeStartWith.fulfilled, (state, action) => {
                state.documentTypeStartWithLoading = false;
                state.documentTypeStartWithList = action.payload;
            })
            .addCase(fetchDocumentTypeStartWith.rejected, (state, action) => {
                state.documentTypeStartWithLoading = false;
                state.documentTypeStartWithError = action.payload ?? "Unknown error";
            })
            // GetCurrencyStartwith
            .addCase(fetchCurrencyStartWith.pending, (state) => {
                state.currencyStartWithLoading = true;
                state.currencyStartWithError = null;
            })
            .addCase(fetchCurrencyStartWith.fulfilled, (state, action) => {
                state.currencyStartWithLoading = false;
                state.currencyStartWithList = action.payload;
            })
            .addCase(fetchCurrencyStartWith.rejected, (state, action) => {
                state.currencyStartWithLoading = false;
                state.currencyStartWithError = action.payload ?? "Unknown error";
            })
            // GetAllAccHeadStartWith
            .addCase(fetchAccHeadStartWith.pending, (state) => {
                state.accHeadStartWithLoading = true;
                state.accHeadStartWithError = null;
            })
            .addCase(fetchAccHeadStartWith.fulfilled, (state, action) => {
                state.accHeadStartWithLoading = false;
                state.accHeadStartWithList = action.payload;
            })
            .addCase(fetchAccHeadStartWith.rejected, (state, action) => {
                state.accHeadStartWithLoading = false;
                state.accHeadStartWithError = action.payload ?? "Unknown error";
            })
            // GetAllAccHeadsForDocs
            .addCase(fetchAccHeadsForDocs.pending, (state) => {
                state.accHeadsForDocsLoading = true;
                state.accHeadsForDocsError = null;
            })
            .addCase(fetchAccHeadsForDocs.fulfilled, (state, action) => {
                state.accHeadsForDocsLoading = false;
                state.accHeadsForDocsList = action.payload;
            })
            .addCase(fetchAccHeadsForDocs.rejected, (state, action) => {
                state.accHeadsForDocsLoading = false;
                state.accHeadsForDocsError = action.payload ?? "Unknown error";
            })
            // GetTaxMasterDetails
            .addCase(fetchTaxMasterDetails.pending, (state) => {
                state.taxMasterDetailsLoading = true;
                state.taxMasterDetailsError = null;
            })
            .addCase(fetchTaxMasterDetails.fulfilled, (state, action) => {
                state.taxMasterDetailsLoading = false;
                state.taxMasterDetailsList = action.payload;
            })
            .addCase(fetchTaxMasterDetails.rejected, (state, action) => {
                state.taxMasterDetailsLoading = false;
                state.taxMasterDetailsError = action.payload ?? "Unknown error";
            })
            // GetAllInvoiceTaxTypes
            .addCase(fetchInvoiceTaxTypes.pending, (state) => {
                state.invoiceTaxTypesLoading = true;
                state.invoiceTaxTypesError = null;
            })
            .addCase(fetchInvoiceTaxTypes.fulfilled, (state, action) => {
                state.invoiceTaxTypesLoading = false;
                state.invoiceTaxTypesList = action.payload;
            })
            .addCase(fetchInvoiceTaxTypes.rejected, (state, action) => {
                state.invoiceTaxTypesLoading = false;
                state.invoiceTaxTypesError = action.payload ?? "Unknown error";
            })
            // GetAccGroupStartWith
            .addCase(fetchAccGroupStartWith.pending, (state) => {
                state.accGroupStartWithLoading = true;
                state.accGroupStartWithError = null;
            })
            .addCase(fetchAccGroupStartWith.fulfilled, (state, action) => {
                state.accGroupStartWithLoading = false;
                state.accGroupStartWithList = action.payload;
            })
            .addCase(fetchAccGroupStartWith.rejected, (state, action) => {
                state.accGroupStartWithLoading = false;
                state.accGroupStartWithError = action.payload ?? "Unknown error";
            })
            // GetServiceItemBySearch
            .addCase(fetchServiceItemBySearch.pending, (state) => {
                state.serviceItemBySearchLoading = true;
                state.serviceItemBySearchError = null;
            })
            .addCase(fetchServiceItemBySearch.fulfilled, (state, action) => {
                state.serviceItemBySearchLoading = false;
                state.serviceItemBySearchList = action.payload;
            })
            .addCase(fetchServiceItemBySearch.rejected, (state, action) => {
                state.serviceItemBySearchLoading = false;
                state.serviceItemBySearchError = action.payload ?? "Unknown error";
            })
            // SaveChanges
            .addCase(saveDocumentChanges.pending, (state) => {
                state.documentSaveLoading = true;
                state.documentSaveError = null;
            })
            .addCase(saveDocumentChanges.fulfilled, (state, action) => {
                state.documentSaveLoading = false;
                state.documentSaveResult = action.payload;
            })
            .addCase(saveDocumentChanges.rejected, (state, action) => {
                state.documentSaveLoading = false;
                state.documentSaveError = action.payload ?? "Unknown error";
            })
            // GetSelectedDocument
            .addCase(fetchSelectedDocument.pending, (state) => {
                state.selectedDocumentLoading = true;
                state.selectedDocumentError = null;
            })
            .addCase(fetchSelectedDocument.fulfilled, (state, action) => {
                state.selectedDocumentLoading = false;
                state.selectedDocument = action.payload;
            })
            .addCase(fetchSelectedDocument.rejected, (state, action) => {
                state.selectedDocumentLoading = false;
                state.selectedDocumentError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearDocumentList,
    clearDocumentTypeStartWithList,
    clearCurrencyStartWithList,
    clearAccHeadStartWithList,
    clearAccHeadsForDocsList,
    clearTaxMasterDetailsList,
    clearInvoiceTaxTypesList,
    clearAccGroupStartWithList,
    clearServiceItemBySearchList,
    clearDocumentSaveResult,
    clearSelectedDocument,
    resetDocument,
} = documentSlice.actions;

export default documentSlice.reducer;
