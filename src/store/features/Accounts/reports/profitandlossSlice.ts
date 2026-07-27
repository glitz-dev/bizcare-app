import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UnclosedFinancialYear {
    FinYearName: string;
    FinYearID: number;
    FromDate: string;
    ToDate: string;
}

export interface FetchUnclosedFinancialYearParams {
    companyId?: number;
    finYearId?: number;
}

export interface PandLGroupItem {
    AcGroupName: string;
    NetBalance: number;
    OpeningStock: number;
    ClosingStock: number;
    LinkGroupID: number;
    MajourGroupID: number;
    MajorGroupName: string | null;
    CompanyName: string;
    BranchName: string;
    LinkGroup: string;
}

export interface FetchPandLReportGroupwiseParams {
    fromDate: string;              // "2024-04-01"
    toDate: string;                // "2026-07-30"
    companyId?: number;            // default 1
    branchId?: number;             // default 1
    finYearId?: number;            // header only — default 2
    rMode?: number;                // RMode — default 2
    rateType?: string;             // RateType — default "PurchaseRate"
    reportName?: string;           // ReportName — default "PandLreport1"
    showStockVal?: boolean;        // ShowStockVal — default false
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

export interface ProfitAndLossState {
    unclosedFinYear: UnclosedFinancialYear | null;
    unclosedFinYearLoading: boolean;
    unclosedFinYearError: string | null;
    pandLGroupwiseList: PandLGroupItem[];
    pandLGroupwiseLoading: boolean;
    pandLGroupwiseError: string | null;
}

const initialState: ProfitAndLossState = {
    unclosedFinYear: null,
    unclosedFinYearLoading: false,
    unclosedFinYearError: null,
    pandLGroupwiseList: [],
    pandLGroupwiseLoading: false,
    pandLGroupwiseError: null,
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

export const fetchUnclosedFinancialYear = createAsyncThunk<
    UnclosedFinancialYear,
    FetchUnclosedFinancialYearParams | void,
    { state: RootState; rejectValue: string }
>(
    "profitAndLoss/fetchUnclosedFinancialYear",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/CommonUtility/GetUnclosedFinancialYear",
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

            const json: ServerResponse<UnclosedFinancialYear> = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch unclosed financial year");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPandLReportGroupwise = createAsyncThunk<
    PandLGroupItem[],
    FetchPandLReportGroupwiseParams,
    { state: RootState; rejectValue: string }
>(
    "profitAndLoss/fetchPandLReportGroupwise",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const branchId = params.branchId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const rMode = params.rMode ?? 2;
        const rateType = params.rateType ?? "PurchaseRate";
        const reportName = params.reportName ?? "PandLreport1";
        const showStockVal = params.showStockVal ?? false;

        try {
            const query = new URLSearchParams({
                RMode: String(rMode),
                RateType: rateType,
                ReportName: reportName,
                ShowStockVal: String(showStockVal),
                branchId: String(branchId),
                companyId: String(companyId),
                fromDate: params.fromDate,
                toDate: params.toDate,
            });

            const url = `https://erp.glitzit.com/service/api/Voucher/GetPandLReportGroupwise?${query.toString()}`;

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

            const json: ServerResponse<PandLGroupItem[]> = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch profit and loss report");
            }

            return json.Server.Data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const profitAndLossSlice = createSlice({
    name: "profitAndLoss",
    initialState,
    reducers: {
        clearUnclosedFinYear: (state) => {
            state.unclosedFinYear = null;
            state.unclosedFinYearError = null;
        },
        clearPandLGroupwise: (state) => {
            state.pandLGroupwiseList = [];
            state.pandLGroupwiseError = null;
        },
        clearProfitAndLossState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUnclosedFinancialYear.pending, (state) => {
                state.unclosedFinYearLoading = true;
                state.unclosedFinYearError = null;
            })
            .addCase(fetchUnclosedFinancialYear.fulfilled, (state, action) => {
                state.unclosedFinYearLoading = false;
                state.unclosedFinYear = action.payload;
            })
            .addCase(fetchUnclosedFinancialYear.rejected, (state, action) => {
                state.unclosedFinYearLoading = false;
                state.unclosedFinYearError = action.payload ?? "Unknown error";
            })
            .addCase(fetchPandLReportGroupwise.pending, (state) => {
                state.pandLGroupwiseLoading = true;
                state.pandLGroupwiseError = null;
            })
            .addCase(fetchPandLReportGroupwise.fulfilled, (state, action) => {
                state.pandLGroupwiseLoading = false;
                state.pandLGroupwiseList = action.payload;
            })
            .addCase(fetchPandLReportGroupwise.rejected, (state, action) => {
                state.pandLGroupwiseLoading = false;
                state.pandLGroupwiseError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const { clearUnclosedFinYear, clearPandLGroupwise, clearProfitAndLossState } =
    profitAndLossSlice.actions;

export default profitAndLossSlice.reducer;
