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

export interface PaymentType {
    PaymentTypeID: number;
    PaymentTypeName: string;
}

export interface TableColumn {
    TableColumnID: number;
    ColumnName: string;
    Show: boolean;
    Width: string;
    ColumnDisplayName: string;
}

export interface InvoiceTaxTypeDetail {
    DocumentID: number;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
}

export interface Currency {
    CurrencyID: number;
    Currency: string;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

export interface TaxRate {
    TaxCategoryName: string;
    TaxValue: number;
    TaxCategoryId: number;
}

export interface ServiceItem {
    ItemID: number;
    ItemCode: string;
    ItemName: string;
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
    UnitMultiplier: number;
    HeadID: number;
    SalesUnitID: number;
}

export interface AccountHead {
    HeadName: string;
    HeadID: number;
}

export interface PurchaseListItem {
    rowAscNum: number;
    rowDescNum: number;
    UserID: number;
    PurchaseID: number;
    PODocID: number | null;
    InvoiceNo: string;
    InvoiceDate: string;
    PaymentType: string;
    Store: string | null;
    Supplier: string;
    TotalQuantity: number;
    NetAmount: number;
    TotalAmt: number;
    ApprovedBy: string | null;
    Approve: string;
    Approved: boolean;
    DocumentID: number;
    AgainstDocumentName: string;
    PODocID1: number | null;
    DocumentTypeID: number;
    SupInvoiceNo: string;
    SupInvoiceDate: string | null;
    InpassNo: string;
    CreatedDate: string;
    ApprovedDate: string | null;
    Username: string;
    MobileNo: string;
    MsgSent: boolean;
}

export interface ServiceBillListItem {
    rowAscNum: number;
    rowDescNum: number;
    ServiceBillID: number;
    InvoiceNo: string;
    SupplierID: number;
    GrossAmount: number;
    NetAmount: number;
    PartyName: string;
    TDSApplicableOn: number;
    TaxPercentage: number;
    SGSTPer: number;
    CGSTPer: number;
    IGSTPer: number;
    UTGTPer: number;
    VATPer: number;
    CESSPer: number;
    ItemID: number | null;
    ItemName: string | null;
    HeadID: number | null;
    InvoiceDate: string;
    SupInvoiceNo: string;
}

// New Interface for Sales/Purchase API
export interface SalesPurchaseForServiceBillItem {
    rowAscNum: number;
    rowDescNum: number;
    PartyName: string;
    DocumentID: number;
    VoucherID: number;
    InvoiceNo: string;
    VoucherNo: string;
    InvoiceDate: string;
    SupInvoiceNo: string;
    SupInvoiceDate: string;
    NetAmount: number;
    Type: string;
    PartyCode: string;
}

// Interface specifically for Sales records — SupInvoiceNo/SupInvoiceDate are absent in Sales response
export interface SalesForServiceBillItem {
    rowAscNum: number;
    rowDescNum: number;
    PartyName: string;
    DocumentID: number;
    VoucherID: number;
    InvoiceNo: string;
    VoucherNo: string;
    InvoiceDate: string;
    NetAmount: number;
    Type: string;
    PartyCode: string;
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

export interface ServerResponse<T> {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: T;
        Id?: number;
        Info?: any;
        Approve?: any;
    };
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

export interface FetchUserTableColumnParams {
    tableCode?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchInvoiceTaxTypeParams {
    documentID: number;
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchCurrencyStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchServiceBillListParams {
    supplierID?: number;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchSalesPurchaseForServiceBillParams {
    startDate?: string;
    endDate?: string;
    supplierID?: number;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchSuppliersParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchTaxRatesParams {
    taxMasterName?: string;
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchServiceItemsParams {
    itemCategoryID?: number;
    itemGroupID?: number;
    itemTypeID?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchAccountHeadsParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchPurchaseListParams {
    fromDate?: string;
    toDate?: string;
    rowsPerPage?: number;
    documentType?: string;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchSalesForServiceBillParams {
    startDate?: string;
    endDate?: string;
    supplierID?: number;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

// Params for the new dedicated Sales thunk
export interface FetchSalesListForServiceBillParams {
    startDate?: string;
    endDate?: string;
    supplierID?: number;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

// Params for the new dedicated Purchase thunk
export interface FetchPurchaseListForServiceBillParams {
    startDate?: string;
    endDate?: string;
    supplierID?: number;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface ServiceBillState {
    documentList: DocumentStartWith[];
    selectedDocument: DocumentStartWith | null;
    documentLoading: boolean;
    documentError: string | null;

    paymentTypeList: PaymentType[];
    selectedPaymentType: PaymentType | null;
    paymentTypeLoading: boolean;
    paymentTypeError: string | null;

    tableColumnList: TableColumn[];
    tableColumnLoading: boolean;
    tableColumnError: string | null;

    invoiceTaxTypeList: InvoiceTaxTypeDetail[];
    selectedInvoiceTaxType: InvoiceTaxTypeDetail | null;
    invoiceTaxTypeLoading: boolean;
    invoiceTaxTypeError: string | null;

    currencyList: Currency[];
    selectedCurrency: Currency | null;
    currencyLoading: boolean;
    currencyError: string | null;

    // Supplier
    supplierList: Supplier[];
    selectedSupplier: Supplier | null;
    supplierLoading: boolean;
    supplierError: string | null;

    serviceBillList: ServiceBillListItem[];
    serviceBillListLoading: boolean;
    serviceBillListError: string | null;

    // Purchase records for Service Bill
    salesPurchaseList: SalesPurchaseForServiceBillItem[];
    salesPurchaseListLoading: boolean;
    salesPurchaseListError: string | null;

    // Sales records for Service Bill
    salesList: SalesPurchaseForServiceBillItem[];
    salesListLoading: boolean;
    salesListError: string | null;

    // Sales-only records (type=Sales, no SupInvoiceNo/SupInvoiceDate)
    salesItemList: SalesForServiceBillItem[];
    salesItemListLoading: boolean;
    salesItemListError: string | null;

    // Purchase-only records (type=Purchase, SalesPurchaseForServiceBillItem)
    purchaseItemList: SalesPurchaseForServiceBillItem[];
    purchaseItemListLoading: boolean;
    purchaseItemListError: string | null;

    // Tax Rates (GST)
    taxRateList: TaxRate[];
    selectedTaxRate: TaxRate | null;
    taxRateLoading: boolean;
    taxRateError: string | null;

    // Service Items
    serviceItemList: ServiceItem[];
    selectedServiceItem: ServiceItem | null;
    serviceItemLoading: boolean;
    serviceItemError: string | null;

    // Account Heads
    accountHeadList: AccountHead[];
    selectedAccountHead: AccountHead | null;
    accountHeadLoading: boolean;
    accountHeadError: string | null;

    // Purchase List (ReadAllPurchase)
    purchaseList: PurchaseListItem[];
    purchaseListLoading: boolean;
    purchaseListError: string | null;
    purchaseListTotalRows: number;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: ServiceBillState = {
    documentList: [],
    selectedDocument: null,
    documentLoading: false,
    documentError: null,

    paymentTypeList: [],
    selectedPaymentType: null,
    paymentTypeLoading: false,
    paymentTypeError: null,

    tableColumnList: [],
    tableColumnLoading: false,
    tableColumnError: null,

    invoiceTaxTypeList: [],
    selectedInvoiceTaxType: null,
    invoiceTaxTypeLoading: false,
    invoiceTaxTypeError: null,

    currencyList: [],
    selectedCurrency: null,
    currencyLoading: false,
    currencyError: null,

    supplierList: [],
    selectedSupplier: null,
    supplierLoading: false,
    supplierError: null,

    serviceBillList: [],
    serviceBillListLoading: false,
    serviceBillListError: null,

    salesPurchaseList: [],
    salesPurchaseListLoading: false,
    salesPurchaseListError: null,

    salesList: [],
    salesListLoading: false,
    salesListError: null,

    salesItemList: [],
    salesItemListLoading: false,
    salesItemListError: null,

    purchaseItemList: [],
    purchaseItemListLoading: false,
    purchaseItemListError: null,

    taxRateList: [],
    selectedTaxRate: null,
    taxRateLoading: false,
    taxRateError: null,

    serviceItemList: [],
    selectedServiceItem: null,
    serviceItemLoading: false,
    serviceItemError: null,

    accountHeadList: [],
    selectedAccountHead: null,
    accountHeadLoading: false,
    accountHeadError: null,

    purchaseList: [],
    purchaseListLoading: false,
    purchaseListError: null,
    purchaseListTotalRows: 0,
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
    "serviceBill/fetchDocumentStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith");
            url.searchParams.set("DocumentType", "Service Bill Purchase");
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
    "serviceBill/fetchPaymentTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/PaymentType/GetPaymentTypeStartWith");
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

export const fetchUserTableColumn = createAsyncThunk<
    TableColumn[],
    FetchUserTableColumnParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchUserTableColumn",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const tableCode = params?.tableCode ?? "PurchaseTbl";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<TableColumn[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch table columns");
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
    "serviceBill/fetchInvoiceTaxTypeDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { documentID, startWith = "", companyId = 1, finYearId = 2 } = params;

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<InvoiceTaxTypeDetail[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch invoice tax types");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyStartWith = createAsyncThunk<
    Currency[],
    FetchCurrencyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchCurrencyStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Currency/GetCurrencyStartwith");
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

            const json: ServerResponse<Currency[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currencies");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchServiceBillList = createAsyncThunk<
    ServiceBillListItem[],
    FetchServiceBillListParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchServiceBillList",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const supplierID = params?.supplierID ?? 0;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const currentPage = params?.currentPage ?? 1;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Purchase/GetAllServiceBillFor");
            url.searchParams.set("supplierID", String(supplierID));
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<ServiceBillListItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch service bills");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// New Thunk - GetAllSalesPurchaseForSevicebill
export const fetchSalesPurchaseForServiceBill = createAsyncThunk<
    SalesPurchaseForServiceBillItem[],
    FetchSalesPurchaseForServiceBillParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchSalesPurchaseForServiceBill",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const type = "Purchase";
        const startDate = params?.startDate ?? "";
        const endDate = params?.endDate ?? "";
        const supplierID = params?.supplierID ?? 0;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const currentPage = params?.currentPage ?? 1;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Purchase/GetAllSalesPurchaseForSevicebill");
            url.searchParams.set("type", type);
            if (startDate) url.searchParams.set("startDate", startDate);
            if (endDate) url.searchParams.set("endDate", endDate);
            url.searchParams.set("supplierID", String(supplierID));
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<SalesPurchaseForServiceBillItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch sales/purchase records");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Sales thunk - GetAllSalesPurchaseForSevicebill (type=Sales)
export const fetchSalesForServiceBill = createAsyncThunk<
    SalesPurchaseForServiceBillItem[],
    FetchSalesForServiceBillParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchSalesForServiceBill",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startDate = params?.startDate ?? "";
        const endDate = params?.endDate ?? "";
        const supplierID = params?.supplierID ?? 0;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const currentPage = params?.currentPage ?? 1;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Purchase/GetAllSalesPurchaseForSevicebill");
            url.searchParams.set("type", "Sales");
            if (startDate) url.searchParams.set("startDate", startDate);
            if (endDate) url.searchParams.set("endDate", endDate);
            url.searchParams.set("supplierID", String(supplierID));
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<SalesPurchaseForServiceBillItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch sales records");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Suppliers thunk - GetAllSuppliers
export const fetchAllSuppliers = createAsyncThunk<
    Supplier[],
    FetchSuppliersParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchAllSuppliers",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<Supplier[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch suppliers");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// New thunk — GetAllSalesPurchaseForSevicebill (type=Sales)

export const fetchSalesListForServiceBill = createAsyncThunk<
    SalesForServiceBillItem[],
    FetchSalesListForServiceBillParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchSalesListForServiceBill",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startDate = params?.startDate ?? "";
        const endDate = params?.endDate ?? "";
        const supplierID = params?.supplierID ?? 0;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const currentPage = params?.currentPage ?? 1;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Purchase/GetAllSalesPurchaseForSevicebill");
            url.searchParams.set("type", "Sales");
            if (startDate) url.searchParams.set("startDate", startDate);
            if (endDate) url.searchParams.set("endDate", endDate);
            url.searchParams.set("supplierID", String(supplierID));
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<SalesForServiceBillItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch sales records");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Purchase thunk — GetAllSalesPurchaseForSevicebill (type=Purchase)
// Uses SalesPurchaseForServiceBillItem which includes SupInvoiceNo / SupInvoiceDate
export const fetchPurchaseListForServiceBill = createAsyncThunk<
    SalesPurchaseForServiceBillItem[],
    FetchPurchaseListForServiceBillParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchPurchaseListForServiceBill",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startDate = params?.startDate ?? "";
        const endDate = params?.endDate ?? "";
        const supplierID = params?.supplierID ?? 0;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const currentPage = params?.currentPage ?? 1;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Purchase/GetAllSalesPurchaseForSevicebill");
            url.searchParams.set("type", "Purchase");
            if (startDate) url.searchParams.set("startDate", startDate);
            if (endDate) url.searchParams.set("endDate", endDate);
            url.searchParams.set("supplierID", String(supplierID));
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<SalesPurchaseForServiceBillItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch purchase records");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Tax Rates thunk — GetTaxRates
export const fetchTaxRates = createAsyncThunk<
    TaxRate[],
    FetchTaxRatesParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchTaxRates",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const taxMasterName = params?.taxMasterName ?? "GST";
        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Voucher/GetTaxRates");
            url.searchParams.set("TaxMasterName", taxMasterName);
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

            const json: TaxRate[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Service Items thunk — GetServiceItem
export const fetchServiceItems = createAsyncThunk<
    ServiceItem[],
    FetchServiceItemsParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchServiceItems",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const itemCategoryID = params?.itemCategoryID ?? 0;
        const itemGroupID = params?.itemGroupID ?? 0;
        const itemTypeID = params?.itemTypeID ?? 3;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Item/GetServiceItem");
            url.searchParams.set("itemCategoryID", String(itemCategoryID));
            url.searchParams.set("itemGroupID", String(itemGroupID));
            url.searchParams.set("itemTypeID", String(itemTypeID));
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

            const json: ServerResponse<ServiceItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch service items");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Account Heads thunk — GetAllAccHeadStartWith
export const fetchAccountHeads = createAsyncThunk<
    AccountHead[],
    FetchAccountHeadsParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchAccountHeads",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/AccountHead/GetAllAccHeadStartWith");
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

            // Response is a plain array — not wrapped in Server
            const json: AccountHead[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Purchase List thunk — ReadAllPurchase
export const fetchPurchaseList = createAsyncThunk<
    { data: PurchaseListItem[]; totalRows: number },
    FetchPurchaseListParams | void,
    { state: RootState; rejectValue: string }
>(
    "serviceBill/fetchPurchaseList",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const fromDate = params?.fromDate ?? "12-05-2022";
        const toDate = params?.toDate ?? new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const documentType = params?.documentType ?? "Service Bill Purchase";
        const currentPage = params?.currentPage ?? 1;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Purchase/ReadAllPurchase");
            url.searchParams.set("FromDate", fromDate);
            url.searchParams.set("ToDate", toDate);
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<PurchaseListItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch purchase list");
            }

            // rowAscNum on the first item = total record count (descending list)
            const totalRows = json.Server.Data?.[0]?.rowAscNum ?? json.Server.Data?.length ?? 0;

            return { data: json.Server.Data, totalRows };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const serviceBillSlice = createSlice({
    name: "serviceBill",
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
        clearTableColumnList(state) {
            state.tableColumnList = [];
            state.tableColumnError = null;
        },
        setSelectedInvoiceTaxType(state, action: PayloadAction<InvoiceTaxTypeDetail | null>) {
            state.selectedInvoiceTaxType = action.payload;
        },
        clearInvoiceTaxTypeList(state) {
            state.invoiceTaxTypeList = [];
            state.invoiceTaxTypeError = null;
        },
        setSelectedCurrency(state, action: PayloadAction<Currency | null>) {
            state.selectedCurrency = action.payload;
        },
        clearCurrencyList(state) {
            state.currencyList = [];
            state.currencyError = null;
        },
        setSelectedSupplier(state, action: PayloadAction<Supplier | null>) {
            state.selectedSupplier = action.payload;
        },
        clearSupplierList(state) {
            state.supplierList = [];
            state.supplierError = null;
        },
        clearServiceBillList(state) {
            state.serviceBillList = [];
            state.serviceBillListError = null;
        },
        clearSalesPurchaseList(state) {
            state.salesPurchaseList = [];
            state.salesPurchaseListError = null;
        },
        clearSalesList(state) {
            state.salesList = [];
            state.salesListError = null;
        },
        clearSalesItemList(state) {
            state.salesItemList = [];
            state.salesItemListError = null;
        },
        clearPurchaseItemList(state) {
            state.purchaseItemList = [];
            state.purchaseItemListError = null;
        },
        setSelectedTaxRate(state, action: PayloadAction<TaxRate | null>) {
            state.selectedTaxRate = action.payload;
        },
        clearTaxRateList(state) {
            state.taxRateList = [];
            state.taxRateError = null;
        },
        setSelectedServiceItem(state, action: PayloadAction<ServiceItem | null>) {
            state.selectedServiceItem = action.payload;
        },
        clearServiceItemList(state) {
            state.serviceItemList = [];
            state.serviceItemError = null;
        },
        setSelectedAccountHead(state, action: PayloadAction<AccountHead | null>) {
            state.selectedAccountHead = action.payload;
        },
        clearAccountHeadList(state) {
            state.accountHeadList = [];
            state.accountHeadError = null;
        },
        clearPurchaseList(state) {
            state.purchaseList = [];
            state.purchaseListError = null;
            state.purchaseListTotalRows = 0;
        },
        resetServiceBill() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Document
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

            // Payment Type
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

            // User Table Column
            .addCase(fetchUserTableColumn.pending, (state) => {
                state.tableColumnLoading = true;
                state.tableColumnError = null;
            })
            .addCase(fetchUserTableColumn.fulfilled, (state, action) => {
                state.tableColumnLoading = false;
                state.tableColumnList = action.payload;
            })
            .addCase(fetchUserTableColumn.rejected, (state, action) => {
                state.tableColumnLoading = false;
                state.tableColumnError = action.payload ?? "Unknown error";
            })

            // Invoice Tax Type
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

            // Currency
            .addCase(fetchCurrencyStartWith.pending, (state) => {
                state.currencyLoading = true;
                state.currencyError = null;
            })
            .addCase(fetchCurrencyStartWith.fulfilled, (state, action) => {
                state.currencyLoading = false;
                state.currencyList = action.payload;
                if (!state.selectedCurrency && action.payload.length > 0) {
                    const rupees = action.payload.find(c =>
                        c.Currency === "Rupees" || c.CurrencyID === 4
                    );
                    state.selectedCurrency = rupees ?? action.payload[0];
                }
            })
            .addCase(fetchCurrencyStartWith.rejected, (state, action) => {
                state.currencyLoading = false;
                state.currencyError = action.payload ?? "Unknown error";
            })

            // Suppliers
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

            // Service Bill List
            .addCase(fetchServiceBillList.pending, (state) => {
                state.serviceBillListLoading = true;
                state.serviceBillListError = null;
            })
            .addCase(fetchServiceBillList.fulfilled, (state, action) => {
                state.serviceBillListLoading = false;
                state.serviceBillList = action.payload;
            })
            .addCase(fetchServiceBillList.rejected, (state, action) => {
                state.serviceBillListLoading = false;
                state.serviceBillListError = action.payload ?? "Unknown error";
            })

            // Sales/Purchase (Purchase) for Service Bill
            .addCase(fetchSalesPurchaseForServiceBill.pending, (state) => {
                state.salesPurchaseListLoading = true;
                state.salesPurchaseListError = null;
            })
            .addCase(fetchSalesPurchaseForServiceBill.fulfilled, (state, action) => {
                state.salesPurchaseListLoading = false;
                state.salesPurchaseList = action.payload;
            })
            .addCase(fetchSalesPurchaseForServiceBill.rejected, (state, action) => {
                state.salesPurchaseListLoading = false;
                state.salesPurchaseListError = action.payload ?? "Unknown error";
            })

            // Sales for Service Bill
            .addCase(fetchSalesForServiceBill.pending, (state) => {
                state.salesListLoading = true;
                state.salesListError = null;
            })
            .addCase(fetchSalesForServiceBill.fulfilled, (state, action) => {
                state.salesListLoading = false;
                state.salesList = action.payload;
            })
            .addCase(fetchSalesForServiceBill.rejected, (state, action) => {
                state.salesListLoading = false;
                state.salesListError = action.payload ?? "Unknown error";
            })

            // Sales List for Service Bill (type=Sales, SalesForServiceBillItem)
            .addCase(fetchSalesListForServiceBill.pending, (state) => {
                state.salesItemListLoading = true;
                state.salesItemListError = null;
            })
            .addCase(fetchSalesListForServiceBill.fulfilled, (state, action) => {
                state.salesItemListLoading = false;
                state.salesItemList = action.payload;
            })
            .addCase(fetchSalesListForServiceBill.rejected, (state, action) => {
                state.salesItemListLoading = false;
                state.salesItemListError = action.payload ?? "Unknown error";
            })

            // Purchase List for Service Bill (type=Purchase, SalesPurchaseForServiceBillItem)
            .addCase(fetchPurchaseListForServiceBill.pending, (state) => {
                state.purchaseItemListLoading = true;
                state.purchaseItemListError = null;
            })
            .addCase(fetchPurchaseListForServiceBill.fulfilled, (state, action) => {
                state.purchaseItemListLoading = false;
                state.purchaseItemList = action.payload;
            })
            .addCase(fetchPurchaseListForServiceBill.rejected, (state, action) => {
                state.purchaseItemListLoading = false;
                state.purchaseItemListError = action.payload ?? "Unknown error";
            })

            // Tax Rates
            .addCase(fetchTaxRates.pending, (state) => {
                state.taxRateLoading = true;
                state.taxRateError = null;
            })
            .addCase(fetchTaxRates.fulfilled, (state, action) => {
                state.taxRateLoading = false;
                state.taxRateList = action.payload;
                if (!state.selectedTaxRate && action.payload.length > 0) {
                    state.selectedTaxRate = action.payload[0];
                }
            })
            .addCase(fetchTaxRates.rejected, (state, action) => {
                state.taxRateLoading = false;
                state.taxRateError = action.payload ?? "Unknown error";
            })

            // Service Items
            .addCase(fetchServiceItems.pending, (state) => {
                state.serviceItemLoading = true;
                state.serviceItemError = null;
            })
            .addCase(fetchServiceItems.fulfilled, (state, action) => {
                state.serviceItemLoading = false;
                state.serviceItemList = action.payload;
            })
            .addCase(fetchServiceItems.rejected, (state, action) => {
                state.serviceItemLoading = false;
                state.serviceItemError = action.payload ?? "Unknown error";
            })

            // Account Heads
            .addCase(fetchAccountHeads.pending, (state) => {
                state.accountHeadLoading = true;
                state.accountHeadError = null;
            })
            .addCase(fetchAccountHeads.fulfilled, (state, action) => {
                state.accountHeadLoading = false;
                state.accountHeadList = action.payload;
            })
            .addCase(fetchAccountHeads.rejected, (state, action) => {
                state.accountHeadLoading = false;
                state.accountHeadError = action.payload ?? "Unknown error";
            })

            // Purchase List (ReadAllPurchase)
            .addCase(fetchPurchaseList.pending, (state) => {
                state.purchaseListLoading = true;
                state.purchaseListError = null;
            })
            .addCase(fetchPurchaseList.fulfilled, (state, action) => {
                state.purchaseListLoading = false;
                state.purchaseList = action.payload.data;
                state.purchaseListTotalRows = action.payload.totalRows;
            })
            .addCase(fetchPurchaseList.rejected, (state, action) => {
                state.purchaseListLoading = false;
                state.purchaseListError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    setSelectedDocument,
    clearDocumentList,
    setSelectedPaymentType,
    clearPaymentTypeList,
    clearTableColumnList,
    setSelectedInvoiceTaxType,
    clearInvoiceTaxTypeList,
    setSelectedCurrency,
    clearCurrencyList,
    setSelectedSupplier,
    clearSupplierList,
    clearServiceBillList,
    clearSalesPurchaseList,
    clearSalesList,
    clearSalesItemList,
    clearPurchaseItemList,
    setSelectedTaxRate,
    clearTaxRateList,
    setSelectedServiceItem,
    clearServiceItemList,
    setSelectedAccountHead,
    clearAccountHeadList,
    clearPurchaseList,
    resetServiceBill,
} = serviceBillSlice.actions;

export default serviceBillSlice.reducer;
