import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanyCurrency {
    CompanyID: number;
    CurrencyID: number;
    Currency: string;
    Symbol: string;
}

export interface FetchCompanyCurrencyParams {
    companyId?: number;
    finYearId?: number;
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

export interface FetchPreferenceDetailsByFunctionNameParams {
    functionName: string;
    companyId?: number;
    finYearId?: number;
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

export interface CurrencyExRateItem {
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

export interface FetchCurrencyExRateParams {
    currencyId: number;
    date: string;
    companyId?: number;
    finYearId?: number;
}

export interface SupplierStartWithItem {
    PartyName: string;
    PartyID: number;
    PartyAddress: string | null;
    PartyCategory: string;
    DebitAccountID: number;
    DebitAccount: string;
    PartyAcHeadID: number;
    HeadName: string;
    CurrencyID: number;
    LinkedPartyID: number | null;
}

export interface FetchSupplierStartWithForSettlementParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface CashBankAccountHead {
    HeadID: number;
    HeadName: string;
    GroupID: number;
}

export interface FetchCashBankAccountHeadsParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface PaymentTypeStartWithItem {
    PaymentTypeName: string;
    PaymentTypeID: number;
}

export interface FetchPaymentTypeStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface ServerResponse<T> {
    Server: {
        Success: boolean;
        Message: string | null;
        MessageId: string | null;
        Data: T;
        Id: number;
        Info: string | null;
        Approve: boolean | null;
    };
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface SupplierPaymentState {
    currencies: CompanyCurrency[];
    selectedCurrency: CompanyCurrency | null;
    currencyLoading: boolean;
    currencyError: string | null;
    preferenceDetails: PreferenceDetail[];
    preferenceDetailsLoading: boolean;
    preferenceDetailsError: string | null;
    currencyExRate: CurrencyExRateItem[];
    currencyExRateLoading: boolean;
    currencyExRateError: string | null;
    supplierStartWithList: SupplierStartWithItem[];
    supplierStartWithLoading: boolean;
    supplierStartWithError: string | null;
    cashBankAccountHeads: CashBankAccountHead[];
    cashBankAccountHeadsLoading: boolean;
    cashBankAccountHeadsError: string | null;
    paymentTypeStartWithList: PaymentTypeStartWithItem[];
    paymentTypeStartWithLoading: boolean;
    paymentTypeStartWithError: string | null;
}

const initialState: SupplierPaymentState = {
    currencies: [],
    selectedCurrency: null,
    currencyLoading: false,
    currencyError: null,
    preferenceDetails: [],
    preferenceDetailsLoading: false,
    preferenceDetailsError: null,
    currencyExRate: [],
    currencyExRateLoading: false,
    currencyExRateError: null,
    supplierStartWithList: [],
    supplierStartWithLoading: false,
    supplierStartWithError: null,
    cashBankAccountHeads: [],
    cashBankAccountHeadsLoading: false,
    cashBankAccountHeadsError: null,
    paymentTypeStartWithList: [],
    paymentTypeStartWithLoading: false,
    paymentTypeStartWithError: null,
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

// ─── Thunk ────────────────────────────────────────────────────────────────────

export const fetchCompanyCurrency = createAsyncThunk<
    CompanyCurrency[],
    FetchCompanyCurrencyParams | void,
    { state: RootState; rejectValue: string }
>(
    "supplierPayment/fetchCompanyCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/Company/GetCompanyCurrency",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<CompanyCurrency[]> = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch company currency");
            }

            return json?.Server?.Data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPreferenceDetailsByFunctionName = createAsyncThunk<
    PreferenceDetail[],
    FetchPreferenceDetailsByFunctionNameParams,
    { state: RootState; rejectValue: string }
>(
    "supplierPayment/fetchPreferenceDetailsByFunctionName",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/CommonUtility/GetPreferenceDetailsbyFunctionName?functionName=${params.functionName}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: PreferenceDetail[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyExRate = createAsyncThunk<
    CurrencyExRateItem[],
    FetchCurrencyExRateParams,
    { state: RootState; rejectValue: string }
>(
    "supplierPayment/fetchCurrencyExRate",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api//Currency/GetCurrencyExRate?currencyID=${params.currencyId}&date=${params.date}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<CurrencyExRateItem[]> = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch currency exchange rate");
            }

            return json?.Server?.Data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSupplierStartWithForSettlement = createAsyncThunk<
    SupplierStartWithItem[],
    FetchSupplierStartWithForSettlementParams | void,
    { state: RootState; rejectValue: string }
>(
    "supplierPayment/fetchSupplierStartWithForSettlement",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api//Party/GetSupplierStartwithForSettlement?startWith=${startWith}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: SupplierStartWithItem[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCashBankAccountHeads = createAsyncThunk<
    CashBankAccountHead[],
    FetchCashBankAccountHeadsParams | void,
    { state: RootState; rejectValue: string }
>(
    "supplierPayment/fetchCashBankAccountHeads",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api//CommonUtility/GetCashBankAccountHeads?startWith=${startWith}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<CashBankAccountHead[]> = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch cash/bank account heads");
            }

            return json?.Server?.Data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPaymentTypeStartWith = createAsyncThunk<
    PaymentTypeStartWithItem[],
    FetchPaymentTypeStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "supplierPayment/fetchPaymentTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api//PaymentType/GetPaymentTypeStartWith?startWith=${startWith}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: PaymentTypeStartWithItem[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const supplierPaymentSlice = createSlice({
    name: "supplierPayment",
    initialState,
    reducers: {
        setSelectedCurrency: (state, action: PayloadAction<CompanyCurrency | null>) => {
            state.selectedCurrency = action.payload;
        },
        clearPreferenceDetails: (state) => {
            state.preferenceDetails = [];
            state.preferenceDetailsError = null;
        },
        clearCurrencyExRate: (state) => {
            state.currencyExRate = [];
            state.currencyExRateError = null;
        },
        clearSupplierStartWithList: (state) => {
            state.supplierStartWithList = [];
            state.supplierStartWithError = null;
        },
        clearCashBankAccountHeads: (state) => {
            state.cashBankAccountHeads = [];
            state.cashBankAccountHeadsError = null;
        },
        clearPaymentTypeStartWithList: (state) => {
            state.paymentTypeStartWithList = [];
            state.paymentTypeStartWithError = null;
        },
        clearSupplierPaymentState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompanyCurrency.pending, (state) => {
                state.currencyLoading = true;
                state.currencyError = null;
            })
            .addCase(fetchCompanyCurrency.fulfilled, (state, action) => {
                state.currencyLoading = false;
                state.currencies = action.payload;
                // Default to the first (typically only) currency returned for the company
                state.selectedCurrency = action.payload[0] ?? null;
            })
            .addCase(fetchCompanyCurrency.rejected, (state, action) => {
                state.currencyLoading = false;
                state.currencyError = action.payload ?? "Unknown error";
            })
            .addCase(fetchPreferenceDetailsByFunctionName.pending, (state) => {
                state.preferenceDetailsLoading = true;
                state.preferenceDetailsError = null;
            })
            .addCase(fetchPreferenceDetailsByFunctionName.fulfilled, (state, action) => {
                state.preferenceDetailsLoading = false;
                state.preferenceDetails = action.payload;
            })
            .addCase(fetchPreferenceDetailsByFunctionName.rejected, (state, action) => {
                state.preferenceDetailsLoading = false;
                state.preferenceDetailsError = action.payload ?? "Unknown error";
            })
            .addCase(fetchCurrencyExRate.pending, (state) => {
                state.currencyExRateLoading = true;
                state.currencyExRateError = null;
            })
            .addCase(fetchCurrencyExRate.fulfilled, (state, action) => {
                state.currencyExRateLoading = false;
                state.currencyExRate = action.payload;
            })
            .addCase(fetchCurrencyExRate.rejected, (state, action) => {
                state.currencyExRateLoading = false;
                state.currencyExRateError = action.payload ?? "Unknown error";
            })
            .addCase(fetchSupplierStartWithForSettlement.pending, (state) => {
                state.supplierStartWithLoading = true;
                state.supplierStartWithError = null;
            })
            .addCase(fetchSupplierStartWithForSettlement.fulfilled, (state, action) => {
                state.supplierStartWithLoading = false;
                state.supplierStartWithList = action.payload;
            })
            .addCase(fetchSupplierStartWithForSettlement.rejected, (state, action) => {
                state.supplierStartWithLoading = false;
                state.supplierStartWithError = action.payload ?? "Unknown error";
            })
            .addCase(fetchCashBankAccountHeads.pending, (state) => {
                state.cashBankAccountHeadsLoading = true;
                state.cashBankAccountHeadsError = null;
            })
            .addCase(fetchCashBankAccountHeads.fulfilled, (state, action) => {
                state.cashBankAccountHeadsLoading = false;
                state.cashBankAccountHeads = action.payload;
            })
            .addCase(fetchCashBankAccountHeads.rejected, (state, action) => {
                state.cashBankAccountHeadsLoading = false;
                state.cashBankAccountHeadsError = action.payload ?? "Unknown error";
            })
            .addCase(fetchPaymentTypeStartWith.pending, (state) => {
                state.paymentTypeStartWithLoading = true;
                state.paymentTypeStartWithError = null;
            })
            .addCase(fetchPaymentTypeStartWith.fulfilled, (state, action) => {
                state.paymentTypeStartWithLoading = false;
                state.paymentTypeStartWithList = action.payload;
            })
            .addCase(fetchPaymentTypeStartWith.rejected, (state, action) => {
                state.paymentTypeStartWithLoading = false;
                state.paymentTypeStartWithError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    setSelectedCurrency,
    clearPreferenceDetails,
    clearCurrencyExRate,
    clearSupplierStartWithList,
    clearCashBankAccountHeads,
    clearPaymentTypeStartWithList,
    clearSupplierPaymentState,
} = supplierPaymentSlice.actions;

export default supplierPaymentSlice.reducer;
