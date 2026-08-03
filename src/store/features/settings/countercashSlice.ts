import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /CounterCashTransaction/GetShiftsStartWith/?startWith=...
// Returns a plain array (no envelope)
export interface ShiftStartWithItem {
    ShiftName: string;
    ShiftID: number;
}

// GET /CounterCashTransaction/GetMachineCodesStartWith/?startWith=...
// Returns a plain array (no envelope)
export interface MachineCodeStartWithItem {
    MachineCode: string;
    MachineID: number;
}

// GET /CounterCashTransaction/GetUserStartWith/?startWith=...
// Returns a plain array (no envelope)
export interface UserStartWithItem {
    UserName: string;
    UserID: number;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchShiftsStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchMachineCodesStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchUserStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface CounterCashState {
    shiftList: ShiftStartWithItem[];
    shiftListLoading: boolean;
    shiftListError: string | null;

    machineCodeList: MachineCodeStartWithItem[];
    machineCodeListLoading: boolean;
    machineCodeListError: string | null;

    userList: UserStartWithItem[];
    userListLoading: boolean;
    userListError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: CounterCashState = {
    shiftList: [],
    shiftListLoading: false,
    shiftListError: null,

    machineCodeList: [],
    machineCodeListLoading: false,
    machineCodeListError: null,

    userList: [],
    userListLoading: false,
    userListError: null,
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

// 1. GetShiftsStartWith — plain array response
export const fetchShiftsStartWith = createAsyncThunk<
    ShiftStartWithItem[],
    FetchShiftsStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "counterCash/fetchShiftsStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/CounterCashTransaction/GetShiftsStartWith/?startWith=${encodeURIComponent(
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

            const data: ShiftStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetMachineCodesStartWith — plain array response
export const fetchMachineCodesStartWith = createAsyncThunk<
    MachineCodeStartWithItem[],
    FetchMachineCodesStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "counterCash/fetchMachineCodesStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/CounterCashTransaction/GetMachineCodesStartWith/?startWith=${encodeURIComponent(
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

            const data: MachineCodeStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetUserStartWith — plain array response
export const fetchUserStartWith = createAsyncThunk<
    UserStartWithItem[],
    FetchUserStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "counterCash/fetchUserStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/CounterCashTransaction/GetUserStartWith/?startWith=${encodeURIComponent(
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

            const data: UserStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const countercashSlice = createSlice({
    name: "counterCash",
    initialState,
    reducers: {
        clearShiftsStartWith(state) {
            state.shiftList = [];
            state.shiftListError = null;
        },
        clearMachineCodesStartWith(state) {
            state.machineCodeList = [];
            state.machineCodeListError = null;
        },
        clearUserStartWith(state) {
            state.userList = [];
            state.userListError = null;
        },
        resetCounterCash() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetShiftsStartWith
            .addCase(fetchShiftsStartWith.pending, (state) => {
                state.shiftListLoading = true;
                state.shiftListError = null;
            })
            .addCase(fetchShiftsStartWith.fulfilled, (state, action) => {
                state.shiftListLoading = false;
                state.shiftList = action.payload;
            })
            .addCase(fetchShiftsStartWith.rejected, (state, action) => {
                state.shiftListLoading = false;
                state.shiftListError = action.payload ?? "Unknown error";
            })

            // GetMachineCodesStartWith
            .addCase(fetchMachineCodesStartWith.pending, (state) => {
                state.machineCodeListLoading = true;
                state.machineCodeListError = null;
            })
            .addCase(fetchMachineCodesStartWith.fulfilled, (state, action) => {
                state.machineCodeListLoading = false;
                state.machineCodeList = action.payload;
            })
            .addCase(fetchMachineCodesStartWith.rejected, (state, action) => {
                state.machineCodeListLoading = false;
                state.machineCodeListError = action.payload ?? "Unknown error";
            })

            // GetUserStartWith
            .addCase(fetchUserStartWith.pending, (state) => {
                state.userListLoading = true;
                state.userListError = null;
            })
            .addCase(fetchUserStartWith.fulfilled, (state, action) => {
                state.userListLoading = false;
                state.userList = action.payload;
            })
            .addCase(fetchUserStartWith.rejected, (state, action) => {
                state.userListLoading = false;
                state.userListError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearShiftsStartWith,
    clearMachineCodesStartWith,
    clearUserStartWith,
    resetCounterCash,
} = countercashSlice.actions;

export default countercashSlice.reducer;
