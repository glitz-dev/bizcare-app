import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BalanceSheetMajorGroupItem {
    MajourGroupID: number;
    MajorGroupName: string;
    AcGroupID: number;
    AcGroupName: string;
    NetBalance: number;
    LinkGroupID: number;
    SortOrder: number;
    Childs: number;
}

export interface BalanceSheetGroupItem {
    MajourGroupID: number;
    MajorGroupName: string;
    AcGroupID: number;
    AcGroupName: string;
    NetBalance: number;
    SortOrder: number;
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

export interface FetchBalanceSheetParams {
    fromDate: string;               // e.g. "2024-04-01"
    toDate: string;                 // e.g. "2026-08-16"
    mode?: number;                  // default 2
    branchId?: number;              // default 1
    companyId?: number;             // default 1
    finYearId?: number;             // used for auth headers — default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface BalanceSheetState {
    // Major Groupwise State
    balanceSheetMajorList: BalanceSheetMajorGroupItem[];
    balanceSheetMajorLoading: boolean;
    balanceSheetMajorError: string | null;

    // Groupwise State
    balanceSheetGroupList: BalanceSheetGroupItem[];
    balanceSheetGroupLoading: boolean;
    balanceSheetGroupError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: BalanceSheetState = {
    balanceSheetMajorList: [],
    balanceSheetMajorLoading: false,
    balanceSheetMajorError: null,

    balanceSheetGroupList: [],
    balanceSheetGroupLoading: false,
    balanceSheetGroupError: null,
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

/**
 * Fetch Balance Sheet - Major Groupwise
 * Endpoint: /service/api/Voucher/GetBalanceSheetMajorGroupwise
 */
export const fetchBalanceSheetMajorGroupwise = createAsyncThunk<
    BalanceSheetMajorGroupItem[],
    FetchBalanceSheetParams,
    { state: RootState; rejectValue: string }
>(
    "balanceSheet/fetchBalanceSheetMajorGroupwise",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const mode = params.mode ?? 2;
        const branchId = params.branchId ?? 1;
        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const queryParams = new URLSearchParams({
                Mode: String(mode),
                branchId: String(branchId),
                companyId: String(companyId),
                fromDate: params.fromDate,
                toDate: params.toDate,
            });

            const url = `https://erp.glitzit.com/service/api/Voucher/GetBalanceSheetMajorGroupwise?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<BalanceSheetMajorGroupItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch major groupwise balance sheet.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

/**
 * Fetch Balance Sheet - Groupwise
 * Endpoint: /service/api/Voucher/GetBalanceSheetGroupwise
 */
export const fetchBalanceSheetGroupwise = createAsyncThunk<
    BalanceSheetGroupItem[],
    FetchBalanceSheetParams,
    { state: RootState; rejectValue: string }
>(
    "balanceSheet/fetchBalanceSheetGroupwise",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const mode = params.mode ?? 2;
        const branchId = params.branchId ?? 1;
        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const queryParams = new URLSearchParams({
                Mode: String(mode),
                branchId: String(branchId),
                companyId: String(companyId),
                fromDate: params.fromDate,
                toDate: params.toDate,
            });

            const url = `https://erp.glitzit.com/service/api/Voucher/GetBalanceSheetGroupwise?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<BalanceSheetGroupItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch groupwise balance sheet.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const balanceSheetSlice = createSlice({
    name: "balanceSheet",
    initialState,
    reducers: {
        clearBalanceSheetMajor(state) {
            state.balanceSheetMajorList = [];
            state.balanceSheetMajorError = null;
        },
        clearBalanceSheetGroup(state) {
            state.balanceSheetGroupList = [];
            state.balanceSheetGroupError = null;
        },
        resetBalanceSheet() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Major Groupwise ---
            .addCase(fetchBalanceSheetMajorGroupwise.pending, (state) => {
                state.balanceSheetMajorLoading = true;
                state.balanceSheetMajorError = null;
            })
            .addCase(fetchBalanceSheetMajorGroupwise.fulfilled, (state, action) => {
                state.balanceSheetMajorLoading = false;
                state.balanceSheetMajorList = action.payload;
            })
            .addCase(fetchBalanceSheetMajorGroupwise.rejected, (state, action) => {
                state.balanceSheetMajorLoading = false;
                state.balanceSheetMajorError = action.payload ?? "Unknown error";
            })

            // --- Groupwise ---
            .addCase(fetchBalanceSheetGroupwise.pending, (state) => {
                state.balanceSheetGroupLoading = true;
                state.balanceSheetGroupError = null;
            })
            .addCase(fetchBalanceSheetGroupwise.fulfilled, (state, action) => {
                state.balanceSheetGroupLoading = false;
                state.balanceSheetGroupList = action.payload;
            })
            .addCase(fetchBalanceSheetGroupwise.rejected, (state, action) => {
                state.balanceSheetGroupLoading = false;
                state.balanceSheetGroupError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearBalanceSheetMajor,
    clearBalanceSheetGroup,
    resetBalanceSheet,
} = balanceSheetSlice.actions;

export default balanceSheetSlice.reducer;
