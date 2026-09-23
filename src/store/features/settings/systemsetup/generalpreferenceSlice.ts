import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /GeneralPreference/GetAllGeneralPreference
// Returns a flat array (no envelope wrapper)
export interface GeneralPreferenceItem {
    Value: string | null;
    PreferenceID: number;
    ModuleName: string;
    FunctionName: string;
    Required: boolean;
    OptionValue: number;
    OptionString: string | null;
    ValueField: string | null;
}

// GET /StockType/GetStockType?Id=...
// Returns a single object (no envelope wrapper)
export interface StockTypeItem {
    TypeID: number;
    TypeName: string;
    TypeDescription: string;
    CompanyID: number;
    BranchID: number;
    FinYearID: number;
    Status: boolean;
    Default: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    TypeGuid: string;
    Common: boolean;
    Active: boolean;
}

// GET /StockType/GetStockTypeStartWith?startWith=...
// Returns a flat array (no envelope wrapper)
export interface StockTypeStartWithItem {
    TypeName: string;
    TypeID: number;
}

// GET /ItemType/GetItemTypeStartWith?startWith=...
// Returns a flat array (no envelope wrapper)
export interface ItemTypeStartWithItem {
    ItemType: string;
    ItemTypeID: number;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchAllGeneralPreferenceParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchStockTypeParams {
    id: number;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchStockTypeStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchItemTypeStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface GeneralPreferenceState {
    generalPreferenceList: GeneralPreferenceItem[];
    generalPreferenceListLoading: boolean;
    generalPreferenceListError: string | null;
    stockType: StockTypeItem | null;
    stockTypeLoading: boolean;
    stockTypeError: string | null;
    stockTypeStartWithList: StockTypeStartWithItem[];
    stockTypeStartWithLoading: boolean;
    stockTypeStartWithError: string | null;
    itemTypeStartWithList: ItemTypeStartWithItem[];
    itemTypeStartWithLoading: boolean;
    itemTypeStartWithError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: GeneralPreferenceState = {
    generalPreferenceList: [],
    generalPreferenceListLoading: false,
    generalPreferenceListError: null,
    stockType: null,
    stockTypeLoading: false,
    stockTypeError: null,
    stockTypeStartWithList: [],
    stockTypeStartWithLoading: false,
    stockTypeStartWithError: null,
    itemTypeStartWithList: [],
    itemTypeStartWithLoading: false,
    itemTypeStartWithError: null,
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

// 1. GetAllGeneralPreference — flat array response (no envelope)
export const fetchAllGeneralPreference = createAsyncThunk<
    GeneralPreferenceItem[],
    FetchAllGeneralPreferenceParams | void,
    { state: RootState; rejectValue: string }
>(
    "generalPreference/fetchAllGeneralPreference",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/GeneralPreference/GetAllGeneralPreference`;

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

            const json: GeneralPreferenceItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetStockType — single object response (no envelope)
export const fetchStockType = createAsyncThunk<
    StockTypeItem,
    FetchStockTypeParams,
    { state: RootState; rejectValue: string }
>(
    "generalPreference/fetchStockType",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/StockType/GetStockType?Id=${params.id}`;

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

            const json: StockTypeItem = await response.json();

            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetStockTypeStartWith — flat array response (no envelope)
export const fetchStockTypeStartWith = createAsyncThunk<
    StockTypeStartWithItem[],
    FetchStockTypeStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "generalPreference/fetchStockTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/StockType/GetStockTypeStartWith?startWith=${encodeURIComponent(
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

            const json: StockTypeStartWithItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetItemTypeStartWith — flat array response (no envelope)
export const fetchItemTypeStartWith = createAsyncThunk<
    ItemTypeStartWithItem[],
    FetchItemTypeStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "generalPreference/fetchItemTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/ItemType/GetItemTypeStartWith?startWith=${encodeURIComponent(
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

            const json: ItemTypeStartWithItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const generalPreferenceSlice = createSlice({
    name: "generalPreference",
    initialState,
    reducers: {
        clearGeneralPreferenceList(state) {
            state.generalPreferenceList = [];
            state.generalPreferenceListError = null;
        },
        clearStockType(state) {
            state.stockType = null;
            state.stockTypeError = null;
        },
        clearStockTypeStartWithList(state) {
            state.stockTypeStartWithList = [];
            state.stockTypeStartWithError = null;
        },
        clearItemTypeStartWithList(state) {
            state.itemTypeStartWithList = [];
            state.itemTypeStartWithError = null;
        },
        resetGeneralPreference() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllGeneralPreference
            .addCase(fetchAllGeneralPreference.pending, (state) => {
                state.generalPreferenceListLoading = true;
                state.generalPreferenceListError = null;
            })
            .addCase(fetchAllGeneralPreference.fulfilled, (state, action) => {
                state.generalPreferenceListLoading = false;
                state.generalPreferenceList = action.payload;
            })
            .addCase(fetchAllGeneralPreference.rejected, (state, action) => {
                state.generalPreferenceListLoading = false;
                state.generalPreferenceListError = action.payload ?? "Unknown error";
            })
            // GetStockType
            .addCase(fetchStockType.pending, (state) => {
                state.stockTypeLoading = true;
                state.stockTypeError = null;
            })
            .addCase(fetchStockType.fulfilled, (state, action) => {
                state.stockTypeLoading = false;
                state.stockType = action.payload;
            })
            .addCase(fetchStockType.rejected, (state, action) => {
                state.stockTypeLoading = false;
                state.stockTypeError = action.payload ?? "Unknown error";
            })
            // GetStockTypeStartWith
            .addCase(fetchStockTypeStartWith.pending, (state) => {
                state.stockTypeStartWithLoading = true;
                state.stockTypeStartWithError = null;
            })
            .addCase(fetchStockTypeStartWith.fulfilled, (state, action) => {
                state.stockTypeStartWithLoading = false;
                state.stockTypeStartWithList = action.payload;
            })
            .addCase(fetchStockTypeStartWith.rejected, (state, action) => {
                state.stockTypeStartWithLoading = false;
                state.stockTypeStartWithError = action.payload ?? "Unknown error";
            })
            // GetItemTypeStartWith
            .addCase(fetchItemTypeStartWith.pending, (state) => {
                state.itemTypeStartWithLoading = true;
                state.itemTypeStartWithError = null;
            })
            .addCase(fetchItemTypeStartWith.fulfilled, (state, action) => {
                state.itemTypeStartWithLoading = false;
                state.itemTypeStartWithList = action.payload;
            })
            .addCase(fetchItemTypeStartWith.rejected, (state, action) => {
                state.itemTypeStartWithLoading = false;
                state.itemTypeStartWithError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearGeneralPreferenceList,
    clearStockType,
    clearStockTypeStartWithList,
    clearItemTypeStartWithList,
    resetGeneralPreference,
} = generalPreferenceSlice.actions;

export default generalPreferenceSlice.reducer;
