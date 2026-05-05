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

export interface PaymentType {
  PaymentTypeName: string;
  PaymentTypeID: number;
}

export interface Store {
  StoreName: string;
  StoreID: number;
}

export interface InPassDoc {
  DocumentID: number;
  DocumentName: string;
  DisplayDocName: string;
  DocumentTypeName: string;
}

export interface FetchInPassDocsParams {
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

export interface InPassDetail {
  rowAscNum: number;
  rowDescNum: number;
  InPassID: number;
  InPassNo: string;
  InPassDate: string;
  SupplierID: number;
  Supplier: string;
  Against: string;
  JobWorker: string;
  Through: string;
  InpassDocumentID: number;
  OrderID: number;
  OrderNo: string;
  OrderDate: string;
  OrderStatus: string;
  InPassAmount: number;
  BillNo: string;
  TotalRowCount: number;
}

export interface FetchInPassDetailsParams {
  From: string;
  To: string;
  currentPage: number;
  documentId: number;
  rowsPerPage: number;
  searchStr?: string;
  supplierID: number;
  companyId?: number;
  finYearId?: number;
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

export interface FetchItemDetailsParams {
  searchStr?: string; // defaults to ""
  companyId?: number;
  finYearId?: number;
}

export interface TableColumn {
  TableColumnID: number;
  ColumnName: string;
  Show: boolean;
  Width: string;
  ColumnDisplayName: string;
}

export interface FetchTableColumnsParams {
  tableCode?: string;
  companyId?: number;
  finYearId?: number;
}

export interface InvoiceTaxType {
  DocumentID: number;
  InvoiceTaxTypeID: number;
  InvoiceTaxType: string;
}

export interface FetchInvoiceTaxTypesParams {
  documentID: number;
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

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

export interface FetchSuppliersParams {
  startWith?: string; // defaults to ""
  companyId?: number;
  finYearId?: number;
}

export interface SupplierCurrentTotal {
  CurrentTotal: number;
}

export interface FetchSupplierCurrentTotalParams {
  supplierID: number;
  companyId?: number;
  finYearId?: number;
}

export interface CurrencyM {
  CurrencyID: number;
  CurrencyCode: string;
  Currency: string;
  Active: boolean;
  CompanyID: number;
  Status: boolean;
  Symbol: string;
  FaClass: string;
  FaChar: string;
  Common: boolean;
}

export interface CurrencyExRate {
  CurrencyM: CurrencyM;
  CurrencyTID: number;
  CurrencyID: number;
  TransDate: string;
  ExchRate: number;
  CompanyID: number;
  UserID: number;
  EntryDate: string;
  ModifiedUserID: number | null;
  ModifiedDate: string | null;
  CurrencyTGuid: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Status: boolean;
}

export interface FetchCurrencyExRateParams {
  currencyID: number;
  date?: string; // ISO date string — defaults to now
  companyId?: number;
  finYearId?: number;
}

export interface AccountHead {
  DocumentName: string;
  DocumentID: number;
  HeadName: string;
  HeadID: number;
}

export interface FetchAccountHeadsParams {
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

export interface DefaultAccountHead {
  DocumentName: string;
  HeadName: string;
  DocumentID: number;
  HeadID: number;
}

export interface SelectedItemForPR {
  ItemID: number;
  ItemName: string;
  ItemCode: string;
  Hsn: string;
  SpecID: number | null;
  Spec: string | null;
  UnitMultiplier: number;
  UnitID: number;
  Unit: string;
  BillUnit: string;
  BillUnitID: number;
  PurchaseRate: number;
  Mrp: number | null;
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
  GstCategoryDesc: string;
  GSTCategoryTID: number;
  StockTypeID: number;
  PurchaseUnitID: number;
  GstCategoryDesc1: string;
  PackingIndent: number;
}

export interface FetchDefaultAccountHeadParams {
  documentID: number;
  companyId?: number;
  finYearId?: number;
}

// ── Save Purchase ──────────────────────────────────────────────────────────────

export interface SavePurchaseLineDetail {
  TaxPercentage: number;
  InPassID: number | null;
  InPassMID: number | null;
  InPassNo: string | null;
  InPassTID: number | null;
  OrderedQty: number;
  ItemID: number;
  ItemCode: string;
  ItemName: string;
  Hsn: string;
  Barcode: string;
  Spec: string;
  RateOn: string;
  BasedOn: string;
  Qty: number;
  BillUnitID: number;
  BillUnit: string;
  PurchaseRate: number;
  NetRate: number;
  DiscountPercentage: number;
  DiscountAmount: number;
  GrossAmount: number;
  TaxAmount: number;
  NetAmount: number;
  GrossAmountBase: number;
  TaxAmountBase: number;
  NetAmountBase: number;
  SGST: number;
  CGST: number;
  IGST: number;
  UTGST: number;
  CESS: number;
  SGSTAmount: number;
  CGSTAmount: number;
  IGSTAmount: number;
  UTGSTAmount: number;
  CESSAmount: number;
  VATAmount: number;
  TaxCategoryCode: string;
  TaxCategoryId: number;
  GSTCategoryMID: number;
  GSTCategoryTID: number;
  StockTypeID: number;
  PurchaseUnitID: number;
  UnitMultiplier: number;
}

export interface SavePurchaseAdditionalDetail {
  HeadID: number;
  HeadName: string;
  Amount: number;
  AmountBase: number;
  IsDeduction: boolean;
}

export interface SavePurchasePayload {
  // ── Document ──
  DocumentID: number;
  DocumentName: string;
  DocumentTypeName: string;
  AgainstDocID: number;
  AgainstDocumentName: string;
  InvoiceNo: string;
  InvoiceDate: string;         // ISO string e.g. "2026-04-29T05:35:48.488Z"
  InvoiceDateStr: string;      // "DD-MM-YYYY"
  InvoiceTypeID: number;
  InvoiceTaxTypeID: number;
  InvoiceTaxType: string;
  TaxMasterID: number;
  TaxMasterName: string;
  TaxPercHead: string;
  TaxAmountHead: string;
  IsGST: boolean;
  // ── Supplier ──
  SupplierID: number;
  SupplierName: string;
  SupInvoiceNo: string;
  SupInvoiceDate: string;      // ISO string
  SupInvoiceDateStr: string;   // "DD-MM-YYYY"
  PartyCreditLimitAmt: number | null;
  PartyCreditLimitDays: number;
  // ── Store / Payment ──
  StoreID: number;
  StoreName: string;
  PaymentTypeID: number;
  PaymentTypeName: string;
  DebitHeadID: number;
  DebitHeadName: string;
  // ── Currency ──
  CurrencyID: number;
  Currency: string;
  CurrencyExchRate: number;
  // ── Amounts ──
  CurrentTotal: number;
  GrossAmount: string;
  GrossAmountBase: number;
  NetAmount: string;
  NetAmountBase: string;
  PreNetAmount: string;
  PreNetAmountBase: string;
  NetTotal: string;
  NetTotalBase: string;
  TotalQuantity: string;
  TotalDiscount: string;
  TotalDiscountBase: number;
  TotalTax: string;
  TotalTaxBase: string;
  BillwiseDiscountPer: number;
  BillwiseDiscountAmt: string;
  OtherAdditionalAmount: string;
  OtherAdditionalAmountBase: string;
  OtherDeductionAmount: string;
  OtherDeductionAmountBase: string;
  // ── Tax breakdown ──
  TotalSGSTAmt: number;
  TotalCGSTAmt: number;
  TotalIGSTAmt: number;
  TotalUTGSTAmt: number;
  TotalCESSAmt: number;
  TotalVATAmount: number;
  TotalTCS: string;
  TotalTCSAmt: string;
  TotalTDS: string;
  TotalTDSAmt: string | null;
  TCSApplicableOn: number;
  TDSApplicableOn: number;
  // ── Round-off ──
  RoundOff: boolean;
  RoundOffAmount: number;
  RoundOffAmountBase: number;
  // ── Misc ──
  InPassNo: string;
  ChequeDate: string | null;
  // ── Line items & adjustments ──
  LstPurchaseDetails: SavePurchaseLineDetail[];
  LstPurchaseAdditionalDetails: SavePurchaseAdditionalDetail[];
}

export interface SavePurchaseResult {
  Success: boolean;
  Message: string;
  InvoiceNo: string | null; // populated from Server.Info on success
}

export interface SavePurchaseParams {
  payload: SavePurchasePayload;
  companyId?: number;
  finYearId?: number;
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

export interface FetchDocumentTypesParams {
  documentType?: string;
  startWith?: string;
  companyId?: number;
  finYearId?: number;
}

export interface FetchPaymentTypesParams {
  startWith?: string; // defaults to ""
  companyId?: number;
  finYearId?: number;
}

export interface FetchDefaultStoreParams {
  companyId?: number;
  finYearId?: number;
}

export interface FetchSelectedItemForPRParams {
  ItemID: number;
  InvoiceTaxTypeID: number;
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
  // ── Document Types ──
  documentTypes: DocumentType[];
  documentTypesLoading: boolean;
  documentTypesError: string | null;
  // ── Payment Types ──
  paymentTypes: PaymentType[];
  paymentTypesLoading: boolean;
  paymentTypesError: string | null;
  // ── Default Store ──
  defaultStores: Store[];
  defaultStoresLoading: boolean;
  defaultStoresError: string | null;
  // ── InPass Against Docs ──
  inPassDocs: InPassDoc[];
  inPassDocsLoading: boolean;
  inPassDocsError: string | null;
  // ── Table Columns ──
  tableColumns: TableColumn[];
  tableColumnsLoading: boolean;
  tableColumnsError: string | null;
  // ── Invoice Tax Types ──
  invoiceTaxTypes: InvoiceTaxType[];
  invoiceTaxTypesLoading: boolean;
  invoiceTaxTypesError: string | null;
  // ── Default Account Head ──
  defaultAccountHead: DefaultAccountHead[];
  defaultAccountHeadLoading: boolean;
  defaultAccountHeadError: string | null;
  // ── Suppliers ──
  suppliers: Supplier[];
  suppliersLoading: boolean;
  suppliersError: string | null;
  // ── Supplier Current Total ──
  supplierCurrentTotal: number | null;
  supplierCurrentTotalLoading: boolean;
  supplierCurrentTotalError: string | null;
  // ── Currency Exchange Rate ──
  currencyExRate: CurrencyExRate | null;
  currencyExRateLoading: boolean;
  currencyExRateError: string | null;
  // ── Account Heads ──
  accountHeads: AccountHead[];
  accountHeadsLoading: boolean;
  accountHeadsError: string | null;
  // ── Account Head Default ──
  accountHeadDefault: AccountHead | null;
  accountHeadDefaultLoading: boolean;
  accountHeadDefaultError: string | null;
  // ── InPass Details ──
  inPassDetails: InPassDetail[];
  inPassDetailsLoading: boolean;
  inPassDetailsError: string | null;
  inPassDetailsTotalRecords: number;
  // ── Item Details ──
  itemDetails: ItemDetail[];
  itemDetailsLoading: boolean;
  itemDetailsError: string | null;
  // ── Selected Item For PR ──
  selectedItemForPR: SelectedItemForPR | null;
  selectedItemForPRLoading: boolean;
  selectedItemForPRError: string | null;
  // ── Save Purchase ──
  savePurchaseLoading: boolean;
  savePurchaseError: string | null;
  savePurchaseResult: SavePurchaseResult | null;
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
  // ── Document Types ──
  documentTypes: [],
  documentTypesLoading: false,
  documentTypesError: null,
  // ── Payment Types ──
  paymentTypes: [],
  paymentTypesLoading: false,
  paymentTypesError: null,
  // ── Default Store ──
  defaultStores: [],
  defaultStoresLoading: false,
  defaultStoresError: null,
  // ── InPass Against Docs ──
  inPassDocs: [],
  inPassDocsLoading: false,
  inPassDocsError: null,
  // ── Table Columns ──
  tableColumns: [],
  tableColumnsLoading: false,
  tableColumnsError: null,
  // ── Invoice Tax Types ──
  invoiceTaxTypes: [],
  invoiceTaxTypesLoading: false,
  invoiceTaxTypesError: null,
  // ── Default Account Head ──
  defaultAccountHead: [],
  defaultAccountHeadLoading: false,
  defaultAccountHeadError: null,
  // ── Suppliers ──
  suppliers: [],
  suppliersLoading: false,
  suppliersError: null,
  // ── Supplier Current Total ──
  supplierCurrentTotal: null,
  supplierCurrentTotalLoading: false,
  supplierCurrentTotalError: null,
  // ── Currency Exchange Rate ──
  currencyExRate: null,
  currencyExRateLoading: false,
  currencyExRateError: null,
  // ── Account Heads ──
  accountHeads: [],
  accountHeadsLoading: false,
  accountHeadsError: null,
  // ── Account Head Default ──
  accountHeadDefault: null,
  accountHeadDefaultLoading: false,
  accountHeadDefaultError: null,
  // ── InPass Details ──
  inPassDetails: [],
  inPassDetailsLoading: false,
  inPassDetailsError: null,
  inPassDetailsTotalRecords: 0,
  // ── Item Details ──
  itemDetails: [],
  itemDetailsLoading: false,
  itemDetailsError: null,
  // ── Selected Item For PR ──
  selectedItemForPR: null,
  selectedItemForPRLoading: false,
  selectedItemForPRError: null,
  // ── Save Purchase ──
  savePurchaseLoading: false,
  savePurchaseError: null,
  savePurchaseResult: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
  let token = state.auth.userData?.token || localStorage.getItem("token");
  if (!token) return null;

  token = token.replace(/^Bearer\s+/i, "").trim();
  return token;
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

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

export const fetchDocumentTypes = createAsyncThunk<
  DocumentType[],
  FetchDocumentTypesParams | void,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchDocumentTypes",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const documentType = params?.documentType ?? "Purchase";
    const startWith = params?.startWith ?? "";
    const companyId = params?.companyId ?? 1;
    const finYearId = params?.finYearId ?? 2;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith"
      );
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

      const json: DocumentType[] = await response.json();
      return json;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchPaymentTypes = createAsyncThunk<
  PaymentType[],
  FetchPaymentTypesParams | void,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchPaymentTypes",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const startWith = params?.startWith ?? "";
    const companyId = params?.companyId ?? 1;
    const finYearId = params?.finYearId ?? 2;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/PaymentType/GetPaymentTypeStartWith"
      );
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

      const json: PaymentType[] = await response.json();
      return json;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchDefaultStore = createAsyncThunk<
  Store[],
  FetchDefaultStoreParams | void,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchDefaultStore",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const companyId = params?.companyId ?? 1;
    const finYearId = params?.finYearId ?? 2;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/Store/GetDefaultStore"
      );

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

      const json: Store[] = await response.json();
      return json;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchInPassDocs = createAsyncThunk<
  InPassDoc[],
  FetchInPassDocsParams | void,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchInPassDocs",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const startWith = params?.startWith ?? "";
    const companyId = params?.companyId ?? 1;
    const finYearId = params?.finYearId ?? 2;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/InPass/GetInPassAgainstDoc/"
      );
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

      const json: { Server: { Success: boolean; Message: string; Data: InPassDoc[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchTableColumns = createAsyncThunk<
  TableColumn[],
  FetchTableColumnsParams | void,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchTableColumns",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const tableCode = params?.tableCode ?? "PurchaseTbl";
    const companyId = params?.companyId ?? 1;
    const finYearId = params?.finYearId ?? 2;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/CommonUtility/GetUserTableColumn"
      );
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

      const json: { Server: { Success: boolean; Message: string; Data: TableColumn[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchInvoiceTaxTypes = createAsyncThunk<
  InvoiceTaxType[],
  FetchInvoiceTaxTypesParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchInvoiceTaxTypes",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { documentID, startWith = "", companyId = 1, finYearId = 2 } = params;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/CommonUtility/GetInvoiceTaxTypeDetails"
      );
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

      const json: { Server: { Success: boolean; Message: string; Data: InvoiceTaxType[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchDefaultAccountHead = createAsyncThunk<
  DefaultAccountHead[],
  FetchDefaultAccountHeadParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchDefaultAccountHead",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { documentID, companyId = 1, finYearId = 2 } = params;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/DocumentM/GetDefaultAccountHead"
      );
      url.searchParams.set("DocumentID", String(documentID));

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

      const json: { Server: { Success: boolean; Message: string; Data: DefaultAccountHead[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchAllSuppliers = createAsyncThunk<
  Supplier[],
  FetchSuppliersParams | void,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchAllSuppliers",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const startWith = params?.startWith ?? "";
    const companyId = params?.companyId ?? 1;
    const finYearId = params?.finYearId ?? 2;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/Party/GetAllSuppliers"
      );
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

      const json: { Server: { Success: boolean; Message: string; Data: Supplier[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchSupplierCurrentTotal = createAsyncThunk<
  number,
  FetchSupplierCurrentTotalParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchSupplierCurrentTotal",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { supplierID, companyId = 1, finYearId = 2 } = params;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/Party/GetCurrentTotalOfSelectedSupplier"
      );
      url.searchParams.set("supplierID", String(supplierID));

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

      const json: { Server: { Success: boolean; Message: string; Data: SupplierCurrentTotal[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data[0]?.CurrentTotal ?? 0;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchCurrencyExRate = createAsyncThunk<
  CurrencyExRate,
  FetchCurrencyExRateParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchCurrencyExRate",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { currencyID, date = new Date().toISOString(), companyId = 1, finYearId = 2 } = params;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/Currency/GetCurrencyExRate"
      );
      url.searchParams.set("currencyID", String(currencyID));
      url.searchParams.set("date", date);

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

      const json: { Server: { Success: boolean; Message: string; Data: CurrencyExRate[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data[0];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchAccountHeads = createAsyncThunk<
  AccountHead[],
  FetchAccountHeadsParams | void,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchAccountHeads",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const startWith = params?.startWith ?? "";
    const companyId = params?.companyId ?? 1;
    const finYearId = params?.finYearId ?? 2;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/AccountHead/GetAllAccHeadStartWith"
      );
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

      const json: AccountHead[] = await response.json();
      return json;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchAccountHeadDefault = createAsyncThunk<
  AccountHead | null,
  FetchDefaultAccountHeadParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchAccountHeadDefault",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { documentID, companyId = 1, finYearId = 2 } = params;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/DocumentM/GetDefaultAccountHead"
      );
      url.searchParams.set("DocumentID", String(documentID));   // ← was startWith

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

      const json: { Server: { Success: boolean; Message: string; Data: AccountHead[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data[0] ?? null;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchInPassDetails = createAsyncThunk<
  InPassDetail[],
  FetchInPassDetailsParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchInPassDetails",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const {
      From,
      To,
      currentPage,
      documentId,
      rowsPerPage,
      searchStr = "",
      supplierID,
      companyId = 1,
      finYearId = 2,
    } = params;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/Purchase/GetInPasssDetails"
      );
      url.searchParams.set("From", From);
      url.searchParams.set("To", To);
      url.searchParams.set("currentPage", String(currentPage));
      url.searchParams.set("documentId", String(documentId));
      url.searchParams.set("rowsPerPage", String(rowsPerPage));
      url.searchParams.set("searchStr", searchStr);
      url.searchParams.set("supplierID", String(supplierID));

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

      const json: { Server: { Success: boolean; Message: string; Data: InPassDetail[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchItemDetails = createAsyncThunk<
  ItemDetail[],
  FetchItemDetailsParams | void,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchItemDetails",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const searchStr = params?.searchStr ?? "";
    const companyId = params?.companyId ?? 1;
    const finYearId = params?.finYearId ?? 2;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/Item/GetItemDetailsForOpeningStock"
      );
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

      const json: { Server: { Success: boolean; Message: string; Data: ItemDetail[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchSelectedItemForPR = createAsyncThunk<
  SelectedItemForPR,
  FetchSelectedItemForPRParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/fetchSelectedItemForPR",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { ItemID, InvoiceTaxTypeID, companyId = 1, finYearId = 2 } = params;

    try {
      const url = new URL(
        "https://erp.glitzit.com/service/api/PurchaseOrder/GetSelectedItemForPR"
      );
      url.searchParams.set("ItemID", String(ItemID));
      url.searchParams.set("InvoiceTaxTypeID", String(InvoiceTaxTypeID));

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

      const json: { Server: { Success: boolean; Message: string; Data: SelectedItemForPR[] } } =
        await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "API returned failure");
      }

      return json.Server.Data[0]; // API always returns a single-element array
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const savePurchase = createAsyncThunk<
  SavePurchaseResult,
  SavePurchaseParams,
  { state: RootState; rejectValue: string }
>(
  "purchase/savePurchase",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { payload, companyId = 1, finYearId = 2 } = params;

    try {
      const response = await fetch(
        "https://erp.glitzit.com/service/api/Purchase/SaveChanges",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
            "x-company-id": String(companyId),
            "x-finyear-id": String(finYearId),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: {
        Server: {
          Success: boolean;
          Message: string;
          MessageId: string | null;
          Data: null;
          Id: number;
          Info: string | null;
          Approve: string | null;
        };
      } = await response.json();

      if (!json.Server?.Success) {
        return rejectWithValue(json.Server?.Message || "Failed to save purchase");
      }

      return {
        Success: true,
        Message: json.Server.Message,
        InvoiceNo: json.Server.Info ?? null, // e.g. "PNV-42"
      };
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
    clearDocumentTypes(state) {
      state.documentTypes = [];
      state.documentTypesError = null;
    },
    clearPaymentTypes(state) {
      state.paymentTypes = [];
      state.paymentTypesError = null;
    },
    clearDefaultStore(state) {
      state.defaultStores = [];
      state.defaultStoresError = null;
    },
    clearInPassDocs(state) {
      state.inPassDocs = [];
      state.inPassDocsError = null;
    },
    clearTableColumns(state) {
      state.tableColumns = [];
      state.tableColumnsError = null;
    },
    clearInvoiceTaxTypes(state) {
      state.invoiceTaxTypes = [];
      state.invoiceTaxTypesError = null;
    },
    clearDefaultAccountHead(state) {
      state.defaultAccountHead = [];
      state.defaultAccountHeadError = null;
    },
    clearSuppliers(state) {
      state.suppliers = [];
      state.suppliersError = null;
    },
    clearSupplierCurrentTotal(state) {
      state.supplierCurrentTotal = null;
      state.supplierCurrentTotalError = null;
    },
    clearCurrencyExRate(state) {
      state.currencyExRate = null;
      state.currencyExRateError = null;
    },
    clearAccountHeads(state) {
      state.accountHeads = [];
      state.accountHeadsError = null;
    },
    clearAccountHeadDefault(state) {
      state.accountHeadDefault = null;
      state.accountHeadDefaultError = null;
    },
    clearInPassDetails(state) {
      state.inPassDetails = [];
      state.inPassDetailsError = null;
      state.inPassDetailsTotalRecords = 0;
    },
    clearItemDetails(state) {
      state.itemDetails = [];
      state.itemDetailsError = null;
    },
    clearSelectedItemForPR: (state) => {
      state.selectedItemForPR = null;
      state.selectedItemForPRError = null;
    },
    clearSavePurchase: (state) => {
      state.savePurchaseLoading = false;
      state.savePurchaseError = null;
      state.savePurchaseResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchAllPurchases ──────────────────────────────────────────────────
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
              ? action.payload[0].rowDescNum
              : 0;
        }
      )
      .addCase(fetchAllPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      })

      // ── fetchDocumentTypes ────────────────────────────────────────────────
      .addCase(fetchDocumentTypes.pending, (state) => {
        state.documentTypesLoading = true;
        state.documentTypesError = null;
      })
      .addCase(
        fetchDocumentTypes.fulfilled,
        (state, action: PayloadAction<DocumentType[]>) => {
          state.documentTypesLoading = false;
          state.documentTypes = action.payload;
        }
      )
      .addCase(fetchDocumentTypes.rejected, (state, action) => {
        state.documentTypesLoading = false;
        state.documentTypesError = action.payload ?? "Failed to load document types";
      })

      // ── fetchPaymentTypes ─────────────────────────────────────────────────
      .addCase(fetchPaymentTypes.pending, (state) => {
        state.paymentTypesLoading = true;
        state.paymentTypesError = null;
      })
      .addCase(
        fetchPaymentTypes.fulfilled,
        (state, action: PayloadAction<PaymentType[]>) => {
          state.paymentTypesLoading = false;
          state.paymentTypes = action.payload;
        }
      )
      .addCase(fetchPaymentTypes.rejected, (state, action) => {
        state.paymentTypesLoading = false;
        state.paymentTypesError = action.payload ?? "Failed to load payment types";
      })

      // ── fetchDefaultStore ─────────────────────────────────────────────────
      .addCase(fetchDefaultStore.pending, (state) => {
        state.defaultStoresLoading = true;
        state.defaultStoresError = null;
      })
      .addCase(
        fetchDefaultStore.fulfilled,
        (state, action: PayloadAction<Store[]>) => {
          state.defaultStoresLoading = false;
          state.defaultStores = action.payload;
        }
      )
      .addCase(fetchDefaultStore.rejected, (state, action) => {
        state.defaultStoresLoading = false;
        state.defaultStoresError = action.payload ?? "Failed to load default store";
      })

      // ── fetchInPassDocs ───────────────────────────────────────────────────
      .addCase(fetchInPassDocs.pending, (state) => {
        state.inPassDocsLoading = true;
        state.inPassDocsError = null;
      })
      .addCase(
        fetchInPassDocs.fulfilled,
        (state, action: PayloadAction<InPassDoc[]>) => {
          state.inPassDocsLoading = false;
          state.inPassDocs = action.payload;
        }
      )
      .addCase(fetchInPassDocs.rejected, (state, action) => {
        state.inPassDocsLoading = false;
        state.inPassDocsError = action.payload ?? "Failed to load InPass documents";
      })

      // ── fetchTableColumns ─────────────────────────────────────────────────
      .addCase(fetchTableColumns.pending, (state) => {
        state.tableColumnsLoading = true;
        state.tableColumnsError = null;
      })
      .addCase(
        fetchTableColumns.fulfilled,
        (state, action: PayloadAction<TableColumn[]>) => {
          state.tableColumnsLoading = false;
          state.tableColumns = action.payload;
        }
      )
      .addCase(fetchTableColumns.rejected, (state, action) => {
        state.tableColumnsLoading = false;
        state.tableColumnsError = action.payload ?? "Failed to load table columns";
      })

      // ── fetchInvoiceTaxTypes ──────────────────────────────────────────────
      .addCase(fetchInvoiceTaxTypes.pending, (state) => {
        state.invoiceTaxTypesLoading = true;
        state.invoiceTaxTypesError = null;
      })
      .addCase(
        fetchInvoiceTaxTypes.fulfilled,
        (state, action: PayloadAction<InvoiceTaxType[]>) => {
          state.invoiceTaxTypesLoading = false;
          state.invoiceTaxTypes = action.payload;
        }
      )
      .addCase(fetchInvoiceTaxTypes.rejected, (state, action) => {
        state.invoiceTaxTypesLoading = false;
        state.invoiceTaxTypesError = action.payload ?? "Failed to load invoice tax types";
      })

      // ── fetchDefaultAccountHead ───────────────────────────────────────────
      .addCase(fetchDefaultAccountHead.pending, (state) => {
        state.defaultAccountHeadLoading = true;
        state.defaultAccountHeadError = null;
      })
      .addCase(
        fetchDefaultAccountHead.fulfilled,
        (state, action: PayloadAction<DefaultAccountHead[]>) => {
          state.defaultAccountHeadLoading = false;
          state.defaultAccountHead = action.payload;
        }
      )
      .addCase(fetchDefaultAccountHead.rejected, (state, action) => {
        state.defaultAccountHeadLoading = false;
        state.defaultAccountHeadError = action.payload ?? "Failed to load default account head";
      })

      // ── fetchAllSuppliers ─────────────────────────────────────────────────
      .addCase(fetchAllSuppliers.pending, (state) => {
        state.suppliersLoading = true;
        state.suppliersError = null;
      })
      .addCase(
        fetchAllSuppliers.fulfilled,
        (state, action: PayloadAction<Supplier[]>) => {
          state.suppliersLoading = false;
          state.suppliers = action.payload;
        }
      )
      .addCase(fetchAllSuppliers.rejected, (state, action) => {
        state.suppliersLoading = false;
        state.suppliersError = action.payload ?? "Failed to load suppliers";
      })

      // ── fetchSupplierCurrentTotal ─────────────────────────────────────────
      .addCase(fetchSupplierCurrentTotal.pending, (state) => {
        state.supplierCurrentTotalLoading = true;
        state.supplierCurrentTotalError = null;
      })
      .addCase(
        fetchSupplierCurrentTotal.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.supplierCurrentTotalLoading = false;
          state.supplierCurrentTotal = action.payload;
        }
      )
      .addCase(fetchSupplierCurrentTotal.rejected, (state, action) => {
        state.supplierCurrentTotalLoading = false;
        state.supplierCurrentTotalError = action.payload ?? "Failed to load supplier current total";
      })

      // ── fetchCurrencyExRate ───────────────────────────────────────────────
      .addCase(fetchCurrencyExRate.pending, (state) => {
        state.currencyExRateLoading = true;
        state.currencyExRateError = null;
      })
      .addCase(
        fetchCurrencyExRate.fulfilled,
        (state, action: PayloadAction<CurrencyExRate>) => {
          state.currencyExRateLoading = false;
          state.currencyExRate = action.payload;
        }
      )
      .addCase(fetchCurrencyExRate.rejected, (state, action) => {
        state.currencyExRateLoading = false;
        state.currencyExRateError = action.payload ?? "Failed to load currency exchange rate";
      })

      // ── fetchAccountHeads ─────────────────────────────────────────────────
      .addCase(fetchAccountHeads.pending, (state) => {
        state.accountHeadsLoading = true;
        state.accountHeadsError = null;
      })
      .addCase(
        fetchAccountHeads.fulfilled,
        (state, action: PayloadAction<AccountHead[]>) => {
          state.accountHeadsLoading = false;
          state.accountHeads = action.payload;
        }
      )
      .addCase(fetchAccountHeads.rejected, (state, action) => {
        state.accountHeadsLoading = false;
        state.accountHeadsError = action.payload ?? "Failed to load account heads";
      })

      // ── fetchAccountHeadDefault ───────────────────────────────────────────
      .addCase(fetchAccountHeadDefault.pending, (state) => {
        state.accountHeadDefaultLoading = true;
        state.accountHeadDefaultError = null;
      })
      .addCase(
        fetchAccountHeadDefault.fulfilled,
        (state, action: PayloadAction<AccountHead | null>) => {
          state.accountHeadDefaultLoading = false;
          state.accountHeadDefault = action.payload;
        }
      )
      .addCase(fetchAccountHeadDefault.rejected, (state, action) => {
        state.accountHeadDefaultLoading = false;
        state.accountHeadDefaultError = action.payload ?? "Failed to load default account head";
      })

      // ── fetchInPassDetails ────────────────────────────────────────────────
      .addCase(fetchInPassDetails.pending, (state) => {
        state.inPassDetailsLoading = true;
        state.inPassDetailsError = null;
      })
      .addCase(
        fetchInPassDetails.fulfilled,
        (state, action: PayloadAction<InPassDetail[]>) => {
          state.inPassDetailsLoading = false;
          state.inPassDetails = action.payload;
          state.inPassDetailsTotalRecords =
            action.payload.length > 0 ? action.payload[0].TotalRowCount : 0;
        }
      )
      .addCase(fetchInPassDetails.rejected, (state, action) => {
        state.inPassDetailsLoading = false;
        state.inPassDetailsError = action.payload ?? "Failed to load InPass details";
      })

      // ── fetchItemDetails ──────────────────────────────────────────────────
      .addCase(fetchItemDetails.pending, (state) => {
        state.itemDetailsLoading = true;
        state.itemDetailsError = null;
      })
      .addCase(
        fetchItemDetails.fulfilled,
        (state, action: PayloadAction<ItemDetail[]>) => {
          state.itemDetailsLoading = false;
          state.itemDetails = action.payload;
        }
      )
      .addCase(fetchItemDetails.rejected, (state, action) => {
        state.itemDetailsLoading = false;
        state.itemDetailsError = action.payload ?? "Failed to load item details";
      })
      // ── fetchSelectedItemForPR ────────────────────────────────────────────
      .addCase(fetchSelectedItemForPR.pending, (state) => {
        state.selectedItemForPRLoading = true;
        state.selectedItemForPRError = null;
      })
      .addCase(
        fetchSelectedItemForPR.fulfilled,
        (state, action: PayloadAction<SelectedItemForPR>) => {
          state.selectedItemForPRLoading = false;
          state.selectedItemForPR = action.payload;
        }
      )
      .addCase(fetchSelectedItemForPR.rejected, (state, action) => {
        state.selectedItemForPRLoading = false;
        state.selectedItemForPRError = action.payload ?? "Failed to load selected item";
      })

      // ── savePurchase ──────────────────────────────────────────────────────
      .addCase(savePurchase.pending, (state) => {
        state.savePurchaseLoading = true;
        state.savePurchaseError = null;
        state.savePurchaseResult = null;
      })
      .addCase(
        savePurchase.fulfilled,
        (state, action: PayloadAction<SavePurchaseResult>) => {
          state.savePurchaseLoading = false;
          state.savePurchaseResult = action.payload;
        }
      )
      .addCase(savePurchase.rejected, (state, action) => {
        state.savePurchaseLoading = false;
        state.savePurchaseError = action.payload ?? "Failed to save purchase";
      })
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
  clearDocumentTypes,
  clearPaymentTypes,
  clearDefaultStore,
  clearInPassDocs,
  clearTableColumns,
  clearInvoiceTaxTypes,
  clearDefaultAccountHead,
  clearSuppliers,
  clearSupplierCurrentTotal,
  clearCurrencyExRate,
  clearAccountHeads,
  clearAccountHeadDefault,
  clearInPassDetails,
  clearItemDetails,
  clearSelectedItemForPR,
  clearSavePurchase,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;