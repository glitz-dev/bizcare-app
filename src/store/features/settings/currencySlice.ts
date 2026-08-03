import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /Currency/CheckDuplication?CurrencyName=...&currencyId=...
// Returns a plain boolean (true = duplicate exists)

// POST /Currency/CreateNewCurrency
// Returns plain text "OK" on success (no JSON envelope)
export interface CreateCurrencyPayload {
    CurrencyID: number;             
    CurrencyCode: string;
    Currency: string;
    Symbol: string;
    ExchRate: number;
    Active: boolean;
    Common: boolean;
    BaseToCur: boolean;
    CurToBase: boolean;
}

// GET /Currency/GetAllCurrencys
// Returns a plain array (no envelope)
export interface CurrencyListItem {
    CurrencyID: number;
    Currency: string;
    CurrencyCode: string;
    Symbol: string | null;
    Active: "Active" | "InActive";
}

// GET /Currency/GetCurrency?CurrencyID=...
// Returns a plain array with a single item (no envelope)
export interface CurrencyDetail {
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
    Symbol: string | null;
    FaClass: string | null;
    FaChar: string | null;
    Common: boolean;
}

// POST /Currency/UpdateCurrency
// Returns plain text "OK" on success (no JSON envelope)
export type UpdateCurrencyPayload = CurrencyDetail;

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface CheckCurrencyDuplicationParams {
    currencyName: string;
    currencyId?: number;            // default 0
    companyId?: number;             // default 1
    finYearId?: number;             // default 2
}

export interface CreateNewCurrencyParams {
    payload: CreateCurrencyPayload;
    companyId?: number;             // default 1
    finYearId?: number;             // default 2
}

export interface FetchAllCurrenciesParams {
    companyId?: number;             // default 1
    finYearId?: number;             // default 2
}

export interface FetchCurrencyByIdParams {
    currencyId: number;
    companyId?: number;             // default 1
    finYearId?: number;             // default 2
}

export interface UpdateCurrencyParams {
    payload: UpdateCurrencyPayload;
    companyId?: number;             // default 1
    finYearId?: number;             // default 2
}

export interface DeleteCurrencyParams {
    currencyId: number;
    modUserId?: number;             // default 1
    companyId?: number;             // default 1
    finYearId?: number;             // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface CurrencyState {
    isDuplicateCurrency: boolean | null;
    duplicateCheckLoading: boolean;
    duplicateCheckError: string | null;

    createCurrencyLoading: boolean;
    createCurrencyError: string | null;
    createCurrencySuccess: boolean;

    currencyList: CurrencyListItem[];
    currencyListLoading: boolean;
    currencyListError: string | null;

    currencyDetail: CurrencyDetail | null;
    currencyDetailLoading: boolean;
    currencyDetailError: string | null;

    updateCurrencyLoading: boolean;
    updateCurrencyError: string | null;
    updateCurrencySuccess: boolean;

    deleteCurrencyLoading: boolean;
    deleteCurrencyError: string | null;
    deleteCurrencySuccess: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: CurrencyState = {
    isDuplicateCurrency: null,
    duplicateCheckLoading: false,
    duplicateCheckError: null,

    createCurrencyLoading: false,
    createCurrencyError: null,
    createCurrencySuccess: false,

    currencyList: [],
    currencyListLoading: false,
    currencyListError: null,

    currencyDetail: null,
    currencyDetailLoading: false,
    currencyDetailError: null,

    updateCurrencyLoading: false,
    updateCurrencyError: null,
    updateCurrencySuccess: false,

    deleteCurrencyLoading: false,
    deleteCurrencyError: null,
    deleteCurrencySuccess: false,
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

// 1. CheckDuplication — plain boolean response
export const checkCurrencyDuplication = createAsyncThunk<
    boolean,
    CheckCurrencyDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "currency/checkCurrencyDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const currencyId = params.currencyId ?? 0;

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/CheckDuplication?CurrencyName=${encodeURIComponent(
                params.currencyName
            )}&currencyId=${currencyId}`;

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

            const text = (await response.text()).trim().toLowerCase();
            return text === "true";
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. CreateNewCurrency — plain text "OK" response (no envelope)
export const createNewCurrency = createAsyncThunk<
    void,
    CreateNewCurrencyParams,
    { state: RootState; rejectValue: string }
>(
    "currency/createNewCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/CreateNewCurrency`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(params.payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const text = (await response.text()).trim();
            if (text.toUpperCase() !== "OK") {
                return rejectWithValue(text || "Failed to create currency.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetAllCurrencys — plain array response
export const fetchAllCurrencies = createAsyncThunk<
    CurrencyListItem[],
    FetchAllCurrenciesParams | void,
    { state: RootState; rejectValue: string }
>(
    "currency/fetchAllCurrencies",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/GetAllCurrencys`;

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

            const data: CurrencyListItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetCurrency — plain array response with a single item
export const fetchCurrencyById = createAsyncThunk<
    CurrencyDetail,
    FetchCurrencyByIdParams,
    { state: RootState; rejectValue: string }
>(
    "currency/fetchCurrencyById",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/GetCurrency?CurrencyID=${params.currencyId}`;

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

            const data: CurrencyDetail[] = await response.json();
            if (!data || data.length === 0) {
                return rejectWithValue("Currency not found.");
            }
            return data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. UpdateCurrency — plain text "OK" response (no envelope)
export const updateCurrency = createAsyncThunk<
    void,
    UpdateCurrencyParams,
    { state: RootState; rejectValue: string }
>(
    "currency/updateCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/UpdateCurrency`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(params.payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            // UpdateCurrency returns no response body — a non-error HTTP status is success.
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. DeleteCurrency — plain text/number response ("0" = success)
export const deleteCurrency = createAsyncThunk<
    number,
    DeleteCurrencyParams,
    { state: RootState; rejectValue: string }
>(
    "currency/deleteCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const modUserId = params.modUserId ?? 1;

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/DeleteCurrency?CurrencyID=${params.currencyId}&ModUserID=${modUserId}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const text = (await response.text()).trim();
            if (text !== "0") {
                return rejectWithValue(text || "Failed to delete currency.");
            }

            return params.currencyId;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const currencySlice = createSlice({
    name: "currency",
    initialState,
    reducers: {
        clearDuplicateCheck(state) {
            state.isDuplicateCurrency = null;
            state.duplicateCheckError = null;
        },
        clearCreateCurrencyStatus(state) {
            state.createCurrencyError = null;
            state.createCurrencySuccess = false;
        },
        clearCurrencyList(state) {
            state.currencyList = [];
            state.currencyListError = null;
        },
        clearCurrencyDetail(state) {
            state.currencyDetail = null;
            state.currencyDetailError = null;
        },
        clearUpdateCurrencyStatus(state) {
            state.updateCurrencyError = null;
            state.updateCurrencySuccess = false;
        },
        clearDeleteCurrencyStatus(state) {
            state.deleteCurrencyError = null;
            state.deleteCurrencySuccess = false;
        },
        resetCurrency() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // CheckDuplication
            .addCase(checkCurrencyDuplication.pending, (state) => {
                state.duplicateCheckLoading = true;
                state.duplicateCheckError = null;
            })
            .addCase(checkCurrencyDuplication.fulfilled, (state, action) => {
                state.duplicateCheckLoading = false;
                state.isDuplicateCurrency = action.payload;
            })
            .addCase(checkCurrencyDuplication.rejected, (state, action) => {
                state.duplicateCheckLoading = false;
                state.duplicateCheckError = action.payload ?? "Unknown error";
            })

            // CreateNewCurrency
            .addCase(createNewCurrency.pending, (state) => {
                state.createCurrencyLoading = true;
                state.createCurrencyError = null;
                state.createCurrencySuccess = false;
            })
            .addCase(createNewCurrency.fulfilled, (state) => {
                state.createCurrencyLoading = false;
                state.createCurrencySuccess = true;
            })
            .addCase(createNewCurrency.rejected, (state, action) => {
                state.createCurrencyLoading = false;
                state.createCurrencyError = action.payload ?? "Unknown error";
            })

            // GetAllCurrencys
            .addCase(fetchAllCurrencies.pending, (state) => {
                state.currencyListLoading = true;
                state.currencyListError = null;
            })
            .addCase(fetchAllCurrencies.fulfilled, (state, action) => {
                state.currencyListLoading = false;
                state.currencyList = action.payload;
            })
            .addCase(fetchAllCurrencies.rejected, (state, action) => {
                state.currencyListLoading = false;
                state.currencyListError = action.payload ?? "Unknown error";
            })

            // GetCurrency
            .addCase(fetchCurrencyById.pending, (state) => {
                state.currencyDetailLoading = true;
                state.currencyDetailError = null;
            })
            .addCase(fetchCurrencyById.fulfilled, (state, action) => {
                state.currencyDetailLoading = false;
                state.currencyDetail = action.payload;
            })
            .addCase(fetchCurrencyById.rejected, (state, action) => {
                state.currencyDetailLoading = false;
                state.currencyDetailError = action.payload ?? "Unknown error";
            })

            // UpdateCurrency
            .addCase(updateCurrency.pending, (state) => {
                state.updateCurrencyLoading = true;
                state.updateCurrencyError = null;
                state.updateCurrencySuccess = false;
            })
            .addCase(updateCurrency.fulfilled, (state) => {
                state.updateCurrencyLoading = false;
                state.updateCurrencySuccess = true;
            })
            .addCase(updateCurrency.rejected, (state, action) => {
                state.updateCurrencyLoading = false;
                state.updateCurrencyError = action.payload ?? "Unknown error";
            })

            // DeleteCurrency
            .addCase(deleteCurrency.pending, (state) => {
                state.deleteCurrencyLoading = true;
                state.deleteCurrencyError = null;
                state.deleteCurrencySuccess = false;
            })
            .addCase(deleteCurrency.fulfilled, (state, action) => {
                state.deleteCurrencyLoading = false;
                state.deleteCurrencySuccess = true;
                state.currencyList = state.currencyList.filter(
                    (item) => item.CurrencyID !== action.payload
                );
            })
            .addCase(deleteCurrency.rejected, (state, action) => {
                state.deleteCurrencyLoading = false;
                state.deleteCurrencyError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearDuplicateCheck,
    clearCreateCurrencyStatus,
    clearCurrencyList,
    clearCurrencyDetail,
    clearUpdateCurrencyStatus,
    clearDeleteCurrencyStatus,
    resetCurrency,
} = currencySlice.actions;

export default currencySlice.reducer;
