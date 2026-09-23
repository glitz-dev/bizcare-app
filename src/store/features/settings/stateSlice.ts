import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StateListItem {
    StateID: number;
    StateName: string;
    StateCode: string;
    StateNumber: string;
    Active: "Active" | "InActive";
}

export interface CountryStartWithItem {
    CountryName: string;
    CountryID: number;
}

export interface CreateStatePayload {
    StateID: number;
    StateName: string;
    StateCode: string;
    StateNumber: string;
    CountryID: number;
    CountryName: string;
    Common: boolean;
    Active: boolean;
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface FetchAllStatesParams {
    companyId?: number;
    finYearId?: number;
}

export interface FetchCountryStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface CheckStateDuplicationParams {
    stateName: string;
    stateId?: number;
    companyId?: number;
    finYearId?: number;
}

export interface CreateNewStateParams {
    payload: CreateStatePayload;
    companyId?: number;
    finYearId?: number;
}

// Params for delete
export interface DeleteStateParams {
    stateId: number;
    modUserId?: number; // default 1
    companyId?: number; // default 1
    finYearId?: number; // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface StateState {
    stateList: StateListItem[];
    stateListLoading: boolean;
    stateListError: string | null;

    countryList: CountryStartWithItem[];
    countryListLoading: boolean;
    countryListError: string | null;

    isDuplicateState: boolean | null;
    duplicateCheckLoading: boolean;
    duplicateCheckError: string | null;

    createStateLoading: boolean;
    createStateError: string | null;
    createStateSuccess: boolean;

    // Delete state
    deleteStateLoading: boolean;
    deleteStateError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: StateState = {
    stateList: [],
    stateListLoading: false,
    stateListError: null,

    countryList: [],
    countryListLoading: false,
    countryListError: null,

    isDuplicateState: null,
    duplicateCheckLoading: false,
    duplicateCheckError: null,

    createStateLoading: false,
    createStateError: null,
    createStateSuccess: false,

    deleteStateLoading: false,
    deleteStateError: null,
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

export const fetchAllStates = createAsyncThunk<
    StateListItem[],
    FetchAllStatesParams | void,
    { state: RootState; rejectValue: string }
>(
    "state/fetchAllStates",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/State/GetAllStates`;

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

            const data: StateListItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCountryStartWith = createAsyncThunk<
    CountryStartWithItem[],
    FetchCountryStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "state/fetchCountryStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/CompanyAdditionalDetails/GetCountryStartWith?startWith=${encodeURIComponent(
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

            const data: CountryStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const checkStateDuplication = createAsyncThunk<
    boolean,
    CheckStateDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "state/checkStateDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const stateId = params.stateId ?? 0;

        try {
            const url = `https://erp.glitzit.com/service/api/State/CheckDuplication?StateName=${encodeURIComponent(
                params.stateName
            )}&StateID=${stateId}`;

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

export const createNewState = createAsyncThunk<
    void,
    CreateNewStateParams,
    { state: RootState; rejectValue: string }
>(
    "state/createNewState",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/State/CreateNewState`;

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
                return rejectWithValue(text || "Failed to create state.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const deleteState = createAsyncThunk<
    string,
    DeleteStateParams,
    { state: RootState; rejectValue: string }
>(
    "state/deleteState",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const modUserId = params.modUserId ?? 1;

        try {
            const url = `https://erp.glitzit.com/service/api/State/DeleteState?ID=${params.stateId}&ModUserID=${modUserId}`;

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

            // API returns "0" for success based on your prompt. We'll simply return the raw text.
            const text = (await response.text()).trim();
            return text;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const stateSlice = createSlice({
    name: "state",
    initialState,
    reducers: {
        clearStateList(state) {
            state.stateList = [];
            state.stateListError = null;
        },
        clearCountryStartWith(state) {
            state.countryList = [];
            state.countryListError = null;
        },
        clearDuplicateCheck(state) {
            state.isDuplicateState = null;
            state.duplicateCheckError = null;
        },
        clearCreateStateStatus(state) {
            state.createStateError = null;
            state.createStateSuccess = false;
        },
        resetState() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllStates
            .addCase(fetchAllStates.pending, (state) => {
                state.stateListLoading = true;
                state.stateListError = null;
            })
            .addCase(fetchAllStates.fulfilled, (state, action) => {
                state.stateListLoading = false;
                state.stateList = action.payload;
            })
            .addCase(fetchAllStates.rejected, (state, action) => {
                state.stateListLoading = false;
                state.stateListError = action.payload ?? "Unknown error";
            })

            // GetCountryStartWith
            .addCase(fetchCountryStartWith.pending, (state) => {
                state.countryListLoading = true;
                state.countryListError = null;
            })
            .addCase(fetchCountryStartWith.fulfilled, (state, action) => {
                state.countryListLoading = false;
                state.countryList = action.payload;
            })
            .addCase(fetchCountryStartWith.rejected, (state, action) => {
                state.countryListLoading = false;
                state.countryListError = action.payload ?? "Unknown error";
            })

            // CheckDuplication
            .addCase(checkStateDuplication.pending, (state) => {
                state.duplicateCheckLoading = true;
                state.duplicateCheckError = null;
            })
            .addCase(checkStateDuplication.fulfilled, (state, action) => {
                state.duplicateCheckLoading = false;
                state.isDuplicateState = action.payload;
            })
            .addCase(checkStateDuplication.rejected, (state, action) => {
                state.duplicateCheckLoading = false;
                state.duplicateCheckError = action.payload ?? "Unknown error";
            })

            // CreateNewState
            .addCase(createNewState.pending, (state) => {
                state.createStateLoading = true;
                state.createStateError = null;
                state.createStateSuccess = false;
            })
            .addCase(createNewState.fulfilled, (state) => {
                state.createStateLoading = false;
                state.createStateSuccess = true;
            })
            .addCase(createNewState.rejected, (state, action) => {
                state.createStateLoading = false;
                state.createStateError = action.payload ?? "Unknown error";
            })

            // DeleteState
            .addCase(deleteState.pending, (state) => {
                state.deleteStateLoading = true;
                state.deleteStateError = null;
            })
            .addCase(deleteState.fulfilled, (state) => {
                state.deleteStateLoading = false;
            })
            .addCase(deleteState.rejected, (state, action) => {
                state.deleteStateLoading = false;
                state.deleteStateError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearStateList,
    clearCountryStartWith,
    clearDuplicateCheck,
    clearCreateStateStatus,
    resetState,
} = stateSlice.actions;

export default stateSlice.reducer;
