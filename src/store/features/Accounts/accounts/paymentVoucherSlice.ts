import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentStartWith {
    DocumentID: number;
    DocumentName: string;
    SetDefault: boolean;
    PrintModName: string | null;
    Declaration: string | null;
    ShortName: string | null;
    CreditHeadID: number | null;
    Automation: boolean;
    CreditAccount: string | null;
    DebitHeadID: number | null;
    DebitAccount: string | null;
    Prefix: string;
    Suffix: string | null;
    StartingNo: number;
    BackgroundColor: string | null;
    PanelColor: string | null;
    TaxMasterID: number;
    IsGST: boolean;
    IsVAT: boolean;
    EnableAddCharges: boolean;
    EnableDedCharges: boolean;
    GroupCode: string | null;
    CurrencyID: number;
    Currency: string;
    ExchRate: number | null;
    DocumentTypeID: number;
}

export interface PreferenceDetail {
    PreferenceID: number;
    ModuleName: string;
    FunctionName: string;
    Required: boolean;
    OptionValue: number;
    OptionString: string | null;
    Valuefield: string;
    CompanyID: number;
    BranchID: number;
    FinYearID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    PrefGUID: string;
}

export interface CompanyCurrency {
    CompanyID: number;
    CurrencyID: number;
    Currency: string;
    Symbol: string;
}

export interface CurrencyM {
    CurrencyID: number;
    CurrencyCode: string;
    Currency: string;
    Active: boolean;
    CompanyID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    CurrencyGuid: string;
    Symbol: string;
    FaClass: string;
    FaChar: string;
    Common: boolean;
}

export interface CurrencyExRateData {
    CurrencyM: CurrencyM;
    CurrencyTID: number;
    CurrencyID: number;
    TransDate: string;
    ExchRate: number;
    CompanyID: number;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    CurrencyTGuid: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Status: boolean;
}

export interface TaxOnServiceDetail {
    OptionValue: number;
}

export interface AccountHeadHeader {
    HeadID: number;
    HeadName: string;
    GroupID?: number; // GroupID is now optional since the GetAllAccHeadStartWith response doesn't provide it
}

export interface BankDetail {
    BankID: number;
    BankName: string;
    PostShipmentCredit: number | null;
    PreshipmentCredit: number | null;
    AcHeadID: number;
    AccountNo: string;
}

export interface CurrencyStartWith {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

export interface VoucherListItem {
    PayOrRecID: number;
    Date: string;
    VoucherNo: string;
    VoucherAmount: number;
    ChequeNo: string | null;
    ChequeDate: string | null;
    VoucherMode: string;
    VoucherType: string;
    IsReceiptOrPayment: boolean;
    ApprovedBY: string;
    Approve: string;
    Remarks: string | null;
    OrderNos: string;
    CreatedOn: string;
    HeadNames: string;
    ApprovedDate: string | null;
    UserName: string | null;
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

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchDocumentStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchDocumentStartWithActiveParams {
    documentType: string;
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchPreferenceDetailsParams {
    functionName: string;
    companyId?: number;
    branchId?: number;
    finYearId?: number;
}

export interface FetchCompanyCurrencyParams {
    companyId?: number;
}

export interface FetchCurrencyExRateParams {
    currencyId: number;
    date?: string;
    companyId?: number;
}

export interface FetchTaxOnServiceParams {
    companyId?: number;
}

export interface FetchAccountHeadsParams {
    startWith?: string;
    voucherTypeId?: number;
    companyId?: number;
}

export interface FetchAccountHeadsAllParams {
    startWith?: string;
    companyId?: number;
}

export interface FetchAccountBalanceParams {
    headId: number;
    companyId?: number;
}

export interface CheckChequeNumberDuplicationParams {
    bankId: number;
    chequeNo: string;
    companyId?: number;
}

export interface FetchBankParams {
    startWith?: string;
    companyId?: number;
}

export interface FetchCurrencyStartWithParams {
    startWith?: string;
    companyId?: number;
}

export interface FetchVoucherListParams {
    fromDate: string;
    toDate: string;
    paymentOrReceipt: number;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

// ─── SaveChanges (Voucher) Payload Types ──────────────────────────────────────
// Mirrors the exact shape the backend expects at /service/api/Voucher/SaveChanges.
// Field names/casing are kept verbatim (PascalCase / mixed-case) to match the API.

export interface SaveChangesBankDetails {
    BankReceiptTypeID: number;
    NeftRefNo: string | null;
    ChequeNo: string | null;
    ChequeDateStr: string | null;
    BankID: number;
    BankName: string | null;
    Branch: string | null;
}

export interface SaveChangesBankPaymentType {
    Id: number;
    Title: string;
}

export interface SaveChangesVoucherType {
    Id: number;
    Name: string;
}

export interface SaveChangesDetailLine {
    HeadName: string;
    HeadID: number;
    Balance: string;
    SystemAmount: string;
    Amount: number;
    CESSAmt: number;
    CGSTAmt: number;
    IGSTAmt: number;
    NetAmt: string;
    RefDate: string | null;
    SGSTAmt: number;
    TaxPercentage: number;
    TaxRate: string;
    UTGSTAmt: number;
    VATAmt: string;
    VATPer: number;
}

export interface SaveChangesFundCreditLine {
    Charge: number;
    IsReceiptOrPayment: number;
    AccHeadName: string;
    AccHeadID: number;
    Amount: number;
    BaseAmount: string;
    CGSTAmount: number;
    Currency: string;
    CurrencyID: number;
    ExRate: number;
    NetAmount: number;
    SGSTAmount: number;
    TaxEnabled: boolean;
    TotalTaxAmount: number;
}

export interface SaveChangesPayload {
    Advance: boolean;
    BankDetails: SaveChangesBankDetails;
    BankID: number;
    BankName: string | null;
    BankPaymentType: SaveChangesBankPaymentType;
    BankReceiptTypeID: number;
    BaseCurrencyAmt: number;
    Branch: string | null;
    ChequeDate: string | null;
    ChequeDateStr: string | null;
    ChequeNo: string | null;
    Currency: string;
    CurrencyID: number;
    Date: string;
    DocumentID: number;
    DocumentName: string;
    EmpLoan: boolean;
    ExchRate: number;
    FundCreditTo: number;
    HeadID: number;
    HeaderGroupID: number;
    HeaderHeadID: number;
    HeaderHeadName: string;
    IsCess: boolean;
    IsGST: boolean;
    IsReceiptOrPayment: number;
    IsVAT: boolean;
    LstPaymentReceiptAdvanceT: SaveChangesDetailLine[];
    LstPaymentReceiptT: SaveChangesDetailLine[];
    LstVoucherDetails: SaveChangesDetailLine[];
    NeftRefNo: string | null;
    NextTransNo: number;
    Percentage: string;
    ReceiptTypeID: number;
    Remarks: string;
    RoundOff: boolean;
    Settled: boolean;
    TDSHeadID: number;
    TDSHeadName: string;
    TaxAmountHead: string;
    TaxMasterName: string;
    TaxPercHead: string;
    TotalTDS: string;
    TotalTDSAmt: number;
    VoucherAmount: number;
    VoucherAmountPopUp: string;
    VoucherDateStr: string;
    lstFundCredit: SaveChangesFundCreditLine[];
    startingnowithoutprefix: number;
    totalAmt: number;
    voucherType: SaveChangesVoucherType;
    voucherprefix: string;
    vouchersufix: string | null;
}

export interface SaveChangesParams {
    payload: SaveChangesPayload;
    companyId?: number;
    finYearId?: number;
}

// Mirrors the "Server" envelope returned by /Voucher/SaveChanges. Data is
// always null on success/failure here — the saved voucher's identifying
// info (e.g. "BP-2") comes back in `Info`.
export interface SaveChangesResult {
    Success: boolean;
    Message: string;
    MessageId: string | null;
    Data: null;
    Id: number;
    Info: string | null;
    Approve: boolean | null;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface PaymentVoucherState {
    documentList: DocumentStartWith[];
    selectedDocument: DocumentStartWith | null;
    documentLoading: boolean;
    documentError: string | null;

    activeDocumentList: DocumentStartWith[];
    selectedActiveDocument: DocumentStartWith | null;
    activeDocumentLoading: boolean;
    activeDocumentError: string | null;

    preferenceDetails: PreferenceDetail[] | null;
    preferenceLoading: boolean;
    preferenceError: string | null;

    companyCurrency: CompanyCurrency | null;
    currencyLoading: boolean;
    currencyError: string | null;

    exchangeRateData: CurrencyExRateData | null;
    exchangeRateLoading: boolean;
    exchangeRateError: string | null;

    taxOnService: TaxOnServiceDetail[] | null;
    taxOnServiceLoading: boolean;
    taxOnServiceError: string | null;

    accountHeadsList: AccountHeadHeader[];
    accountHeadsLoading: boolean;
    accountHeadsError: string | null;

    accountHeadsDetailList: AccountHeadHeader[];
    accountHeadsDetailLoading: boolean;
    accountHeadsDetailError: string | null;

    accountBalance: string;
    accountBalanceLoading: boolean;
    accountBalanceError: string | null;

    chequeDuplicationResult: number | null;
    chequeDuplicationLoading: boolean;
    chequeDuplicationError: string | null;

    bankList: BankDetail[];
    bankLoading: boolean;
    bankError: string | null;

    currencyStartWithList: CurrencyStartWith[];
    currencyStartWithLoading: boolean;
    currencyStartWithError: string | null;

    voucherList: VoucherListItem[];
    voucherListLoading: boolean;
    voucherListError: string | null;

    saveChangesResult: SaveChangesResult | null;
    saveChangesLoading: boolean;
    saveChangesError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: PaymentVoucherState = {
    documentList: [],
    selectedDocument: null,
    documentLoading: false,
    documentError: null,

    activeDocumentList: [],
    selectedActiveDocument: null,
    activeDocumentLoading: false,
    activeDocumentError: null,

    preferenceDetails: null,
    preferenceLoading: false,
    preferenceError: null,

    companyCurrency: null,
    currencyLoading: false,
    currencyError: null,

    exchangeRateData: null,
    exchangeRateLoading: false,
    exchangeRateError: null,

    taxOnService: null,
    taxOnServiceLoading: false,
    taxOnServiceError: null,

    accountHeadsList: [],
    accountHeadsLoading: false,
    accountHeadsError: null,

    accountHeadsDetailList: [],
    accountHeadsDetailLoading: false,
    accountHeadsDetailError: null,

    accountBalance: "0.00",
    accountBalanceLoading: false,
    accountBalanceError: null,

    chequeDuplicationResult: null,
    chequeDuplicationLoading: false,
    chequeDuplicationError: null,

    bankList: [],
    bankLoading: false,
    bankError: null,

    currencyStartWithList: [],
    currencyStartWithLoading: false,
    currencyStartWithError: null,

    voucherList: [],
    voucherListLoading: false,
    voucherListError: null,

    saveChangesResult: null,
    saveChangesLoading: false,
    saveChangesError: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

interface AuthState {
    userData?: {
        token?: string | null;
    };
}

const getCleanToken = (state: RootState): string | null => {
    const authState = (state as unknown as { auth?: AuthState }).auth;
    let token = authState?.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDocumentStartWith = createAsyncThunk<
    DocumentStartWith[],
    FetchDocumentStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchDocumentStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith");
            url.searchParams.set("DocumentType", "PAYMENT");
            url.searchParams.set("startWith", startWith);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: DocumentStartWith[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDocumentStartWithActive = createAsyncThunk<
    DocumentStartWith[],
    FetchDocumentStartWithActiveParams,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchDocumentStartWithActive",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params.startWith ?? "";
        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWithActive");
            url.searchParams.set("DocumentType", params.documentType);
            url.searchParams.set("startWith", startWith);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<DocumentStartWith[]> | DocumentStartWith[] = await response.json();

            if (Array.isArray(json)) {
                return json;
            }

            if (json.Server?.Success && Array.isArray(json.Server.Data)) {
                return json.Server.Data;
            }

            return rejectWithValue(json.Server?.Message || "Failed to fetch active documents.");
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPreferenceDetails = createAsyncThunk<
    PreferenceDetail[],
    FetchPreferenceDetailsParams,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchPreferenceDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const branchId = params.branchId ?? 1;
        const finYearId = params.finYearId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/CommonUtility/GetPreferenceDetailsbyFunctionName");
            url.searchParams.set("functionName", params.functionName);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-branch-id": String(branchId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: PreferenceDetail[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCompanyCurrency = createAsyncThunk<
    CompanyCurrency,
    FetchCompanyCurrencyParams | void,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchCompanyCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Company/GetCompanyCurrency");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<CompanyCurrency[]> = await response.json();

            if (json.Server?.Success && json.Server.Data?.length > 0) {
                return json.Server.Data[0];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch company currency.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyExRate = createAsyncThunk<
    CurrencyExRateData,
    FetchCurrencyExRateParams,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchCurrencyExRate",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const targetDate = params.date ?? new Date().toISOString();

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Currency/GetCurrencyExRate");
            url.searchParams.set("currencyID", String(params.currencyId));
            url.searchParams.set("date", targetDate);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<CurrencyExRateData[]> = await response.json();

            if (json.Server?.Success && json.Server.Data?.length > 0) {
                return json.Server.Data[0];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currency exchange rate.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchIsTaxOnService = createAsyncThunk<
    TaxOnServiceDetail[],
    FetchTaxOnServiceParams | void,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchIsTaxOnService",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/IsTaxOnService");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: TaxOnServiceDetail[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccountHeadsHeader = createAsyncThunk<
    AccountHeadHeader[],
    FetchAccountHeadsParams | void,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchAccountHeadsHeader",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const voucherTypeId = params?.voucherTypeId ?? 1;
        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/GetAllAcHeadsHeaderStartWith");
            url.searchParams.set("startWith", startWith);
            url.searchParams.set("voucherTypeId", String(voucherTypeId));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<AccountHeadHeader[]> = await response.json();

            if (json.Server?.Success && Array.isArray(json.Server.Data)) {
                return json.Server.Data;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch account heads header.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccountHeadsDetail = createAsyncThunk<
    AccountHeadHeader[],
    FetchAccountHeadsParams | void,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchAccountHeadsDetail",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const voucherTypeId = params?.voucherTypeId ?? 1;
        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/GetAllAcHeadsDetailStartWith");
            url.searchParams.set("startWith", startWith);
            url.searchParams.set("voucherTypeId", String(voucherTypeId));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<AccountHeadHeader[]> = await response.json();

            if (json.Server?.Success && Array.isArray(json.Server.Data)) {
                return json.Server.Data;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch account heads detail.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccountHeadsAll = createAsyncThunk<
    AccountHeadHeader[],
    FetchAccountHeadsAllParams | void,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchAccountHeadsAll",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/AccountHead/GetAllAccHeadStartWith");
            url.searchParams.set("startWith", startWith);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<AccountHeadHeader[]> | AccountHeadHeader[] = await response.json();

            // Handle direct payload naked JSON array representation
            if (Array.isArray(json)) {
                return json;
            }

            // Fallback wrapper strategy matching the design of other endpoints
            if ("Server" in json && json.Server?.Success && Array.isArray(json.Server.Data)) {
                return json.Server.Data;
            }

            return rejectWithValue("Failed to fetch all account heads data.");
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccountBalance = createAsyncThunk<
    string,
    FetchAccountBalanceParams,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchAccountBalance",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/GetAccountBalance");
            url.searchParams.set("HeadID", String(params.headId));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const textData = await response.text();
            const sanitizedBalance = textData.replace(/['"]+/g, '').trim();
            
            return sanitizedBalance || "0.00";
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const checkChequeNumberDuplication = createAsyncThunk<
    number,
    CheckChequeNumberDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/checkChequeNumberDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/ChequeNumberDuplication");
            url.searchParams.set("bankId", String(params.bankId));
            url.searchParams.set("chequeNo", params.chequeNo);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<number> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? 0;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to check cheque number duplication.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchBanks = createAsyncThunk<
    BankDetail[],
    FetchBankParams | void,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchBanks",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Bank/GetBankStartwith");
            url.searchParams.set("startWith", startWith);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: BankDetail[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyStartWith = createAsyncThunk<
    CurrencyStartWith[],
    FetchCurrencyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchCurrencyStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Currency/GetCurrencyStartwith");
            url.searchParams.set("startWith", startWith);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<CurrencyStartWith[]> = await response.json();

            if (json.Server?.Success && Array.isArray(json.Server.Data)) {
                return json.Server.Data;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currency list.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchVoucherList = createAsyncThunk<
    VoucherListItem[],
    FetchVoucherListParams,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/fetchVoucherList",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const rowsPerPage = params.rowsPerPage ?? 25;
        const currentPage = params.currentPage ?? 1;
        const searchStr = params.searchStr ?? "";

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/GetDetailsByDateVoucher");
            url.searchParams.set("FromDate", params.fromDate);
            url.searchParams.set("ToDate", params.toDate);
            url.searchParams.set("PaymentOrReceipt", String(params.paymentOrReceipt));
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
            url.searchParams.set("currentPage", String(currentPage));
            url.searchParams.set("searchStr", searchStr);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<VoucherListItem[]> = await response.json();

            if (json.Server?.Success && Array.isArray(json.Server.Data)) {
                return json.Server.Data;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch voucher list.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Saves (creates) a Payment/Receipt voucher. Posts the full voucher payload
// (header info, bank/cheque/NEFT details, line items, and fund-credit rows)
// to /Voucher/SaveChanges. On success the API returns Data: null and the
// human-readable voucher number (e.g. "BP-2") in Info — there is nothing to
// "unwrap" out of Data here, so we return the whole Server envelope.
export const saveChanges = createAsyncThunk<
    SaveChangesResult,
    SaveChangesParams,
    { state: RootState; rejectValue: string }
>(
    "paymentVoucher/saveChanges",
    async ({ payload, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? 1;
        const resolvedFinYearId = finYearId ?? 2;

        try {
            const response = await fetch("https://erp.glitzit.com/service/api/Voucher/SaveChanges", {
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
                return json.Server;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to save voucher.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const paymentVoucherSlice = createSlice({
    name: "paymentVoucher",
    initialState,
    reducers: {
        setSelectedDocument(state, action: PayloadAction<DocumentStartWith | null>) {
            state.selectedDocument = action.payload;
        },
        clearDocumentList(state) {
            state.documentList = [];
            state.selectedDocument = null;
            state.documentError = null;
        },
        setSelectedActiveDocument(state, action: PayloadAction<DocumentStartWith | null>) {
            state.selectedActiveDocument = action.payload;
        },
        clearActiveDocumentList(state) {
            state.activeDocumentList = [];
            state.selectedActiveDocument = null;
            state.activeDocumentError = null;
        },
        clearPreferenceDetails(state) {
            state.preferenceDetails = null;
            state.preferenceError = null;
        },
        clearCompanyCurrency(state) {
            state.companyCurrency = null;
            state.currencyError = null;
        },
        clearExchangeRateData(state) {
            state.exchangeRateData = null;
            state.exchangeRateError = null;
        },
        clearTaxOnService(state) {
            state.taxOnService = null;
            state.taxOnServiceError = null;
        },
        clearAccountHeadsList(state) {
            state.accountHeadsList = [];
            state.accountHeadsError = null;
        },
        clearAccountHeadsDetailList(state) {
            state.accountHeadsDetailList = [];
            state.accountHeadsDetailError = null;
        },
        clearAccountBalance(state) {
            state.accountBalance = "0.00";
            state.accountBalanceError = null;
        },
        clearChequeNumberDuplication(state) {
            state.chequeDuplicationResult = null;
            state.chequeDuplicationError = null;
        },
        clearBankList(state) {
            state.bankList = [];
            state.bankError = null;
        },
        clearCurrencyStartWithList(state) {
            state.currencyStartWithList = [];
            state.currencyStartWithError = null;
        },
        clearVoucherList(state) {
            state.voucherList = [];
            state.voucherListError = null;
        },
        clearSaveChangesResult(state) {
            state.saveChangesResult = null;
            state.saveChangesError = null;
        },
        resetPaymentVoucher() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Document Master (Payment)
            .addCase(fetchDocumentStartWith.pending, (state) => {
                state.documentLoading = true;
                state.documentError = null;
            })
            .addCase(fetchDocumentStartWith.fulfilled, (state, action) => {
                state.documentLoading = false;
                state.documentList = Array.isArray(action.payload) && typeof action.payload[0] === 'object' ? action.payload : [];
                
                if (!state.selectedDocument && state.documentList.length > 0) {
                    const defaultDoc = state.documentList.find((d) => d.SetDefault) ?? state.documentList[0];
                    state.selectedDocument = defaultDoc;
                }
            })
            .addCase(fetchDocumentStartWith.rejected, (state, action) => {
                state.documentLoading = false;
                state.documentError = action.payload ?? "Unknown error";
            })

            // Document Master Active
            .addCase(fetchDocumentStartWithActive.pending, (state) => {
                state.activeDocumentLoading = true;
                state.activeDocumentError = null;
            })
            .addCase(fetchDocumentStartWithActive.fulfilled, (state, action) => {
                state.activeDocumentLoading = false;
                state.activeDocumentList = action.payload;
                
                if (!state.selectedActiveDocument && state.activeDocumentList.length > 0) {
                    const defaultDoc = state.activeDocumentList.find((d) => d.SetDefault) ?? state.activeDocumentList[0];
                    state.selectedActiveDocument = defaultDoc;
                }
            })
            .addCase(fetchDocumentStartWithActive.rejected, (state, action) => {
                state.activeDocumentLoading = false;
                state.activeDocumentError = action.payload ?? "Unknown error";
            })

            // Preference Details
            .addCase(fetchPreferenceDetails.pending, (state) => {
                state.preferenceLoading = true;
                state.preferenceError = null;
            })
            .addCase(fetchPreferenceDetails.fulfilled, (state, action) => {
                state.preferenceLoading = false;
                state.preferenceDetails = action.payload;
            })
            .addCase(fetchPreferenceDetails.rejected, (state, action) => {
                state.preferenceLoading = false;
                state.preferenceError = action.payload ?? "Unknown error";
            })

            // Company Currency
            .addCase(fetchCompanyCurrency.pending, (state) => {
                state.currencyLoading = true;
                state.currencyError = null;
            })
            .addCase(fetchCompanyCurrency.fulfilled, (state, action) => {
                state.currencyLoading = false;
                state.companyCurrency = action.payload;
            })
            .addCase(fetchCompanyCurrency.rejected, (state, action) => {
                state.currencyLoading = false;
                state.currencyError = action.payload ?? "Unknown error";
            })

            // Currency Exchange Rate
            .addCase(fetchCurrencyExRate.pending, (state) => {
                state.exchangeRateLoading = true;
                state.exchangeRateError = null;
            })
            .addCase(fetchCurrencyExRate.fulfilled, (state, action) => {
                state.exchangeRateLoading = false;
                state.exchangeRateData = action.payload;
            })
            .addCase(fetchCurrencyExRate.rejected, (state, action) => {
                state.exchangeRateLoading = false;
                state.exchangeRateError = action.payload ?? "Unknown error";
            })

            // Is Tax On Service
            .addCase(fetchIsTaxOnService.pending, (state) => {
                state.taxOnServiceLoading = true;
                state.taxOnServiceError = null;
            })
            .addCase(fetchIsTaxOnService.fulfilled, (state, action) => {
                state.taxOnServiceLoading = false;
                state.taxOnService = action.payload;
            })
            .addCase(fetchIsTaxOnService.rejected, (state, action) => {
                state.taxOnServiceLoading = false;
                state.taxOnServiceError = action.payload ?? "Unknown error";
            })

            // Get All Account Heads Header Start With
            .addCase(fetchAccountHeadsHeader.pending, (state) => {
                state.accountHeadsLoading = true;
                state.accountHeadsError = null;
            })
            .addCase(fetchAccountHeadsHeader.fulfilled, (state, action) => {
                state.accountHeadsLoading = false;
                state.accountHeadsList = action.payload;
            })
            .addCase(fetchAccountHeadsHeader.rejected, (state, action) => {
                state.accountHeadsLoading = false;
                state.accountHeadsError = action.payload ?? "Unknown error";
            })

            // Get All Account Heads Detail Start With
            .addCase(fetchAccountHeadsDetail.pending, (state) => {
                state.accountHeadsDetailLoading = true;
                state.accountHeadsDetailError = null;
            })
            .addCase(fetchAccountHeadsDetail.fulfilled, (state, action) => {
                state.accountHeadsDetailLoading = false;
                state.accountHeadsDetailList = action.payload;
            })
            .addCase(fetchAccountHeadsDetail.rejected, (state, action) => {
                state.accountHeadsDetailLoading = false;
                state.accountHeadsDetailError = action.payload ?? "Unknown error";
            })

            // Get All Account Heads All Start With (New API)
            .addCase(fetchAccountHeadsAll.pending, (state) => {
                state.accountHeadsLoading = true;
                state.accountHeadsError = null;
            })
            .addCase(fetchAccountHeadsAll.fulfilled, (state, action) => {
                state.accountHeadsLoading = false;
                state.accountHeadsList = action.payload;
            })
            .addCase(fetchAccountHeadsAll.rejected, (state, action) => {
                state.accountHeadsLoading = false;
                state.accountHeadsError = action.payload ?? "Unknown error";
            })

            // Get Account Balance
            .addCase(fetchAccountBalance.pending, (state) => {
                state.accountBalanceLoading = true;
                state.accountBalanceError = null;
            })
            .addCase(fetchAccountBalance.fulfilled, (state, action) => {
                state.accountBalanceLoading = false;
                state.accountBalance = action.payload;
            })
            .addCase(fetchAccountBalance.rejected, (state, action) => {
                state.accountBalanceLoading = false;
                state.accountBalanceError = action.payload ?? "Unknown error";
            })

            // Cheque Number Duplication Check
            .addCase(checkChequeNumberDuplication.pending, (state) => {
                state.chequeDuplicationLoading = true;
                state.chequeDuplicationError = null;
            })
            .addCase(checkChequeNumberDuplication.fulfilled, (state, action) => {
                state.chequeDuplicationLoading = false;
                state.chequeDuplicationResult = action.payload;
            })
            .addCase(checkChequeNumberDuplication.rejected, (state, action) => {
                state.chequeDuplicationLoading = false;
                state.chequeDuplicationError = action.payload ?? "Unknown error";
            })

            // Get Bank Startwith
            .addCase(fetchBanks.pending, (state) => {
                state.bankLoading = true;
                state.bankError = null;
            })
            .addCase(fetchBanks.fulfilled, (state, action) => {
                state.bankLoading = false;
                state.bankList = action.payload;
            })
            .addCase(fetchBanks.rejected, (state, action) => {
                state.bankLoading = false;
                state.bankError = action.payload ?? "Unknown error";
            })

            // Get Currency Startwith
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

            // Get Voucher List By Date Range
            .addCase(fetchVoucherList.pending, (state) => {
                state.voucherListLoading = true;
                state.voucherListError = null;
            })
            .addCase(fetchVoucherList.fulfilled, (state, action) => {
                state.voucherListLoading = false;
                state.voucherList = action.payload;
            })
            .addCase(fetchVoucherList.rejected, (state, action) => {
                state.voucherListLoading = false;
                state.voucherListError = action.payload ?? "Unknown error";
            })

            // Save Voucher (Payment/Receipt)
            .addCase(saveChanges.pending, (state) => {
                state.saveChangesLoading = true;
                state.saveChangesError = null;
            })
            .addCase(saveChanges.fulfilled, (state, action) => {
                state.saveChangesLoading = false;
                state.saveChangesResult = action.payload;
            })
            .addCase(saveChanges.rejected, (state, action) => {
                state.saveChangesLoading = false;
                state.saveChangesError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    setSelectedDocument,
    clearDocumentList,
    setSelectedActiveDocument,
    clearActiveDocumentList,
    clearPreferenceDetails,
    clearCompanyCurrency,
    clearExchangeRateData,
    clearTaxOnService,
    clearAccountHeadsList,
    clearAccountHeadsDetailList,
    clearAccountBalance,
    clearChequeNumberDuplication,
    clearBankList,
    clearCurrencyStartWithList,
    clearVoucherList,
    clearSaveChangesResult,
    resetPaymentVoucher,
} = paymentVoucherSlice.actions;

export default paymentVoucherSlice.reducer;
