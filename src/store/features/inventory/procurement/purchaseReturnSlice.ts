import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentStartWith {
    DocumentID: number;
    DocumentName: string;
    SetDefault: boolean;
    PrintModName: string | null;
    Declaration: string | null;
    ShortName: string;
    CreditHeadID: number | null;
    Automation: boolean;
    CreditAccount: string | null;
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

export interface PaymentType {
    PaymentTypeID: number;
    PaymentTypeName: string;
}

export interface DefaultStore {
    StoreID: number;
    StoreName: string;
}

export interface AccountHead {
    HeadID: number;
    HeadName: string;
}

export interface InvoiceTaxTypeDetail {
    DocumentID: number;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
}

export interface PurchaseForReturn {
    PurchaseID: number;
    InvoiceNo: string;
    InvoiceDate: string;
    firstDescr: string | null;
    secondDescr: string | null;
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

export interface PurchaseDetailItem {
    PurchaseID: number;
    PurchaseMasterID: number;
    ItemID: number;
    ItemName: string;
    ItemCode: string;
    Quantity: number;
    ReturnQty: number;
    PurchaseRate: number;
    DiscountPercentage: number;
    DiscountAmount: number;
    Amount: number;
    NetPRate: number;
    SGSTPer: number | null;
    CGSTPer: number | null;
    IGSTPer: number | null;
    UTGSTPer: number | null;
    CESSPer: number | null;
    VATPer: number | null;
    SGSTAmt: number;
    CGSTAmt: number;
    IGSTAmt: number;
    UTGSTAmt: number;
    CESSAmt: number;
    VATAmt: number;
    TaxPercentage: number;
    TaxRate: number;
    PurchaseUnitID: number;
    ItemUnitName: string;
    UnitMultiplier: number;
    SalesRate: number;
    MRP: number;
    Free: number;
    HeadID: number;
    CreditOrDebit: number;
    CreditOrDebitName: string;
    Returned: boolean;
    StockTypeID: number;
    StoreID: number;
    OrderedQty: number;
    BatchNo: string | null;
    BatchName: string | null;
    ManufactureDate: string | null;
    ExpiaryDate: string | null;
    GstCategoryDesc: string | null;
    PurchaseDate: string;
}

export interface SelectedPurchaseForReturn {
    PurchaseID: number;
    InvoiceNo: string;
    InvoiceDate: string;
    SupInvoiceNo: string;
    SupInvoiceDate: string;
    SupInvoiceAmt: number | null;
    InvoiceTypeID: number;
    SupplierID: number;
    SupplierName: string;
    DocumentID: number;
    DocumentName: string;
    GSTTypeID: number;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
    TotalQuantity: number;
    GrossAmount: number;
    TotalVATAmount: number;
    TotalTDSAmt: number;
    RoundOffAmount: number;
    NetAmount: number;
    PaymentTypeID: number;
    PaymentTypeName: string;
    CurrencyID: number;
    currencyInfo: string;
    CurrencyExchRate: number;
    GstReverse: boolean;
    IsGST: boolean;
    TaxMasterID: number;
    Returned: boolean;
    Cancelled: boolean;
    Remarks: string | null;
    LstPurchaseDetails: PurchaseDetailItem[];
}

export interface PurchaseReturnDetailBody {
    PurchaseID: number;
    PurchaseMasterID: number;
    PurchaseM: null;
    OrderDetailID: number | null;
    PurchaseOrderT: null;
    ItemID: number;
    ItemName: string;
    ItemCode: string;
    Quantity: number;
    ReturnQty: number;
    PurchaseRate: number;
    DiscountPercentage: number;
    DiscountAmount: number;
    Amount: number;
    NetPRate: number;
    SGSTPer: number | null;
    CGSTPer: number | null;
    IGSTPer: number | null;
    UTGSTPer: number | null;
    CESSPer: number | null;
    VATPer: number | null;
    SGSTAmt: number;
    CGSTAmt: number;
    IGSTAmt: number;
    UTGSTAmt: number;
    CESSAmt: number;
    VATAmt: number;
    TaxPercentage: number;
    TaxRate: number;
    PurchaseUnitID: number;
    ItemUnitName: string;
    UnitMultiplier: number;
    SalesRate: number;
    MRP: number;
    Free: number;
    HeadID: number;
    CreditOrDebit: number;
    CreditOrDebitName: string;
    Returned: boolean;
    StockTypeID: number;
    StoreID: number;
    OrderedQty: number;
    BatchNo: string | null;
    BatchName: string | null;
    ManufactureDate: string | null;
    ExpiaryDate: string | null;
    GstCategoryDesc: string | null;
    PurchaseDate: string;
}

export interface SavePurchaseReturnBody {
    ReturnDateStr: string;
    ReturnDate: string;
    ReturnNo: string;
    DocumentID: number;
    DocumentName: string;
    SupplierID: number;
    SupplierName: string;
    PurchaseID: number;
    PurchaseNo: string;
    InvoiceTypeID: number;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
    PaymentTypeID: number;
    PaymentTypeName: string;
    StoreID: number;
    StoreName: string;
    HeadID: number;
    PRAcHeadID: number;
    DebitHeadName: string;
    TaxMasterID: number;
    IsGST: boolean;
    GrossAmount: string;
    TotalDiscount: string;
    BillwiseDiscountPer: number;
    BillwiseDiscountAmt: string;
    TotalTax: string;
    TotalSGSTAmt: number;
    TotalCGSTAmt: number;
    TotalIGSTAmt: number;
    TotalUTGSTAmt: number;
    TotalCESSAmt: number;
    TotalVATAmt: number;
    TotalVATAmount: number;
    OtherAdditionalAmount: string;
    OtherDeductionAmount: string;
    PreNetAmount: string;
    NetAmount: string;
    NetAmountBase: string;
    NetTotal: string;
    TotalQuantity: string;
    RoundOff: boolean;
    TaxPercHead: string;
    TaxAmountHead: string;
    Remarks: string;
    SupInvoiceDate: string | null;
    ChequeDate: string | null;
    LstPurchaseReturnDetails: PurchaseReturnDetailBody[];
    RoundOffAmount: number;
    RoundOffAmountBase: number;
}

export interface SavePurchaseReturnResult {
    Success: boolean;
    Message: string;
    MessageId: string | null;
    Data: null;
    Id: number;
    Info: string;
    Approve: null;
}

export interface PurchaseReturnListItem {
    rowAscNum: number;
    rowDescNum: number;
    UserID: number;
    ReturnID: number;
    PaymentType: string;
    Store: string;
    Supplier: string;
    ReturnNo: string;
    ReturnDate: string;
    TotalQuantity: number;
    NetAmount: number;
    InvoiceNo: string;
    ApprovedBy: string | null;
    Approve: string;
    DocumentID: number;
    CreatedDate: string;
    ApprovedDate: string;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchDocumentStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchPaymentTypeStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchDefaultStoreParams {
    companyId?: number;
    finYearId?: number;
}

export interface FetchAccHeadStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchAllAccHeadStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchInvoiceTaxTypeParams {
    documentID: number;
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchPurchaseForReturnParams {
    supplierID: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchSelectedPurchaseForReturnParams {
    purchaseID: number;
    companyId?: number;
    finYearId?: number;
}

export interface FetchAllSuppliersParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface SavePurchaseReturnParams {
    body: SavePurchaseReturnBody;
    companyId?: number;
    finYearId?: number;
}

export interface FetchPurchaseReturnListParams {
    fromDate: string;       // "DD-MM-YYYY"
    toDate: string;         // "DD-MM-YYYY"
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    documentType?: string;
    companyId?: number;
    finYearId?: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface PurchaseReturnState {
    documentList: DocumentStartWith[];
    selectedDocument: DocumentStartWith | null;
    documentLoading: boolean;
    documentError: string | null;

    paymentTypeList: PaymentType[];
    selectedPaymentType: PaymentType | null;
    paymentTypeLoading: boolean;
    paymentTypeError: string | null;

    defaultStore: DefaultStore | null;
    storeLoading: boolean;
    storeError: string | null;

    accHeadList: AccountHead[];
    selectedAccHead: AccountHead | null;
    accHeadLoading: boolean;
    accHeadError: string | null;

    allAccHeadList: AccountHead[];
    selectedAllAccHead: AccountHead | null;
    allAccHeadLoading: boolean;
    allAccHeadError: string | null;

    invoiceTaxTypeList: InvoiceTaxTypeDetail[];
    selectedInvoiceTaxType: InvoiceTaxTypeDetail | null;
    invoiceTaxTypeLoading: boolean;
    invoiceTaxTypeError: string | null;

    purchaseForReturnList: PurchaseForReturn[];
    selectedPurchaseForReturn: PurchaseForReturn | null;
    purchaseForReturnLoading: boolean;
    purchaseForReturnError: string | null;

    supplierList: Supplier[];
    selectedSupplier: Supplier | null;
    supplierLoading: boolean;
    supplierError: string | null;

    selectedPurchaseDetail: SelectedPurchaseForReturn | null;
    selectedPurchaseDetailLoading: boolean;
    selectedPurchaseDetailError: string | null;

    saveLoading: boolean;
    saveError: string | null;
    saveResult: SavePurchaseReturnResult | null;

    purchaseReturnList: PurchaseReturnListItem[];
    purchaseReturnListLoading: boolean;
    purchaseReturnListError: string | null;
    purchaseReturnListTotal: number;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: PurchaseReturnState = {
    documentList: [],
    selectedDocument: null,
    documentLoading: false,
    documentError: null,

    paymentTypeList: [],
    selectedPaymentType: null,
    paymentTypeLoading: false,
    paymentTypeError: null,

    defaultStore: null,
    storeLoading: false,
    storeError: null,

    accHeadList: [],
    selectedAccHead: null,
    accHeadLoading: false,
    accHeadError: null,

    allAccHeadList: [],
    selectedAllAccHead: null,
    allAccHeadLoading: false,
    allAccHeadError: null,

    invoiceTaxTypeList: [],
    selectedInvoiceTaxType: null,
    invoiceTaxTypeLoading: false,
    invoiceTaxTypeError: null,

    purchaseForReturnList: [],
    selectedPurchaseForReturn: null,
    purchaseForReturnLoading: false,
    purchaseForReturnError: null,

    supplierList: [],
    selectedSupplier: null,
    supplierLoading: false,
    supplierError: null,

    selectedPurchaseDetail: null,
    selectedPurchaseDetailLoading: false,
    selectedPurchaseDetailError: null,

    saveLoading: false,
    saveError: null,
    saveResult: null,

    purchaseReturnList: [],
    purchaseReturnListLoading: false,
    purchaseReturnListError: null,
    purchaseReturnListTotal: 0,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    let token = state.auth.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDocumentStartWith = createAsyncThunk<
    DocumentStartWith[],
    FetchDocumentStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchDocumentStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith"
            );
            url.searchParams.set("DocumentType", "PURCHASE RETURN");
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

            const json: DocumentStartWith[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPaymentTypeStartWith = createAsyncThunk<
    PaymentType[],
    FetchPaymentTypeStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchPaymentTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: PaymentType[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDefaultStore = createAsyncThunk<
    DefaultStore,
    FetchDefaultStoreParams | void,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchDefaultStore",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: DefaultStore[] = await response.json();
            const store = json[0];
            if (!store) return rejectWithValue("No default store found");
            return store;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccHeadStartWith = createAsyncThunk<
    AccountHead[],
    FetchAccHeadStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchAccHeadStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/AccountHead/GetAccHeadStartWith"
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: AccountHead[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllAccHeadStartWith = createAsyncThunk<
    AccountHead[],
    FetchAllAccHeadStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchAllAccHeadStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: AccountHead[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPurchaseDetailsForReturn = createAsyncThunk<
    PurchaseForReturn[],
    FetchPurchaseForReturnParams,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchPurchaseDetailsForReturn",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { supplierID, searchStr = "", companyId = 1, finYearId = 2 } = params;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Purchase/GetPurchaseDetailsForReturnBySupplierID"
            );
            url.searchParams.set("SupplierID", String(supplierID));
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

            const json: { Server: { Success: boolean; Message: string; Data: PurchaseForReturn[] } } =
                await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch purchase details for return");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchInvoiceTaxTypeDetails = createAsyncThunk<
    InvoiceTaxTypeDetail[],
    FetchInvoiceTaxTypeParams,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchInvoiceTaxTypeDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: { Server: { Success: boolean; Message: string; Data: InvoiceTaxTypeDetail[] } } =
                await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch invoice tax types");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllSuppliers = createAsyncThunk<
    Supplier[],
    FetchAllSuppliersParams | void,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchAllSuppliers",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: { Server: { Success: boolean; Message: string; Data: Supplier[] } } =
                await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch suppliers");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSelectedPurchaseForReturn = createAsyncThunk<
    SelectedPurchaseForReturn,
    FetchSelectedPurchaseForReturnParams,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchSelectedPurchaseForReturn",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { purchaseID, companyId = 1, finYearId = 2 } = params;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Purchase/GetSelectedPurchaseforPurchaseReturn"
            );
            url.searchParams.set("PurchaseID", String(purchaseID));

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

            const json: { Server: { Success: boolean; Message: string; Data: SelectedPurchaseForReturn } } =
                await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch selected purchase for return");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const savePurchaseReturn = createAsyncThunk<
    SavePurchaseReturnResult,
    SavePurchaseReturnParams,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/savePurchaseReturn",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { body, companyId = 1, finYearId = 2 } = params;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/PurchaseReturn/SaveChanges"
            );

            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: { Server: SavePurchaseReturnResult } = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to save purchase return");
            }

            return json.Server;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPurchaseReturnList = createAsyncThunk<
    { data: PurchaseReturnListItem[]; total: number },
    FetchPurchaseReturnListParams,
    { state: RootState; rejectValue: string }
>(
    "purchaseReturn/fetchPurchaseReturnList",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const {
            fromDate,
            toDate,
            rowsPerPage = 25,
            currentPage = 1,
            searchStr = "",
            documentType = "PURCHASE RETURN",
            companyId = 1,
            finYearId = 2,
        } = params;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/PurchaseReturn/ReadAllPurchaseReturns"
            );
            url.searchParams.set("FromDate", fromDate);
            url.searchParams.set("ToDate", toDate);
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
            url.searchParams.set("currentPage", String(currentPage));
            url.searchParams.set("searchStr", searchStr);
            url.searchParams.set("documentType", documentType);

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

            const json: {
                Server: {
                    Success: boolean;
                    Message: string;
                    Data: PurchaseReturnListItem[];
                    Id: number;
                };
            } = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch purchase returns");
            }

            const data = json.Server.Data ?? [];
            return { data, total: data.length > 0 ? data[0].rowAscNum : 0 };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const purchaseReturnSlice = createSlice({
    name: "purchaseReturn",
    initialState,
    reducers: {
        setSelectedDocument(state, action: PayloadAction<DocumentStartWith | null>) {
            state.selectedDocument = action.payload;
        },
        clearDocumentList(state) {
            state.documentList = [];
            state.documentError = null;
        },
        setSelectedPaymentType(state, action: PayloadAction<PaymentType | null>) {
            state.selectedPaymentType = action.payload;
        },
        clearPaymentTypeList(state) {
            state.paymentTypeList = [];
            state.paymentTypeError = null;
        },
        clearDefaultStore(state) {
            state.defaultStore = null;
            state.storeError = null;
        },
        setSelectedAccHead(state, action: PayloadAction<AccountHead | null>) {
            state.selectedAccHead = action.payload;
        },
        clearAccHeadList(state) {
            state.accHeadList = [];
            state.accHeadError = null;
        },
        setSelectedAllAccHead(state, action: PayloadAction<AccountHead | null>) {
            state.selectedAllAccHead = action.payload;
        },
        clearAllAccHeadList(state) {
            state.allAccHeadList = [];
            state.allAccHeadError = null;
        },
        setSelectedInvoiceTaxType(state, action: PayloadAction<InvoiceTaxTypeDetail | null>) {
            state.selectedInvoiceTaxType = action.payload;
        },
        clearInvoiceTaxTypeList(state) {
            state.invoiceTaxTypeList = [];
            state.invoiceTaxTypeError = null;
        },
        setSelectedPurchaseForReturn(state, action: PayloadAction<PurchaseForReturn | null>) {
            state.selectedPurchaseForReturn = action.payload;
        },
        clearPurchaseForReturnList(state) {
            state.purchaseForReturnList = [];
            state.purchaseForReturnError = null;
        },
        setSelectedSupplier(state, action: PayloadAction<Supplier | null>) {
            state.selectedSupplier = action.payload;
        },
        clearSupplierList(state) {
            state.supplierList = [];
            state.supplierError = null;
        },
        clearSelectedPurchaseDetail(state) {
            state.selectedPurchaseDetail = null;
            state.selectedPurchaseDetailError = null;
        },
        clearSaveResult(state) {
            state.saveResult = null;
            state.saveError = null;
        },
        clearPurchaseReturnList(state) {
            state.purchaseReturnList = [];
            state.purchaseReturnListError = null;
            state.purchaseReturnListTotal = 0;
        },
        resetPurchaseReturn() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Document ──────────────────────────────────────────────────────────
            .addCase(fetchDocumentStartWith.pending, (state) => {
                state.documentLoading = true;
                state.documentError = null;
            })
            .addCase(fetchDocumentStartWith.fulfilled, (state, action) => {
                state.documentLoading = false;
                state.documentList = action.payload;

                if (!state.selectedDocument) {
                    const defaultDoc = action.payload.find((doc) => doc.SetDefault);
                    state.selectedDocument = defaultDoc ?? action.payload[0] ?? null;
                }
            })
            .addCase(fetchDocumentStartWith.rejected, (state, action) => {
                state.documentLoading = false;
                state.documentError = action.payload ?? "Unknown error";
            })

            // ── Payment Type ──────────────────────────────────────────────────────
            .addCase(fetchPaymentTypeStartWith.pending, (state) => {
                state.paymentTypeLoading = true;
                state.paymentTypeError = null;
            })
            .addCase(fetchPaymentTypeStartWith.fulfilled, (state, action) => {
                state.paymentTypeLoading = false;
                state.paymentTypeList = action.payload;

                if (!state.selectedPaymentType && action.payload.length > 0) {
                    state.selectedPaymentType = action.payload[0];
                }
            })
            .addCase(fetchPaymentTypeStartWith.rejected, (state, action) => {
                state.paymentTypeLoading = false;
                state.paymentTypeError = action.payload ?? "Unknown error";
            })

            // ── Default Store ─────────────────────────────────────────────────────
            .addCase(fetchDefaultStore.pending, (state) => {
                state.storeLoading = true;
                state.storeError = null;
            })
            .addCase(fetchDefaultStore.fulfilled, (state, action) => {
                state.storeLoading = false;
                state.defaultStore = action.payload;
            })
            .addCase(fetchDefaultStore.rejected, (state, action) => {
                state.storeLoading = false;
                state.storeError = action.payload ?? "Unknown error";
            })

            // ── Account Head ──────────────────────────────────────────────────────
            .addCase(fetchAccHeadStartWith.pending, (state) => {
                state.accHeadLoading = true;
                state.accHeadError = null;
            })
            .addCase(fetchAccHeadStartWith.fulfilled, (state, action) => {
                state.accHeadLoading = false;
                state.accHeadList = action.payload;

                if (!state.selectedAccHead && action.payload.length > 0) {
                    state.selectedAccHead = action.payload[0];
                }
            })
            .addCase(fetchAccHeadStartWith.rejected, (state, action) => {
                state.accHeadLoading = false;
                state.accHeadError = action.payload ?? "Unknown error";
            })

            // ── All Account Head ──────────────────────────────────────────────────
            .addCase(fetchAllAccHeadStartWith.pending, (state) => {
                state.allAccHeadLoading = true;
                state.allAccHeadError = null;
            })
            .addCase(fetchAllAccHeadStartWith.fulfilled, (state, action) => {
                state.allAccHeadLoading = false;
                state.allAccHeadList = action.payload;
            })
            .addCase(fetchAllAccHeadStartWith.rejected, (state, action) => {
                state.allAccHeadLoading = false;
                state.allAccHeadError = action.payload ?? "Unknown error";
            })

            // ── Purchase Details For Return ────────────────────────────────────────
            .addCase(fetchPurchaseDetailsForReturn.pending, (state) => {
                state.purchaseForReturnLoading = true;
                state.purchaseForReturnError = null;
            })
            .addCase(fetchPurchaseDetailsForReturn.fulfilled, (state, action) => {
                state.purchaseForReturnLoading = false;
                state.purchaseForReturnList = action.payload;
                state.selectedPurchaseForReturn = null; // reset selection when list refreshes
            })
            .addCase(fetchPurchaseDetailsForReturn.rejected, (state, action) => {
                state.purchaseForReturnLoading = false;
                state.purchaseForReturnError = action.payload ?? "Unknown error";
            })

            // ── Invoice Tax Type ──────────────────────────────────────────────────
            .addCase(fetchInvoiceTaxTypeDetails.pending, (state) => {
                state.invoiceTaxTypeLoading = true;
                state.invoiceTaxTypeError = null;
            })
            .addCase(fetchInvoiceTaxTypeDetails.fulfilled, (state, action) => {
                state.invoiceTaxTypeLoading = false;
                state.invoiceTaxTypeList = action.payload;

                if (!state.selectedInvoiceTaxType && action.payload.length > 0) {
                    state.selectedInvoiceTaxType = action.payload[0];
                }
            })
            .addCase(fetchInvoiceTaxTypeDetails.rejected, (state, action) => {
                state.invoiceTaxTypeLoading = false;
                state.invoiceTaxTypeError = action.payload ?? "Unknown error";
            })

            // ── All Suppliers ─────────────────────────────────────────────────────
            .addCase(fetchAllSuppliers.pending, (state) => {
                state.supplierLoading = true;
                state.supplierError = null;
            })
            .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
                state.supplierLoading = false;
                state.supplierList = action.payload;
            })
            .addCase(fetchAllSuppliers.rejected, (state, action) => {
                state.supplierLoading = false;
                state.supplierError = action.payload ?? "Unknown error";
            })

            // ── Selected Purchase For Return ───────────────────────────────────────
            .addCase(fetchSelectedPurchaseForReturn.pending, (state) => {
                state.selectedPurchaseDetailLoading = true;
                state.selectedPurchaseDetailError = null;
            })
            .addCase(fetchSelectedPurchaseForReturn.fulfilled, (state, action) => {
                state.selectedPurchaseDetailLoading = false;
                state.selectedPurchaseDetail = action.payload;
            })
            .addCase(fetchSelectedPurchaseForReturn.rejected, (state, action) => {
                state.selectedPurchaseDetailLoading = false;
                state.selectedPurchaseDetailError = action.payload ?? "Unknown error";
            })

            // ── Save Purchase Return ───────────────────────────────────────────────
            .addCase(savePurchaseReturn.pending, (state) => {
                state.saveLoading = true;
                state.saveError = null;
                state.saveResult = null;
            })
            .addCase(savePurchaseReturn.fulfilled, (state, action) => {
                state.saveLoading = false;
                state.saveResult = action.payload;
            })
            .addCase(savePurchaseReturn.rejected, (state, action) => {
                state.saveLoading = false;
                state.saveError = action.payload ?? "Unknown error";
            })

            // ── Purchase Return List ───────────────────────────────────────────────
            .addCase(fetchPurchaseReturnList.pending, (state) => {
                state.purchaseReturnListLoading = true;
                state.purchaseReturnListError = null;
            })
            .addCase(fetchPurchaseReturnList.fulfilled, (state, action) => {
                state.purchaseReturnListLoading = false;
                state.purchaseReturnList = action.payload.data;
                state.purchaseReturnListTotal = action.payload.total;
            })
            .addCase(fetchPurchaseReturnList.rejected, (state, action) => {
                state.purchaseReturnListLoading = false;
                state.purchaseReturnListError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    setSelectedDocument,
    clearDocumentList,
    setSelectedPaymentType,
    clearPaymentTypeList,
    clearDefaultStore,
    setSelectedAccHead,
    clearAccHeadList,
    setSelectedAllAccHead,
    clearAllAccHeadList,
    setSelectedInvoiceTaxType,
    clearInvoiceTaxTypeList,
    setSelectedPurchaseForReturn,
    clearPurchaseForReturnList,
    setSelectedSupplier,
    clearSupplierList,
    clearSelectedPurchaseDetail,
    clearSaveResult,
    clearPurchaseReturnList,
    resetPurchaseReturn,
} = purchaseReturnSlice.actions;

export default purchaseReturnSlice.reducer;