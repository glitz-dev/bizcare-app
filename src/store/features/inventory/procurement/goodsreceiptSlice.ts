import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /DocumentM/GetDocumentStartWith?DocumentType=...&StartWith=...
// Returns a plain array (no envelope)
export interface DocumentStartWithItem {
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

// GET /CommonUtility/GetPaintItem
// Returns a plain number (no envelope)
export type PaintItemResult = number;

// GET /InPass/GetInPassAgainstDoc?startWith=...
// Returns an envelope-wrapped array
export interface InPassAgainstDocItem {
    DocumentID: number;
    DocumentName: string;
    DisplayDocName: string;
    DocumentTypeName: string;
}

// GET /CommonUtility/GetUserTableColumn?tableCode=...
// Returns an envelope-wrapped array
export interface TableColumnItem {
    TableColumnID: number;
    ColumnName: string;
    Show: boolean;
    Width: string;
    ColumnDisplayName: string;
}

// GET /Company/GetCompanyCurrency
// Returns an envelope-wrapped array
export interface CompanyCurrencyItem {
    CompanyID: number;
    CurrencyID: number;
    Currency: string;
    Symbol: string;
}

// GET /Currency/GetCurrencyExRate?currencyID=...&date=...
// Returns an envelope-wrapped array
export interface CurrencyMaster {
    CurrencyID: number;
    CurrencyCode: string;
    Currency: string;
    Active: boolean;
    CompanyID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    CurrencyGuid: string;
    Symbol: string;
    FaClass: string;
    FaChar: string;
    Common: boolean;
}

export interface CurrencyExRateItem {
    CurrencyM: CurrencyMaster;
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

// GET /Party/GetAllSuppliersAndJobWorkers/?startWith=...
// Returns an envelope-wrapped array
export interface SupplierJobWorkerItem {
    SupplierID: number;
    SupplierName: string;
    SupplierStoreID: number | null;
}

// GET /UserStore/GetUserFormWiseStoreDetails
// Returns an envelope-wrapped array
export interface UserFormWiseStoreItem {
    StoreID: number;
    AccessAllJobWorkers: boolean;
    StoreName: string;
}

// GET /Store/GetCompanyStoreStartWith?startWith=...
// Returns an envelope-wrapped array
export interface CompanyStoreItem {
    StoreName: string;
    StoreID: number;
    CompanyStore: boolean;
}

// GET /InPass/GetPurchaseOrdersForInPass?documentID=...&startWith=...&supplierId=...
// Returns an envelope-wrapped array
export interface PurchaseOrderForInPassItem {
    ID: number;
    DocumentID: number;
    SelectedDocNo: string;
    ProfNo: string;
    SupplierID: number;
    SuppilerName: string;
    firstDescr: string;
    secondDescr: string;
}

// GET /Item/GetItemDetailsForOpeningStock?searchStr=...
// Returns an envelope-wrapped array
export interface ItemDetailItem {
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Hsn: string | null;
    PurchaseRate: number | null;
    Description: string | null;
    CategoryID: number | null;
    CategoryName: string | null;
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

// GET /ItemUnit/GetUnitsOfSelectedItem/?itemID=...
// Returns an envelope-wrapped array
export interface ItemUnitItem {
    UnitID: number;
    Unit: string;
}

// GET /InPass/CheckSupplyInvoiceExist?str=...&supplierID=...&inpassID=...
// Returns an envelope-wrapped number (0 = no existing supply invoice match; non-zero = a match was found)
export type SupplyInvoiceExistResult = number;

// POST /InPass/SaveChanges
// Single line item within the LstInPassDetails array of the save payload.
export interface SaveInPassDetailLine {
    InPassTID: number;
    InPassMID: number;
    InPassM: unknown;
    POTID: number;
    OrderedQty: number;
    LandedQty: number;
    ExcessQty: number;
    RejectedQty: number | null;
    Rate: number;
    Amount: string;
    Remarks: string | null;
    ItemID: number;
    ItemM: unknown;
    UnitID: number;
    ItemUnit: unknown;
    BatchID: number;
    ItemBatchM: unknown;
    CompanyID: number;
    BranchID: number | null;
    FinYearID: number | null;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    POID: number;
    StockInLedgerID: number | null;
    StockLedger: unknown;
    StockInID: number | null;
    ItemStock: unknown;
    SpecID: number | null;
    OutPassQty: number | null;
    BillQty: number;
    BillUnitID: number;
    BillUnit: string;
    Damaged: boolean;
    StockRate: number | null;
    LstInpassOutDetails: unknown;
    ItemName: string;
    Unit: unknown;
    UnitMultiplier: number;
    UnitName: string;
    TotalLandedQty: number;
    Spec: unknown;
    ExactStockCheck: boolean;
    RemainingQty: string;
    PrevLandedQty: number;
    InpassQty: number;
    ShowRate: boolean;
    InsufficientStock: boolean;
    PhyStkDate: string;
    Area: string;
}

// Full save payload for a goods receipt (InPass).
export interface SaveGoodsReceiptPayload {
    AgainstDocumentName: string;
    BillNeeded: boolean;
    BillNo: string;
    Currency: string;
    CurrencyID: number;
    DocumentID: number;
    DocumentName: string;
    DocumentTypeName: string;
    ExRate: number;
    GrossAmount: number;
    InPassDate: string;
    InPassDateStr: string;
    InPassDateTimeStr: string;
    InPassDocument: unknown;
    InPassNo: string;
    InPassTime: string;
    InPassTimeStr: string;
    InspectedDate: string | null;
    LocationName: string | null;
    LstInPass: unknown[];
    LstInPassBOMTDetails: unknown[];
    LstInPassDetails: SaveInPassDetailLine[];
    NetAmount: number;
    OtherAdditionalAmount: number;
    OtherDeductionAmount: number;
    PODocID: number;
    POID: number;
    PartyCode: string;
    ProfNo: string;
    SecurityInwardDate: string | null;
    SelectedDocNo: string;
    StoreID: number;
    StoreName: string;
    SupplierID: number;
    SupplierName: string;
    SupplierStoreID: number;
}

// Trimmed result pulled from the envelope: Message carries the saved GRN
// (e.g. "GR-52") and Id carries the newly saved InPass ID (e.g. 2063).
export interface SaveGoodsReceiptResult {
    message: string;
    id: number;
}

// GET /InPass/GetSelectedPurchaseOrderForInPass?PurchaseOrderID=...
// Returns an envelope-wrapped array (single-element array holding the InPass master with its detail lines)
export interface SelectedPurchaseOrderInPassDetailItem {
    InPassTID: number;
    InPassMID: number;
    InPassM: unknown;
    POTID: number;
    OrderedQty: number;
    LandedQty: number;
    ExcessQty: number | null;
    RejectedQty: number | null;
    Rate: number;
    Amount: number;
    Remarks: string | null;
    ItemID: number;
    ItemM: unknown;
    UnitID: number;
    ItemUnit: unknown;
    BatchID: number;
    ItemBatchM: unknown;
    CompanyID: number;
    BranchID: number | null;
    FinYearID: number | null;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    POID: number;
    StockInLedgerID: number | null;
    StockLedger: unknown;
    StockInID: number | null;
    ItemStock: unknown;
    SpecID: number | null;
    OutPassQty: number | null;
    BillQty: number;
    BillUnitID: number | null;
    Damaged: boolean;
    StockRate: number | null;
    LstInpassOutDetails: unknown;
    UnitName: string | null;
    ItemName: string;
    Unit: unknown;
    BillUnit: unknown;
    UnitMultiplier: number;
    TotalLandedQty: number;
    Spec: unknown;
    ExactStockCheck: boolean;
    RemainingQty: number;
    PrevLandedQty: number;
    InpassQty: number;
    ShowRate: boolean;
    InsufficientStock: boolean;
    PhyStkDate: string;
}

export interface SelectedPurchaseOrderForInPassItem {
    InPassID: number;
    DocumentID: number;
    Document: unknown;
    InPassNo: string | null;
    InPassDate: string;
    PODocID: number;
    AgainstDocument: unknown;
    SupplierID: number;
    Supplier: unknown;
    StoreID: number;
    Store: unknown;
    Through: unknown;
    POID: number;
    Remarks: string | null;
    CompanyID: number;
    BranchID: number;
    FinYearID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    InPassGuid: string;
    InPassTime: unknown;
    OtherAdditionalAmount: number | null;
    OtherDeductionAmount: number | null;
    CurrencyID: number | null;
    ExRate: number | null;
    PurchaseEntry: boolean;
    LandedDate: string | null;
    DocumentName: string | null;
    AgainstDocumentName: string | null;
    SupplierName: string;
    StoreName: string;
    InPassTimeVal: unknown;
    SelectedDocNo: string | null;
    InPassDateTimeStr: string | null;
    SupplierStoreID: number;
    LocationName: string | null;
    LstInPassDetails: SelectedPurchaseOrderInPassDetailItem[] | null;
    LstInPassBOMTDetails: unknown;
    LstInpassAdditionalDetails: unknown;
    Approve: boolean | null;
    ApprovedDate: string | null;
    ApprovedBy: string | null;
    QCApprove: boolean | null;
    QCApprovedDate: string | null;
    QCApprovedBy: string | null;
    BillNo: string | null;
    BillNeeded: boolean;
    DisApprovedBy: string | null;
    DisApprovedDate: string | null;
    BillReceivedDate: string | null;
    InvalidationUserID: number | null;
    ProfNo: string | null;
    PartyCode: string | null;
    DisapproveRemark: string | null;
    DocumentTypeName: string | null;
    ProcessName: string | null;
    DisplayDocName: string | null;
    QcApproveDelayRemark: string | null;
}

// Editable row shape for the goods receipt items table, derived from
// SelectedPurchaseOrderInPassDetailItem after fetchSelectedPurchaseOrderForInPass resolves.
export interface ReceiptItemRow {
    potId: number;
    itemId: number;
    itemName: string;
    unitId: number;
    unitName: string | null;
    orderedQty: number;
    landedQty: number;
    billQty: number;
    rate: number;
    amount: number;
    remainingQty: number;
    remarks: string;
    damaged: boolean;
}

// GET /InPass/GetInPasssDetails?From=...&To=...&currentPage=...&rowsPerPage=...&searchStr=...
// Returns an envelope-wrapped array; paginated grid/list of goods receipts (InPass).
export interface GoodsReceiptListItem {
    rowAscNum: number;
    rowDescNum: number;
    InPassID: number;
    InPassNo: string;
    InPassDate: string;
    SupplierID: number;
    Supplier: string;
    Against: string;
    ReceivedAt: string | null;
    Through: string | null;
    NetAmount: number;
    ApprovedBy: string | null;
    BillNo: string | null;
    OrderNo: string | null;
    Approve: string | null;
    QCApprove: string | null;
    QCApprovedBy: string | null;
    CreatedBy: string | null;
    DocumentName: string;
    PurchaseEntry: boolean;
    CreatedDate: string;
    ApprovedDate: string | null;
    Approved: boolean;
    MobileNo: string | null;
    QCApprovedDate: string | null;
}

export interface ApiResponseWrapper<T> {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: T;
        Id: number;
        Info: string | null;
        Approve: boolean | null;
    };
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchDocumentStartWithParams {
    documentType: string;          // e.g. "GOODS RECEIPT"
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchPaintItemParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchInPassAgainstDocParams {
    startWith: string;             // e.g. "LOCAL PURCHASE ORDER"
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchUserTableColumnParams {
    tableCode: string;             // e.g. "InPass_Tbl"
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchCompanyCurrencyParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchCurrencyExRateParams {
    currencyID: number;            // e.g. 4
    date: string;                  // ISO string, e.g. new Date().toISOString()
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchSupplierJobWorkersParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchUserFormWiseStoreParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchCompanyStoreParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchPurchaseOrdersForInPassParams {
    documentID: number;            // e.g. 1035
    startWith?: string;            // default ""
    supplierId?: number;           // default 0
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchItemDetailsParams {
    searchStr?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchUnitsOfSelectedItemParams {
    itemID: number;                // e.g. 81546
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchSelectedPurchaseOrderForInPassParams {
    purchaseOrderID: number;       // e.g. 2092
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface CheckSupplyInvoiceExistParams {
    str: string;                   // bill/invoice no. being checked, e.g. "102"
    supplierID: number;            // e.g. 22011
    inpassID?: number;             // default 0 (0 = new/unsaved goods receipt)
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface SaveGoodsReceiptParams {
    payload: SaveGoodsReceiptPayload;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchGoodsReceiptListParams {
    from: string;                  // DD-MM-YYYY, e.g. "28-06-2020"
    to: string;                    // DD-MM-YYYY, e.g. "28-07-2026"
    currentPage?: number;          // default 1
    rowsPerPage?: number;          // default 25
    searchStr?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface GoodsReceiptState {
    documentStartWithList: DocumentStartWithItem[];
    documentStartWithLoading: boolean;
    documentStartWithError: string | null;

    paintItem: PaintItemResult | null;
    paintItemLoading: boolean;
    paintItemError: string | null;

    inPassAgainstDocList: InPassAgainstDocItem[];
    inPassAgainstDocLoading: boolean;
    inPassAgainstDocError: string | null;

    userTableColumnList: TableColumnItem[];
    userTableColumnLoading: boolean;
    userTableColumnError: string | null;

    companyCurrencyList: CompanyCurrencyItem[];
    companyCurrencyLoading: boolean;
    companyCurrencyError: string | null;

    currencyExRateList: CurrencyExRateItem[];
    currencyExRateLoading: boolean;
    currencyExRateError: string | null;

    supplierJobWorkerList: SupplierJobWorkerItem[];
    supplierJobWorkerLoading: boolean;
    supplierJobWorkerError: string | null;

    userFormWiseStoreList: UserFormWiseStoreItem[];
    userFormWiseStoreLoading: boolean;
    userFormWiseStoreError: string | null;

    companyStoreList: CompanyStoreItem[];
    companyStoreLoading: boolean;
    companyStoreError: string | null;

    purchaseOrdersForInPassList: PurchaseOrderForInPassItem[];
    purchaseOrdersForInPassLoading: boolean;
    purchaseOrdersForInPassError: string | null;

    itemDetailsList: ItemDetailItem[];
    itemDetailsLoading: boolean;
    itemDetailsError: string | null;

    itemUnitsList: ItemUnitItem[];
    itemUnitsLoading: boolean;
    itemUnitsError: string | null;

    selectedPurchaseOrderForInPassList: SelectedPurchaseOrderForInPassItem[];
    selectedPurchaseOrderForInPassLoading: boolean;
    selectedPurchaseOrderForInPassError: string | null;

    receiptItems: ReceiptItemRow[];

    supplyInvoiceExistResult: SupplyInvoiceExistResult | null;
    supplyInvoiceExistLoading: boolean;
    supplyInvoiceExistError: string | null;

    saveGoodsReceiptResult: SaveGoodsReceiptResult | null;
    saveGoodsReceiptLoading: boolean;
    saveGoodsReceiptError: string | null;

    goodsReceiptListList: GoodsReceiptListItem[];
    goodsReceiptListLoading: boolean;
    goodsReceiptListError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: GoodsReceiptState = {
    documentStartWithList: [],
    documentStartWithLoading: false,
    documentStartWithError: null,

    paintItem: null,
    paintItemLoading: false,
    paintItemError: null,

    inPassAgainstDocList: [],
    inPassAgainstDocLoading: false,
    inPassAgainstDocError: null,

    userTableColumnList: [],
    userTableColumnLoading: false,
    userTableColumnError: null,

    companyCurrencyList: [],
    companyCurrencyLoading: false,
    companyCurrencyError: null,

    currencyExRateList: [],
    currencyExRateLoading: false,
    currencyExRateError: null,

    supplierJobWorkerList: [],
    supplierJobWorkerLoading: false,
    supplierJobWorkerError: null,

    userFormWiseStoreList: [],
    userFormWiseStoreLoading: false,
    userFormWiseStoreError: null,

    companyStoreList: [],
    companyStoreLoading: false,
    companyStoreError: null,

    purchaseOrdersForInPassList: [],
    purchaseOrdersForInPassLoading: false,
    purchaseOrdersForInPassError: null,

    itemDetailsList: [],
    itemDetailsLoading: false,
    itemDetailsError: null,

    itemUnitsList: [],
    itemUnitsLoading: false,
    itemUnitsError: null,

    selectedPurchaseOrderForInPassList: [],
    selectedPurchaseOrderForInPassLoading: false,
    selectedPurchaseOrderForInPassError: null,

    receiptItems: [],

    supplyInvoiceExistResult: null,
    supplyInvoiceExistLoading: false,
    supplyInvoiceExistError: null,

    saveGoodsReceiptResult: null,
    saveGoodsReceiptLoading: false,
    saveGoodsReceiptError: null,

    goodsReceiptListList: [],
    goodsReceiptListLoading: false,
    goodsReceiptListError: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    const authState = state as RootState;
    let token = (authState.auth as any)?.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// 1. GetDocumentStartWith — plain array response
export const fetchDocumentStartWith = createAsyncThunk<
    DocumentStartWithItem[],
    FetchDocumentStartWithParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchDocumentStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const startWith = params.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith?DocumentType=${encodeURIComponent(
                params.documentType
            )}&StartWith=${encodeURIComponent(startWith)}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data: DocumentStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetPaintItem — plain number response
export const fetchPaintItem = createAsyncThunk<
    PaintItemResult,
    FetchPaintItemParams | void,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchPaintItem",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/CommonUtility/GetPaintItem`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data: PaintItemResult = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetInPassAgainstDoc — envelope-wrapped response
export const fetchInPassAgainstDoc = createAsyncThunk<
    InPassAgainstDocItem[],
    FetchInPassAgainstDocParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchInPassAgainstDoc",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/InPass/GetInPassAgainstDoc/?startWith=${encodeURIComponent(
                "LOCAL PURCHASE ORDER"
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<InPassAgainstDocItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch in-pass documents.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetUserTableColumn — envelope-wrapped response
export const fetchUserTableColumn = createAsyncThunk<
    TableColumnItem[],
    FetchUserTableColumnParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchUserTableColumn",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/CommonUtility/GetUserTableColumn?tableCode=${encodeURIComponent(
                'InPass_Tbl'
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<TableColumnItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch table columns.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. GetCompanyCurrency — envelope-wrapped response
export const fetchCompanyCurrency = createAsyncThunk<
    CompanyCurrencyItem[],
    FetchCompanyCurrencyParams | void,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchCompanyCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Company/GetCompanyCurrency`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<CompanyCurrencyItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch company currency.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. GetCurrencyExRate — envelope-wrapped response
export const fetchCurrencyExRate = createAsyncThunk<
    CurrencyExRateItem[],
    FetchCurrencyExRateParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchCurrencyExRate",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/GetCurrencyExRate?currencyID=${params.currencyID}&date=${encodeURIComponent(
                params.date
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<CurrencyExRateItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currency exchange rate.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 7. GetAllSuppliersAndJobWorkers — envelope-wrapped response
export const fetchSupplierJobWorkers = createAsyncThunk<
    SupplierJobWorkerItem[],
    FetchSupplierJobWorkersParams | void,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchSupplierJobWorkers",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/Party/GetAllSuppliersAndJobWorkers/?startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<SupplierJobWorkerItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch suppliers/jobworkers.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 8. GetUserFormWiseStoreDetails — envelope-wrapped response
export const fetchUserFormWiseStore = createAsyncThunk<
    UserFormWiseStoreItem[],
    FetchUserFormWiseStoreParams | void,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchUserFormWiseStore",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api//UserStore/GetUserFormWiseStoreDetails`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<UserFormWiseStoreItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch user form-wise stores.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 9. GetCompanyStoreStartWith — envelope-wrapped response
export const fetchCompanyStore = createAsyncThunk<
    CompanyStoreItem[],
    FetchCompanyStoreParams | void,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchCompanyStore",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api//Store/GetCompanyStoreStartWith?startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<CompanyStoreItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch company stores.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 10. GetPurchaseOrdersForInPass — envelope-wrapped response
export const fetchPurchaseOrdersForInPass = createAsyncThunk<
    PurchaseOrderForInPassItem[],
    FetchPurchaseOrdersForInPassParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchPurchaseOrdersForInPass",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const startWith = params.startWith ?? "";
        const supplierId = params.supplierId ?? 0;

        try {
            const url = `https://erp.glitzit.com/service/api/InPass/GetPurchaseOrdersForInPass?documentID=${params.documentID}&startWith=${encodeURIComponent(
                startWith
            )}&supplierId=${supplierId}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<PurchaseOrderForInPassItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch purchase orders.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 11. GetItemDetailsForOpeningStock — envelope-wrapped response
export const fetchItemDetails = createAsyncThunk<
    ItemDetailItem[],
    FetchItemDetailsParams | void,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchItemDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const searchStr = params?.searchStr ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api//Item/GetItemDetailsForOpeningStock?searchStr=${encodeURIComponent(
                searchStr
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<ItemDetailItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch items.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 12. GetUnitsOfSelectedItem — envelope-wrapped response
export const fetchUnitsOfSelectedItem = createAsyncThunk<
    ItemUnitItem[],
    FetchUnitsOfSelectedItemParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchUnitsOfSelectedItem",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/ItemUnit/GetUnitsOfSelectedItem/?itemID=${params.itemID}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<ItemUnitItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch units for the selected item.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 13. GetSelectedPurchaseOrderForInPass — envelope-wrapped response
export const fetchSelectedPurchaseOrderForInPass = createAsyncThunk<
    SelectedPurchaseOrderForInPassItem[],
    FetchSelectedPurchaseOrderForInPassParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchSelectedPurchaseOrderForInPass",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/InPass/GetSelectedPurchaseOrderForInPass?PurchaseOrderID=${params.purchaseOrderID}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<SelectedPurchaseOrderForInPassItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch selected purchase order for in-pass.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 14. CheckSupplyInvoiceExist — envelope-wrapped number response
export const checkSupplyInvoiceExist = createAsyncThunk<
    SupplyInvoiceExistResult,
    CheckSupplyInvoiceExistParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/checkSupplyInvoiceExist",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const inpassID = params.inpassID ?? 0;

        try {
            const url = `https://erp.glitzit.com/service/api/InPass/CheckSupplyInvoiceExist?str=${encodeURIComponent(
                params.str
            )}&supplierID=${params.supplierID}&inpassID=${inpassID}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<SupplyInvoiceExistResult> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? 0;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to check supply invoice.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 15. SaveChanges — POST, envelope-wrapped response (Data is null; Message holds the
// saved GRN and Id holds the newly saved InPass ID)
export const saveGoodsReceipt = createAsyncThunk<
    SaveGoodsReceiptResult,
    SaveGoodsReceiptParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/saveGoodsReceipt",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/InPass/SaveChanges`;

            const response = await fetch(url, {
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

            const json: ApiResponseWrapper<null> = await response.json();

            if (json.Server?.Success) {
                return { message: json.Server.Message ?? "", id: json.Server.Id };
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to save goods receipt.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 16. GetInPasssDetails — envelope-wrapped array; paginated list of goods receipts
export const fetchGoodsReceiptList = createAsyncThunk<
    GoodsReceiptListItem[],
    FetchGoodsReceiptListParams,
    { state: RootState; rejectValue: string }
>(
    "goodsReceipt/fetchGoodsReceiptList",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const currentPage = params.currentPage ?? 1;
        const rowsPerPage = params.rowsPerPage ?? 25;
        const searchStr = params.searchStr ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/InPass/GetInPasssDetails?From=${encodeURIComponent(
                params.from
            )}&To=${encodeURIComponent(
                params.to
            )}&currentPage=${currentPage}&rowsPerPage=${rowsPerPage}&searchStr=${encodeURIComponent(searchStr)}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<GoodsReceiptListItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch goods receipt list.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const goodsReceiptSlice = createSlice({
    name: "goodsReceipt",
    initialState,
    reducers: {
        clearDocumentStartWith(state) {
            state.documentStartWithList = [];
            state.documentStartWithError = null;
        },
        clearInPassAgainstDoc(state) {
            state.inPassAgainstDocList = [];
            state.inPassAgainstDocError = null;
        },
        clearUserTableColumn(state) {
            state.userTableColumnList = [];
            state.userTableColumnError = null;
        },
        clearCompanyCurrency(state) {
            state.companyCurrencyList = [];
            state.companyCurrencyError = null;
        },
        clearCurrencyExRate(state) {
            state.currencyExRateList = [];
            state.currencyExRateError = null;
        },
        clearSupplierJobWorkers(state) {
            state.supplierJobWorkerList = [];
            state.supplierJobWorkerError = null;
        },
        clearUserFormWiseStore(state) {
            state.userFormWiseStoreList = [];
            state.userFormWiseStoreError = null;
        },
        clearCompanyStore(state) {
            state.companyStoreList = [];
            state.companyStoreError = null;
        },
        clearPurchaseOrdersForInPass(state) {
            state.purchaseOrdersForInPassList = [];
            state.purchaseOrdersForInPassError = null;
        },
        clearItemDetails(state) {
            state.itemDetailsList = [];
            state.itemDetailsError = null;
        },
        clearItemUnits(state) {
            state.itemUnitsList = [];
            state.itemUnitsError = null;
        },
        clearSelectedPurchaseOrderForInPass(state) {
            state.selectedPurchaseOrderForInPassList = [];
            state.selectedPurchaseOrderForInPassError = null;
        },
        // Edit a single prefilled row (e.g. LandedQty, Rate, Remarks, Damaged) by its POTID.
        updateReceiptItem(
            state,
            action: PayloadAction<{ potId: number; changes: Partial<ReceiptItemRow> }>
        ) {
            const row = state.receiptItems.find((r) => r.potId === action.payload.potId);
            if (row) {
                Object.assign(row, action.payload.changes);
            }
        },
        clearReceiptItems(state) {
            state.receiptItems = [];
        },
        clearSupplyInvoiceExist(state) {
            state.supplyInvoiceExistResult = null;
            state.supplyInvoiceExistError = null;
        },
        clearSaveGoodsReceipt(state) {
            state.saveGoodsReceiptResult = null;
            state.saveGoodsReceiptError = null;
        },
        clearGoodsReceiptList(state) {
            state.goodsReceiptListList = [];
            state.goodsReceiptListError = null;
        },
        resetGoodsReceipt() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetDocumentStartWith
            .addCase(fetchDocumentStartWith.pending, (state) => {
                state.documentStartWithLoading = true;
                state.documentStartWithError = null;
            })
            .addCase(fetchDocumentStartWith.fulfilled, (state, action) => {
                state.documentStartWithLoading = false;
                state.documentStartWithList = action.payload;
            })
            .addCase(fetchDocumentStartWith.rejected, (state, action) => {
                state.documentStartWithLoading = false;
                state.documentStartWithError = action.payload ?? "Unknown error";
            })

            // GetPaintItem
            .addCase(fetchPaintItem.pending, (state) => {
                state.paintItemLoading = true;
                state.paintItemError = null;
            })
            .addCase(fetchPaintItem.fulfilled, (state, action) => {
                state.paintItemLoading = false;
                state.paintItem = action.payload;
            })
            .addCase(fetchPaintItem.rejected, (state, action) => {
                state.paintItemLoading = false;
                state.paintItemError = action.payload ?? "Unknown error";
            })

            // GetInPassAgainstDoc
            .addCase(fetchInPassAgainstDoc.pending, (state) => {
                state.inPassAgainstDocLoading = true;
                state.inPassAgainstDocError = null;
            })
            .addCase(fetchInPassAgainstDoc.fulfilled, (state, action) => {
                state.inPassAgainstDocLoading = false;
                state.inPassAgainstDocList = action.payload;
            })
            .addCase(fetchInPassAgainstDoc.rejected, (state, action) => {
                state.inPassAgainstDocLoading = false;
                state.inPassAgainstDocError = action.payload ?? "Unknown error";
            })

            // GetUserTableColumn
            .addCase(fetchUserTableColumn.pending, (state) => {
                state.userTableColumnLoading = true;
                state.userTableColumnError = null;
            })
            .addCase(fetchUserTableColumn.fulfilled, (state, action) => {
                state.userTableColumnLoading = false;
                state.userTableColumnList = action.payload;
            })
            .addCase(fetchUserTableColumn.rejected, (state, action) => {
                state.userTableColumnLoading = false;
                state.userTableColumnError = action.payload ?? "Unknown error";
            })

            // GetCompanyCurrency
            .addCase(fetchCompanyCurrency.pending, (state) => {
                state.companyCurrencyLoading = true;
                state.companyCurrencyError = null;
            })
            .addCase(fetchCompanyCurrency.fulfilled, (state, action) => {
                state.companyCurrencyLoading = false;
                state.companyCurrencyList = action.payload;
            })
            .addCase(fetchCompanyCurrency.rejected, (state, action) => {
                state.companyCurrencyLoading = false;
                state.companyCurrencyError = action.payload ?? "Unknown error";
            })

            // GetCurrencyExRate
            .addCase(fetchCurrencyExRate.pending, (state) => {
                state.currencyExRateLoading = true;
                state.currencyExRateError = null;
            })
            .addCase(fetchCurrencyExRate.fulfilled, (state, action) => {
                state.currencyExRateLoading = false;
                state.currencyExRateList = action.payload;
            })
            .addCase(fetchCurrencyExRate.rejected, (state, action) => {
                state.currencyExRateLoading = false;
                state.currencyExRateError = action.payload ?? "Unknown error";
            })

            // GetAllSuppliersAndJobWorkers
            .addCase(fetchSupplierJobWorkers.pending, (state) => {
                state.supplierJobWorkerLoading = true;
                state.supplierJobWorkerError = null;
            })
            .addCase(fetchSupplierJobWorkers.fulfilled, (state, action) => {
                state.supplierJobWorkerLoading = false;
                state.supplierJobWorkerList = action.payload;
            })
            .addCase(fetchSupplierJobWorkers.rejected, (state, action) => {
                state.supplierJobWorkerLoading = false;
                state.supplierJobWorkerError = action.payload ?? "Unknown error";
            })

            // GetUserFormWiseStoreDetails
            .addCase(fetchUserFormWiseStore.pending, (state) => {
                state.userFormWiseStoreLoading = true;
                state.userFormWiseStoreError = null;
            })
            .addCase(fetchUserFormWiseStore.fulfilled, (state, action) => {
                state.userFormWiseStoreLoading = false;
                state.userFormWiseStoreList = action.payload;
            })
            .addCase(fetchUserFormWiseStore.rejected, (state, action) => {
                state.userFormWiseStoreLoading = false;
                state.userFormWiseStoreError = action.payload ?? "Unknown error";
            })

            // GetCompanyStoreStartWith
            .addCase(fetchCompanyStore.pending, (state) => {
                state.companyStoreLoading = true;
                state.companyStoreError = null;
            })
            .addCase(fetchCompanyStore.fulfilled, (state, action) => {
                state.companyStoreLoading = false;
                state.companyStoreList = action.payload;
            })
            .addCase(fetchCompanyStore.rejected, (state, action) => {
                state.companyStoreLoading = false;
                state.companyStoreError = action.payload ?? "Unknown error";
            })

            // GetPurchaseOrdersForInPass
            .addCase(fetchPurchaseOrdersForInPass.pending, (state) => {
                state.purchaseOrdersForInPassLoading = true;
                state.purchaseOrdersForInPassError = null;
            })
            .addCase(fetchPurchaseOrdersForInPass.fulfilled, (state, action) => {
                state.purchaseOrdersForInPassLoading = false;
                state.purchaseOrdersForInPassList = action.payload;
            })
            .addCase(fetchPurchaseOrdersForInPass.rejected, (state, action) => {
                state.purchaseOrdersForInPassLoading = false;
                state.purchaseOrdersForInPassError = action.payload ?? "Unknown error";
            })

            // GetItemDetailsForOpeningStock
            .addCase(fetchItemDetails.pending, (state) => {
                state.itemDetailsLoading = true;
                state.itemDetailsError = null;
            })
            .addCase(fetchItemDetails.fulfilled, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetailsList = action.payload;
            })
            .addCase(fetchItemDetails.rejected, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetailsError = action.payload ?? "Unknown error";
            })

            // GetUnitsOfSelectedItem
            .addCase(fetchUnitsOfSelectedItem.pending, (state) => {
                state.itemUnitsLoading = true;
                state.itemUnitsError = null;
            })
            .addCase(fetchUnitsOfSelectedItem.fulfilled, (state, action) => {
                state.itemUnitsLoading = false;
                state.itemUnitsList = action.payload;
            })
            .addCase(fetchUnitsOfSelectedItem.rejected, (state, action) => {
                state.itemUnitsLoading = false;
                state.itemUnitsError = action.payload ?? "Unknown error";
            })

            // GetSelectedPurchaseOrderForInPass
            .addCase(fetchSelectedPurchaseOrderForInPass.pending, (state) => {
                state.selectedPurchaseOrderForInPassLoading = true;
                state.selectedPurchaseOrderForInPassError = null;
            })
            .addCase(fetchSelectedPurchaseOrderForInPass.fulfilled, (state, action) => {
                state.selectedPurchaseOrderForInPassLoading = false;
                state.selectedPurchaseOrderForInPassList = action.payload;

                // Prefill the receipt items table from the selected PO's detail lines.
                const master = action.payload[0];
                state.receiptItems = (master?.LstInPassDetails ?? []).map((line) => ({
                    potId: line.POTID,
                    itemId: line.ItemID,
                    itemName: line.ItemName,
                    unitId: line.UnitID,
                    unitName: line.UnitName,
                    orderedQty: line.OrderedQty,
                    landedQty: line.LandedQty,
                    billQty: line.BillQty,
                    rate: line.Rate,
                    amount: line.Amount,
                    remainingQty: line.RemainingQty,
                    remarks: line.Remarks ?? "",
                    damaged: line.Damaged,
                }));
            })
            .addCase(fetchSelectedPurchaseOrderForInPass.rejected, (state, action) => {
                state.selectedPurchaseOrderForInPassLoading = false;
                state.selectedPurchaseOrderForInPassError = action.payload ?? "Unknown error";
            })

            // CheckSupplyInvoiceExist
            .addCase(checkSupplyInvoiceExist.pending, (state) => {
                state.supplyInvoiceExistLoading = true;
                state.supplyInvoiceExistError = null;
            })
            .addCase(checkSupplyInvoiceExist.fulfilled, (state, action) => {
                state.supplyInvoiceExistLoading = false;
                state.supplyInvoiceExistResult = action.payload;
            })
            .addCase(checkSupplyInvoiceExist.rejected, (state, action) => {
                state.supplyInvoiceExistLoading = false;
                state.supplyInvoiceExistError = action.payload ?? "Unknown error";
            })

            // SaveChanges
            .addCase(saveGoodsReceipt.pending, (state) => {
                state.saveGoodsReceiptLoading = true;
                state.saveGoodsReceiptError = null;
            })
            .addCase(saveGoodsReceipt.fulfilled, (state, action) => {
                state.saveGoodsReceiptLoading = false;
                state.saveGoodsReceiptResult = action.payload;
            })
            .addCase(saveGoodsReceipt.rejected, (state, action) => {
                state.saveGoodsReceiptLoading = false;
                state.saveGoodsReceiptError = action.payload ?? "Unknown error";
            })

            // GetInPasssDetails
            .addCase(fetchGoodsReceiptList.pending, (state) => {
                state.goodsReceiptListLoading = true;
                state.goodsReceiptListError = null;
            })
            .addCase(fetchGoodsReceiptList.fulfilled, (state, action) => {
                state.goodsReceiptListLoading = false;
                state.goodsReceiptListList = action.payload;
            })
            .addCase(fetchGoodsReceiptList.rejected, (state, action) => {
                state.goodsReceiptListLoading = false;
                state.goodsReceiptListError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearDocumentStartWith,
    clearInPassAgainstDoc,
    clearUserTableColumn,
    clearCompanyCurrency,
    clearCurrencyExRate,
    clearSupplierJobWorkers,
    clearUserFormWiseStore,
    clearCompanyStore,
    clearPurchaseOrdersForInPass,
    clearItemDetails,
    clearItemUnits,
    clearSelectedPurchaseOrderForInPass,
    updateReceiptItem,
    clearReceiptItems,
    clearSupplyInvoiceExist,
    clearSaveGoodsReceipt,
    clearGoodsReceiptList,
    resetGoodsReceipt,
} = goodsReceiptSlice.actions;

export default goodsReceiptSlice.reducer;
