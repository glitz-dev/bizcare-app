import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /AccMajorGroupM/GetAllMajorGroups
// Returns a flat array (no Server envelope wrapper).
// Note: MajorGroupShName comes back with trailing padding spaces (e.g. "E  ").
export interface MajorGroupItem {
    MajorGroupID: number;
    MajorGroupName: string;
    MajorGroupShName: string;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchMajorGroupsParams {
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface MajorGroupState {
    majorGroupList: MajorGroupItem[];
    majorGroupListLoading: boolean;
    majorGroupListError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: MajorGroupState = {
    majorGroupList: [],
    majorGroupListLoading: false,
    majorGroupListError: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    const authState = state as RootState;
    let token = (authState.auth as any)?.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

const getCompanyId = (state: RootState): number => {
    const authState = state as RootState;
    const companyId =
        (authState.auth as any)?.userData?.companyId ??
        (authState.auth as any)?.userData?.CompanyID ??
        localStorage.getItem("companyId");
    return companyId ? Number(companyId) : 1;
};

const getFinYearId = (state: RootState): number => {
    const authState = state as RootState;
    const finYearId =
        (authState.auth as any)?.userData?.finYearId ??
        (authState.auth as any)?.userData?.FinYearID ??
        localStorage.getItem("finYearId");
    return finYearId ? Number(finYearId) : 2;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// 1. GetAllMajorGroups — flat array response (no envelope)
export const fetchMajorGroups = createAsyncThunk<
    MajorGroupItem[],
    FetchMajorGroupsParams | void,
    { state: RootState; rejectValue: string }
>(
    "majorGroup/fetchMajorGroups",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccMajorGroupM/GetAllMajorGroups`;

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

            const json: MajorGroupItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const majorGroupSlice = createSlice({
    name: "majorGroup",
    initialState,
    reducers: {
        clearMajorGroupList(state) {
            state.majorGroupList = [];
            state.majorGroupListError = null;
        },
        resetMajorGroup() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllMajorGroups
            .addCase(fetchMajorGroups.pending, (state) => {
                state.majorGroupListLoading = true;
                state.majorGroupListError = null;
            })
            .addCase(fetchMajorGroups.fulfilled, (state, action) => {
                state.majorGroupListLoading = false;
                state.majorGroupList = action.payload;
            })
            .addCase(fetchMajorGroups.rejected, (state, action) => {
                state.majorGroupListLoading = false;
                state.majorGroupListError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const { clearMajorGroupList, resetMajorGroup } = majorGroupSlice.actions;

export default majorGroupSlice.reducer;
