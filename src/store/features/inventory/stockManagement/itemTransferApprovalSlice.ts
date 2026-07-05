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

export interface TransferRequestStartWith {
    ItemTransferRequestRefNo: string;
    ItemTransferRequestMId: number;
}

export interface SelectedTransferRequest {
    ItemTransferRequestMId: number;
    RequestFromBranchID: number;
    ReqFromBranch: string;
    RequestToBranchID: number;
    ReqToBranch: string;
    RequestFromStoreID: number;
    RequestFromStore: string;
    RequestToStoreID: number;
    RequestToStore: string;
    RequestDate: string;
    DueDate: string | null;
    ItemTransferRequestRefNo: string;
    Approved: boolean;
    DocumentID: number;
    DocumentName: string;
    Remarks: string | null;
    IsInternalTransfer: number;
    ItemTransferRequestTId: number;
    ItemID: number;
    ItemName: string;
    Quantity: number;
    BatchID: number;
    StockTypeID: number;
    Barcode: string;
    Itemcode: string;
    UnitMultiplier: number;
    UnitId: number;
}

export interface ItemRequestToApprove {
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

// Interfaces for SaveChanges Payload
export interface ItemTransferApprovalTItem {
    ItemID: number;
    BatchID: number;
    Barcode: string;
    ItemCode: string;
    ItemName: string;
    Quantity: number;
    ApprovedQuantity: number;
    ItemTransferRequestMId: number;
    ItemTransferRequestTId: number;
    Status: boolean;
    StockTypeID: number;
    UnitId: number;
    UnitMultiplier: number;
}

export interface SaveChangesPayload {
    BranchName: string;
    DocumentID: number;
    DocumentName: string;
    IsInternalTransfer: boolean;
    ItemTransferApprovalT: ItemTransferApprovalTItem[];
    ItemTransferRefNo: string;
    ItemTransferRequestMId: number;
    ItemTransferRequestRefNo: string;
    RequestFromBranchID: number;
    RequestFromStoreID: number;
    RequestToBranchID: number;
    RequestToStoreID: number;
    StcokStoreID: number;
    StockBranchID: number;
    StoreName: string;
    TotalQuantity: number;
    TransferDate: string;
    TransferDateStr: string;
    TransferType: boolean;
    branchStoreName: string;
    companyId?: number; // optional parameter overrides
    finYearId?: number; // optional parameter overrides
}

export interface SaveChangesResponse {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: any | null;
        Id: number;
        Info: string | null;
        Approve: boolean | null;
    };
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface ItemTransferApprovalState {
    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    defaultStores: DefaultStore[];
    defaultStoresLoading: boolean;
    defaultStoresError: string | null;

    storesStartWith: StoreStartWith[];
    storesStartWithLoading: boolean;
    storesStartWithError: string | null;

    transferRequestsStartWith: TransferRequestStartWith[];
    transferRequestsStartWithLoading: boolean;
    transferRequestsStartWithError: string | null;

    selectedTransferRequests: SelectedTransferRequest[];
    selectedTransferRequestsLoading: boolean;
    selectedTransferRequestsError: string | null;

    itemRequestsToApprove: ItemRequestToApprove[];
    itemRequestsToApproveLoading: boolean;
    itemRequestsToApproveError: string | null;

    // Added SaveChanges state
    saveChangesLoading: boolean;
    saveChangesSuccess: boolean;
    saveChangesError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: ItemTransferApprovalState = {
    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    defaultStores: [],
    defaultStoresLoading: false,
    defaultStoresError: null,

    storesStartWith: [],
    storesStartWithLoading: false,
    storesStartWithError: null,

    transferRequestsStartWith: [],
    transferRequestsStartWithLoading: false,
    transferRequestsStartWithError: null,

    selectedTransferRequests: [],
    selectedTransferRequestsLoading: false,
    selectedTransferRequestsError: null,

    itemRequestsToApprove: [],
    itemRequestsToApproveLoading: false,
    itemRequestsToApproveError: null,

    // Initialized SaveChanges State
    saveChangesLoading: false,
    saveChangesSuccess: false,
    saveChangesError: null,
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
    "itemTransferApproval/fetchDocumentMasters",
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
            url.searchParams.set("DocumentType", "ITEM TRANSFER APPROVAL");
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
    "itemTransferApproval/fetchDefaultStore",
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
    "itemTransferApproval/fetchStoreStartWith",
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

export const fetchTransferRequestStartWith = createAsyncThunk<
    TransferRequestStartWith[],
    { branchId: number | string; startWith?: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "itemTransferApproval/fetchTransferRequestStartWith",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params.startWith ?? "";
        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//ItemTransferApproval/GetTransferRequestStartWith"
            );
            url.searchParams.set("BranchID", String(params.branchId));
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

            const data: TransferRequestStartWith[] = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSelectedTransferRequest = createAsyncThunk<
    SelectedTransferRequest[],
    { transferRequestId: number | string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "itemTransferApproval/fetchSelectedTransferRequest",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/ItemTransferRequest/GetSelectedTransferRequest"
            );
            url.searchParams.set("TransferRequestID", String(params.transferRequestId));

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

            return json.Server.Data as SelectedTransferRequest[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllItemRequestsToApprove = createAsyncThunk<
    ItemRequestToApprove[],
    { storeId: number | string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "itemTransferApproval/fetchAllItemRequestsToApprove",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/ItemTransferApproval/GetAllItemRequestsToApprove"
            );
            url.searchParams.set("StoreID", String(params.storeId));

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

            return json.Server.Data as ItemRequestToApprove[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// New Thunk: Save Changes (POST API)
export const saveChanges = createAsyncThunk<
    SaveChangesResponse,
    SaveChangesPayload,
    { state: RootState; rejectValue: string }
>(
    "itemTransferApproval/saveChanges",
    async (payload, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        // Extracted company and fin year overrides out of payload if explicitly passed, else fallback
        const { companyId: pCompanyId, finYearId: pFinYearId, ...cleanedPayload } = payload;
        const companyId = getCompanyId(state, pCompanyId);
        const finYearId = getFinYearId(state, pFinYearId);

        try {
            const url = "https://erp.glitzit.com/service/api/ItemTransferApproval/SaveChanges";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(cleanedPayload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: SaveChangesResponse = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure during save");
            }

            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const itemTransferApprovalSlice = createSlice({
    name: "itemTransferApproval",
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
        clearTransferRequestsStartWith(state) {
            state.transferRequestsStartWith = [];
            state.transferRequestsStartWithLoading = false;
            state.transferRequestsStartWithError = null;
        },
        clearSelectedTransferRequests(state) {
            state.selectedTransferRequests = [];
            state.selectedTransferRequestsLoading = false;
            state.selectedTransferRequestsError = null;
        },
        clearItemRequestsToApprove(state) {
            state.itemRequestsToApprove = [];
            state.itemRequestsToApproveLoading = false;
            state.itemRequestsToApproveError = null;
        },
        // Action to clear submission feedback states
        resetSaveChangesState(state) {
            state.saveChangesLoading = false;
            state.saveChangesSuccess = false;
            state.saveChangesError = null;
        }
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

            // Transfer Requests Start-With Search
            .addCase(fetchTransferRequestStartWith.pending, (state) => {
                state.transferRequestsStartWithLoading = true;
                state.transferRequestsStartWithError = null;
            })
            .addCase(fetchTransferRequestStartWith.fulfilled, (state, action) => {
                state.transferRequestsStartWithLoading = false;
                state.transferRequestsStartWith = action.payload;
            })
            .addCase(fetchTransferRequestStartWith.rejected, (state, action) => {
                state.transferRequestsStartWithLoading = false;
                state.transferRequestsStartWithError = action.payload ?? "Unknown error";
            })

            // Selected Transfer Request Detail
            .addCase(fetchSelectedTransferRequest.pending, (state) => {
                state.selectedTransferRequestsLoading = true;
                state.selectedTransferRequestsError = null;
            })
            .addCase(fetchSelectedTransferRequest.fulfilled, (state, action) => {
                state.selectedTransferRequestsLoading = false;
                state.selectedTransferRequests = action.payload;
            })
            .addCase(fetchSelectedTransferRequest.rejected, (state, action) => {
                state.selectedTransferRequestsLoading = false;
                state.selectedTransferRequestsError = action.payload ?? "Unknown error";
            })

            // All Item Requests To Approve
            .addCase(fetchAllItemRequestsToApprove.pending, (state) => {
                state.itemRequestsToApproveLoading = true;
                state.itemRequestsToApproveError = null;
            })
            .addCase(fetchAllItemRequestsToApprove.fulfilled, (state, action) => {
                state.itemRequestsToApproveLoading = false;
                state.itemRequestsToApprove = action.payload;
            })
            .addCase(fetchAllItemRequestsToApprove.rejected, (state, action) => {
                state.itemRequestsToApproveLoading = false;
                state.itemRequestsToApproveError = action.payload ?? "Unknown error";
            })

            // Save Changes Reducers
            .addCase(saveChanges.pending, (state) => {
                state.saveChangesLoading = true;
                state.saveChangesSuccess = false;
                state.saveChangesError = null;
            })
            .addCase(saveChanges.fulfilled, (state) => {
                state.saveChangesLoading = false;
                state.saveChangesSuccess = true;
            })
            .addCase(saveChanges.rejected, (state, action) => {
                state.saveChangesLoading = false;
                state.saveChangesSuccess = false;
                state.saveChangesError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const { 
    clearDocumentMasters, 
    clearDefaultStore,
    clearStoresStartWith,
    clearTransferRequestsStartWith,
    clearSelectedTransferRequests,
    clearItemRequestsToApprove,
    resetSaveChangesState
} = itemTransferApprovalSlice.actions;

export default itemTransferApprovalSlice.reducer;
