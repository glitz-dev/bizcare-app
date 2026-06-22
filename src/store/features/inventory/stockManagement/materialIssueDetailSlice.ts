import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentMaster {
    DocumentID: number;
    DocumentName: string;
    SetDefault: boolean;
    PrintModName: string | null;
    Declaration: string | null;
    ShortName: string | null;
    CreditHeadID: number | null;
    Automation: boolean;
    CreditAccount: string | null;
    DebitHeadID: number | null;
    DebitAccount: string | null;
    Prefix: string;
    Suffix: string | null;
    StartingNo: number;
    BackgroundColor: string | null;
    PanelColor: string | null;
    TaxMasterID: number;
    IsGST: boolean;
    IsVAT: boolean;
    EnableAddCharges: boolean;
    EnableDedCharges: boolean;
    GroupCode: string | null;
    CurrencyID: number | null;
    Currency: string | null;
    ExchRate: number | null;
    DocumentTypeID: number;
}

export interface StoreStartWith {
    StoreName: string;
    StoreID: number;
    CompanyStore: boolean | null;
}

export interface ItemBySearch {
    ItemID: number;
    ItemName: string;
    ItemCode: string | null;
    Description: string | null;
    ItemUnitID: number;
    SubCategoryID: number | null;
    ItemGroupID: number | null;
    ItemUnit: string;
}

export interface ItemSpecification {
    SpecID: number;
    Spec: string;
}

export interface MaterialIssueDetailLineItem {
    Status: boolean;
    ItemName: string;
    ItemID: number;
    UnitID: number;
    StockUnit: string;
    IssuedQty: string | number;
    [key: string]: any; // Catch-all for extra properties in the array item
}

export interface MaterialIssuePayload {
    DocumentID: number;
    DocumentName: string;
    FromCompanyID: number;
    FromStoreID: number;
    FromStoreName: string;
    ToCompanyID: number;
    ToStoreID: number;
    ToStoreName: string;
    MaterialIssueDate: string;
    MaterialIssueDateStr: string;
    MaterialIssueNo: string;
    StockStatus: boolean;
    LstMaterialIssueDetails: MaterialIssueDetailLineItem[];
    [key: string]: any; // Allows flexibility for top level dynamic fields
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface MaterialIssueDetailState {
    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    storesStartWith: StoreStartWith[];
    storesStartWithLoading: boolean;
    storesStartWithError: string | null;

    itemsBySearch: ItemBySearch[];
    itemsBySearchLoading: boolean;
    itemsBySearchError: string | null;

    itemSpecifications: ItemSpecification[];
    itemSpecificationsLoading: boolean;
    itemSpecificationsError: string | null;

    // Save States
    saveLoading: boolean;
    saveError: string | null;
    savedDocumentNo: string | null; 
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: MaterialIssueDetailState = {
    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    storesStartWith: [],
    storesStartWithLoading: false,
    storesStartWithError: null,

    itemsBySearch: [],
    itemsBySearchLoading: false,
    itemsBySearchError: null,

    itemSpecifications: [],
    itemSpecificationsLoading: false,
    itemSpecificationsError: null,

    saveLoading: false,
    saveError: null,
    savedDocumentNo: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    let token = state.auth.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

const getCompanyId = (state: RootState, override?: number): number => {
    return override ?? (state.auth.userData as any)?.companyId ?? 1;
};

const getFinYearId = (state: RootState, override?: number): number => {
    return override ?? (state.auth.userData as any)?.finYearId ?? 2;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDocumentMasters = createAsyncThunk<
    DocumentMaster[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "materialIssueDetail/fetchDocumentMasters",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//DocumentM/GetDocumentStartWith"
            );
            url.searchParams.set("DocumentType", "Material Issue");
            url.searchParams.set("startWith", startWith);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data: DocumentMaster[] = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchStoreStartWith = createAsyncThunk<
    StoreStartWith[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "materialIssueDetail/fetchStoreStartWith",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Store/GetStoreStartWith");
            url.searchParams.set("startWith", startWith);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as StoreStartWith[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemsBySearch = createAsyncThunk<
    ItemBySearch[],
    { searchStr?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "materialIssueDetail/fetchItemsBySearch",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const searchStr = params?.searchStr ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Item/GetItemBySearch/");
            url.searchParams.set("searchStr", searchStr);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as ItemBySearch[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemSpecifications = createAsyncThunk<
    ItemSpecification[],
    { itemID: number | string; startWith?: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "materialIssueDetail/fetchItemSpecifications",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params.startWith ?? "";
        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Item/GetSpecificationsOfSelectedItem");
            url.searchParams.set("ItemID", String(params.itemID));
            url.searchParams.set("startWith", startWith);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as ItemSpecification[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const saveMaterialIssue = createAsyncThunk<
    string, // Returns the Document code string (e.g., "MIG-51")
    MaterialIssuePayload,
    { state: RootState; rejectValue: string }
>(
    "materialIssueDetail/saveMaterialIssue",
    async (payload, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        // Fallbacks to Global state values if payload does not explicitly pass them
        const companyId = payload.FromCompanyID ?? getCompanyId(state);
        const finYearId = getFinYearId(state);

        try {
            const url = "https://erp.glitzit.com/service/api/MaterialIssue/SaveChanges";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "Saving document failed.");
            }

            return json.Server.Data as string; // Standard output returns code e.g. "MIG-51"
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network submission error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const materialIssueDetailSlice = createSlice({
    name: "materialIssueDetail",
    initialState,
    reducers: {
        clearDocumentMasters(state) {
            state.documentMasters = [];
            state.documentMastersLoading = false;
            state.documentMastersError = null;
        },
        clearStoresStartWith(state) {
            state.storesStartWith = [];
            state.storesStartWithLoading = false;
            state.storesStartWithError = null;
        },
        clearItemsBySearch(state) {
            state.itemsBySearch = [];
            state.itemsBySearchLoading = false;
            state.itemsBySearchError = null;
        },
        clearItemSpecifications(state) {
            state.itemSpecifications = [];
            state.itemSpecificationsLoading = false;
            state.itemSpecificationsError = null;
        },
        clearSaveState(state) {
            state.saveLoading = false;
            state.saveError = null;
            state.savedDocumentNo = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Document Masters
            .addCase(fetchDocumentMasters.pending, (state) => {
                state.documentMastersLoading = true;
                state.documentMastersError = null;
            })
            .addCase(fetchDocumentMasters.fulfilled, (state, action) => {
                state.documentMastersLoading = false;
                state.documentMasters = action.payload;
            })
            .addCase(fetchDocumentMasters.rejected, (state, action) => {
                state.documentMastersLoading = false;
                state.documentMastersError = action.payload ?? "Unknown error";
            })

            // Stores Start-With Search
            .addCase(fetchStoreStartWith.pending, (state) => {
                state.storesStartWithLoading = true;
                state.storesStartWithError = null;
            })
            .addCase(fetchStoreStartWith.fulfilled, (state, action) => {
                state.storesStartWithLoading = false;
                state.storesStartWith = action.payload;
            })
            .addCase(fetchStoreStartWith.rejected, (state, action) => {
                state.storesStartWithLoading = false;
                state.storesStartWithError = action.payload ?? "Unknown error";
            })

            // Items By Search
            .addCase(fetchItemsBySearch.pending, (state) => {
                state.itemsBySearchLoading = true;
                state.itemsBySearchError = null;
            })
            .addCase(fetchItemsBySearch.fulfilled, (state, action) => {
                state.itemsBySearchLoading = false;
                state.itemsBySearch = action.payload;
            })
            .addCase(fetchItemsBySearch.rejected, (state, action) => {
                state.itemsBySearchLoading = false;
                state.itemsBySearchError = action.payload ?? "Unknown error";
            })

            // Item Specifications
            .addCase(fetchItemSpecifications.pending, (state) => {
                state.itemSpecificationsLoading = true;
                state.itemSpecificationsError = null;
            })
            .addCase(fetchItemSpecifications.fulfilled, (state, action) => {
                state.itemSpecificationsLoading = false;
                state.itemSpecifications = action.payload;
            })
            .addCase(fetchItemSpecifications.rejected, (state, action) => {
                state.itemSpecificationsLoading = false;
                state.itemSpecificationsError = action.payload ?? "Unknown error";
            })

            // Save Material Issue
            .addCase(saveMaterialIssue.pending, (state) => {
                state.saveLoading = true;
                state.saveError = null;
                state.savedDocumentNo = null;
            })
            .addCase(saveMaterialIssue.fulfilled, (state, action) => {
                state.saveLoading = false;
                state.savedDocumentNo = action.payload; // assigns "MIG-51"
            })
            .addCase(saveMaterialIssue.rejected, (state, action) => {
                state.saveLoading = false;
                state.saveError = action.payload ?? "Unknown transaction error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const { 
    clearDocumentMasters, 
    clearStoresStartWith, 
    clearItemsBySearch,
    clearItemSpecifications,
    clearSaveState
} = materialIssueDetailSlice.actions;

export default materialIssueDetailSlice.reducer;
