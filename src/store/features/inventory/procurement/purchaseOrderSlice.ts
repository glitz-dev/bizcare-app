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

// ─── NEW INTERFACE FOR GetItemDetailsForOpeningStock API ───────────────────────
export interface ItemDetailsForOpeningStock {
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

export interface ProductionItemDetail {
  ItemID: number;
  ItemCode: string;
  ItemName: string;
  Description: string | null;
  PurchaseUnitID: number;
  PurchaseUnit: string;
  Hsn: string;
  SalesUnitID: number;
  SalesUnit: string;
  SalesRate: number | null;
  UnitMultiplier: number;
  IsNonStockItem: boolean;
  DesignID: number | null;
  DesignCode: string | null;
  DesignName: string | null;
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
  CurrentQuantity: number;
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
  SubCategoryName: string | null;
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

// ─── Selected Item For PR (from GetSelectedItemForPR) ───────────────────────
export interface SelectedItemForPR {
  ItemID: number;
  ItemName: string;
  ItemCode: string | null;
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

export interface ItemUnit {
  Unit: string;
  ItemUnitName: string;
  UnitID: number;
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

// ─── PARAMS FOR GetItemDetailsForOpeningStock API ─────────────────────────
export interface FetchItemDetailsForOpeningStockParams {
  searchStr?: string;
  companyId?: number;
  finYearId?: number;
}

export interface FetchProductionItemDetailsParams {
  asMode?: string;
  customerCode?: string;
  customerId?: number;
  designCode?: string;
  invoiceTaxTypeId?: number;
  itemCode?: string;
  itemId?: number;
  companyId?: number;
  finYearId?: number;
}

export interface FetchSelectedItemForPRParams {
  itemID: number;
  invoiceTaxTypeID: number;
  companyId?: number;
  finYearId?: number;
}

export interface FetchItemUnitsParams {
  searchStr?: string;
  companyId?: number;
  finYearId?: number;
}

// ─── SaveChanges Payload ────────────────────────────────────────────────────────
export interface PurchaseOrderDetailPayload {
  ItemID: number;
  IndentDetailID: number | null;
  IndentMasterID: number | null;
  BatchID: number;
  ItemCode: string;
  [key: string]: unknown;
}

export interface SavePurchaseOrderPayload {
  OrderDateStr: string;
  TaxPercHead: string;
  TaxAmountHead: string;
  SupQtyIndexCE: string;
  SupQtyIndexPC: number;
  Attention: string;
  BillingAddress: string;
  BillwiseDiscountAmt: string;
  BillwiseDiscountPer: number;
  CategoryID: number | null;
  CategoryName: string | null;
  Conditions: string;
  Currency: string;
  CurrencyID: number;
  DocumentID: number;
  DocumentName: string;
  ExRate: number;
  ExchRate: number;
  ExpectedDate: string;
  ExpectedDateStr: string;
  GrossAmount: string;
  GrossAmountBase: number;
  IndentID: number | null;
  IndentMasterID: number | null;
  IndentNo: string;
  IndentTID: number | null;
  InpassDocumentID: string;
  InvoiceTaxType: string;
  InvoiceTaxTypeID: number;
  IsGST: boolean;
  IsLocal: boolean;
  IsVAT: boolean;
  LstPurchaseOrderDetails: PurchaseOrderDetailPayload[];
  LstporderDetails: unknown[];
  NetAmount: string;
  NetAmountBase: string;
  NetTotal: string;
  NetTotalBase: string;
  OrderDate: string;
  OrderID: number;
  OrderNo: string;
  OtherAdditionalAmount: string;
  OtherAdditionalAmountBase: string;
  OtherDeductionAmount: string;
  OtherDeductionAmountBase: string;
  PackingIndent: boolean;
  PreNetAmount: string;
  PreNetAmountBase: string;
  Quantity: string;
  SearchItemID: number;
  ShippingAddress: string;
  StoreID: number;
  StoreName: string;
  SubCategoryID: number | null;
  SubCategoryName: string | null;
  SupplierID: number;
  SupplierName: string;
  TaxMasterID: number;
  TaxMasterName: string;
  TaxPayerType: string;
  TotalCESSAmt: number;
  TotalCGSTAmt: number;
  TotalDiscount: string;
  TotalDiscountBase: number;
  TotalIGSTAmt: number;
  TotalQuantity: string;
  TotalSGSTAmt: number;
  TotalTax: string;
  TotalTaxBase: string;
  TotalUTGSTAmt: number;
  TotalVATAmount: number;
  ValidDate: string | null;
  ValidDays: number;
  companyId?: number;
  finYearId?: number;
}

export interface SavePurchaseOrderResult {
  Success: boolean;
  Message: string;
  Id: number;
  Info: string;
}

// ─── GetSelectedPO ────────────────────────────────────────────────────────────
export interface SelectedPODetail {
  OrderTID: number;
  OrderMasterID: number;
  PurchaseOrderM: null;
  IndentDetailID: number | null;
  IndentOrderT: null;
  PurchasedQty: number | null;
  GReceiptQty: number | null;
  POClosed: boolean | null;
  ItemID: number;
  ItemM: null;
  ItemDescription: string | null;
  BatchID: number | null;
  ItemBatchM: null;
  BatchNo: string | null;
  Quantity: number;
  PurchaseRate: number;
  UnitMultiplier: number;
  SalesRate: number;
  MRP: number;
  Free: number;
  DiscountPercentage: number;
  DiscountAmount: number;
  TaxOnMRP: boolean;
  SGSTPer: number | null;
  CGSTPer: number | null;
  IGSTPer: number | null;
  UTGSTPer: number | null;
  CESSPer: number | null;
  VATPer: number | null;
  SGSTAmt: number | null;
  CGSTAmt: number | null;
  IGSTAmt: number | null;
  UTGSTAmt: number | null;
  CESSAmt: number | null;
  VATAmt: number | null;
  TaxID: number | null;
  AccTaxM: null;
  TaxPercentage: number;
  TaxRate: number;
  ServiceTaxID: number | null;
  ServiceTax: null;
  ServiceTaxPercentage: number | null;
  Amount: number;
  SalesMargin: number;
  NetPRate: number;
  UnitID: number;
  ItemUnit: null;
  WsRate: number;
  BarCode: string | null;
  CompanyID: number;
  BranchID: number;
  FinYearID: number;
  Status: boolean;
  UserID: number;
  EntryDate: string;
  ModifiedUserID: number | null;
  ModifiedDate: string | null;
  PurOrdTGuid: string;
  InpassQty: number;
  SpecID: number | null;
  RequiredDate: string | null;
  Remarks: string | null;
  BillQty: number;
  BillUnitID: number | null;
  GSTCategoryTID: number | null;
  IndentMasterID: number | null;
  IndentOrderM: null;
  PurchaseDate: string;
  ItemName: string;
  ItemCode: string;
  Label: string | null;
  StockTypeID: number;
  StoreID: number;
  BatchName: string | null;
  OldPurchaseRate: number;
  OldSalesRate: number;
  OldMRP: number;
  OldBatchName: string | null;
  OldManDate: string | null;
  OldExpDate: string | null;
  SalesMarginPer: number | null;
  OrderedQty: number | null;
  IndentQty: number;
  BalanceQty: number | null;
  Mrp: number;
  Spec: string | null;
  Unit: string | null;
  BillUnit: string | null;
  Hsn: string;
  GstCategoryDesc: string | null;
}

export interface SelectedPO {
  OrderID: number;
  OrderNo: string;
  OrderDate: string;
  SupplierID: number;
  PartyMasterM: null;
  StoreID: number;
  StoreM: null;
  DocumentID: number;
  DocumentM: null;
  TotalQuantity: number;
  ExpectedDate: string | null;
  Attention: string;
  BillwiseDiscountPer: number;
  BillwiseDiscountAmt: number;
  InvoiceTaxTypeID: number;
  TotalSGSTAmt: number;
  TotalCGSTAmt: number;
  TotalIGSTAmt: number;
  TotalUTGSTAmt: number;
  TotalCESSAmt: number;
  TotalVATAmount: number;
  TotalCSTAmount: number;
  TotalServiceTaxAmount: number;
  GrossAmount: number;
  TotalDiscount: number;
  TotalTax: number;
  RoundOffAmount: number;
  NetAmount: number;
  POCompleted: boolean;
  ValidDays: number;
  ValidDate: string | null;
  Remarks: string | null;
  CompanyID: number;
  BranchID: number;
  FinYearID: number;
  Status: boolean;
  UserID: number;
  EntryDate: string;
  ModifiedUserID: number | null;
  ModifiedDate: string | null;
  PurOrdMGuid: string;
  InpassCompleted: boolean | null;
  ItemTypeID: number;
  DepartmentID: number | null;
  SubDepartmentID: number | null;
  CategoryID: number | null;
  SubCategoryID: number | null;
  CurrencyID: number;
  ExRate: number;
  Conditions: string;
  OtherAdditionalAmount: number;
  OtherDeductionAmount: number;
  Completed: boolean;
  MsgSent: boolean;
  IndentID: number | null;
  ShippingAddress: string;
  BillingAddress: string;
  LstPurchaseOrderDetails: SelectedPODetail[];
  LstPOAdditionalDetails: unknown[];
  SupplierName: string;
  InvoiceTaxType: string;
  StoreName: string;
  GrossTotal: number | null;
  PreTotal: number | null;
  ItemType: string | null;
  InpassCount: number;
  Approve: boolean;
  ApprovedDate: string | null;
  ApprovedBy: string | null;
  DepartmentName: string | null;
  SubDepartmentName: string | null;
  CategoryName: string | null;
  SubCategoryName: string | null;
  Currency: string;
  DocumentName: string;
  Quantity: number;
  DisApprovedDate: string | null;
  DisApprovedBy: string | null;
  IndentNo: string | null;
  AdvPaid: number | null;
  DisapproveRemark: string | null;
  IsGST: boolean;
  IsVAT: boolean;
  TaxMasterID: number;
  EnableAddCharges: boolean;
  EnableDedCharges: boolean;
  IsLocal: boolean;
  TaxPayerType: string;
  PackingIndent: boolean;
}

export interface FetchSelectedPOParams {
  orderID: number;
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
  itemDetailsForOpeningStock: ItemDetailsForOpeningStock[];
  productionItemDetails: ProductionItemDetail[];
  selectedItemForPR: SelectedItemForPR[];
  itemUnits: ItemUnit[];
  updatePurchaseOrderResult: UpdatePurchaseOrderResult | null;
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
  itemDetailsForOpeningStockLoading: boolean;
  itemDetailsForOpeningStockError: string | null;
  productionItemDetailsLoading: boolean;
  productionItemDetailsError: string | null;
  selectedItemForPRLoading: boolean;
  selectedItemForPRError: string | null;
  savePurchaseOrderLoading: boolean;
  savePurchaseOrderError: string | null;
  savePurchaseOrderResult: SavePurchaseOrderResult | null;
  selectedPO: SelectedPO | null;
  selectedPOLoading: boolean;
  selectedPOError: string | null;
  itemUnitsLoading: boolean;
  itemUnitsError: string | null;
  updatePurchaseOrderLoading: boolean;
  updatePurchaseOrderError: string | null;
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

export interface UpdatePurchaseOrderPayload extends SavePurchaseOrderPayload {
  OrderID: number;
  POCompleted?: boolean;
  RoundOff?: boolean;
  RoundOffAmount?: number;
  TotalCSTAmount?: number;
  TotalServiceTaxAmount?: number;
  MsgSent?: boolean;
  PurOrdMGuid?: string;
  PartyMasterM?: null;
  StoreM?: null;
  DocumentM?: null;
  ModifiedDate?: string | null;
  ModifiedUserID?: number | null;
  LstPOAdditionalDetails?: unknown[];
  ValidDateStr?: string | null;
  GrossTotal?: null;
  PreTotal?: null;
  InpassCompleted?: null;
  InpassCount?: number;
  ItemTypeID?: number;
  ItemType?: string | null;
  DepartmentID?: number | null;
  DepartmentName?: string | null;
  SubDepartmentID?: number | null;
  SubDepartmentName?: string | null;
  Approve?: boolean | null;
  ApprovedDate?: string | null;
  ApprovedBy?: string | null;
  DisApprovedDate?: string | null;
  DisApprovedBy?: string | null;
  DisapproveRemark?: string | null;
  AdvPaid?: number | null;
  BranchID?: number;
  CompanyID?: number;
  FinYearID?: number;
  UserID?: number;
  Status?: boolean;
  EntryDate?: string;
}

export interface UpdatePurchaseOrderResult {
  Success: boolean;
  Message: string;
  Id: number;
  Info: string | null;
}

// ─── API Response Shape (reused where applicable) ──────────────────────────────
interface ApiResponse {
  Server: {
    Success: boolean;
    Message: string;
    Data: any;
    Id: number;
    Info: string;
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

// ─── GetItemDetailsForOpeningStock ────────────────────────────────
export const fetchItemDetailsForOpeningStock = createAsyncThunk<
  ItemDetailsForOpeningStock[],
  FetchItemDetailsForOpeningStockParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchItemDetailsForOpeningStock",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const searchStr = params.searchStr ?? "";
    const companyId = params.companyId ?? 1;
    const finYearId = params.finYearId ?? 2;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Item/GetItemDetailsForOpeningStock");
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

      if (!json?.Server?.Success) {
        return rejectWithValue(json?.Server?.Message ?? "Failed to fetch item details for opening stock");
      }

      return json.Server.Data as ItemDetailsForOpeningStock[];
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

export const fetchProductionItemDetails = createAsyncThunk<
  ProductionItemDetail[],
  FetchProductionItemDetailsParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchProductionItemDetails",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const {
      asMode = "II",
      customerCode = "",
      customerId = 0,
      designCode = "",
      invoiceTaxTypeId = 1,
      itemCode = "",
      itemId = 0,
      companyId = 1,
      finYearId = 2,
    } = params;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/Item/GetProductionItemDetails");

      url.searchParams.set("asMode", asMode);
      url.searchParams.set("customerCode", customerCode);
      url.searchParams.set("customerId", String(customerId));
      url.searchParams.set("designCode", designCode);
      url.searchParams.set("invoiceTaxTypeId", String(invoiceTaxTypeId));
      url.searchParams.set("itemCode", itemCode);
      url.searchParams.set("itemId", String(itemId));

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
        return rejectWithValue(json?.Server?.Message ?? "Failed to fetch production item details");
      }

      return json.Server.Data as ProductionItemDetail[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// Fetch Selected Item For PR (single item when user selects from dropdown)
export const fetchSelectedItemForPR = createAsyncThunk<
  SelectedItemForPR[],
  FetchSelectedItemForPRParams,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchSelectedItemForPR",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const {
      itemID,
      invoiceTaxTypeID,
      companyId = 1,
      finYearId = 2,
    } = params;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/PurchaseOrder/GetSelectedItemForPR");

      url.searchParams.set("ItemID", String(itemID));
      url.searchParams.set("InvoiceTaxTypeID", String(invoiceTaxTypeID));

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
        return rejectWithValue(json?.Server?.Message ?? "Failed to fetch selected item for PR");
      }

      return json.Server.Data as SelectedItemForPR[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// ─── SaveChanges ───────────────────────────────────────────────────────────────
export const savePurchaseOrder = createAsyncThunk<
  SavePurchaseOrderResult,
  SavePurchaseOrderPayload,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/savePurchaseOrder",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { companyId = 1, finYearId = 2, ...payload } = params;

    try {
      const response = await fetch(
        "https://erp.glitzit.com/service/api/PurchaseOrder/SaveChanges",
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

      const json: ApiResponse = await response.json();

      if (!json?.Server?.Success) {
        return rejectWithValue(json?.Server?.Message ?? "Failed to save purchase order");
      }

      return {
        Success: json.Server.Success,
        Message: json.Server.Message,
        Id: json.Server.Id,
        Info: json.Server.Info,
      } as SavePurchaseOrderResult;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

// ─── GetSelectedPO ────────────────────────────────────────────────────────────
export const fetchSelectedPO = createAsyncThunk<
  SelectedPO,
  FetchSelectedPOParams,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchSelectedPO",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { orderID, companyId = 1, finYearId = 2 } = params;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/PurchaseOrder/GetSelectedPO");
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

      if (!json?.Server?.Success) {
        return rejectWithValue(json?.Server?.Message ?? "Failed to fetch selected purchase order");
      }

      return json.Server.Data as SelectedPO;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const fetchItemUnits = createAsyncThunk<
  ItemUnit[],
  FetchItemUnitsParams | undefined,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/fetchItemUnits",
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { searchStr = "", companyId = 1, finYearId = 2 } = params;

    try {
      const url = new URL("https://erp.glitzit.com/service/api/ItemUnit/GetItemUnitBySearch");
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

      const json = await response.json();

      if (!Array.isArray(json)) {
        return rejectWithValue("Invalid response format");
      }

      return json as ItemUnit[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Network error");
    }
  }
);

export const updatePurchaseOrder = createAsyncThunk<
  UpdatePurchaseOrderResult,
  UpdatePurchaseOrderPayload,
  { state: RootState; rejectValue: string }
>(
  "purchaseOrder/updatePurchaseOrder",
  async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    const { companyId = 1, finYearId = 2, ...payload } = params;

    try {
      const response = await fetch(
        "https://erp.glitzit.com/service/api/PurchaseOrder/UpdateChanges",
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

      const json: ApiResponse = await response.json();

      if (!json?.Server?.Success) {
        return rejectWithValue(json?.Server?.Message ?? "Failed to update purchase order");
      }

      return {
        Success: json.Server.Success,
        Message: json.Server.Message,
        Id: json.Server.Id,
        Info: json.Server.Info,
      } as UpdatePurchaseOrderResult;
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
  itemDetailsForOpeningStock: [],
  productionItemDetails: [],
  selectedItemForPR: [],
  itemUnits: [],
  updatePurchaseOrderResult: null,
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
  itemDetailsForOpeningStockLoading: false,
  itemDetailsForOpeningStockError: null,
  productionItemDetailsLoading: false,
  productionItemDetailsError: null,
  selectedItemForPRLoading: false,
  selectedItemForPRError: null,
  savePurchaseOrderLoading: false,
  savePurchaseOrderError: null,
  savePurchaseOrderResult: null,
  selectedPO: null,
  selectedPOLoading: false,
  selectedPOError: null,
  itemUnitsLoading: false,
  itemUnitsError: null,
  updatePurchaseOrderLoading: false,
  updatePurchaseOrderError: null,
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
    clearItemDetailsForOpeningStock(state) {
      state.itemDetailsForOpeningStock = [];
      state.itemDetailsForOpeningStockError = null;
    },
    clearProductionItemDetails(state) {
      state.productionItemDetails = [];
      state.productionItemDetailsError = null;
    },
    clearSelectedItemForPR(state) {
      state.selectedItemForPR = [];
      state.selectedItemForPRError = null;
    },
    clearSavePurchaseOrder(state) {
      state.savePurchaseOrderResult = null;
      state.savePurchaseOrderError = null;
    },
    clearSelectedPO(state) {
      state.selectedPO = null;
      state.selectedPOError = null;
    },
    clearItemUnits(state) {
      state.itemUnits = [];
      state.itemUnitsError = null;
    },
    clearUpdatePurchaseOrder(state) {
      state.updatePurchaseOrderResult = null;
      state.updatePurchaseOrderError = null;
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

      // fetchItemDetailsForOpeningStock
      .addCase(fetchItemDetailsForOpeningStock.pending, (state) => {
        state.itemDetailsForOpeningStockLoading = true;
        state.itemDetailsForOpeningStockError = null;
      })
      .addCase(fetchItemDetailsForOpeningStock.fulfilled, (state, action) => {
        state.itemDetailsForOpeningStockLoading = false;
        state.itemDetailsForOpeningStock = action.payload;
      })
      .addCase(fetchItemDetailsForOpeningStock.rejected, (state, action) => {
        state.itemDetailsForOpeningStockLoading = false;
        state.itemDetailsForOpeningStockError = action.payload ?? "Failed to load item details for opening stock";
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
      })

      // fetchProductionItemDetails
      .addCase(fetchProductionItemDetails.pending, (state) => {
        state.productionItemDetailsLoading = true;
        state.productionItemDetailsError = null;
      })
      .addCase(fetchProductionItemDetails.fulfilled, (state, action) => {
        state.productionItemDetailsLoading = false;
        state.productionItemDetails = action.payload;
      })
      .addCase(fetchProductionItemDetails.rejected, (state, action) => {
        state.productionItemDetailsLoading = false;
        state.productionItemDetailsError = action.payload ?? "Failed to load production item details";
      })

      // fetchSelectedItemForPR
      .addCase(fetchSelectedItemForPR.pending, (state) => {
        state.selectedItemForPRLoading = true;
        state.selectedItemForPRError = null;
      })
      .addCase(fetchSelectedItemForPR.fulfilled, (state, action) => {
        state.selectedItemForPRLoading = false;
        state.selectedItemForPR = action.payload;
      })
      .addCase(fetchSelectedItemForPR.rejected, (state, action) => {
        state.selectedItemForPRLoading = false;
        state.selectedItemForPRError = action.payload ?? "Failed to load selected item for PR";
      })

      // savePurchaseOrder
      .addCase(savePurchaseOrder.pending, (state) => {
        state.savePurchaseOrderLoading = true;
        state.savePurchaseOrderError = null;
        state.savePurchaseOrderResult = null;
      })
      .addCase(savePurchaseOrder.fulfilled, (state, action) => {
        state.savePurchaseOrderLoading = false;
        state.savePurchaseOrderResult = action.payload;
      })
      .addCase(savePurchaseOrder.rejected, (state, action) => {
        state.savePurchaseOrderLoading = false;
        state.savePurchaseOrderError = action.payload ?? "Failed to save purchase order";
      })

      // fetchSelectedPO
      .addCase(fetchSelectedPO.pending, (state) => {
        state.selectedPOLoading = true;
        state.selectedPOError = null;
      })
      .addCase(fetchSelectedPO.fulfilled, (state, action) => {
        state.selectedPOLoading = false;
        state.selectedPO = action.payload;
      })
      .addCase(fetchSelectedPO.rejected, (state, action) => {
        state.selectedPOLoading = false;
        state.selectedPOError = action.payload ?? "Failed to load selected purchase order";
      })
      // fetchItemUnits
      .addCase(fetchItemUnits.pending, (state) => {
        state.itemUnitsLoading = true;
        state.itemUnitsError = null;
      })
      .addCase(fetchItemUnits.fulfilled, (state, action) => {
        state.itemUnitsLoading = false;
        state.itemUnits = action.payload;
      })
      .addCase(fetchItemUnits.rejected, (state, action) => {
        state.itemUnitsLoading = false;
        state.itemUnitsError = action.payload ?? "Failed to load item units";
      })
      // updatePurchaseOrder
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.updatePurchaseOrderLoading = true;
        state.updatePurchaseOrderError = null;
        state.updatePurchaseOrderResult = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.updatePurchaseOrderLoading = false;
        state.updatePurchaseOrderResult = action.payload;
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.updatePurchaseOrderLoading = false;
        state.updatePurchaseOrderError = action.payload ?? "Failed to update purchase order";
      })
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
  clearItemDetailsForOpeningStock,
  clearProductionItemDetails,
  clearSelectedItemForPR,
  clearSavePurchaseOrder,
  clearSelectedPO,
  clearItemUnits,
  clearUpdatePurchaseOrder,
} = purchaseOrderSlice.actions;

export default purchaseOrderSlice.reducer;