import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /FinancialYear/CheckDuplication?FinYearName=...&FinYearID=...
// Returns a plain boolean (true = duplicate exists)

// POST /FinancialYear/CreateNewFinancialYear
// Returns plain text "OK" on success (no JSON envelope)
export interface CreateFinancialYearPayload {
    FinYearID: number;              // 0 for new financial year
    FinYearName: string;
    FromDatestr: string;            // "DD-MM-YYYY"
    ToDatestr: string;               // "DD-MM-YYYY"
    FromDate: string;                // ISO string
    ToDate: string;                  // ISO string
    OpBalEdit: boolean;
    ActiveFinYear: boolean;
}

// GET /FinancialYear/GetAllFinyears
// Returns a plain array (no envelope)
export interface FinancialYearListItem {
    FinYearName: string;
    FinYearID: number;
    ActiveFinYear: "Yes" | "No";
    FromDate: string;                // "DD-MM-YYYY"
    ToDate: string;                   // "DD-MM-YYYY"
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

export interface CheckFinYearDuplicationParams {
    finYearName: string;
    finYearID?: number;            // default 0
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface CreateNewFinancialYearParams {
    payload: CreateFinancialYearPayload;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchAllFinYearsParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface FinancialYearState {
    isDuplicateFinYear: boolean | null;
    duplicateCheckLoading: boolean;
    duplicateCheckError: string | null;

    createFinYearLoading: boolean;
    createFinYearError: string | null;
    createFinYearSuccess: boolean;

    finYearList: FinancialYearListItem[];
    finYearListLoading: boolean;
    finYearListError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: FinancialYearState = {
    isDuplicateFinYear: null,
    duplicateCheckLoading: false,
    duplicateCheckError: null,

    createFinYearLoading: false,
    createFinYearError: null,
    createFinYearSuccess: false,

    finYearList: [],
    finYearListLoading: false,
    finYearListError: null,
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
export const checkFinYearDuplication = createAsyncThunk<
    boolean,
    CheckFinYearDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "financialYear/checkFinYearDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const finYearID = params.finYearID ?? 0;

        try {
            const url = `https://erp.glitzit.com/service/api/FinancialYear/CheckDuplication?FinYearName=${encodeURIComponent(
                params.finYearName
            )}&FinYearID=${finYearID}`;

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

// 2. CreateNewFinancialYear — plain text "OK" response (no envelope)
export const createNewFinancialYear = createAsyncThunk<
    void,
    CreateNewFinancialYearParams,
    { state: RootState; rejectValue: string }
>(
    "financialYear/createNewFinancialYear",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/FinancialYear/CreateNewFinancialYear`;

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
                return rejectWithValue(text || "Failed to create financial year.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetAllFinyears — plain array response
export const fetchAllFinYears = createAsyncThunk<
    FinancialYearListItem[],
    FetchAllFinYearsParams | void,
    { state: RootState; rejectValue: string }
>(
    "financialYear/fetchAllFinYears",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/FinancialYear/GetAllFinyears`;

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

            const data: FinancialYearListItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const financialYearSlice = createSlice({
    name: "financialYear",
    initialState,
    reducers: {
        clearDuplicateCheck(state) {
            state.isDuplicateFinYear = null;
            state.duplicateCheckError = null;
        },
        clearCreateFinYearStatus(state) {
            state.createFinYearError = null;
            state.createFinYearSuccess = false;
        },
        clearFinYearList(state) {
            state.finYearList = [];
            state.finYearListError = null;
        },
        resetFinancialYear() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // CheckDuplication
            .addCase(checkFinYearDuplication.pending, (state) => {
                state.duplicateCheckLoading = true;
                state.duplicateCheckError = null;
            })
            .addCase(checkFinYearDuplication.fulfilled, (state, action) => {
                state.duplicateCheckLoading = false;
                state.isDuplicateFinYear = action.payload;
            })
            .addCase(checkFinYearDuplication.rejected, (state, action) => {
                state.duplicateCheckLoading = false;
                state.duplicateCheckError = action.payload ?? "Unknown error";
            })

            // CreateNewFinancialYear
            .addCase(createNewFinancialYear.pending, (state) => {
                state.createFinYearLoading = true;
                state.createFinYearError = null;
                state.createFinYearSuccess = false;
            })
            .addCase(createNewFinancialYear.fulfilled, (state) => {
                state.createFinYearLoading = false;
                state.createFinYearSuccess = true;
            })
            .addCase(createNewFinancialYear.rejected, (state, action) => {
                state.createFinYearLoading = false;
                state.createFinYearError = action.payload ?? "Unknown error";
            })

            // GetAllFinyears
            .addCase(fetchAllFinYears.pending, (state) => {
                state.finYearListLoading = true;
                state.finYearListError = null;
            })
            .addCase(fetchAllFinYears.fulfilled, (state, action) => {
                state.finYearListLoading = false;
                state.finYearList = action.payload;
            })
            .addCase(fetchAllFinYears.rejected, (state, action) => {
                state.finYearListLoading = false;
                state.finYearListError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearDuplicateCheck,
    clearCreateFinYearStatus,
    clearFinYearList,
    resetFinancialYear,
} = financialYearSlice.actions;

export default financialYearSlice.reducer;
