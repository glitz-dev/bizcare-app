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

export interface InvoiceTaxType {
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
}

export interface AcHead {
    HeadID: number;
    HeadName: string;
}

export interface TaxRate {
    TaxCategoryName: string;
    TaxValue: number;
    TaxCategoryId: number;
}

export interface VoucherDetail {
    VoucherID: number;
    VoucherNo: string;
    VoucherAmount: number;
    DocumentID: number;
    Remarks: string | null;
    DocumentName: string;
    Verified: number;
    VoucherDate: string;
    ApprovedBy: string | null;
    Approve: string;
    ChequeNo: string | null;
    ChequeDate: string | null;
    CreatedOn: string;
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

export interface AccJournalTItem {
    HeadName: string;
    HeadID: number;
    CurrentBal: string;
    DebitAmount: number;
    CreditAmount: number;
    CESSAmt: number;
    CGSTAmt: number;
    IGSTAmt: number;
    SGSTAmt: number;
    UTGSTAmt: number;
    VATAmt: string;
    VATPer: number;
    TaxPercentage: number;
    TaxRate: string;
    NetAmt: string;
}

export interface SaveJournalVoucherPayload {
    VoucherDateStr: string;
    StartDateStr: string;
    EndDateStr: string;
    Currency: string;
    CurrencyID: number;
    DocumentID: number;
    DocumentName: string;
    ExchRate: number;
    GSTGroupID: number | null;
    GSTGroupName: string | null;
    InvoiceTaxType: string;
    InvoiceTaxTypeID: number;
    IsCess: boolean;
    IsGST: boolean;
    IsJournalOrContra: boolean;
    IsVAT: boolean;
    LstAccJournalT: AccJournalTItem[];
    LstSalesPurchaseDetail: any[]; // Adjust type if details are structured
    Narration?: string;
    Remarks?: string;
    Settled: boolean;
    SettledAmount: string;
    TaxAmountHead: string;
    TaxMasterID: number;
    TaxMasterName: string;
    TaxPercHead: string;
    Type: string;
    TypeName: { name: string; id: number };
    id?: number;
    VoucherAmount: string;
    VoucherDate: string;
    VoucherNo: string;
    totalAmt: number;
    companyId?: number; // Optional modifier parameter for header routing override
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

export interface FetchAllInvoiceTaxTypesParams {
    taxMasterId: number;
    companyId?: number;
}

export interface FetchAcHeadStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchAccountBalanceParams {
    headId: number;
    companyId?: number;
    finYearId?: number;
}

export interface FetchTaxRatesParams {
    taxMasterName: string;
    startWith?: string;
    companyId?: number;
}

export interface FetchVoucherDetailsParams {
    fromDate: string;
    toDate: string;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface JournalVoucherState {
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

    invoiceTaxTypes: InvoiceTaxType[];
    taxTypesLoading: boolean;
    taxTypesError: string | null;

    acHeadList: AcHead[];
    acHeadLoading: boolean;
    acHeadError: string | null;

    accountBalance: number | null;
    balanceLoading: boolean;
    balanceError: string | null;

    taxRates: TaxRate[];
    taxRatesLoading: boolean;
    taxRatesError: string | null;

    voucherDetails: VoucherDetail[];
    voucherDetailsLoading: boolean;
    voucherDetailsError: string | null;

    // Save Changes API Statuses
    saveLoading: boolean;
    saveError: string | null;
    saveSuccess: string | null; // Stores saved MessageId (e.g. "JN-3") upon success
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: JournalVoucherState = {
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

    invoiceTaxTypes: [],
    taxTypesLoading: false,
    taxTypesError: null,

    acHeadList: [],
    acHeadLoading: false,
    acHeadError: null,

    accountBalance: null,
    balanceLoading: false,
    balanceError: null,

    taxRates: [],
    taxRatesLoading: false,
    taxRatesError: null,

    voucherDetails: [],
    voucherDetailsLoading: false,
    voucherDetailsError: null,

    saveLoading: false,
    saveError: null,
    saveSuccess: null,
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
    "journalVoucher/fetchDocumentStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith");
            url.searchParams.set("DocumentType", "JOURNAL");
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
    "journalVoucher/fetchCompanyCurrency",
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
    "journalVoucher/fetchCurrencyExRate",
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
    "journalVoucher/fetchCurrencyStartWith",
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

export const fetchAllInvoiceTaxTypes = createAsyncThunk<
    InvoiceTaxType[],
    FetchAllInvoiceTaxTypesParams,
    { state: RootState; rejectValue: string }
>(
    "journalVoucher/fetchAllInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/CommonUtility/GetAllInvoiceTaxTypes");
            url.searchParams.set("taxMasterId", String(params.taxMasterId));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: InvoiceTaxType[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAcHeadStartWith = createAsyncThunk<
    AcHead[],
    FetchAcHeadStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "journalVoucher/fetchAcHeadStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/JournalVoucher/GetAcHeadStartWith");
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

            const json: ApiResponseWrapper<AcHead[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch account heads.");
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
    "journalVoucher/fetchAccountBalance",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/JournalVoucher/GetAccountBalance");
            url.searchParams.set("HeadID", String(params.headId));

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

            const textResponse = await response.text();
            const balance = parseFloat(textResponse);
            return isNaN(balance) ? 0 : balance;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchTaxRates = createAsyncThunk<
    TaxRate[],
    FetchTaxRatesParams,
    { state: RootState; rejectValue: string }
>(
    "journalVoucher/fetchTaxRates",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const startWith = params?.startWith ?? "";

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/GetTaxRates");
            url.searchParams.set("TaxMasterName", params.taxMasterName);
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

            const json: TaxRate[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchVoucherDetails = createAsyncThunk<
    VoucherDetail[],
    FetchVoucherDetailsParams,
    { state: RootState; rejectValue: string }
>(
    "journalVoucher/fetchVoucherDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/JournalVoucher/GetDetailsByDate");
            url.searchParams.set("FromDate", params.fromDate);
            url.searchParams.set("ToDate", params.toDate);
            url.searchParams.set("rowsPerPage", String(params.rowsPerPage ?? 25));
            url.searchParams.set("currentPage", String(params.currentPage ?? 1));

            if (params.searchStr) {
                url.searchParams.set("searchStr", params.searchStr);
            }

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<VoucherDetail[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch voucher details.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Save Changes API Thunk ───────────────────────────────────────────────────
export const saveJournalVoucher = createAsyncThunk<
    string, // Returns MessageId on success
    SaveJournalVoucherPayload,
    { state: RootState; rejectValue: string }
>(
    "journalVoucher/saveJournalVoucher",
    async (payload, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { companyId, ...body } = payload;
        const targetCompanyId = companyId ?? 1;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/JournalVoucher/SaveChanges");

            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(targetCompanyId),
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<null> = await response.json();

            if (json.Server?.Success) {
                return json.Server.MessageId || "Success";
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to save journal voucher modifications.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const journalVoucherSlice = createSlice({
    name: "journalVoucher",
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
        clearCurrencyList(state) {
            state.currencyList = [];
            state.currencyListError = null;
        },
        clearInvoiceTaxTypes(state) {
            state.invoiceTaxTypes = [];
            state.taxTypesError = null;
        },
        clearAcHeadList(state) {
            state.acHeadList = [];
            state.acHeadError = null;
        },
        clearAccountBalance(state) {
            state.accountBalance = null;
            state.balanceError = null;
        },
        clearTaxRates(state) {
            state.taxRates = [];
            state.taxRatesError = null;
        },
        clearVoucherDetails(state) {
            state.voucherDetails = [];
            state.voucherDetailsError = null;
        },
        clearSaveStatus(state) {
            state.saveLoading = false;
            state.saveError = null;
            state.saveSuccess = null;
        },
        resetJournalVoucher() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Document Master
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

            // Invoice Tax Types
            .addCase(fetchAllInvoiceTaxTypes.pending, (state) => {
                state.taxTypesLoading = true;
                state.taxTypesError = null;
            })
            .addCase(fetchAllInvoiceTaxTypes.fulfilled, (state, action) => {
                state.taxTypesLoading = false;
                state.invoiceTaxTypes = action.payload;
            })
            .addCase(fetchAllInvoiceTaxTypes.rejected, (state, action) => {
                state.taxTypesLoading = false;
                state.taxTypesError = action.payload ?? "Unknown error";
            })

            // Account Heads
            .addCase(fetchAcHeadStartWith.pending, (state) => {
                state.acHeadLoading = true;
                state.acHeadError = null;
            })
            .addCase(fetchAcHeadStartWith.fulfilled, (state, action) => {
                state.acHeadLoading = false;
                state.acHeadList = action.payload;
            })
            .addCase(fetchAcHeadStartWith.rejected, (state, action) => {
                state.acHeadLoading = false;
                state.acHeadError = action.payload ?? "Unknown error";
            })

            // Account Balance
            .addCase(fetchAccountBalance.pending, (state) => {
                state.balanceLoading = true;
                state.balanceError = null;
            })
            .addCase(fetchAccountBalance.fulfilled, (state, action) => {
                state.balanceLoading = false;
                state.accountBalance = action.payload;
            })
            .addCase(fetchAccountBalance.rejected, (state, action) => {
                state.balanceLoading = false;
                state.balanceError = action.payload ?? "Unknown error";
            })

            // Tax Rates
            .addCase(fetchTaxRates.pending, (state) => {
                state.taxRatesLoading = true;
                state.taxRatesError = null;
            })
            .addCase(fetchTaxRates.fulfilled, (state, action) => {
                state.taxRatesLoading = false;
                state.taxRates = action.payload;
            })
            .addCase(fetchTaxRates.rejected, (state, action) => {
                state.taxRatesLoading = false;
                state.taxRatesError = action.payload ?? "Unknown error";
            })

            // Voucher Details
            .addCase(fetchVoucherDetails.pending, (state) => {
                state.voucherDetailsLoading = true;
                state.voucherDetailsError = null;
            })
            .addCase(fetchVoucherDetails.fulfilled, (state, action) => {
                state.voucherDetailsLoading = false;
                state.voucherDetails = action.payload;
            })
            .addCase(fetchVoucherDetails.rejected, (state, action) => {
                state.voucherDetailsLoading = false;
                state.voucherDetailsError = action.payload ?? "Unknown error";
            })

            // Save Journal Voucher Changes
            .addCase(saveJournalVoucher.pending, (state) => {
                state.saveLoading = true;
                state.saveError = null;
                state.saveSuccess = null;
            })
            .addCase(saveJournalVoucher.fulfilled, (state, action) => {
                state.saveLoading = false;
                state.saveSuccess = action.payload;
            })
            .addCase(saveJournalVoucher.rejected, (state, action) => {
                state.saveLoading = false;
                state.saveError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    setSelectedDocument,
    clearDocumentList,
    clearCurrencyList,
    clearInvoiceTaxTypes,
    clearAcHeadList,
    clearAccountBalance,
    clearTaxRates,
    clearVoucherDetails,
    clearSaveStatus,
    resetJournalVoucher,
} = journalVoucherSlice.actions;

export default journalVoucherSlice.reducer;
