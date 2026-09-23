import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaxCategoryListItem {
    TaxCategoryId: number;
    TaxCategoryCode: string;
    TaxCategoryName: string;
}

// POST /TaxCategoryM/CreateNewTaxCategory
// Returns plain text "OK" on success (no JSON envelope)
export interface CreateTaxCategoryPayload {
    TaxCategoryId: number;         // 0 for new tax category
    TaxCategoryCode: string;
    TaxCategoryName: string;
    TaxValue: string;
}

// GET /TaxCategoryM/GetTaxCategory?TaxCategoryId=
// Returns a single tax category object (JSON, no envelope)
export interface TaxCategoryDetail {
    TaxCategoryId: number;
    TaxCategoryCode: string;
    TaxCategoryName: string;
    Description: string | null;
    TaxValue: number;
}

// POST /TaxCategoryM/UpdateTaxCategory
// No response body on success — only HTTP status is checked
export interface UpdateTaxCategoryPayload {
    TaxCategoryId: number;
    TaxCategoryCode: string;
    TaxCategoryName: string;
    Description: string | null;
    TaxValue: number;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchAllTaxCategoriesParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface CheckTaxCategoryDuplicationParams {
    taxCategoryName: string;
    taxCategoryId?: number;        // default 0
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface CreateNewTaxCategoryParams {
    payload: CreateTaxCategoryPayload;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface GetTaxCategoryParams {
    taxCategoryId: number;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface UpdateTaxCategoryParams {
    payload: UpdateTaxCategoryPayload;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface DeleteTaxCategoryParams {
    taxCategoryId: number;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface TaxCategoryState {
    taxCategoryList: TaxCategoryListItem[];
    taxCategoryListLoading: boolean;
    taxCategoryListError: string | null;

    isDuplicateTaxCategory: boolean | null;
    duplicateCheckLoading: boolean;
    duplicateCheckError: string | null;

    createTaxCategoryLoading: boolean;
    createTaxCategoryError: string | null;
    createTaxCategorySuccess: boolean;

    selectedTaxCategory: TaxCategoryDetail | null;
    selectedTaxCategoryLoading: boolean;
    selectedTaxCategoryError: string | null;

    updateTaxCategoryLoading: boolean;
    updateTaxCategoryError: string | null;
    updateTaxCategorySuccess: boolean;

    deleteTaxCategoryLoading: boolean;
    deleteTaxCategoryError: string | null;
    deleteTaxCategorySuccess: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: TaxCategoryState = {
    taxCategoryList: [],
    taxCategoryListLoading: false,
    taxCategoryListError: null,

    isDuplicateTaxCategory: null,
    duplicateCheckLoading: false,
    duplicateCheckError: null,

    createTaxCategoryLoading: false,
    createTaxCategoryError: null,
    createTaxCategorySuccess: false,

    selectedTaxCategory: null,
    selectedTaxCategoryLoading: false,
    selectedTaxCategoryError: null,

    updateTaxCategoryLoading: false,
    updateTaxCategoryError: null,
    updateTaxCategorySuccess: false,

    deleteTaxCategoryLoading: false,
    deleteTaxCategoryError: null,
    deleteTaxCategorySuccess: false,
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

// 1. GetAllTaxCategories — plain array response
export const fetchAllTaxCategories = createAsyncThunk<
    TaxCategoryListItem[],
    FetchAllTaxCategoriesParams | void,
    { state: RootState; rejectValue: string }
>(
    "taxCategory/fetchAllTaxCategories",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/TaxCategoryM/GetAllTaxCategories`;

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

            const data: TaxCategoryListItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. CheckDuplication — plain boolean response
export const checkTaxCategoryDuplication = createAsyncThunk<
    boolean,
    CheckTaxCategoryDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "taxCategory/checkTaxCategoryDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const taxCategoryId = params.taxCategoryId ?? 0;

        try {
            const url = `https://erp.glitzit.com/service/api/TaxCategoryM/CheckDuplication?TaxCategoryName=${encodeURIComponent(
                params.taxCategoryName
            )}&TaxCategoryId=${taxCategoryId}`;

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

// 3. CreateNewTaxCategory — plain text "OK" response (no envelope)
export const createNewTaxCategory = createAsyncThunk<
    void,
    CreateNewTaxCategoryParams,
    { state: RootState; rejectValue: string }
>(
    "taxCategory/createNewTaxCategory",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/TaxCategoryM/CreateNewTaxCategory`;

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
                return rejectWithValue(text || "Failed to create tax category.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetTaxCategory — single object response (no envelope)
export const fetchTaxCategoryById = createAsyncThunk<
    TaxCategoryDetail,
    GetTaxCategoryParams,
    { state: RootState; rejectValue: string }
>(
    "taxCategory/fetchTaxCategoryById",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/TaxCategoryM/GetTaxCategory?TaxCategoryId=${params.taxCategoryId}`;

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

            const data: TaxCategoryDetail = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. UpdateTaxCategory — no response body on success, only HTTP status is checked
export const updateTaxCategory = createAsyncThunk<
    void,
    UpdateTaxCategoryParams,
    { state: RootState; rejectValue: string }
>(
    "taxCategory/updateTaxCategory",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/TaxCategoryM/UpdateTaxCategory`;

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
            // No response body to parse — a 2xx status is treated as success.
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. DeleteTaxCategory — plain text response ("0" = success)
export const deleteTaxCategory = createAsyncThunk<
    number,
    DeleteTaxCategoryParams,
    { state: RootState; rejectValue: string }
>(
    "taxCategory/deleteTaxCategory",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/TaxCategoryM/DeleteTaxCategory?TaxCategoryId=${params.taxCategoryId}`;

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

            // API returns "0" on success; any other value indicates failure.
            if (text !== "0") {
                return rejectWithValue(text || "Failed to delete tax category.");
            }

            return params.taxCategoryId;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const taxCategorySlice = createSlice({
    name: "taxCategory",
    initialState,
    reducers: {
        clearTaxCategoryList(state) {
            state.taxCategoryList = [];
            state.taxCategoryListError = null;  
        },
        clearDuplicateCheck(state) {
            state.isDuplicateTaxCategory = null;
            state.duplicateCheckError = null;
        },
        clearCreateTaxCategoryStatus(state) {
            state.createTaxCategoryError = null;
            state.createTaxCategorySuccess = false;
        },
        clearSelectedTaxCategory(state) {
            state.selectedTaxCategory = null;
            state.selectedTaxCategoryError = null;
        },
        clearUpdateTaxCategoryStatus(state) {
            state.updateTaxCategoryError = null;
            state.updateTaxCategorySuccess = false;
        },
        clearDeleteTaxCategoryStatus(state) {
            state.deleteTaxCategoryError = null;
            state.deleteTaxCategorySuccess = false;
        },
        resetTaxCategory() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllTaxCategories
            .addCase(fetchAllTaxCategories.pending, (state) => {
                state.taxCategoryListLoading = true;
                state.taxCategoryListError = null;
            })
            .addCase(fetchAllTaxCategories.fulfilled, (state, action) => {
                state.taxCategoryListLoading = false;
                state.taxCategoryList = action.payload;
            })
            .addCase(fetchAllTaxCategories.rejected, (state, action) => {
                state.taxCategoryListLoading = false;
                state.taxCategoryListError = action.payload ?? "Unknown error";
            })

            // CheckDuplication
            .addCase(checkTaxCategoryDuplication.pending, (state) => {
                state.duplicateCheckLoading = true;
                state.duplicateCheckError = null;
            })
            .addCase(checkTaxCategoryDuplication.fulfilled, (state, action) => {
                state.duplicateCheckLoading = false;
                state.isDuplicateTaxCategory = action.payload;
            })
            .addCase(checkTaxCategoryDuplication.rejected, (state, action) => {
                state.duplicateCheckLoading = false;
                state.duplicateCheckError = action.payload ?? "Unknown error";
            })

            // CreateNewTaxCategory
            .addCase(createNewTaxCategory.pending, (state) => {
                state.createTaxCategoryLoading = true;
                state.createTaxCategoryError = null;
                state.createTaxCategorySuccess = false;
            })
            .addCase(createNewTaxCategory.fulfilled, (state) => {
                state.createTaxCategoryLoading = false;
                state.createTaxCategorySuccess = true;
            })
            .addCase(createNewTaxCategory.rejected, (state, action) => {
                state.createTaxCategoryLoading = false;
                state.createTaxCategoryError = action.payload ?? "Unknown error";
            })

            // GetTaxCategory
            .addCase(fetchTaxCategoryById.pending, (state) => {
                state.selectedTaxCategoryLoading = true;
                state.selectedTaxCategoryError = null;
            })
            .addCase(fetchTaxCategoryById.fulfilled, (state, action) => {
                state.selectedTaxCategoryLoading = false;
                state.selectedTaxCategory = action.payload;
            })
            .addCase(fetchTaxCategoryById.rejected, (state, action) => {
                state.selectedTaxCategoryLoading = false;
                state.selectedTaxCategoryError = action.payload ?? "Unknown error";
            })

            // UpdateTaxCategory
            .addCase(updateTaxCategory.pending, (state) => {
                state.updateTaxCategoryLoading = true;
                state.updateTaxCategoryError = null;
                state.updateTaxCategorySuccess = false;
            })
            .addCase(updateTaxCategory.fulfilled, (state) => {
                state.updateTaxCategoryLoading = false;
                state.updateTaxCategorySuccess = true;
            })
            .addCase(updateTaxCategory.rejected, (state, action) => {
                state.updateTaxCategoryLoading = false;
                state.updateTaxCategoryError = action.payload ?? "Unknown error";
            })

            // DeleteTaxCategory
            .addCase(deleteTaxCategory.pending, (state) => {
                state.deleteTaxCategoryLoading = true;
                state.deleteTaxCategoryError = null;
                state.deleteTaxCategorySuccess = false;
            })
            .addCase(deleteTaxCategory.fulfilled, (state, action) => {
                state.deleteTaxCategoryLoading = false;
                state.deleteTaxCategorySuccess = true;
                // Optimistically remove the deleted row from the cached list
                state.taxCategoryList = state.taxCategoryList.filter(
                    (item) => item.TaxCategoryId !== action.payload
                );
            })
            .addCase(deleteTaxCategory.rejected, (state, action) => {
                state.deleteTaxCategoryLoading = false;
                state.deleteTaxCategoryError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearTaxCategoryList,
    clearDuplicateCheck,
    clearCreateTaxCategoryStatus,
    clearSelectedTaxCategory,
    clearUpdateTaxCategoryStatus,
    clearDeleteTaxCategoryStatus,
    resetTaxCategory,
} = taxCategorySlice.actions;

export default taxCategorySlice.reducer;
