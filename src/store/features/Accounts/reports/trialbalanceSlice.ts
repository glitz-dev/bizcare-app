import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrialBalanceGroupItem {
    sorder: number;
    AcGroupName: string;
    AcGroupID: number;
    DebitOpBalance: string;
    CreditOpBalance: string;
    CurrDebit: string;
    CurrCredit: string;
    CurrClosing: string;           // e.g. "117084.93 CR"
    DebitCloBalance: string;
    CreditCloBalance: string;
    ParentGroup: string | null;
    Company: string;
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

export interface FetchTrialBalanceParams {
    fromDate: string;              // "01-04-2024"
    toDate: string;                // "22-07-2026"
    companyId?: number;            // spUrl param 3 — default 1
    branchId?: number;             // spUrl param 4 — default 1
    finYearId?: number;            // spUrl param 5 — default 2
    isHeadwise?: boolean;          // selects SP: spTrialBalanceCommon_Headwise vs _Groupwise — default false
    cumulative?: boolean;          // spUrl boolean param — default false
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface TrialBalanceState {
    trialBalanceList: TrialBalanceGroupItem[];
    trialBalanceLoading: boolean;
    trialBalanceError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: TrialBalanceState = {
    trialBalanceList: [],
    trialBalanceLoading: false,
    trialBalanceError: null,
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

export const fetchTrialBalance = createAsyncThunk<
    TrialBalanceGroupItem[],
    FetchTrialBalanceParams,
    { state: RootState; rejectValue: string }
>(
    "trialBalance/fetchTrialBalance",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const branchId = params.branchId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const isHeadwise = params.isHeadwise ?? false;
        const cumulative = params.cumulative ?? false;

        try {
            const spName = isHeadwise ? "spTrialBalanceCommon_Headwise" : "spTrialBalanceCommon_Groupwise";
            let spUrl = `${spName} '${params.fromDate}', '${params.toDate}', '${companyId}', '${branchId}','${finYearId}',${cumulative}`;
            // Headwise + cumulative carries an extra trailing boolean param in the confirmed API call
            spUrl += isHeadwise && cumulative ? ", false" : " ";

            // Encode to match the exact format the backend expects: spaces -> '+', quotes -> '%27'.
            // Do NOT use URLSearchParams/URL.searchParams here — it percent-encodes commas as %2C,
            // which the backend does not parse the same way as a literal comma.
            const encodedSpUrl = spUrl.replace(/ /g, "+").replace(/'/g, "%27");
            const url = `https://erp.glitzit.com/service/api/Utils/GetReportDataWithLoadedCompany?spUrl=${encodedSpUrl}`;

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

            const json: ApiResponseWrapper<TrialBalanceGroupItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch trial balance.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const trialBalanceSlice = createSlice({
    name: "trialBalance",
    initialState,
    reducers: {
        clearTrialBalance(state) {
            state.trialBalanceList = [];
            state.trialBalanceError = null;
        },
        resetTrialBalance() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Trial Balance Groupwise / Headwise (both plain & cumulative variants
            // route through this same thunk, differentiated by params)
            .addCase(fetchTrialBalance.pending, (state) => {
                state.trialBalanceLoading = true;
                state.trialBalanceError = null;
            })
            .addCase(fetchTrialBalance.fulfilled, (state, action) => {
                state.trialBalanceLoading = false;
                state.trialBalanceList = action.payload;
            })
            .addCase(fetchTrialBalance.rejected, (state, action) => {
                state.trialBalanceLoading = false;
                state.trialBalanceError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const { clearTrialBalance, resetTrialBalance } = trialBalanceSlice.actions;

export default trialBalanceSlice.reducer;
