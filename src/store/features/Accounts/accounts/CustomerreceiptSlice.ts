import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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

export interface FetchPreferenceDetailsByFunctionNameParams {
    functionName: string;
    companyId?: number;
    finYearId?: number;
}

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

export interface CurrencyMaster {
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

export interface CurrencyExRate {
    CurrencyM: CurrencyMaster;
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

// ─── State ────────────────────────────────────────────────────────────────────

export interface CustomerReceiptState {
    preferenceDetails: PreferenceDetail[];
    preferenceDetailsLoading: boolean;
    preferenceDetailsError: string | null;
    companyCurrency: CompanyCurrency[];
    companyCurrencyLoading: boolean;
    companyCurrencyError: string | null;
    currencyExRate: CurrencyExRate[];
    currencyExRateLoading: boolean;
    currencyExRateError: string | null;
}

const initialState: CustomerReceiptState = {
    preferenceDetails: [],
    preferenceDetailsLoading: false,
    preferenceDetailsError: null,
    companyCurrency: [],
    companyCurrencyLoading: false,
    companyCurrencyError: null,
    currencyExRate: [],
    currencyExRateLoading: false,
    currencyExRateError: null,
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

export const fetchPreferenceDetailsByFunctionName = createAsyncThunk<
    PreferenceDetail[],
    FetchPreferenceDetailsByFunctionNameParams,
    { state: RootState; rejectValue: string }
>(
    "customerReceipt/fetchPreferenceDetailsByFunctionName",
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

export const fetchCompanyCurrency = createAsyncThunk<
    CompanyCurrency[],
    FetchCompanyCurrencyParams | void,
    { state: RootState; rejectValue: string }
>(
    "customerReceipt/fetchCompanyCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/Company/GetCompanyCurrency`,
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

            const json = await response.json();

            // Envelope: { Server: { Success, Message, MessageId, Data, Id, Info, Approve } }
            const server = json?.Server;
            if (!server || server.Success !== true) {
                return rejectWithValue(server?.Message ?? "Failed to fetch company currency.");
            }

            return (server.Data ?? []) as CompanyCurrency[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyExRate = createAsyncThunk<
    CurrencyExRate[],
    FetchCurrencyExRateParams,
    { state: RootState; rejectValue: string }
>(
    "customerReceipt/fetchCurrencyExRate",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/Currency/GetCurrencyExRate?currencyID=${params.currencyId}&date=${encodeURIComponent(
                    params.date
                )}`,
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

            const json = await response.json();

            // Envelope: { Server: { Success, Message, MessageId, Data, Id, Info, Approve } }
            const server = json?.Server;
            if (!server || server.Success !== true) {
                return rejectWithValue(server?.Message ?? "Failed to fetch currency exchange rate.");
            }

            return (server.Data ?? []) as CurrencyExRate[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const customerReceiptSlice = createSlice({
    name: "customerReceipt",
    initialState,
    reducers: {
        clearPreferenceDetails: (state) => {
            state.preferenceDetails = [];
            state.preferenceDetailsError = null;
        },
        clearCompanyCurrency: (state) => {
            state.companyCurrency = [];
            state.companyCurrencyError = null;
        },
        clearCurrencyExRate: (state) => {
            state.currencyExRate = [];
            state.currencyExRateError = null;
        },
        clearCustomerReceiptState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
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
            .addCase(fetchCompanyCurrency.pending, (state) => {
                state.companyCurrencyLoading = true;
                state.companyCurrencyError = null;
            })
            .addCase(fetchCompanyCurrency.fulfilled, (state, action) => {
                state.companyCurrencyLoading = false;
                state.companyCurrency = action.payload;
            })
            .addCase(fetchCompanyCurrency.rejected, (state, action) => {
                state.companyCurrencyLoading = false;
                state.companyCurrencyError = action.payload ?? "Unknown error";
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
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearPreferenceDetails,
    clearCompanyCurrency,
    clearCurrencyExRate,
    clearCustomerReceiptState,
} = customerReceiptSlice.actions;

export default customerReceiptSlice.reducer;
