import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /Currency/GetCurrencyStartwith/?startWith=...
// Returns an envelope-wrapped array
export interface CurrencyStartWithItem {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

// GET /Company/GetTimeZoneStartWith/?startWith=...
// Returns a plain array (no envelope)
export interface TimeZoneStartWithItem {
    TimeZoneDesc: string;
    TimeZoneID: number;
}

// GET /Branch/CheckDuplication?BranchCode=...&BranchName=...&BranchID=...
// Returns a plain boolean (true = duplicate exists)

// POST /Branch/CreateNewBranch
// Returns plain text "OK" on success (no JSON envelope)
export interface CreateBranchPayload {
    BranchID: number;              // 0 for new branch
    BranchCode: string;
    BranchName: string;
    ShortName: string;
    PhoneNo: string;
    Address: string;
    Currency: string;
    CurrencyID: number;
    TimeZoneDesc: string;
    TimeZoneID: number;
    GSTIN: string;
    LogoPath: string;
    TaxApplicable: boolean;
}

// GET /Branch/GetAllBranch
// Returns a plain array (no envelope)
export interface BranchListItem {
    BranchID: number;
    BranchName: string;
    BranchCode: string;
    TimeZoneID: number;
    Address: string | null;
    ShortName: string | null;
    CurrencyID: number;
    PhoneNo: string | null;
    LogoPath: string | null;
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

export interface FetchCurrencyStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchTimeZoneStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface CheckBranchDuplicationParams {
    branchCode: string;
    branchName: string;
    branchId?: number;             // default 0
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface CreateNewBranchParams {
    payload: CreateBranchPayload;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchAllBranchesParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface BranchState {
    currencyList: CurrencyStartWithItem[];
    currencyLoading: boolean;
    currencyError: string | null;

    timeZoneList: TimeZoneStartWithItem[];
    timeZoneLoading: boolean;
    timeZoneError: string | null;

    isDuplicateBranch: boolean | null;
    duplicateCheckLoading: boolean;
    duplicateCheckError: string | null;

    createBranchLoading: boolean;
    createBranchError: string | null;
    createBranchSuccess: boolean;

    branchList: BranchListItem[];
    branchListLoading: boolean;
    branchListError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: BranchState = {
    currencyList: [],
    currencyLoading: false,
    currencyError: null,

    timeZoneList: [],
    timeZoneLoading: false,
    timeZoneError: null,

    isDuplicateBranch: null,
    duplicateCheckLoading: false,
    duplicateCheckError: null,

    createBranchLoading: false,
    createBranchError: null,
    createBranchSuccess: false,

    branchList: [],
    branchListLoading: false,
    branchListError: null,
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

// 1. GetCurrencyStartwith — envelope-wrapped response
export const fetchCurrencyStartWith = createAsyncThunk<
    CurrencyStartWithItem[],
    FetchCurrencyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "branch/fetchCurrencyStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/GetCurrencyStartwith/?startWith=${encodeURIComponent(
                startWith
            )}`;

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

            const json: ApiResponseWrapper<CurrencyStartWithItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currencies.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetTimeZoneStartWith — plain array response
export const fetchTimeZoneStartWith = createAsyncThunk<
    TimeZoneStartWithItem[],
    FetchTimeZoneStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "branch/fetchTimeZoneStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/Company/GetTimeZoneStartWith/?startWith=${encodeURIComponent(
                startWith
            )}`;

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

            const data: TimeZoneStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. CheckDuplication — plain boolean response
export const checkBranchDuplication = createAsyncThunk<
    boolean,
    CheckBranchDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "branch/checkBranchDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const branchId = params.branchId ?? 0;

        try {
            const url = `https://erp.glitzit.com/service/api/Branch/CheckDuplication?BranchCode=${encodeURIComponent(
                params.branchCode
            )}&BranchName=${encodeURIComponent(params.branchName)}&BranchID=${branchId}`;

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

// 4. CreateNewBranch — plain text "OK" response (no envelope)
export const createNewBranch = createAsyncThunk<
    void,
    CreateNewBranchParams,
    { state: RootState; rejectValue: string }
>(
    "branch/createNewBranch",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Branch/CreateNewBranch`;

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
                return rejectWithValue(text || "Failed to create branch.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. GetAllBranch — plain array response
export const fetchAllBranches = createAsyncThunk<
    BranchListItem[],
    FetchAllBranchesParams | void,
    { state: RootState; rejectValue: string }
>(
    "branch/fetchAllBranches",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Branch/GetAllBranch`;

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

            const data: BranchListItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const branchSlice = createSlice({
    name: "branch",
    initialState,
    reducers: {
        clearCurrencyStartWith(state) {
            state.currencyList = [];
            state.currencyError = null;
        },
        clearTimeZoneStartWith(state) {
            state.timeZoneList = [];
            state.timeZoneError = null;
        },
        clearDuplicateCheck(state) {
            state.isDuplicateBranch = null;
            state.duplicateCheckError = null;
        },
        clearCreateBranchStatus(state) {
            state.createBranchError = null;
            state.createBranchSuccess = false;
        },
        clearBranchList(state) {
            state.branchList = [];
            state.branchListError = null;
        },
        resetBranch() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetCurrencyStartwith
            .addCase(fetchCurrencyStartWith.pending, (state) => {
                state.currencyLoading = true;
                state.currencyError = null;
            })
            .addCase(fetchCurrencyStartWith.fulfilled, (state, action) => {
                state.currencyLoading = false;
                state.currencyList = action.payload;
            })
            .addCase(fetchCurrencyStartWith.rejected, (state, action) => {
                state.currencyLoading = false;
                state.currencyError = action.payload ?? "Unknown error";
            })

            // GetTimeZoneStartWith
            .addCase(fetchTimeZoneStartWith.pending, (state) => {
                state.timeZoneLoading = true;
                state.timeZoneError = null;
            })
            .addCase(fetchTimeZoneStartWith.fulfilled, (state, action) => {
                state.timeZoneLoading = false;
                state.timeZoneList = action.payload;
            })
            .addCase(fetchTimeZoneStartWith.rejected, (state, action) => {
                state.timeZoneLoading = false;
                state.timeZoneError = action.payload ?? "Unknown error";
            })

            // CheckDuplication
            .addCase(checkBranchDuplication.pending, (state) => {
                state.duplicateCheckLoading = true;
                state.duplicateCheckError = null;
            })
            .addCase(checkBranchDuplication.fulfilled, (state, action) => {
                state.duplicateCheckLoading = false;
                state.isDuplicateBranch = action.payload;
            })
            .addCase(checkBranchDuplication.rejected, (state, action) => {
                state.duplicateCheckLoading = false;
                state.duplicateCheckError = action.payload ?? "Unknown error";
            })

            // CreateNewBranch
            .addCase(createNewBranch.pending, (state) => {
                state.createBranchLoading = true;
                state.createBranchError = null;
                state.createBranchSuccess = false;
            })
            .addCase(createNewBranch.fulfilled, (state) => {
                state.createBranchLoading = false;
                state.createBranchSuccess = true;
            })
            .addCase(createNewBranch.rejected, (state, action) => {
                state.createBranchLoading = false;
                state.createBranchError = action.payload ?? "Unknown error";
            })

            // GetAllBranch
            .addCase(fetchAllBranches.pending, (state) => {
                state.branchListLoading = true;
                state.branchListError = null;
            })
            .addCase(fetchAllBranches.fulfilled, (state, action) => {
                state.branchListLoading = false;
                state.branchList = action.payload;
            })
            .addCase(fetchAllBranches.rejected, (state, action) => {
                state.branchListLoading = false;
                state.branchListError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearCurrencyStartWith,
    clearTimeZoneStartWith,
    clearDuplicateCheck,
    clearCreateBranchStatus,
    clearBranchList,
    resetBranch,
} = branchSlice.actions;

export default branchSlice.reducer;
