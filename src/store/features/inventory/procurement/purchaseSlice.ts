"use client";

import { RootState } from "@/store";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PurchaseRecord {
  rowAscNum: number;
  rowDescNum: number;
  UserID: number;
  PurchaseID: number;
  PODocID: number | null;
  InvoiceNo: string;
  InvoiceDate: string;
  PaymentType: string;
  Store: string;
  Supplier: string;
  TotalQuantity: number;
  NetAmount: number;
  TotalAmt: number;
  ApprovedBy: string;
  Approve: string;
  Approved: boolean;
  DocumentID: number;
  AgainstDocumentName: string;
  PODocID1: number | null;
  DocumentTypeID: number;
  SupInvoiceNo: string;
  SupInvoiceDate: string;
  InpassNo: string;
  CreatedDate: string;
  ApprovedDate: string;
  Username: string;
  MobileNo: string | null;
  MsgSent: boolean;
}

export interface FetchPurchaseParams {
  FromDate: string;
  ToDate: string;
  rowsPerPage: number;
  documentType: string;
  currentPage: number;
  searchStr?: string;
  companyId?: number;
  finYearId?: number;
}

export interface PurchaseState {
  data: PurchaseRecord[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  rowsPerPage: number;
  totalRecords: number;
  fromDate: string;
  toDate: string;
  documentType: string;
  searchStr: string;
}

// ─── API Response Shape ───────────────────────────────────────────────────────

interface ApiResponse {
  Server: {
    Success: boolean;
    Message: string;
    MessageId: string | null;
    Data: PurchaseRecord[];
    Id: number;
    Info: string | null;
    Approve: string | null;
  };
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: PurchaseState = {
  data: [],
  loading: false,
  error: null,
  currentPage: 1,
  rowsPerPage: 25,
  totalRecords: 0,
  fromDate: "",
  toDate: "",
  documentType: "Purchase",
  searchStr: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
  let token = state.auth.userData?.token || localStorage.getItem("token");
  if (!token) return null;

  token = token.replace(/^Bearer\s+/i, "").trim();
  return token;
};

// ─── Async Thunk ──────────────────────────────────────────────────────────────

export const fetchAllPurchases = createAsyncThunk<
  PurchaseRecord[],
  FetchPurchaseParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchAllPurchases",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;

    try {
      const {
        FromDate,
        ToDate,
        rowsPerPage,
        documentType,
        currentPage,
        searchStr = "",
      } = params;

      const url = new URL("https://erp.glitzit.com/service/api/Purchase/ReadAllPurchase");
      url.searchParams.set("FromDate", FromDate);
      url.searchParams.set("ToDate", ToDate);
      url.searchParams.set("rowsPerPage", String(rowsPerPage));
      url.searchParams.set("documentType", documentType);
      url.searchParams.set("currentPage", String(currentPage));
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.rowsPerPage = action.payload;
      state.currentPage = 1; // reset to first page on page-size change
    },
    setDateRange(
      state,
      action: PayloadAction<{ fromDate: string; toDate: string }>
    ) {
      state.fromDate = action.payload.fromDate;
      state.toDate = action.payload.toDate;
      state.currentPage = 1;
    },
    setSearchStr(state, action: PayloadAction<string>) {
      state.searchStr = action.payload;
      state.currentPage = 1;
    },
    setDocumentType(state, action: PayloadAction<string>) {
      state.documentType = action.payload;
      state.currentPage = 1;
    },
    clearPurchases(state) {
      state.data = [];
      state.error = null;
      state.totalRecords = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllPurchases.fulfilled,
        (state, action: PayloadAction<PurchaseRecord[]>) => {
          state.loading = false;
          state.data = action.payload;
          state.totalRecords =
            action.payload.length > 0
              ? action.payload[0].rowDescNum // rowDescNum on first record = total count
              : 0;
        }
      )
      .addCase(fetchAllPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
  setCurrentPage,
  setRowsPerPage,
  setDateRange,
  setSearchStr,
  setDocumentType,
  clearPurchases,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;