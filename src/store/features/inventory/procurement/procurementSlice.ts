import { RootState } from "@/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// ─── Types ────────────────────────────────────────────────────────────────────

export interface IndentOrder {
    IndentID: number;
    IndentNo: string;
    IndentDate: string;
    TotalQuantity: number;
    IndentCompleted: boolean;
    DepartmentID: number;
    DepartmentName: string;
    ItemTypeID: number;
    ItemType: string | null;
    Remarks: string | null;
    Approve: string;
    ApprovedBY: string | null;
    UserName: string | null;
    SubDepartmentName: string | null;
    EmpName: string;
    salesorderId: number | null;
    CategoryName: string;
    CategoryID: number;
    SubCategoryName: string;
    SubCategoryID: number;
    DocumentName: string;
    POStatus: string;
    apprve: boolean;
    SalesOrderNo: string | null;
    CreatedDate: string;
    ApprovedDate: string;
}

export interface FetchIndentParams {
    from: string;
    to: string;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    itemid?: number;
    companyId?: number;
    finYearId?: number;
}

export interface ItemDetail {
    Quantity: number;
    PurchaseOrdQty: number;
    ItemName: string;
    InpassQty: number;
}

export interface DocumentType {
    DocumentID: number;
    DocumentName: string;
    SetDefault: boolean;
    PrintModName: string | null;
    Declaration: string | null;
    ShortName: string;
    CreditHeadID: number | null;
    Automation: boolean;
    CreditAccount: string | null;
    DebitHeadID: number | null;
    DebitAccount: string | null;
    Prefix: string;
    Suffix: string | null;
    StartingNo: number;
    BackgroundColor: string;
    PanelColor: string;
    TaxMasterID: number;
    IsGST: boolean;
    IsVAT: boolean;
    EnableAddCharges: boolean;
    EnableDedCharges: boolean;
    GroupCode: string | null;
    CurrencyID: number;
    Currency: string;
    ExchRate: number;
    DocumentTypeID: number;
}

export interface ItemCategory {
    CategoryName: string;
    CategoryID: number;
}

interface fetchDocumentTypesParams {
    companyId: number;
    finYearId: number;
}

interface fetchItemCategoriesParams {
    companyId: number;
    finYearId: number;
}

interface ProcurementState {
    indentOrders: IndentOrder[];
    items: Item[];
    itemDetails: ItemDetail[];
    documentTypes: DocumentType[];  
    itemCategories: ItemCategory[];          
    itemCategoriesLoading: boolean;          
    itemCategoriesError: string | null;             
    documentTypesLoading: boolean;         
    documentTypesError: string | null;     
    itemDetailsLoading: boolean;
    itemDetailsError: string | null;
    itemsLoading: boolean;
    itemsError: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProcurementState = {
    indentOrders: [],
    items: [],
    itemDetails: [],
    documentTypes: [],  
    itemCategories: [],                      
    itemCategoriesLoading: false,            
    itemCategoriesError: null,                              
    documentTypesLoading: false,       
    documentTypesError: null,          
    itemDetailsLoading: false,
    itemDetailsError: null,
    itemsLoading: false,
    itemsError: null,
    loading: false,
    error: null,
};

export interface Item {
    ItemID: number;
    ItemName: string;
    ItemCode: string | null;
}

/// ─── Helpers ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    let token = state.auth.userData?.token || localStorage.getItem("token");
    if (!token) return null;

    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Async Thunk ──────────────────────────────────────────────────────────────

export const fetchItems = createAsyncThunk<
    Item[],
    void,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItems",
    async (_, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        console.log("🔑 Sending Authorization (Items):", token); // ← debug

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Item/GetallItemsIndent/");
            url.searchParams.set("searchStr", "");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch items");
            }

            return json.Server.Data as Item[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchIndentOrders = createAsyncThunk<
    IndentOrder[],
    FetchIndentParams,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchIndentOrders",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Indent/ReadAllIndentOrder");

            url.searchParams.set("From", params.from);
            url.searchParams.set("To", params.to);
            url.searchParams.set("rowsPerPage", String(params.rowsPerPage ?? 25));
            url.searchParams.set("currentPage", String(params.currentPage ?? 1));
            url.searchParams.set("searchStr", params.searchStr ?? "");
            url.searchParams.set("itemid", String(params.itemid ?? 0));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "x-company-id": String(params.companyId),
                    "x-finyear-id": String(params.finYearId),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Unknown API error");
            }

            return json.Server.Data as IndentOrder[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemDetail = createAsyncThunk<
    ItemDetail[],
    number,                                   
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItemDetail",
    async (indentID, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Indent/GetItemDetail");
            url.searchParams.set("IndentID", String(indentID));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch item details");
            }

            return json.Server.Data as ItemDetail[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDocumentTypes = createAsyncThunk<
    DocumentType[],
    fetchDocumentTypesParams,                                 
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchDocumentTypes",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith");
            url.searchParams.set("DocumentType", "Indent");
            url.searchParams.set("startWith", "");   // empty as per your example

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                    "x-company-id": String(params.companyId),
                    "x-finyear-id": String(params.finYearId),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            // This API returns array directly (not wrapped in { Server: {...} })
            if (!Array.isArray(json)) {
                return rejectWithValue("Invalid response format");
            }

            return json as DocumentType[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemCategories = createAsyncThunk<
    ItemCategory[],
    fetchItemCategoriesParams,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItemCategories",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/ItemCategory/GetItemCategorysStartWith");
            url.searchParams.set("startWith", "");   // empty as per your example

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                    "x-company-id": String(params.companyId),
                    "x-finyear-id": String(params.finYearId),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            // This API returns array directly
            if (!Array.isArray(json)) {
                return rejectWithValue("Invalid response format");
            }

            return json as ItemCategory[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const procurementSlice = createSlice({
    name: "procurement",
    initialState,
    reducers: {
        clearIndentOrders(state) {
            state.indentOrders = [];
            state.error = null;
        },
        clearItemDetails(state) {                    
            state.itemDetails = [];
            state.itemDetailsError = null;
        },
        clearDocumentTypes(state) {             
            state.documentTypes = [];
            state.documentTypesError = null;
        },
        clearItemCategories(state) {              
            state.itemCategories = [];
            state.itemCategoriesError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchIndentOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIndentOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.indentOrders = action.payload;
            })
            .addCase(fetchIndentOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Something went wrong";
            })
            .addCase(fetchItems.pending, (state) => {
                state.itemsLoading = true;
                state.itemsError = null;
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                state.itemsLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.itemsLoading = false;
                state.itemsError = action.payload ?? "Failed to load items";
            })
            .addCase(fetchItemDetail.pending, (state) => {
                state.itemDetailsLoading = true;
                state.itemDetailsError = null;
            })
            .addCase(fetchItemDetail.fulfilled, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetails = action.payload;
            })
            .addCase(fetchItemDetail.rejected, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetailsError = action.payload ?? "Failed to load item details";
            })
            .addCase(fetchDocumentTypes.pending, (state) => {
                state.documentTypesLoading = true;
                state.documentTypesError = null;
            })
            .addCase(fetchDocumentTypes.fulfilled, (state, action) => {
                state.documentTypesLoading = false;
                state.documentTypes = action.payload;
            })
            .addCase(fetchDocumentTypes.rejected, (state, action) => {
                state.documentTypesLoading = false;
                state.documentTypesError = action.payload ?? "Failed to load document types";
            })
            .addCase(fetchItemCategories.pending, (state) => {
                state.itemCategoriesLoading = true;
                state.itemCategoriesError = null;
            })
            .addCase(fetchItemCategories.fulfilled, (state, action) => {
                state.itemCategoriesLoading = false;
                state.itemCategories = action.payload;
            })
            .addCase(fetchItemCategories.rejected, (state, action) => {
                state.itemCategoriesLoading = false;
                state.itemCategoriesError = action.payload ?? "Failed to load item categories";
            });
    },
});

export const { clearIndentOrders, clearItemDetails, clearDocumentTypes, clearItemCategories } = procurementSlice.actions;
export default procurementSlice.reducer;