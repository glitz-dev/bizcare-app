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

export interface BranchStoreStartWith {
    branchStoreName: string;
    ToStoreID: number;
}

export interface ItemDetail {
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Hsn: string;
    PurchaseRate: number | null;
    Description: string | null;
    CategoryID: number;
    CategoryName: string;
    ItemGroupID: number | null;
    ItemGroupName: string | null;
    SubCategoryID: number | null;
    SubCategoryName: string | null;
    ItemTypeID: number;
    ItemType: string;
    StockTypeID: number;
    PurchaseUnitID: number;
    PurchaseUnit: string;
    SalesUnitID: number;
    SalesUnit: string;
    PurchaseUnitMultiplier: number;
    UnitMultiplier: number;
    HeadID: number | null;
}

export interface BatchDetail {
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Description: string | null;
    PurchaseUnitID: number;
    PurchaseUnit: string;
    SalesUnitID: number;
    SaleUnit: string; // Mapped exactly as returned by your API response
    BatchID: number;
    BatchNo: string | null;
    Barcode: string | null;
    Mrp: number;
    PurchaseRate: number;
    SalesRate: number | null;
    WholeSaleRate: number;
    NetPurchaseRate: number;
    UnitMultiplier: number;
    IsNonStockItem: boolean;
    TaxCategoryCode: string | null;
    TaxCategoryId: number | null;
    InvoiceTaxType: string | null;
    TaxValue: number | null;
    SGST: number | null;
    CGST: number | null;
    IGST: number | null;
    UTGST: number | null;
    CESS: number | null;
    VAT: number | null;
}

export interface ItemTransferRequestItem {
    ItemName: string;
    ItemID: number;
    ItemCode: string;
    BatchID: number;
    Quantity: number;
    Status: boolean;
}

export interface SaveTransferRequestPayload {
    DesignID: number;
    DocumentID: number;
    DocumentName: string;
    DueDate: string | null;
    IsInternalTransfer: boolean;
    ItemTransferRequestRefNo: string;
    LstItemTransferRequestT: ItemTransferRequestItem[];
    RequestDate: string;
    RequestFromStoreID: number;
    RequestToStoreID: number;
    SizeID: number;
    SpecID: number;
    StoreName: string;
    TransferType: boolean;
    branchStoreName: string;
    transferrequestDateStr: string;
    companyId?: number;  // Optional override
    finYearId?: number;  // Optional override
}

export interface TransferRequestRow {
    ItemTransferRequestMId: number;
    RequestFromBranchID: number;
    ReqFromBranch: string;
    RequestToBranchID: number;
    ReqToBranch: string;
    RequestFromStoreId: number;
    RequestFromStore: string;
    RequestToStoreId: number;
    RequestToStore: string;
    RequestDate: string;
    ItemTransferRequestRefNo: string;
    Approved: boolean;
    TransferType: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface ItemTransferRequestState {
    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    defaultStores: DefaultStore[];
    defaultStoresLoading: boolean;
    defaultStoresError: string | null;

    storesStartWith: StoreStartWith[];
    storesStartWithLoading: boolean;
    storesStartWithError: string | null;

    branchStoresStartWith: BranchStoreStartWith[];
    branchStoresStartWithLoading: boolean;
    branchStoresStartWithError: string | null;

    itemDetails: ItemDetail[];
    itemDetailsLoading: boolean;
    itemDetailsError: string | null;

    batchDetails: BatchDetail[];
    batchDetailsLoading: boolean;
    batchDetailsError: string | null;

    saveTransferRequestLoading: boolean;
    saveTransferRequestSuccess: boolean;
    saveTransferRequestError: string | null;

    transferRequests: TransferRequestRow[];
    transferRequestsLoading: boolean;
    transferRequestsError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: ItemTransferRequestState = {
    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    defaultStores: [],
    defaultStoresLoading: false,
    defaultStoresError: null,

    storesStartWith: [],
    storesStartWithLoading: false,
    storesStartWithError: null,

    branchStoresStartWith: [],
    branchStoresStartWithLoading: false,
    branchStoresStartWithError: null,

    itemDetails: [],
    itemDetailsLoading: false,
    itemDetailsError: null,

    batchDetails: [],
    batchDetailsLoading: false,
    batchDetailsError: null,

    saveTransferRequestLoading: false,
    saveTransferRequestSuccess: false,
    saveTransferRequestError: null,

    transferRequests: [],
    transferRequestsLoading: false,
    transferRequestsError: null,
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
    "itemTransferRequest/fetchDocumentMasters",
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
            url.searchParams.set("DocumentType", "TRANSFER REQUEST");
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
    "itemTransferRequest/fetchDefaultStore",
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
    "itemTransferRequest/fetchStoreStartWith",
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

export const fetchBranchStoreStartWith = createAsyncThunk<
    BranchStoreStartWith[],
    { branchId?: number; fromStoreId?: number; startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "itemTransferRequest/fetchBranchStoreStartWith",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const branchId = params?.branchId ?? 0;
        const fromStoreId = params?.fromStoreId ?? 0;
        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Store/GetBranchStoreStartWith");
            url.searchParams.set("BranchID", String(branchId));
            url.searchParams.set("FromStoreID", String(fromStoreId));
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

            return json.Server.Data as BranchStoreStartWith[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemDetailsForOpeningStock = createAsyncThunk<
    ItemDetail[],
    { searchStr?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "itemTransferRequest/fetchItemDetailsForOpeningStock",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const searchStr = params?.searchStr ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//Item/GetItemDetailsForOpeningStock");
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

            return json.Server.Data as ItemDetail[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchBatchDetails = createAsyncThunk<
    BatchDetail[],
    { barcode?: string; batchId?: number | string; itemCode?: string; itemId?: number | string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "itemTransferRequest/fetchBatchDetails",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const barcode = params?.barcode ?? "";
        const batchId = params?.batchId !== undefined ? String(params.batchId) : "";
        const itemCode = params?.itemCode ?? "";
        const itemId = params?.itemId !== undefined ? String(params.itemId) : "";
        
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api//ItemBatch/GetBatchDetails");
            url.searchParams.set("barcode", barcode);
            url.searchParams.set("batchId", batchId);
            url.searchParams.set("itemCode", itemCode);
            url.searchParams.set("itemId", itemId);

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

            return json.Server.Data as BatchDetail[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const saveItemTransferRequest = createAsyncThunk<
    void,
    SaveTransferRequestPayload,
    { state: RootState; rejectValue: string }
>(
    "itemTransferRequest/saveItemTransferRequest",
    async (payload, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        // Destructure companyId and finYearId if passed overrides, rest goes into POST body
        const { companyId: payloadCompanyId, finYearId: payloadFinYearId, ...requestBody } = payload;
        
        const companyId = getCompanyId(state, payloadCompanyId);
        const finYearId = getFinYearId(state, payloadFinYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api/ItemTransferRequest/SaveChanges");

            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure saving transfer request");
            }

            return;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchTransferRequests = createAsyncThunk<
    TransferRequestRow[],
    { fromDate: string; toDate: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "itemTransferRequest/fetchTransferRequests",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api/ItemTransferRequest/ReadAllTransferRequests");
            url.searchParams.set("From", params.fromDate);
            url.searchParams.set("To", params.toDate);

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

            return json.Server.Data as TransferRequestRow[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const itemTransferRequestSlice = createSlice({
    name: "itemTransferRequest",
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
        clearBranchStoresStartWith(state) {
            state.branchStoresStartWith = [];
            state.branchStoresStartWithLoading = false;
            state.branchStoresStartWithError = null;
        },
        clearItemDetails(state) {
            state.itemDetails = [];
            state.itemDetailsLoading = false;
            state.itemDetailsError = null;
        },
        clearBatchDetails(state) {
            state.batchDetails = [];
            state.batchDetailsLoading = false;
            state.batchDetailsError = null;
        },
        clearSaveTransferRequestStatus(state) {
            state.saveTransferRequestLoading = false;
            state.saveTransferRequestSuccess = false;
            state.saveTransferRequestError = null;
        },
        clearTransferRequests(state) {
            state.transferRequests = [];
            state.transferRequestsLoading = false;
            state.transferRequestsError = null;
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

            // Branch Stores Start-With Search
            .addCase(fetchBranchStoreStartWith.pending, (state) => {
                state.branchStoresStartWithLoading = true;
                state.branchStoresStartWithError = null;
            })
            .addCase(fetchBranchStoreStartWith.fulfilled, (state, action) => {
                state.branchStoresStartWithLoading = false;
                state.branchStoresStartWith = action.payload;
            })
            .addCase(fetchBranchStoreStartWith.rejected, (state, action) => {
                state.branchStoresStartWithLoading = false;
                state.branchStoresStartWithError = action.payload ?? "Unknown error";
            })

            // Item Details Search
            .addCase(fetchItemDetailsForOpeningStock.pending, (state) => {
                state.itemDetailsLoading = true;
                state.itemDetailsError = null;
            })
            .addCase(fetchItemDetailsForOpeningStock.fulfilled, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetails = action.payload;
            })
            .addCase(fetchItemDetailsForOpeningStock.rejected, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetailsError = action.payload ?? "Unknown error";
            })

            // Batch Details Search
            .addCase(fetchBatchDetails.pending, (state) => {
                state.batchDetailsLoading = true;
                state.batchDetailsError = null;
            })
            .addCase(fetchBatchDetails.fulfilled, (state, action) => {
                state.batchDetailsLoading = false;
                state.batchDetails = action.payload;
            })
            .addCase(fetchBatchDetails.rejected, (state, action) => {
                state.batchDetailsLoading = false;
                state.batchDetailsError = action.payload ?? "Unknown error";
            })

            // Save Item Transfer Request
            .addCase(saveItemTransferRequest.pending, (state) => {
                state.saveTransferRequestLoading = true;
                state.saveTransferRequestSuccess = false;
                state.saveTransferRequestError = null;
            })
            .addCase(saveItemTransferRequest.fulfilled, (state) => {
                state.saveTransferRequestLoading = false;
                state.saveTransferRequestSuccess = true;
            })
            .addCase(saveItemTransferRequest.rejected, (state, action) => {
                state.saveTransferRequestLoading = false;
                state.saveTransferRequestSuccess = false;
                state.saveTransferRequestError = action.payload ?? "Unknown error";
            })

            // Fetch Transfer Requests List
            .addCase(fetchTransferRequests.pending, (state) => {
                state.transferRequestsLoading = true;
                state.transferRequestsError = null;
            })
            .addCase(fetchTransferRequests.fulfilled, (state, action) => {
                state.transferRequestsLoading = false;
                state.transferRequests = action.payload;
            })
            .addCase(fetchTransferRequests.rejected, (state, action) => {
                state.transferRequestsLoading = false;
                state.transferRequestsError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const { 
    clearDocumentMasters, 
    clearDefaultStore, 
    clearStoresStartWith, 
    clearBranchStoresStartWith,
    clearItemDetails,
    clearBatchDetails,
    clearSaveTransferRequestStatus,
    clearTransferRequests,
} = itemTransferRequestSlice.actions;

export default itemTransferRequestSlice.reducer;
