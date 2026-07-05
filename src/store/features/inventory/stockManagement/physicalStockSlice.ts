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
    CurrencyID: number;
    Currency: string;
    ExchRate: number;
    DocumentTypeID: number;
}

export interface DefaultStore {
    StoreName: string;
    StoreID: number;
}

export interface StoreStartWith {
    StoreName: string;
    StoreID: number;
    CompanyStore: boolean | null;
}

export interface DefaultStockType {
    TypeID: number;
    TypeName: string;
    TypeDescription: string;
}

export interface StockTypeStartWith {
    TypeID: number;
    TypeName: string;
}

export interface StockItem {
    ItemID: number;
    ItemName: string;
    ItemCode: string | null;
    Description: string | null;
    ItemUnitID: number;
    SubCategoryID: number | null;
    ItemGroupID: number | null;
    ItemUnit: string;
}

export interface ActualStockPayload {
    ItemID: number;
    ItemName: string;
    ItemCode: string | null;
    UnitID: number;
    Unit: string;
    Stock: number | null;
    CurrentStock: number;
    ExactStockCheck: boolean;
    StockCheckTime: string;
    StockTypeID: number;
    StoreID: number;
}

export interface ActualStockResult {
    itemId: number;
    stock: number;
    message: string;
}

export interface UpdatePhysicalStockPayload {
    PhysicalStockDateStr: string;
    PhysicalStockTimeStr: string;
    CurrentStockType: string;
    DocumentID: number;
    DocumentName: string;
    LstPhysicalStockDetails: {
        ItemName: string;
        ItemID: number;
        ItemCode: string | null;
        UnitID: number;
        Unit: string;
        Stock: number | null;
        CurrentStock: number;
        ExactStockCheck: boolean;
        StockCheckTime: string;
        StockTypeID: number;
        StoreID: number;
    }[];
    PhysicalStkDate: string;
    PhysicalStockDate: string;
    PhysicalStockNo: string;
    PhysicalStockTime: string;
    StockTime: string;
    StockTypeID: number;
    StoreID: number;
    StoreName: string;
}

export interface UpdatePhysicalStockResult {
    physicalStockNo: string; 
    message: string;         
}
// ─── State ────────────────────────────────────────────────────────────────────

export interface PhysicalStockState {
    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    // Default Store State
    defaultStores: DefaultStore[];
    defaultStoresLoading: boolean;
    defaultStoresError: string | null;

    // Stores Start-With Search State
    storesStartWith: StoreStartWith[];
    storesStartWithLoading: boolean;
    storesStartWithError: string | null;

    // Default Stock Type State
    defaultStockTypes: DefaultStockType[];
    defaultStockTypesLoading: boolean;
    defaultStockTypesError: string | null;

    // Stock Types Start-With Search State
    stockTypesStartWith: StockTypeStartWith[];
    stockTypesStartWithLoading: boolean;
    stockTypesStartWithError: string | null;

    // Stock Items State
    stockItems: StockItem[];
    stockItemsLoading: boolean;
    stockItemsError: string | null;

    // Actual Stock Check State — keyed by ItemID so each row holds its own result
    actualStockByItemId: Record<number, number>;
    actualStockLoading: boolean;
    actualStockError: string | null;

    // Update Physical Stock State
    updatePhysicalStockLoading: boolean;
    updatePhysicalStockError: string | null;
    updatedPhysicalStockNo: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: PhysicalStockState = {
    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    defaultStores: [],
    defaultStoresLoading: false,
    defaultStoresError: null,

    storesStartWith: [],
    storesStartWithLoading: false,
    storesStartWithError: null,

    defaultStockTypes: [],
    defaultStockTypesLoading: false,
    defaultStockTypesError: null,

    stockTypesStartWith: [],
    stockTypesStartWithLoading: false,
    stockTypesStartWithError: null,

    stockItems: [],
    stockItemsLoading: false,
    stockItemsError: null,

    actualStockByItemId: {},
    actualStockLoading: false,
    actualStockError: null,

    updatePhysicalStockLoading: false,
    updatePhysicalStockError: null,
    updatedPhysicalStockNo: null,
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
    "physicalStock/fetchDocumentMasters",
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
            url.searchParams.set("DocumentType", "PHYSICAL STOCK");
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

export const fetchDefaultStore = createAsyncThunk<
    DefaultStore[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "physicalStock/fetchDefaultStore",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Store/GetDefaultStore");

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

            const data: DefaultStore[] = await response.json();
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
    "physicalStock/fetchStoreStartWith",
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

export const fetchDefaultStockType = createAsyncThunk<
    DefaultStockType[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "physicalStock/fetchDefaultStockType",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//StockType/GetDefaultStockType");

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

            const data: DefaultStockType[] = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchStockTypeStartWith = createAsyncThunk<
    StockTypeStartWith[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "physicalStock/fetchStockTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//StockType/GetStockTypeStartWith");
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

            const data: StockTypeStartWith[] = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemsBySearch = createAsyncThunk<
    StockItem[],
    { searchStr?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "physicalStock/fetchItemsBySearch",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const searchStr = params?.searchStr ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Item/GetItemBySearch");
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

            const data: StockItem[] = json.Server.Data;
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchActualStock = createAsyncThunk<
    ActualStockResult,
    { payload: ActualStockPayload; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "physicalStock/fetchActualStock",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/CheckActualStockBasedOnSLForPhysicalStock"
            );

            const response = await fetch(url.toString(), {
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

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            return {
                itemId: params.payload.ItemID,
                stock: json.Server.Data as number,
                message: json.Server.Message as string,
            };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const updatePhysicalStock = createAsyncThunk<
    UpdatePhysicalStockResult,
    { payload: UpdatePhysicalStockPayload; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "physicalStock/updatePhysicalStock",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/PhysicalStock/UpdatePhysicalStockDetails",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                    body: JSON.stringify(params.payload),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            return {
                physicalStockNo: json.Server.Info as string,
                message: json.Server.Message as string,
            };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const physicalStockSlice = createSlice({
    name: "physicalStock",
    initialState,
    reducers: {
        clearDocumentMasters(state) {
            state.documentMasters = [];
            state.documentMastersLoading = false;
            state.documentMastersError = null;
        },
        clearDefaultStore(state) {
            state.defaultStores = [];
            state.defaultStoresLoading = false;
            state.defaultStoresError = null;
        },
        clearStoresStartWith(state) {
            state.storesStartWith = [];
            state.storesStartWithLoading = false;
            state.storesStartWithError = null;
        },
        clearDefaultStockType(state) {
            state.defaultStockTypes = [];
            state.defaultStockTypesLoading = false;
            state.defaultStockTypesError = null;
        },
        clearStockTypesStartWith(state) {
            state.stockTypesStartWith = [];
            state.stockTypesStartWithLoading = false;
            state.stockTypesStartWithError = null;
        },
        clearStockItems(state) {
            state.stockItems = [];
            state.stockItemsLoading = false;
            state.stockItemsError = null;
        },
        clearActualStock(state) {
            state.actualStockByItemId = {};
            state.actualStockLoading = false;
            state.actualStockError = null;
        },
        clearUpdatePhysicalStock(state) {
            state.updatePhysicalStockLoading = false;
            state.updatePhysicalStockError = null;
            state.updatedPhysicalStockNo = null;
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

            // Default Store
            .addCase(fetchDefaultStore.pending, (state) => {
                state.defaultStoresLoading = true;
                state.defaultStoresError = null;
            })
            .addCase(fetchDefaultStore.fulfilled, (state, action) => {
                state.defaultStoresLoading = false;
                state.defaultStores = action.payload;
            })
            .addCase(fetchDefaultStore.rejected, (state, action) => {
                state.defaultStoresLoading = false;
                state.defaultStoresError = action.payload ?? "Unknown error";
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

            // Default Stock Type
            .addCase(fetchDefaultStockType.pending, (state) => {
                state.defaultStockTypesLoading = true;
                state.defaultStockTypesError = null;
            })
            .addCase(fetchDefaultStockType.fulfilled, (state, action) => {
                state.defaultStockTypesLoading = false;
                state.defaultStockTypes = action.payload;
            })
            .addCase(fetchDefaultStockType.rejected, (state, action) => {
                state.defaultStockTypesLoading = false;
                state.defaultStockTypesError = action.payload ?? "Unknown error";
            })

            // Stock Types Start-With Search
            .addCase(fetchStockTypeStartWith.pending, (state) => {
                state.stockTypesStartWithLoading = true;
                state.stockTypesStartWithError = null;
            })
            .addCase(fetchStockTypeStartWith.fulfilled, (state, action) => {
                state.stockTypesStartWithLoading = false;
                state.stockTypesStartWith = action.payload;
            })
            .addCase(fetchStockTypeStartWith.rejected, (state, action) => {
                state.stockTypesStartWithLoading = false;
                state.stockTypesStartWithError = action.payload ?? "Unknown error";
            })

            // Stock Items by Search
            .addCase(fetchItemsBySearch.pending, (state) => {
                state.stockItemsLoading = true;
                state.stockItemsError = null;
            })
            .addCase(fetchItemsBySearch.fulfilled, (state, action) => {
                state.stockItemsLoading = false;
                state.stockItems = action.payload;
            })
            .addCase(fetchItemsBySearch.rejected, (state, action) => {
                state.stockItemsLoading = false;
                state.stockItemsError = action.payload ?? "Unknown error";
            })

            // Actual Stock Check
            .addCase(fetchActualStock.pending, (state) => {
                state.actualStockLoading = true;
                state.actualStockError = null;
            })
            .addCase(fetchActualStock.fulfilled, (state, action) => {
                state.actualStockLoading = false;
                // Store result keyed by ItemID — each table row reads its own value
                state.actualStockByItemId[action.payload.itemId] = action.payload.stock;
            })
            .addCase(fetchActualStock.rejected, (state, action) => {
                state.actualStockLoading = false;
                state.actualStockError = action.payload ?? "Unknown error";
            })
            // Update Physical Stock
            .addCase(updatePhysicalStock.pending, (state) => {
                state.updatePhysicalStockLoading = true;
                state.updatePhysicalStockError = null;
                state.updatedPhysicalStockNo = null;
            })
            .addCase(updatePhysicalStock.fulfilled, (state, action) => {
                state.updatePhysicalStockLoading = false;
                state.updatedPhysicalStockNo = action.payload.physicalStockNo;
            })
            .addCase(updatePhysicalStock.rejected, (state, action) => {
                state.updatePhysicalStockLoading = false;
                state.updatePhysicalStockError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const { clearDocumentMasters, clearDefaultStore, clearStoresStartWith, clearDefaultStockType, clearStockTypesStartWith, clearStockItems, clearActualStock, clearUpdatePhysicalStock } = physicalStockSlice.actions;

export default physicalStockSlice.reducer;
