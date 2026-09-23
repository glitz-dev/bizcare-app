import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GSTCategory {
    GSTCategoryMID: number;
    GSTCategoryName: string;
    HSN: string;
    TaxCategoryName: string;
    TaxCategoryID: number;
    WEFDate: string; // DD-MM-YYYY
}

export interface ItemUnit {
    UnitID: number;
    Unit: string;
    ItemUnitName: string;
}

export interface TaxCategoryOption {
    TaxCategoryId: number;
    TaxCategoryName: string;
}

interface GSTCategoryServerResponse {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: GSTCategory[];
        Id: number;
        Info: unknown;
        Approve: unknown;
    };
}

export interface GSTCategoryDetailItem {
    GSTCategoryTID: number;
    GSTCategoryMID: number;
    GSTCategoryM: null;
    TaxCategoryID: number;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    Status: boolean;
    GSTCategoryTGuid: string;
    WEFDate: string;
    TaxCategoryName: string;
}

export interface GSTCategoryDetail {
    GSTCategoryMID: number;
    GSTCategoryName: string;
    HSN: string;
    UnitID: number | null;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    Status: boolean;
    GSTCategoryMGuid: string;
    CompanyID: number | null;
    BranchID: number | null;
    LstCustomerItems: GSTCategoryDetailItem[];
    ItemUnitName: string | null;
    AllowDuplicateHSN: boolean | null;
}

interface GSTCategoryByIDServerResponse {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: GSTCategoryDetail;
        Id: number;
        Info: unknown;
        Approve: unknown;
    };
}

export interface FetchGSTCategoryByIDParams {
    GSTCategoryMID: number;
}

export interface FetchGSTCategoryParams {
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
}

export interface FetchItemUnitParams {
    searchStr?: string;
}

export interface FetchTaxCategoryParams {
    startWith?: string;
}

export interface SaveGSTCategoryItem {
    TaxCategoryID: number | null;
    TaxCategoryName: string;
    WEFDate?: string;
    WEFDateStr: string;
}

export interface SaveGSTCategoryParams {
    GSTCategoryName: string;
    HSN: string;
    ItemUnitName: string;
    UnitID: number;
    LstCustomerItemDetails: SaveGSTCategoryItem;
    LstCustomerItems: SaveGSTCategoryItem[];
}

interface SaveGSTCategoryServerResponse {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: string;
        Id: number;
        Info: unknown;
        Approve: unknown;
    };
}

export interface UpdateGSTCategoryItem {
    GSTCategoryTID: number;
    GSTCategoryMID: number;
    GSTCategoryM: null;
    TaxCategoryID: number | null;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    Status: boolean;
    GSTCategoryTGuid: string;
    WEFDate?: string;
    WEFDateStr: string;
    TaxCategoryName: string;
}

export interface UpdateGSTCategoryItemDetails {
    TaxCategoryID: number | null;
    TaxCategoryName: string;
    WEFDateStr: string;
}

export interface UpdateGSTCategoryParams {
    GSTCategoryMID: number;
    GSTCategoryName: string;
    HSN: string;
    ItemUnitName: string;
    UnitID: number;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    Status: boolean;
    GSTCategoryMGuid: string;
    CompanyID: number | null;
    BranchID: number | null;
    AllowDuplicateHSN: boolean | null;
    LstCustomerItemDetails: UpdateGSTCategoryItemDetails;
    LstCustomerItems: UpdateGSTCategoryItem[];
}

interface GSTCategoryState {
    gstCategoryList: GSTCategory[];
    gstCategoryLoading: boolean;
    gstCategoryError: string | null;

    itemUnitList: ItemUnit[];
    itemUnitLoading: boolean;
    itemUnitError: string | null;

    taxCategoryList: TaxCategoryOption[];
    taxCategoryLoading: boolean;
    taxCategoryError: string | null;

    gstCategorySaving: boolean;
    gstCategorySaveError: string | null;

    gstCategoryUpdating: boolean;
    gstCategoryUpdateError: string | null;

    gstCategoryDetail: GSTCategoryDetail | null;
    gstCategoryDetailLoading: boolean;
    gstCategoryDetailError: string | null;
}

const initialState: GSTCategoryState = {
    gstCategoryList: [],
    gstCategoryLoading: false,
    gstCategoryError: null,

    itemUnitList: [],
    itemUnitLoading: false,
    itemUnitError: null,

    taxCategoryList: [],
    taxCategoryLoading: false,
    taxCategoryError: null,

    gstCategorySaving: false,
    gstCategorySaveError: null,

    gstCategoryUpdating: false,
    gstCategoryUpdateError: null,

    gstCategoryDetail: null,
    gstCategoryDetailLoading: false,
    gstCategoryDetailError: null,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

async function parseOrThrow(response: Response): Promise<GSTCategoryServerResponse> {
    const text = await response.text();
    let parsed: GSTCategoryServerResponse;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    if (!response.ok || !parsed?.Server?.Success) {
        throw new Error(parsed?.Server?.Message || `Request failed with status ${response.status}`);
    }
    return parsed;
}

// These two endpoints return a plain JSON array (no Server envelope).
// On failure, the API can instead return a .NET error object like
// { Message, ExceptionMessage, ExceptionType, StackTrace } — surface that
// instead of a generic status message so failures are debuggable.
async function parseArrayOrThrow<T>(response: Response): Promise<T[]> {
    const text = await response.text();
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    if (!response.ok || !Array.isArray(parsed)) {
        const errorBody = parsed as { ExceptionMessage?: string; Message?: string } | null;
        throw new Error(
            errorBody?.ExceptionMessage ||
                errorBody?.Message ||
                `Request failed with status ${response.status}`
        );
    }
    return parsed as T[];
}

async function parseByIdOrThrow(response: Response): Promise<GSTCategoryByIDServerResponse> {
    const text = await response.text();
    let parsed: GSTCategoryByIDServerResponse;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    if (!response.ok || !parsed?.Server?.Success) {
        throw new Error(parsed?.Server?.Message || `Request failed with status ${response.status}`);
    }
    return parsed;
}

async function parseSaveOrThrow(response: Response): Promise<SaveGSTCategoryServerResponse> {
    const text = await response.text();
    let parsed: SaveGSTCategoryServerResponse;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    if (!response.ok || !parsed?.Server?.Success) {
        throw new Error(parsed?.Server?.Message || `Request failed with status ${response.status}`);
    }
    return parsed;
}

// ─── Thunk ─────────────────────────────────────────────────────────────────────
export const fetchGSTCategory = createAsyncThunk<
    GSTCategory[],
    FetchGSTCategoryParams | void,
    { state: RootState; rejectValue: string }
>("gstCategory/fetchGSTCategory", async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const { rowsPerPage, currentPage, searchStr = "" } = params ?? {};
    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    const query = new URLSearchParams({
        rowsPerPage: rowsPerPage !== undefined ? String(rowsPerPage) : "undefined",
        currentPage: currentPage !== undefined ? String(currentPage) : "undefined",
        searchStr,
    });

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/GSTCategory/GetGSTCategory?${query.toString()}`,
            {
                method: "GET",
                headers: {
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            }
        );

        const data = await parseOrThrow(response);
        return data.Server.Data;
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch GST categories");
    }
});

// ─── Thunk: GST Category By ID ─────────────────────────────────────────────────
export const fetchGSTCategoryByID = createAsyncThunk<
    GSTCategoryDetail,
    FetchGSTCategoryByIDParams,
    { state: RootState; rejectValue: string }
>("gstCategory/fetchGSTCategoryByID", async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const { GSTCategoryMID } = params;
    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    const query = new URLSearchParams({ GSTCategoryMID: String(GSTCategoryMID) });

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/GSTCategory/GetGSTCategoryByID?${query.toString()}`,
            {
                method: "GET",
                headers: {
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            }
        );

        const data = await parseByIdOrThrow(response);
        return data.Server.Data;
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch GST category");
    }
});

// ─── Thunk: Item Units ─────────────────────────────────────────────────────────
export const fetchItemUnits = createAsyncThunk<
    ItemUnit[],
    FetchItemUnitParams | void,
    { state: RootState; rejectValue: string }
>("gstCategory/fetchItemUnits", async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const { searchStr = "" } = params ?? {};
    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    const query = new URLSearchParams({ searchStr });

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api//ItemUnit/GetItemUnitBySearch/?${query.toString()}`,
            {
                method: "GET",
                headers: {
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            }
        );

        return await parseArrayOrThrow<ItemUnit>(response);
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch item units");
    }
});

// ─── Thunk: Tax Categories ─────────────────────────────────────────────────────
export const fetchTaxCategories = createAsyncThunk<
    TaxCategoryOption[],
    FetchTaxCategoryParams | void,
    { state: RootState; rejectValue: string }
>("gstCategory/fetchTaxCategories", async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const { startWith = "" } = params ?? {};
    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());
    const query = new URLSearchParams({ startWith });

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api//TaxCategoryM/GetTaxCategoryStartWith/?${query.toString()}`,
            {
                method: "GET",
                headers: {
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            }
        );

        return await parseArrayOrThrow<TaxCategoryOption>(response);
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch tax categories");
    }
});

// ─── Thunk: Save GST Category ──────────────────────────────────────────────────
export const saveGSTCategory = createAsyncThunk<
    string,
    SaveGSTCategoryParams,
    { state: RootState; rejectValue: string }
>("gstCategory/saveGSTCategory", async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/GSTCategory/SaveChanges`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(params),
            }
        );

        const data = await parseSaveOrThrow(response);
        return data.Server.Data;
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to save GST category");
    }
});

// ─── Thunk: Update GST Category ────────────────────────────────────────────────
export const updateGSTCategory = createAsyncThunk<
    string,
    UpdateGSTCategoryParams,
    { state: RootState; rejectValue: string }
>("gstCategory/updateGSTCategory", async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/GSTCategory/UpdateChanges`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(params),
            }
        );

        const data = await parseSaveOrThrow(response);
        return data.Server.Data;
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to update GST category");
    }
});

// ─── Slice ─────────────────────────────────────────────────────────────────────
const gstCategorySlice = createSlice({
    name: "gstCategory",
    initialState,
    reducers: {
        clearGSTCategory: (state) => {
            state.gstCategoryList = [];
            state.gstCategoryLoading = false;
            state.gstCategoryError = null;
        },
        clearItemUnits: (state) => {
            state.itemUnitList = [];
            state.itemUnitLoading = false;
            state.itemUnitError = null;
        },
        clearTaxCategories: (state) => {
            state.taxCategoryList = [];
            state.taxCategoryLoading = false;
            state.taxCategoryError = null;
        },
        clearGSTCategorySaveState: (state) => {
            state.gstCategorySaving = false;
            state.gstCategorySaveError = null;
        },
        clearGSTCategoryUpdateState: (state) => {
            state.gstCategoryUpdating = false;
            state.gstCategoryUpdateError = null;
        },
        clearGSTCategoryDetail: (state) => {
            state.gstCategoryDetail = null;
            state.gstCategoryDetailLoading = false;
            state.gstCategoryDetailError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGSTCategory.pending, (state) => {
                state.gstCategoryLoading = true;
                state.gstCategoryError = null;
            })
            .addCase(
                fetchGSTCategory.fulfilled,
                (state, action: PayloadAction<GSTCategory[]>) => {
                    state.gstCategoryLoading = false;
                    state.gstCategoryList = action.payload;
                }
            )
            .addCase(fetchGSTCategory.rejected, (state, action) => {
                state.gstCategoryLoading = false;
                state.gstCategoryError = action.payload ?? "Failed to fetch GST categories";
            })
            .addCase(fetchGSTCategoryByID.pending, (state) => {
                state.gstCategoryDetailLoading = true;
                state.gstCategoryDetailError = null;
            })
            .addCase(
                fetchGSTCategoryByID.fulfilled,
                (state, action: PayloadAction<GSTCategoryDetail>) => {
                    state.gstCategoryDetailLoading = false;
                    state.gstCategoryDetail = action.payload;
                }
            )
            .addCase(fetchGSTCategoryByID.rejected, (state, action) => {
                state.gstCategoryDetailLoading = false;
                state.gstCategoryDetailError = action.payload ?? "Failed to fetch GST category";
            })
            .addCase(fetchItemUnits.pending, (state) => {
                state.itemUnitLoading = true;
                state.itemUnitError = null;
            })
            .addCase(fetchItemUnits.fulfilled, (state, action: PayloadAction<ItemUnit[]>) => {
                state.itemUnitLoading = false;
                state.itemUnitList = action.payload;
            })
            .addCase(fetchItemUnits.rejected, (state, action) => {
                state.itemUnitLoading = false;
                state.itemUnitError = action.payload ?? "Failed to fetch item units";
            })
            .addCase(fetchTaxCategories.pending, (state) => {
                state.taxCategoryLoading = true;
                state.taxCategoryError = null;
            })
            .addCase(
                fetchTaxCategories.fulfilled,
                (state, action: PayloadAction<TaxCategoryOption[]>) => {
                    state.taxCategoryLoading = false;
                    state.taxCategoryList = action.payload;
                }
            )
            .addCase(fetchTaxCategories.rejected, (state, action) => {
                state.taxCategoryLoading = false;
                state.taxCategoryError = action.payload ?? "Failed to fetch tax categories";
            })
            .addCase(saveGSTCategory.pending, (state) => {
                state.gstCategorySaving = true;
                state.gstCategorySaveError = null;
            })
            .addCase(saveGSTCategory.fulfilled, (state) => {
                state.gstCategorySaving = false;
            })
            .addCase(saveGSTCategory.rejected, (state, action) => {
                state.gstCategorySaving = false;
                state.gstCategorySaveError = action.payload ?? "Failed to save GST category";
            })
            .addCase(updateGSTCategory.pending, (state) => {
                state.gstCategoryUpdating = true;
                state.gstCategoryUpdateError = null;
            })
            .addCase(updateGSTCategory.fulfilled, (state) => {
                state.gstCategoryUpdating = false;
            })
            .addCase(updateGSTCategory.rejected, (state, action) => {
                state.gstCategoryUpdating = false;
                state.gstCategoryUpdateError = action.payload ?? "Failed to update GST category";
            });
    },
});

export const {
    clearGSTCategory,
    clearItemUnits,
    clearTaxCategories,
    clearGSTCategorySaveState,
    clearGSTCategoryUpdateState,
    clearGSTCategoryDetail,
} = gstCategorySlice.actions;
export default gstCategorySlice.reducer;
