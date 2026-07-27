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
    ExchRate: number;
    DocumentTypeID: number;
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

export interface CurrencyListItem {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

export interface BankListItem {
    BankID: number;
    BankName: string;
    PostShipmentCredit: number | null;
    PreshipmentCredit: number | null;
    AcHeadID: number;
    AccountNo: string;
}

export interface ContraAcHeadListItem {
    CvHeadID: number;
    CvHeadName: string;
}

export interface ContraVoucherListItem {
    VoucherID: number;
    VoucherNo: string;
    VoucherAmount: number;
    DocumentID: number;
    Verified: number;
    VoucherDate: string;
    ApprovedBy: string | null;
    Approve: string;
    ChequeNo: string | null;
    ChequeDate: string | null;
    Type: string;
    Narration: string | null;
    CreatedOn: string;
    ApprovedDate: string | null;
    UserName: string | null;
}

// ── SaveChanges ───────────────────────────────────────────────────────────────

export interface ContraJournalLineItem {
    HeadName: string;
    HeadID: number;
    CurrentBal: string;
    DebitAmount: number;
    CreditAmount: number;
}

export interface ContraBankPaymentType {
    Id: number;
    Title: string;
}

export interface ContraTypeName {
    id: number;
    name: string;
}

export interface SaveContraVoucherPayload {
    VoucherDateStr: string;           // "22-06-2026"
    VoucherDate: string;              // ISO — "2026-06-22T12:10:19.551Z"
    VoucherNo: string;
    DocumentID: number;
    DocumentName: string;
    CurrencyID: number;
    Currency: string;
    ExchRate: number;
    BankID: number;
    BankName: string;
    BankPaymentType: ContraBankPaymentType;
    BankReceiptTypeID: number;
    ChequeDate: string | null;
    Type: string;
    TypeName: ContraTypeName;
    VoucherAmount: string;            // "3000.00"
    SettledAmount: string;            // "3000.00"
    Settled: boolean;
    IsJournalOrContra: boolean;
    LstAccJournalT: ContraJournalLineItem[];
}

export interface SaveContraVoucherResponse {
    Success: boolean;
    Message: string;
    MessageId: string | null;         // new VoucherNo e.g. "CV-3"
}

export interface SaveContraVoucherParams {
    payload: SaveContraVoucherPayload;
    companyId?: number;
    finYearId?: number;
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

export interface FetchCompanyCurrencyParams {
    companyId?: number;
}

export interface FetchCurrencyExRateParams {
    currencyId: number;
    date?: string;
    companyId?: number;
}

export interface FetchCurrencyStartWithParams {
    startWith?: string;
    companyId?: number;
}

export interface FetchBankStartWithParams {
    startWith?: string;
    companyId?: number;
}

export interface FetchContraAcHeadStartWithParams {
    startWith?: string;
    companyId?: number;
}

export interface FetchAccountBalanceParams {
    headId: number;
    companyId?: number;
}

export interface FetchContraDetailsByDateParams {
    fromDate: string;
    toDate: string;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface ContraEntryState {
    documentList: DocumentStartWith[];
    selectedDocument: DocumentStartWith | null;
    documentLoading: boolean;
    documentError: string | null;

    companyCurrency: CompanyCurrency | null;
    currencyLoading: boolean;
    currencyError: string | null;

    exchangeRateData: CurrencyExRateData | null;
    exchangeRateLoading: boolean;
    exchangeRateError: string | null;

    currencyList: CurrencyListItem[];
    currencyListLoading: boolean;
    currencyListError: string | null;

    bankList: BankListItem[];
    bankListLoading: boolean;
    bankListError: string | null;

    acHeadList: ContraAcHeadListItem[];
    acHeadListLoading: boolean;
    acHeadListError: string | null;

    accountBalance: number | null;
    accountBalanceLoading: boolean;
    accountBalanceError: string | null;

    contraList: ContraVoucherListItem[];
    contraListLoading: boolean;
    contraListError: string | null;

    saveLoading: boolean;
    saveError: string | null;
    savedVoucherNo: string | null;    // MessageId from response e.g. "CV-3"
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: ContraEntryState = {
    documentList: [],
    selectedDocument: null,
    documentLoading: false,
    documentError: null,

    companyCurrency: null,
    currencyLoading: false,
    currencyError: null,

    exchangeRateData: null,
    exchangeRateLoading: false,
    exchangeRateError: null,

    currencyList: [],
    currencyListLoading: false,
    currencyListError: null,

    bankList: [],
    bankListLoading: false,
    bankListError: null,

    acHeadList: [],
    acHeadListLoading: false,
    acHeadListError: null,

    accountBalance: null,
    accountBalanceLoading: false,
    accountBalanceError: null,

    contraList: [],
    contraListLoading: false,
    contraListError: null,

    saveLoading: false,
    saveError: null,
    savedVoucherNo: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    let token = state.auth.userData?.token || localStorage.getItem("token");
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
    "contraEntry/fetchDocumentStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith");
            url.searchParams.set("DocumentType", "CONTRA");
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

export const fetchCompanyCurrency = createAsyncThunk<
    CompanyCurrency,
    FetchCompanyCurrencyParams | void,
    { state: RootState; rejectValue: string }
>(
    "contraEntry/fetchCompanyCurrency",
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
    "contraEntry/fetchCurrencyExRate",
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

export const fetchCurrencyStartWith = createAsyncThunk<
    CurrencyListItem[],
    FetchCurrencyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "contraEntry/fetchCurrencyStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const startWith = params?.startWith ?? "";

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

            const json: ApiResponseWrapper<CurrencyListItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currency list.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchBankStartWith = createAsyncThunk<
    BankListItem[],
    FetchBankStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "contraEntry/fetchBankStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const startWith = params?.startWith ?? "";

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

            const json: BankListItem[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchContraAcHeadStartWith = createAsyncThunk<
    ContraAcHeadListItem[],
    FetchContraAcHeadStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "contraEntry/fetchContraAcHeadStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const startWith = params?.startWith ?? "";

        try {
            const url = new URL("https://erp.glitzit.com/service/api/ContraVoucher/GetContraVoucherAcHeadStartWith");
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

            const json: ApiResponseWrapper<ContraAcHeadListItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch account head list.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccountBalance = createAsyncThunk<
    number,
    FetchAccountBalanceParams,
    { state: RootState; rejectValue: string }
>(
    "contraEntry/fetchAccountBalance",
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

            // API directly yields a raw primitive decimal value string / number
            const textResult = await response.text();
            const numericValue = parseFloat(textResult);

            if (isNaN(numericValue)) {
                return rejectWithValue("Invalid numeric balance received from server.");
            }

            return numericValue;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchContraDetailsByDate = createAsyncThunk<
    ContraVoucherListItem[],
    FetchContraDetailsByDateParams,
    { state: RootState; rejectValue: string }
>(
    "contraEntry/fetchContraDetailsByDate",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const rowsPerPage = params.rowsPerPage ?? 25;
        const currentPage = params.currentPage ?? 1;
        const searchStr = params.searchStr ?? "Not Approved";

        try {
            const qs = [
                `FromDate=${encodeURIComponent(params.fromDate)}`,
                `ToDate=${encodeURIComponent(params.toDate)}`,
                `rowsPerPage=${encodeURIComponent(String(rowsPerPage))}`,
                `currentPage=${encodeURIComponent(String(currentPage))}`,
                `searchStr=${encodeURIComponent(searchStr)}`,
            ].join("&");
            const url = `https://erp.glitzit.com/service/api/ContraVoucher/GetDetailsByDate?${qs}`;

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

            const json: ApiResponseWrapper<ContraVoucherListItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch contra vouchers.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const saveContraVoucher = createAsyncThunk<
    SaveContraVoucherResponse,
    SaveContraVoucherParams,
    { state: RootState; rejectValue: string }
>(
    "contraEntry/saveContraVoucher",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/ContraVoucher/SaveChanges",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                    body: JSON.stringify(params.payload),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<null> = await response.json();

            if (json.Server?.Success) {
                return {
                    Success: true,
                    Message: json.Server.Message,
                    MessageId: json.Server.MessageId,
                };
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to save contra voucher.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const contraEntrySlice = createSlice({
    name: "contraEntry",
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
        clearCompanyCurrency(state) {
            state.companyCurrency = null;
            state.currencyError = null;
        },
        clearExchangeRateData(state) {
            state.exchangeRateData = null;
            state.exchangeRateError = null;
        },
        clearCurrencyList(state) {
            state.currencyList = [];
            state.currencyListError = null;
        },
        clearBankList(state) {
            state.bankList = [];
            state.bankListError = null;
        },
        clearAcHeadList(state) {
            state.acHeadList = [];
            state.acHeadListError = null;
        },
        clearAccountBalance(state) {
            state.accountBalance = null;
            state.accountBalanceError = null;
        },
        clearContraList(state) {
            state.contraList = [];
            state.contraListError = null;
        },
        clearSaveState(state) {
            state.saveLoading = false;
            state.saveError = null;
            state.savedVoucherNo = null;
        },
        resetContraEntry() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Document Master (Contra)
            .addCase(fetchDocumentStartWith.pending, (state) => {
                state.documentLoading = true;
                state.documentError = null;
            })
            .addCase(fetchDocumentStartWith.fulfilled, (state, action) => {
                state.documentLoading = false;
                state.documentList = action.payload;
                if (!state.selectedDocument && action.payload.length > 0) {
                    const defaultDoc = action.payload.find((d) => d.SetDefault) ?? action.payload[0];
                    state.selectedDocument = defaultDoc;
                }
            })
            .addCase(fetchDocumentStartWith.rejected, (state, action) => {
                state.documentLoading = false;
                state.documentError = action.payload ?? "Unknown error";
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

            // Currency Start With (Dropdown List)
            .addCase(fetchCurrencyStartWith.pending, (state) => {
                state.currencyListLoading = true;
                state.currencyListError = null;
            })
            .addCase(fetchCurrencyStartWith.fulfilled, (state, action) => {
                state.currencyListLoading = false;
                state.currencyList = action.payload;
            })
            .addCase(fetchCurrencyStartWith.rejected, (state, action) => {
                state.currencyListLoading = false;
                state.currencyListError = action.payload ?? "Unknown error";
            })

            // Bank List Search
            .addCase(fetchBankStartWith.pending, (state) => {
                state.bankListLoading = true;
                state.bankListError = null;
            })
            .addCase(fetchBankStartWith.fulfilled, (state, action) => {
                state.bankListLoading = false;
                state.bankList = action.payload;
            })
            .addCase(fetchBankStartWith.rejected, (state, action) => {
                state.bankListLoading = false;
                state.bankListError = action.payload ?? "Unknown error";
            })

            // Contra Account Head Search
            .addCase(fetchContraAcHeadStartWith.pending, (state) => {
                state.acHeadListLoading = true;
                state.acHeadListError = null;
            })
            .addCase(fetchContraAcHeadStartWith.fulfilled, (state, action) => {
                state.acHeadListLoading = false;
                state.acHeadList = action.payload;
            })
            .addCase(fetchContraAcHeadStartWith.rejected, (state, action) => {
                state.acHeadListLoading = false;
                state.acHeadListError = action.payload ?? "Unknown error";
            })

            // Account Balance Fetch
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

            // Contra Voucher List By Date
            .addCase(fetchContraDetailsByDate.pending, (state) => {
                state.contraListLoading = true;
                state.contraListError = null;
            })
            .addCase(fetchContraDetailsByDate.fulfilled, (state, action) => {
                state.contraListLoading = false;
                state.contraList = action.payload;
            })
            .addCase(fetchContraDetailsByDate.rejected, (state, action) => {
                state.contraListLoading = false;
                state.contraListError = action.payload ?? "Unknown error";
            })

            // Save Contra Voucher
            .addCase(saveContraVoucher.pending, (state) => {
                state.saveLoading = true;
                state.saveError = null;
                state.savedVoucherNo = null;
            })
            .addCase(saveContraVoucher.fulfilled, (state, action) => {
                state.saveLoading = false;
                state.savedVoucherNo = action.payload.MessageId;
            })
            .addCase(saveContraVoucher.rejected, (state, action) => {
                state.saveLoading = false;
                state.saveError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    setSelectedDocument,
    clearDocumentList,
    clearCompanyCurrency,
    clearExchangeRateData,
    clearCurrencyList,
    clearBankList,
    clearAcHeadList,
    clearAccountBalance,
    clearContraList,
    clearSaveState,
    resetContraEntry,
} = contraEntrySlice.actions;

export default contraEntrySlice.reducer;
