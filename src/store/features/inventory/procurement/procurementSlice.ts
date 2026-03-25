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
}

interface ProcurementState {
    indentOrders: IndentOrder[];
    items: Item[];
    itemsLoading: boolean;
    itemsError: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProcurementState = {
    indentOrders: [],
    items: [],
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

// ─── Async Thunk ──────────────────────────────────────────────────────────────

export const fetchItems = createAsyncThunk<
    Item[],
    void,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItems",
    async (_, { rejectWithValue, getState }) => {
        const state = getState();
        const token = state.auth.userData?.token || localStorage.getItem("token");

        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL(
                `https://erp.glitzit.com/service/api/Item/GetallItemsIndent/`
            );

            url.searchParams.set("searchStr", "");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
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
            return rejectWithValue(
                err instanceof Error ? err.message : "Network error"
            );
        }
    }
);

export const fetchIndentOrders = createAsyncThunk<
    IndentOrder[],
    FetchIndentParams,
    { state: RootState; rejectValue: string }   // ← Add this
>(
    "procurement/fetchIndentOrders",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = state.auth.userData?.token || localStorage.getItem('token');

        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Indent/ReadAllIndentOrder"
            );

            url.searchParams.set("From", params.from);
            url.searchParams.set("To", params.to);
            url.searchParams.set("rowsPerPage", String(params.rowsPerPage ?? 25));
            url.searchParams.set("currentPage", String(params.currentPage ?? 1));
            url.searchParams.set("searchStr", params.searchStr ?? "");
            url.searchParams.set("itemid", String(params.itemid ?? 0));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
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
            return rejectWithValue(
                err instanceof Error ? err.message : "Network error"
            );
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
    },
});

export const { clearIndentOrders } = procurementSlice.actions;
export default procurementSlice.reducer;