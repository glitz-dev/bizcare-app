"use client";

import { RootState } from "@/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface PurchaseOrderRow {
  OrderID: number;
  orderNo: string;
  orderDate: string;
  document: string;
  party: string;
  store: string;
  amount: number;
  indentNos: string;
  salesOrder: string;
  status: string;
  custCod: string;
  createdD: string;
  approved: string;
  complete: string;
  prepared: string;
  approved2: string;
}

export interface Item {
  ItemID: number;
  ItemName: string;
  ItemCode: string | null;
}

export interface PurchaseOrderDocument {
  DocumentID: number;
  DocumentName: string;
  SetDefault: boolean;
  PrintModName: string | null;
  Declaration: string | null;
  ShortName: string;
  CreditHeadID: number;
  Automation: boolean;
  CreditAccount: string;
  DebitHeadID: number;
  DebitAccount: string;
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

export interface BaseCurrency {
  OptionValue: number;
  CurrencyID: number;
  Currency: string;
  ExchRate: number;
}

export interface RemainingIndent {
  DocumentID: number;
  IndentMasterID: number;
  IndentNo: string;
  IndentDate: string;
  TotalQuantity: number;
  DepartmentName: string;
  EmpName: string;
  SubDepartmentName: string | null;
  CategoryID: number;
  CategoryName: string;
  SubCategoryID: number;
  SubCategoryName: string;
  PriorityID: number;
  TotalRowCount: number;
}

export interface RemainingIndentsResponse {
  data: RemainingIndent[];
  id: number;
}

export interface UserTableColumn {
  TableColumnID: number;
  ColumnName: string;
  Show: boolean;
  Width: string;
  ColumnDisplayName: string;
}

export interface InvoiceTaxType {
  DocumentID: number;
  InvoiceTaxTypeID: number;
  InvoiceTaxType: string;
}

// Import Invoice Tax Type Details ─────────────────────────────────────
export interface ImportInvoiceTaxType {
  InvoiceTaxTypeID: number;
  InvoiceTaxType: string;
}

// All Invoice Tax Types (from GetAllInvoiceTaxTypes) ──────────────────
export interface AllInvoiceTaxType {
  InvoiceTaxTypeID: number;
  InvoiceTaxType: string;
}

// Store (from GetStoreStartWith) ─────────────────────────────────
export interface Store {
  StoreName: string;
  StoreID: number;
  CompanyStore: boolean | null;
}

// Supplier (from GetAllSuppliers) ─────────────────────────────────────
export interface Supplier {
  SupplierID: number;
  SupplierCode: string | null;
  SupplierName: string;
  SupplierAddress: string | null;
  GSTIN: string | null;
  CurrencyID: number;
  Currency: string;
  Symbol: string;
  ECGCLimit: number | null;
  PaymentTermID: number | null;
  PaymentTerm: string | null;
  PayDaysFromBL: number | null;
  FinanceAvailable: boolean | null;
  PartyCreditLimitAmt: number | null;
  PartyCreditLimitDays: number;
  GSTPayableHeadID: number | null;
  HeadName: string | null;
  IsLocal: boolean;
  TaxPayerTypeID: number;
  TaxPayerType: string;
}

// Selected Indent Items (from GetSelectedIndentItems) ─────────────────
export interface SelectedIndentItem {
  IndentID: number;
  IndentMasterID: number;
  ItemID: number;
  ItemName: string;
  Quantity: number;
  SpecID: number;
  Spec: string | null;
  IndentNo: string;
}

export interface FetchSelectedIndentItemsParams {
  indentID: number;
  purchaseOrderID?: number;
  companyId?: number;
  finYearId?: number;
}

// Selected Indent For PR (from GetSelectedIndentForPR) ────────────────
export interface SelectedIndentForPR {
  IndentMasterID: number;
  IndentNo: string;
  IndentDate: string;
  TotalQuantity: number;
  DocumentID: number;
  DocumentName: string;
  IndentCompleted: boolean;
  IndentDetailID: number;
  IndentMasterID1: number;
  ItemID: number;
  ItemName: string;
  ItemCode: string;
  Hsn: string;
  SpecID: number;
  Spec: string | null;
  BatchID: number;
  BarCode: string;
  BatchNo: string;
  UnitMultiplier: number;
  UnitID: number;
  Unit: string;
  IndentQty: number;
  BillUnit: string;
  BalanceQty: number;
  Quantity: number;
  PurchaseRate: number;
  Mrp: number | null;
  RequiredDate: string;
  SalesRate: number | null;
  NetPurchaseRate: number | null;
  TaxCategoryCode: string;
  TaxCategoryId: number;
  InvoiceTaxType: string;
  TaxValue: number;
  SGST: number | null;
  CGST: number | null;
  IGST: number | null;
  UTGST: number | null;
  CESS: number | null;
  VAT: number | null;
  GSTCategoryMID: number;
  GSTCategoryTID: number;
  GstCategoryDesc: string;
  PackingIndent: number;
}

export interface FetchSelectedIndentForPRParams {
  indentID: number;
  invoiceTaxTypeID: number;
  indentTID?: number;
  orderID?: number;
  companyId?: number;
  finYearId?: number;
}

export interface FetchPurchaseOrdersParams {
  fromDate: string;
  toDate: string;
  rowsPerPage?: number;
  currentPage?: number;
  searchStr?: string;
  itemid?: string | number;
  companyId?: number;
  finYearId?: number;
}

export interface FetchPurchaseOrderDueDaysParams {
  companyId?: number;
  finYearId?: number;
}

export interface FetchPurchaseOrderDocumentsParams {
  documentType?: string;
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

export interface FetchDefaultStoreParams {
  companyId?: number;
  finYearId?: number;
}

export interface FetchBaseCurrencyParams {
  val?: string;
  companyId?: number;
  finYearId?: number;
}

export interface FetchRemainingIndentsForPOParams {
  CategoryID?: number;
  SubCategoryID?: number;
  rowsPerPage?: number;
  currentPage?: number;
  searchStr?: string;
  documentID?: string | number;
  purchaseOrderID?: number;
  itemid?: number;
  companyId?: number;
  finYearId?: number;
}

export interface FetchUserTableColumnsParams {
  tableCode?: string;
  companyId?: number;
  finYearId?: number;
}

export interface FetchInvoiceTaxTypeDetailsParams {
  documentID?: number | string;
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

// Params for GetImportInvoiceTaxTypeDetails API ───────────────────────
export interface FetchImportInvoiceTaxTypeDetailsParams {
  documentID?: number | string;
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

// Params for GetAllInvoiceTaxTypes API ────────────────────────────────
export interface FetchAllInvoiceTaxTypesParams {
  taxMasterId?: number;
  companyId?: number;
  finYearId?: number;
}

// Params for GetStoreStartWith API ───────────────────────────────
export interface FetchStoresParams {
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

// Params for GetAllSuppliers API ──────────────────────────────────────
export interface FetchAllSuppliersParams {
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

// ─── State ─────────────────────────────────────────────────────────────────────
interface PurchaseOrderState {
  purchaseOrders: PurchaseOrderRow[];
  items: Item[];
  purchaseOrderDueDays: PurchaseOrderDueDays | null;
  purchaseOrderDocuments: PurchaseOrderDocument[];
  defaultStore: DefaultStore[];
  remainingIndents: RemainingIndent[];
  remainingIndentsId: number;
  baseCurrency: BaseCurrency[];
  userTableColumns: UserTableColumn[];
  invoiceTaxTypes: InvoiceTaxType[];
  importInvoiceTaxType: ImportInvoiceTaxType | null;
  allInvoiceTaxTypes: AllInvoiceTaxType[];
  stores: Store[];
  suppliers: Supplier[]; 
  loading: boolean;
  error: string | null;
  itemsLoading: boolean;
  itemsError: string | null;
  dueDaysLoading: boolean;
  dueDaysError: string | null;
  documentsLoading: boolean;
  documentsError: string | null;
  defaultStoreLoading: boolean;
  defaultStoreError: string | null;
  baseCurrencyLoading: boolean;
  baseCurrencyError: string | null;
  remainingIndentsTotalCount: number;
  remainingIndentsLoading: boolean;
  remainingIndentsError: string | null;
  userTableColumnsLoading: boolean;
  userTableColumnsError: string | null;
  invoiceTaxTypesLoading: boolean;
  invoiceTaxTypesError: string | null;
  importInvoiceTaxTypeLoading: boolean;
  importInvoiceTaxTypeError: string | null;
  allInvoiceTaxTypesLoading: boolean;
  allInvoiceTaxTypesError: string | null;
  storesLoading: boolean;
  storesError: string | null;
  suppliersLoading: boolean; 
  suppliersError: string | null; 
  selectedIndentItems: SelectedIndentItem[];
  selectedIndentItemsLoading: boolean;
  selectedIndentItemsError: string | null;
  selectedIndentForPR: SelectedIndentForPR[];
  selectedIndentForPRLoading: boolean;
  selectedIndentForPRError: string | null;
}

export interface PurchaseOrderDueDays {
  PreferenceID: number;
  ModuleName: string;
  FunctionName: string;
  Required: boolean;
  OptionValue: number;
  OptionString: string;
  Valuefield: string;
  CompanyID: number;
  BranchID: number;
  FinYearID: number;
  Status: boolean;
  UserID: number;
  EntryDate: string;
  ModifiedUserID: number | null;
  ModifiedDate: string | null;
  PrefGUID: string;
}

// ─── API Response Shape (reused where applicable) ──────────────────────────────
interface ApiResponse {
  Server: {
    Success: boolean;
    Message: string;
    Data: any;
    Id: number;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
  let token = state.auth.userData?.token || localStorage.getItem("token");
  if (!token) return null;

  token = token.replace(/^Bearer\s+/i, "").trim();
  return token;
};

// ─── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchPurchaseOrders = createAsyncThunk<
  PurchaseOrderRow[],
  FetchPurchaseOrdersParams,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchAll",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    try {
      const formatDate = (date: string): string => {
        if (!date) return "";
        const [year, month, day] = date.split("-");
        return `${day}-${month}-${year}`;
      };

      const url = new URL("https://erp.glitzit.com/service/api/PurchaseOrder/ReadAllPurchaseOrder");

      url.searchParams.set("From", formatDate(params.fromDate));
      url.searchParams.set("To", formatDate(params.toDate));
      url.searchParams.set("rowsPerPage", String(params.rowsPerPage ?? 25));
      url.searchParams.set("currentPage", String(params.currentPage ?? 1));
      url.searchParams.set("searchStr", params.searchStr ?? "");
      url.searchParams.set(
        "itemid",
        params.itemid != null ? String(params.itemid) : "undefined"
      );

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "x-company-id": String(params.companyId ?? 1),
          "x-finyear-id": String(params.finYearId ?? 2),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      const transformedRows: PurchaseOrderRow[] = json.Server.Data.map((item: any) => ({
        OrderID: item.OrderID,
        orderNo: item.OrderNo || "",
        orderDate: item.OrderDate || "",
        document: item.DocumentName || "",
        party: item.PartyName || "",
        store: item.Store || "",
        amount: item.TotalAmount ?? 0,
        indentNos: item.IndentNos || "",
        salesOrder: item.SalesOrderNos || "",
        status: item.Approve || "",
        custCod: item.CustCodes || "",
        createdD: item.CreatedDate || "",
        approved: item.ApprovedDate || "",
        complete: item.Completed || "",
        prepared: item.PreparedBy || "",
        approved2: item.ApprovedBy || "",
      }));

      return transformedRows;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchItems = createAsyncThunk<
  Item[],
  void,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchItems",
  async (_, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

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

export const fetchPurchaseOrderDueDays = createAsyncThunk<
  PurchaseOrderDueDays,
  FetchPurchaseOrderDueDaysParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchPurchaseOrderDueDays",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2024;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/GeneralPreference/GetPurchaseOrderDueDays");

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

      const json = await response.json();

      if (!json?.Server?.Success) {
        return rejectWithValue(json?.Server?.Message ?? "Failed to fetch purchase order due days");
      }

      return json.Server.Data as PurchaseOrderDueDays;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchPurchaseOrderDocuments = createAsyncThunk<
  PurchaseOrderDocument[],
  FetchPurchaseOrderDocumentsParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchDocuments",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const documentType = params.documentType ?? "Purchase Order";
    const startWith = params.startWith ?? "";
    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith");

      url.searchParams.set("DocumentType", documentType);
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      if (!Array.isArray(json)) {
        return rejectWithValue("Invalid response format");
      }

      return json as PurchaseOrderDocument[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchDefaultStore = createAsyncThunk<
  DefaultStore[],
  FetchDefaultStoreParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchDefaultStore",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2024;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Store/GetDefaultStore");

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

      const json = await response.json();

      if (!json) {
        return rejectWithValue(json?.Server?.Message ?? "Failed to fetch default store");
      }

      return json as DefaultStore[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchBaseCurrency = createAsyncThunk<
  BaseCurrency[],
  FetchBaseCurrencyParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchBaseCurrency",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;
    const val = params.val ?? "";

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Currency/GetBaseCurrency");
      url.searchParams.set("val", val);

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

      const json = await response.json();

      if (!json?.Server?.Success) {
        return rejectWithValue(json?.Server?.Message ?? "Failed to fetch base currency");
      }

      return json.Server.Data as BaseCurrency[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchRemainingIndentsForPO = createAsyncThunk<
  RemainingIndentsResponse,
  FetchRemainingIndentsForPOParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchRemainingIndentsForPO",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const {
      CategoryID = 0,
      SubCategoryID = 0,
      rowsPerPage = 10,
      currentPage = 1,
      searchStr = "",
      documentID = "undefined",
      purchaseOrderID = 0,
      itemid = 0,
      companyId = 1,
      finYearId = 2024,
    } = params;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Indent/GetRemainingIndentsForPO");

      url.searchParams.set("CategoryID", String(CategoryID));
      url.searchParams.set("SubCategoryID", String(SubCategoryID));
      url.searchParams.set("rowsPerPage", String(rowsPerPage));
      url.searchParams.set("currentPage", String(currentPage));
      url.searchParams.set("searchStr", searchStr);
      url.searchParams.set("documentID", String(documentID));
      url.searchParams.set("purchaseOrderID", String(purchaseOrderID));
      url.searchParams.set("itemid", String(itemid));

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

      if (!json?.Server?.Success) {
        return rejectWithValue(json?.Server?.Message ?? "Failed to fetch remaining indents for PO");
      }

      return {
        data: json.Server.Data as RemainingIndent[],
        id: json.Server.Id ?? 0,
      };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchUserTableColumns = createAsyncThunk<
  UserTableColumn[],
  FetchUserTableColumnsParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchUserTableColumns",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const tableCode = params.tableCode ?? "POrderTbl";
    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2024;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/CommonUtility/GetUserTableColumn");
      url.searchParams.set("tableCode", tableCode);

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
        return rejectWithValue(json.Server?.Message || "Failed to fetch user table columns");
      }

      return json.Server.Data as UserTableColumn[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchInvoiceTaxTypeDetails = createAsyncThunk<
  InvoiceTaxType[],
  FetchInvoiceTaxTypeDetailsParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchInvoiceTaxTypeDetails",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const documentID = params.documentID ?? 1035;
    const startWith = params.startWith ?? "";
    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/CommonUtility/GetInvoiceTaxTypeDetails");
      url.searchParams.set("documentID", String(documentID));
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "Failed to fetch invoice tax type details");
      }

      return json.Server.Data as InvoiceTaxType[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchImportInvoiceTaxTypeDetails = createAsyncThunk<
  ImportInvoiceTaxType,
  FetchImportInvoiceTaxTypeDetailsParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchImportInvoiceTaxTypeDetails",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const documentID = params.documentID;
    const startWith = params.startWith ?? "";
    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/CommonUtility/GetImportInvoiceTaxTypeDetails");
      url.searchParams.set("documentID", String(documentID));
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "Failed to fetch import invoice tax type details");
      }

      return json.Server.Data as ImportInvoiceTaxType;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// Fetch All Invoice Tax Types ─────────────────────────────────────────
export const fetchAllInvoiceTaxTypes = createAsyncThunk<
  AllInvoiceTaxType[],
  FetchAllInvoiceTaxTypesParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchAllInvoiceTaxTypes",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const taxMasterId = params.taxMasterId ?? 1;
    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/CommonUtility/GetAllInvoiceTaxTypes");
      url.searchParams.set("taxMasterId", String(taxMasterId));

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

      const json = await response.json();

      if (!json) {
        return rejectWithValue(json?.Server?.Message || "Failed to fetch all invoice tax types");
      }

      return json as AllInvoiceTaxType[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchStores = createAsyncThunk<
  Store[],
  FetchStoresParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchStores",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const startWith = params.startWith ?? "";
    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Store/GetStoreStartWith");
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "Failed to fetch stores");
      }

      return json.Server.Data as Store[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// Fetch All Suppliers
export const fetchAllSuppliers = createAsyncThunk<
  Supplier[],
  FetchAllSuppliersParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchAllSuppliers",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const startWith = params.startWith ?? "";
    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Party/GetAllSuppliers");
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "Failed to fetch suppliers");
      }

      return json.Server.Data as Supplier[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// Fetch Selected Indent Items ─────────────────────────────────────────
export const fetchSelectedIndentItems = createAsyncThunk<
  SelectedIndentItem[],
  FetchSelectedIndentItemsParams,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchSelectedIndentItems",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const {
      indentID,
      purchaseOrderID = 0,
      companyId = 1,
      finYearId = 2024,
    } = params;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Indent/GetSelectedIndentItems");
      url.searchParams.set("IndentID", String(indentID));
      url.searchParams.set("PurchaseOrderID", String(purchaseOrderID));

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
        return rejectWithValue(json.Server?.Message || "Failed to fetch selected indent items");
      }

      return json.Server.Data as SelectedIndentItem[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// Fetch Selected Indent For PR ────────────────────────────────────────
export const fetchSelectedIndentForPR = createAsyncThunk<
  SelectedIndentForPR[],
  FetchSelectedIndentForPRParams,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchSelectedIndentForPR",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const {
      indentID,
      invoiceTaxTypeID,
      indentTID = 0,
      orderID = 0,
      companyId = 1,
      finYearId = 2024,
    } = params;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Indent/GetSelectedIndentForPR");
      url.searchParams.set("IndentID", String(indentID));
      url.searchParams.set("InvoiceTaxTypeID", String(invoiceTaxTypeID));
      url.searchParams.set("IndentTID", String(indentTID));
      url.searchParams.set("OrderID", String(orderID));

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
        return rejectWithValue(json.Server?.Message || "Failed to fetch selected indent for PR");
      }

      return json.Server.Data as SelectedIndentForPR[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────
const initialState: PurchaseOrderState = {
  purchaseOrders: [],
  items: [],
  purchaseOrderDueDays: null,
  defaultStore: [],
  purchaseOrderDocuments: [],
  remainingIndents: [],
  remainingIndentsTotalCount: 0,
  remainingIndentsId: 0,
  baseCurrency: [],
  userTableColumns: [],
  invoiceTaxTypes: [],
  importInvoiceTaxType: null,
  allInvoiceTaxTypes: [],
  stores: [],
  suppliers: [],
  loading: false,
  error: null,
  itemsLoading: false,
  itemsError: null,
  dueDaysLoading: false,
  dueDaysError: null,
  documentsLoading: false,
  documentsError: null,
  defaultStoreLoading: false,
  defaultStoreError: null,
  baseCurrencyLoading: false,
  baseCurrencyError: null,
  remainingIndentsLoading: false,
  remainingIndentsError: null,
  userTableColumnsLoading: false,
  userTableColumnsError: null,
  invoiceTaxTypesLoading: false,
  invoiceTaxTypesError: null,
  importInvoiceTaxTypeLoading: false,
  importInvoiceTaxTypeError: null,
  allInvoiceTaxTypesLoading: false,
  allInvoiceTaxTypesError: null,
  storesLoading: false,
  storesError: null,
  suppliersLoading: false, 
  suppliersError: null, 
  selectedIndentItems: [],
  selectedIndentItemsLoading: false,
  selectedIndentItemsError: null,
  selectedIndentForPR: [],
  selectedIndentForPRLoading: false,
  selectedIndentForPRError: null,
};

const purchaseOrderSlice = createSlice({
  name: "purchaseOrder",
  initialState,
  reducers: {
    clearPurchaseOrders(state) {
      state.purchaseOrders = [];
      state.error = null;
    },
    clearItems(state) {
      state.items = [];
      state.itemsError = null;
    },
    clearPurchaseOrderDueDays(state) {
      state.purchaseOrderDueDays = null;
      state.dueDaysError = null;
    },
    clearPurchaseOrderDocuments(state) {
      state.purchaseOrderDocuments = [];
      state.documentsError = null;
    },
    clearDefaultStore(state) {
      state.defaultStore = [];
      state.defaultStoreError = null;
    },
    clearBaseCurrency(state) {
      state.baseCurrency = [];
      state.baseCurrencyError = null;
    },
    clearRemainingIndentsForPO(state) {
      state.remainingIndents = [];
      state.remainingIndentsError = null;
    },
    clearUserTableColumns(state) {
      state.userTableColumns = [];
      state.userTableColumnsError = null;
    },
    clearInvoiceTaxTypeDetails(state) {
      state.invoiceTaxTypes = [];
      state.invoiceTaxTypesError = null;
    },
    clearImportInvoiceTaxTypeDetails(state) {
      state.importInvoiceTaxType = null;
      state.importInvoiceTaxTypeError = null;
    },
    clearAllInvoiceTaxTypes(state) {
      state.allInvoiceTaxTypes = [];
      state.allInvoiceTaxTypesError = null;
    },
    clearStores(state) {
      state.stores = [];
      state.storesError = null;
    },
    clearAllSuppliers(state) { 
      state.suppliers = [];
      state.suppliersError = null;
    },
    clearSelectedIndentItems(state) {
      state.selectedIndentItems = [];
      state.selectedIndentItemsError = null;
    },
    clearSelectedIndentForPR(state) {
      state.selectedIndentForPR = [];
      state.selectedIndentForPRError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPurchaseOrders
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      })

      // fetchItems
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

      // fetchPurchaseOrderDueDays
      .addCase(fetchPurchaseOrderDueDays.pending, (state) => {
        state.dueDaysLoading = true;
        state.dueDaysError = null;
      })
      .addCase(fetchPurchaseOrderDueDays.fulfilled, (state, action) => {
        state.dueDaysLoading = false;
        state.purchaseOrderDueDays = action.payload;
      })
      .addCase(fetchPurchaseOrderDueDays.rejected, (state, action) => {
        state.dueDaysLoading = false;
        state.dueDaysError = action.payload ?? "Failed to load purchase order due days";
      })

      // fetchPurchaseOrderDocuments
      .addCase(fetchPurchaseOrderDocuments.pending, (state) => {
        state.documentsLoading = true;
        state.documentsError = null;
      })
      .addCase(fetchPurchaseOrderDocuments.fulfilled, (state, action) => {
        state.documentsLoading = false;
        state.purchaseOrderDocuments = action.payload;
      })
      .addCase(fetchPurchaseOrderDocuments.rejected, (state, action) => {
        state.documentsLoading = false;
        state.documentsError = action.payload ?? "Failed to load purchase order documents";
      })

      // fetchDefaultStore
      .addCase(fetchDefaultStore.pending, (state) => {
        state.defaultStoreLoading = true;
        state.defaultStoreError = null;
      })
      .addCase(fetchDefaultStore.fulfilled, (state, action) => {
        state.defaultStoreLoading = false;
        state.defaultStore = action.payload;
      })
      .addCase(fetchDefaultStore.rejected, (state, action) => {
        state.defaultStoreLoading = false;
        state.defaultStoreError = action.payload ?? "Failed to load default store";
      })

      // fetchBaseCurrency
      .addCase(fetchBaseCurrency.pending, (state) => {
        state.baseCurrencyLoading = true;
        state.baseCurrencyError = null;
      })
      .addCase(fetchBaseCurrency.fulfilled, (state, action) => {
        state.baseCurrencyLoading = false;
        state.baseCurrency = action.payload;
      })
      .addCase(fetchBaseCurrency.rejected, (state, action) => {
        state.baseCurrencyLoading = false;
        state.baseCurrencyError = action.payload ?? "Failed to load base currency";
      })

      // fetchRemainingIndentsForPO
      .addCase(fetchRemainingIndentsForPO.pending, (state) => {
        state.remainingIndentsLoading = true;
        state.remainingIndentsError = null;
      })
      .addCase(fetchRemainingIndentsForPO.fulfilled, (state, action) => {
        state.remainingIndentsLoading = false;
        state.remainingIndents = action.payload.data;
        state.remainingIndentsId = action.payload.id;
        state.remainingIndentsTotalCount = action.payload.data[0]?.TotalRowCount ?? 0;
      })
      .addCase(fetchRemainingIndentsForPO.rejected, (state, action) => {
        state.remainingIndentsLoading = false;
        state.remainingIndentsError = action.payload ?? "Failed to load remaining indents for PO";
      })
      // fetchUserTableColumns
      .addCase(fetchUserTableColumns.pending, (state) => {
        state.userTableColumnsLoading = true;
        state.userTableColumnsError = null;
      })
      .addCase(fetchUserTableColumns.fulfilled, (state, action) => {
        state.userTableColumnsLoading = false;
        state.userTableColumns = action.payload;
      })
      .addCase(fetchUserTableColumns.rejected, (state, action) => {
        state.userTableColumnsLoading = false;
        state.userTableColumnsError = action.payload ?? "Failed to load user table columns";
      })

      // fetchInvoiceTaxTypeDetails
      .addCase(fetchInvoiceTaxTypeDetails.pending, (state) => {
        state.invoiceTaxTypesLoading = true;
        state.invoiceTaxTypesError = null;
      })
      .addCase(fetchInvoiceTaxTypeDetails.fulfilled, (state, action) => {
        state.invoiceTaxTypesLoading = false;
        state.invoiceTaxTypes = action.payload;
      })
      .addCase(fetchInvoiceTaxTypeDetails.rejected, (state, action) => {
        state.invoiceTaxTypesLoading = false;
        state.invoiceTaxTypesError = action.payload ?? "Failed to load invoice tax type details";
      })

      // fetchImportInvoiceTaxTypeDetails
      .addCase(fetchImportInvoiceTaxTypeDetails.pending, (state) => {
        state.importInvoiceTaxTypeLoading = true;
        state.importInvoiceTaxTypeError = null;
      })
      .addCase(fetchImportInvoiceTaxTypeDetails.fulfilled, (state, action) => {
        state.importInvoiceTaxTypeLoading = false;
        state.importInvoiceTaxType = action.payload;
      })
      .addCase(fetchImportInvoiceTaxTypeDetails.rejected, (state, action) => {
        state.importInvoiceTaxTypeLoading = false;
        state.importInvoiceTaxTypeError = action.payload ?? "Failed to load import invoice tax type details";
      })

      // fetchAllInvoiceTaxTypes
      .addCase(fetchAllInvoiceTaxTypes.pending, (state) => {
        state.allInvoiceTaxTypesLoading = true;
        state.allInvoiceTaxTypesError = null;
      })
      .addCase(fetchAllInvoiceTaxTypes.fulfilled, (state, action) => {
        state.allInvoiceTaxTypesLoading = false;
        state.allInvoiceTaxTypes = action.payload;
      })
      .addCase(fetchAllInvoiceTaxTypes.rejected, (state, action) => {
        state.allInvoiceTaxTypesLoading = false;
        state.allInvoiceTaxTypesError = action.payload ?? "Failed to load all invoice tax types";
      })
      // fetchStores
      .addCase(fetchStores.pending, (state) => {
        state.storesLoading = true;
        state.storesError = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.storesLoading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.storesLoading = false;
        state.storesError = action.payload ?? "Failed to load stores";
      })
      // fetchAllSuppliers
      .addCase(fetchAllSuppliers.pending, (state) => {
        state.suppliersLoading = true;
        state.suppliersError = null;
      })
      .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
        state.suppliersLoading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchAllSuppliers.rejected, (state, action) => {
        state.suppliersLoading = false;
        state.suppliersError = action.payload ?? "Failed to load suppliers";
      })

      // fetchSelectedIndentItems
      .addCase(fetchSelectedIndentItems.pending, (state) => {
        state.selectedIndentItemsLoading = true;
        state.selectedIndentItemsError = null;
      })
      .addCase(fetchSelectedIndentItems.fulfilled, (state, action) => {
        state.selectedIndentItemsLoading = false;
        state.selectedIndentItems = action.payload;
      })
      .addCase(fetchSelectedIndentItems.rejected, (state, action) => {
        state.selectedIndentItemsLoading = false;
        state.selectedIndentItemsError = action.payload ?? "Failed to load selected indent items";
      })

      // fetchSelectedIndentForPR
      .addCase(fetchSelectedIndentForPR.pending, (state) => {
        state.selectedIndentForPRLoading = true;
        state.selectedIndentForPRError = null;
      })
      .addCase(fetchSelectedIndentForPR.fulfilled, (state, action) => {
        state.selectedIndentForPRLoading = false;
        state.selectedIndentForPR = action.payload;
      })
      .addCase(fetchSelectedIndentForPR.rejected, (state, action) => {
        state.selectedIndentForPRLoading = false;
        state.selectedIndentForPRError = action.payload ?? "Failed to load selected indent for PR";
      });
  },
});

export const {
  clearPurchaseOrders,
  clearItems,
  clearPurchaseOrderDueDays,
  clearPurchaseOrderDocuments,
  clearDefaultStore,
  clearBaseCurrency,
  clearRemainingIndentsForPO,
  clearUserTableColumns,
  clearInvoiceTaxTypeDetails,
  clearImportInvoiceTaxTypeDetails,
  clearAllInvoiceTaxTypes,
  clearStores,
  clearAllSuppliers, 
  clearSelectedIndentItems,
  clearSelectedIndentForPR,
} = purchaseOrderSlice.actions;

export default purchaseOrderSlice.reducer;