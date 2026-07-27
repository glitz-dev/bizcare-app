import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface CompanyCurrency {
    CompanyID: number;
    CurrencyID: number;
    Currency: string;
    Symbol: string;
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

export interface TaxOnServiceDetail {
    OptionValue: number;
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

export interface AccountHeadHeader {
    HeadID: number;
    HeadName: string;
    GroupID?: number;
}

export interface CurrencyStartWith {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

export interface BankDetail {
    BankID: number;
    BankName: string;
    PostShipmentCredit: number | null;
    PreshipmentCredit: number | null;
    AcHeadID: number;
    AccountNo: string;
}

// ─── Voucher List (GetDetailsByDateVoucher) ────────────────────────────────
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

// ─── SaveChanges Types ──────────────────────────────────────────────────────
// Shapes below are a direct, field-for-field mapping of the SaveChanges
// request payload (POST /api/VoucherReceipt/SaveChanges) as captured from
// the network tab — nothing invented or renamed.

export interface SaveChangesBankDetails {
    BankID: number;
    BankName: string;
    BankReceiptTypeID: number;
    Branch: string;
    ChequeDateStr: string;
    ChequeNo: string;
    NeftRefNo: string;
}

export interface SaveChangesBankPaymentType {
    Id: number;
    Title: string;
}

export interface SaveChangesVoucherType {
    Id: number;
    Name: string;
}

// Shape used by LstPaymentReceiptT, LstPaymentReceiptAdvanceT, and the
// Receipt Details rows inside LstVoucherDetails.
export interface SaveChangesDetailLine {
    HeadName: string;
    HeadID: number;
    Balance: string;
    Amount: number;
    SGSTAmt: number;
    CGSTAmt: number;
    IGSTAmt: number;
    UTGSTAmt: number;
    CESSAmt: number;
    VATAmt: number;
    NetAmt: string;
    TaxRate: string;
    RefDate: string | null;
}

// Shape used by the Domestic Bank Charge rows inside LstVoucherDetails
// (a simpler line than lstFundCredit's SaveChangesFundCreditLine below).
export interface SaveChangesBankChargeDetailLine {
    AccHeadName: string;
    Currency: string;
    Amount: number;
    ExRate: number;
    BaseAmount: number;
    TaxEnabled: boolean;
    SGSTAmount: number;
    CGSTAmount: number;
    NetAmount: number;
}

// Shape used by lstFundCredit — one entry per valid/filled Domestic Bank
// Charge row (Credit + Currency + Amount all selected).
export interface SaveChangesFundCreditLine {
    Charge: number;
    AccHeadName: string;
    AccHeadID: number;
    CurrencyID: number;
    Currency: string;
    Amount: number;
    ExRate: number;
    BaseAmount: string;
    TaxEnabled: boolean;
    SGSTAmount: number;
    CGSTAmount: number;
    TotalTaxAmount: number;
    NetAmount: number;
}

export interface SaveChangesPayload {
    VoucherDateStr: string;
    ChequeDateStr: string;
    Advance: boolean;
    BankDetails: SaveChangesBankDetails;
    BankID: number;
    BankName: string;
    BankPaymentType: SaveChangesBankPaymentType;
    BankReceiptTypeID: number;
    BankRefNo: string;
    BaseCurrencyAmt: number;
    Branch: string;
    ChequeDate: string;
    ChequeNo: string;
    Currency: string;
    CurrencyID: number;
    Date: string;
    DocumentID: number;
    DocumentName: string;
    DomesticHeadID: number;
    DomesticHeadName: string;
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
    LstVoucherDetails: (SaveChangesDetailLine | SaveChangesBankChargeDetailLine)[];
    NeftRefNo: string;
    NextTransNo: number;
    PayOrRecID: number;
    Percentage: string;
    ReceiptTypeID: number;
    Remarks: string;
    RoundOff: boolean;
    Settled: boolean;
    TaxAmountHead: string;
    TaxMasterName: string;
    TaxPercHead: string;
    VoucherAmount: number;
    VoucherAmountPopUp: string;
    lstFundCredit: SaveChangesFundCreditLine[];
    startingnowithoutprefix: number;
    totalAmt: number;
    voucherType: SaveChangesVoucherType;
    voucherprefix: string;
    vouchersufix: string | null;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchPreferenceDetailsParams {
    functionName: string;
    companyId?: number;
    branchId?: number;
    finYearId?: number;
}

export interface FetchCompanyCurrencyParams {
    companyId?: number;
}

export interface FetchDocumentStartWithParams {
    id?: number;
    name?: string;
    documentType?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchDocumentStartWithActiveParams {
    documentType: string;
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchTaxOnServiceParams {
    companyId?: number;
}

export interface FetchCurrencyExRateParams {
    currencyId: number;
    date?: string;
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

export interface FetchCurrencyStartWithParams {
    startWith?: string;
    companyId?: number;
}

export interface FetchBankParams {
    startWith?: string;
    companyId?: number;
}

export interface FetchVoucherListByDateParams {
    fromDate: string; // e.g. "2024-04-01"
    toDate: string;   // e.g. "2026-07-05"
    paymentOrReceipt?: number; // matches the PaymentOrReceipt query param as captured (1 in the sample call)
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}


// ─── State ────────────────────────────────────────────────────────────────────

export interface ReceiptVoucherState {
    preferenceDetails: PreferenceDetail[] | null;
    preferenceLoading: boolean;
    preferenceError: string | null;

    companyCurrency: CompanyCurrency | null;
    currencyLoading: boolean;
    currencyError: string | null;

    documentStartWithList: number[];
    documentStartWithLoading: boolean;
    documentStartWithError: string | null;

    taxOnService: TaxOnServiceDetail[] | null;
    taxOnServiceLoading: boolean;
    taxOnServiceError: string | null;

    exchangeRateData: CurrencyExRateData | null;
    exchangeRateLoading: boolean;
    exchangeRateError: string | null;

    accountHeadsList: AccountHeadHeader[];
    accountHeadsLoading: boolean;
    accountHeadsError: string | null;

    creditHeadList: AccountHeadHeader[];
    creditHeadLoading: boolean;
    creditHeadError: string | null;

    activeDocumentList: DocumentStartWith[];
    selectedActiveDocument: DocumentStartWith | null;
    activeDocumentLoading: boolean;
    activeDocumentError: string | null;

    currencyStartWithList: CurrencyStartWith[];
    currencyStartWithLoading: boolean;
    currencyStartWithError: string | null;

    bankList: BankDetail[];
    bankLoading: boolean;
    bankError: string | null;

    voucherList: VoucherListItem[];
    voucherListLoading: boolean;
    voucherListError: string | null;

    balance: number;
    loading: boolean;
    error: string | null;

    saveChangesLoading: boolean;
    saveChangesError: string | null;
    saveChangesResult: ApiResponseWrapper<null>["Server"] | null;
}

const initialState: ReceiptVoucherState = {
    preferenceDetails: null,
    preferenceLoading: false,
    preferenceError: null,

    companyCurrency: null,
    currencyLoading: false,
    currencyError: null,

    documentStartWithList: [],
    documentStartWithLoading: false,
    documentStartWithError: null,

    taxOnService: null,
    taxOnServiceLoading: false,
    taxOnServiceError: null,

    exchangeRateData: null,
    exchangeRateLoading: false,
    exchangeRateError: null,

    accountHeadsList: [],
    accountHeadsLoading: false,
    accountHeadsError: null,

    creditHeadList: [],
    creditHeadLoading: false,
    creditHeadError: null,

    activeDocumentList: [],
    selectedActiveDocument: null,
    activeDocumentLoading: false,
    activeDocumentError: null,

    currencyStartWithList: [],
    currencyStartWithLoading: false,
    currencyStartWithError: null,

    bankList: [],
    bankLoading: false,
    bankError: null,

    voucherList: [],
    voucherListLoading: false,
    voucherListError: null,

    balance: 0.00,
    loading: false,
    error: null,

    saveChangesLoading: false,
    saveChangesError: null,
    saveChangesResult: null,
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

export const fetchPreferenceDetails = createAsyncThunk<
    PreferenceDetail[],
    FetchPreferenceDetailsParams,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchPreferenceDetails",
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
    "receiptVoucher/fetchCompanyCurrency",
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

export const fetchDocumentStartWith = createAsyncThunk<
    number[],
    FetchDocumentStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchDocumentStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const id = params?.id ?? 2;
        const name = params?.name ?? "Receipt";
        const documentType = params?.documentType ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api//DocumentM/GetDocumentStartWith");
            url.searchParams.set("DocumentType", documentType);
            url.searchParams.set("startWith", JSON.stringify({ Id: id, Name: name }));

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

            const json: number[] = await response.json();
            return json;
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
    "receiptVoucher/fetchIsTaxOnService",
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

export const fetchCurrencyExRate = createAsyncThunk<
    CurrencyExRateData,
    FetchCurrencyExRateParams,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchCurrencyExRate",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const targetDate = params.date ?? new Date().toISOString();

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Currency/GetCurrencyExRate");
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

export const fetchAccountHeadsHeader = createAsyncThunk<
    AccountHeadHeader[],
    FetchAccountHeadsParams | void,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchAccountHeadsHeader",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const voucherTypeId = params?.voucherTypeId ?? 2;
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

export const fetchAccountHeadsDetailStartWith = createAsyncThunk<
    AccountHeadHeader[],
    FetchAccountHeadsParams | void,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchAccountHeadsDetailStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const voucherTypeId = params?.voucherTypeId ?? 2;
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
                return rejectWithValue(json.Server?.Message || "Failed to fetch credit heads.");
            }
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
    "receiptVoucher/fetchDocumentStartWithActive",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params.startWith ?? "";
        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api//DocumentM/GetDocumentStartWithActive");
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

export const fetchCurrencyStartWith = createAsyncThunk<
    CurrencyStartWith[],
    FetchCurrencyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchCurrencyStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Currency/GetCurrencyStartwith");
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

export const fetchBanks = createAsyncThunk<
    BankDetail[],
    FetchBankParams | void,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchBanks",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Bank/GetBankStartwith");
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

export const fetchVoucherListByDate = createAsyncThunk<
    VoucherListItem[],
    FetchVoucherListByDateParams,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchVoucherListByDate",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const paymentOrReceipt = params.paymentOrReceipt ?? 1;
        const rowsPerPage = params.rowsPerPage ?? 25;
        const currentPage = params.currentPage ?? 1;
        const searchStr = params.searchStr ?? "";
        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/GetDetailsByDateVoucher");
            url.searchParams.set("FromDate", params.fromDate);
            url.searchParams.set("ToDate", params.toDate);
            url.searchParams.set("PaymentOrReceipt", String(paymentOrReceipt));
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

export const fetchAccountHeadsAll = createAsyncThunk<
    AccountHeadHeader[],
    FetchAccountHeadsAllParams | void,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/fetchAccountHeadsAll",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api//AccountHead/GetAllAccHeadStartWith");
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
    number,
    number,
    { state: RootState; rejectValue: string }
>(
    'receiptVoucher/fetchAccountBalance',
    async (headId, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/GetAccountBalance");
            url.searchParams.set("HeadID", String(headId));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // The API returns a direct number/string (e.g., 0.00)
            return Number(data);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch balance');
        }
    }
);

export const saveChanges = createAsyncThunk<
    ApiResponseWrapper<null>["Server"],
    SaveChangesPayload,
    { state: RootState; rejectValue: string }
>(
    "receiptVoucher/saveChanges",
    async (payload, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = 1;
        const finYearId = 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/VoucherReceipt/SaveChanges");

            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<null> = await response.json();

            if (json.Server?.Success) {
                return json.Server;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to save receipt voucher.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const receiptVoucherSlice = createSlice({
    name: "receiptVoucher",
    initialState,
    reducers: {
        clearPreferenceDetails: (state) => {
            state.preferenceDetails = null;
            state.preferenceError = null;
        },
        clearCompanyCurrency: (state) => {
            state.companyCurrency = null;
            state.currencyError = null;
        },
        clearDocumentStartWithList: (state) => {
            state.documentStartWithList = [];
            state.documentStartWithError = null;
        },
        clearTaxOnService: (state) => {
            state.taxOnService = null;
            state.taxOnServiceError = null;
        },
        clearExchangeRateData: (state) => {
            state.exchangeRateData = null;
            state.exchangeRateError = null;
        },
        clearAccountHeadsList: (state) => {
            state.accountHeadsList = [];
            state.accountHeadsError = null;
        },
        clearCreditHeadList: (state) => {
            state.creditHeadList = [];
            state.creditHeadError = null;
        },
        setSelectedActiveDocument: (state, action: PayloadAction<DocumentStartWith | null>) => {
            state.selectedActiveDocument = action.payload;
        },
        clearActiveDocumentList: (state) => {
            state.activeDocumentList = [];
            state.selectedActiveDocument = null;
            state.activeDocumentError = null;
        },
        clearCurrencyStartWithList: (state) => {
            state.currencyStartWithList = [];
            state.currencyStartWithError = null;
        },
        clearBankList: (state) => {
            state.bankList = [];
            state.bankError = null;
        },
        clearVoucherList: (state) => {
            state.voucherList = [];
            state.voucherListError = null;
        },
        clearBalanceState: (state) => {
            state.balance = 0.00;
            state.error = null;
        },
        clearSaveChangesResult: (state) => {
            state.saveChangesResult = null;
            state.saveChangesError = null;
        }
    },
    extraReducers: (builder) => {
        builder
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

            // Document Start With
            .addCase(fetchDocumentStartWith.pending, (state) => {
                state.documentStartWithLoading = true;
                state.documentStartWithError = null;
            })
            .addCase(fetchDocumentStartWith.fulfilled, (state, action) => {
                state.documentStartWithLoading = false;
                state.documentStartWithList = action.payload;
            })
            .addCase(fetchDocumentStartWith.rejected, (state, action) => {
                state.documentStartWithLoading = false;
                state.documentStartWithError = action.payload ?? "Unknown error";
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

            // Get All Account Heads Detail Start With (Credit Head - table row field)
            .addCase(fetchAccountHeadsDetailStartWith.pending, (state) => {
                state.creditHeadLoading = true;
                state.creditHeadError = null;
            })
            .addCase(fetchAccountHeadsDetailStartWith.fulfilled, (state, action) => {
                state.creditHeadLoading = false;
                state.creditHeadList = action.payload;
            })
            .addCase(fetchAccountHeadsDetailStartWith.rejected, (state, action) => {
                state.creditHeadLoading = false;
                state.creditHeadError = action.payload ?? "Unknown error";
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

            // Get Voucher List By Date (GetDetailsByDateVoucher)
            .addCase(fetchVoucherListByDate.pending, (state) => {
                state.voucherListLoading = true;
                state.voucherListError = null;
            })
            .addCase(fetchVoucherListByDate.fulfilled, (state, action) => {
                state.voucherListLoading = false;
                state.voucherList = action.payload;
            })
            .addCase(fetchVoucherListByDate.rejected, (state, action) => {
                state.voucherListLoading = false;
                state.voucherListError = action.payload ?? "Unknown error";
            })
            .addCase(fetchAccountBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccountBalance.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                state.balance = action.payload;
            })
            .addCase(fetchAccountBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Save Changes (Receipt Voucher submit)
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
    clearPreferenceDetails,
    clearCompanyCurrency,
    clearDocumentStartWithList,
    clearTaxOnService,
    clearExchangeRateData,
    clearAccountHeadsList,
    clearCreditHeadList,
    setSelectedActiveDocument,
    clearActiveDocumentList,
    clearCurrencyStartWithList,
    clearBankList,
    clearVoucherList,
    clearBalanceState,
    clearSaveChangesResult,
} = receiptVoucherSlice.actions;

export default receiptVoucherSlice.reducer;
