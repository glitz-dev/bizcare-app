import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentMaster {
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

export interface Store {
    StoreID: number;
    StoreName: string;
    CompanyStore: boolean | null;
}

export interface PaymentType {
    PaymentTypeID: number;
    PaymentTypeName: string;
}

export interface DefaultState {
    StateID: number;
    StateName: string;
}

export interface GSTType {
    GSTTypeID: number;
    GSTType: string;
}

export interface Currency {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

export interface CurrencyM {
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
    FaClass: string | null;
    FaChar: string | null;
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

export interface TableColumn {
    TableColumnID: number;
    ColumnName: string;
    Show: boolean;
    Width: string;
    ColumnDisplayName: string;
}

export interface UserFormDocument {
    DocumentID: number;
    UserDocumentID: number;
    DocumentTypeID: number;
    Approve: boolean;
    Disapprove: boolean;
}

export interface InvoiceTaxType {
    DocumentID: number;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
}

export interface Customer {
    CustomerID: number;
    CustomerCode: string | null;
    CustomerName: string;
    CustomerAddress: string | null;
    CurrencyID: number | null;
    Currency: string | null;
    Symbol: string | null;
    ECGCLimit: number | null;
    CurrencyCode: string | null;
    ExchRate: number | null;
    PaymentTermID: number | null;
    PaymentTerm: string | null;
    PayDaysFromBL: number | null;
    FinanceAvailable: number | null;
    FaClass: string | null;
    FaChar: string | null;
    DaysToComplete: number | null;
    PartyAcHeadID: number;
    HeadName: string;
    StateID: number | null;
    StateCode: string | null;
    StateNumber: string | null;
    MerchantExpPer: number;
}

export interface ProductDetail {
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Description: string | null;
    PurchaseUnit: string;
    SalesUnitID: number;
    SalesUnit: string;
    UnitMultiplier: number;
    CategoryID: number;
    CategoryName: string;
}

export interface ProductionItemDetail {
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Description: string | null;
    PurchaseUnitID: number;
    PurchaseUnit: string;
    Hsn: string | null;
    SalesUnitID: number;
    SalesUnit: string;
    SalesRate: number | null;
    UnitMultiplier: number;
    IsNonStockItem: boolean;
    DesignID: number | null;
    DesignCode: string | null;
    DesignName: string | null;
    TaxCategoryCode: string | null;
    TaxCategoryId: number;
    InvoiceTaxType: string | null;
    TaxValue: number;
    SGST: number | null;
    CGST: number | null;
    IGST: number | null;
    UTGST: number | null;
    CESS: number | null;
    VAT: number | null;
    CurrentQuantity: number;
}

export interface RetailInvoiceSalesDetail {
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Description: string | null;
    Quantity: number;
    SalesUnitID: number;
    SalesUnit: string;
    SalesRate: number;
    TaxValue: number;
    TaxAmount: number;
    Amount: number;
    SGST: number | null;
    CGST: number | null;
    IGST: number | null;
    UTGST: number | null;
    CESS: number | null;
    SGSTAmount: number | null;
    CGSTAmount: number | null;
    IGSTAmount: number | null;
    UTGSTAmount: number | null;
    CESSAmount: number | null;
}

export interface SaveRetailInvoicePayload {
    RetInvDateStr: string;
    TaxPercHead: string;
    TaxAmountHead: string;
    Intercompany: boolean;
    BillingAddress: string | null;
    BillingPhNo: string | null;
    ChequeDate: string | null;
    Currency: string;
    CurrencyID: number;
    CustRefDate: string | null;
    CustomerCode: string | null;
    CustomerID: number;
    CustomerName: string;
    DateTypeList: { Id: number; Name: string };
    DeliveryWeek: string | null;
    DirectPurchase: boolean;
    DocumentID: number;
    DocumentName: string;
    ExRate: number;
    ExpIncSalesOrderDocID: number;
    GSTType: string;
    GSTTypeID: number;
    GrossAmount: string;
    GrossAmountBase: number;
    IsGST: boolean;
    IsLocalOrder: boolean;
    LstSalesDetails: RetailInvoiceSalesDetail[];
    NetAmount: string;
    OtherAdditionalAmount: string;
    OtherAdditionalAmountBase: string;
    OtherDeductionAmount: string;
    OtherDeductionAmountBase: string;
    PaymentTypeID: number;
    PaymentTypeName: string;
    PreNetAmount: string;
    PreNetAmountBase: string;
    ProbableAdvDate: string | null;
    ProdCompletionDate: string | null;
    ProjectedArrivalDate: string | null;
    Registered: boolean;
    ReviewDate: string;
    ReviewDateStr: string;
    ReviewedOn: string;
    SalesDate: string;
    SalesNo: string;
    SalesRefDate: string | null;
    SameShippingAddress: boolean;
    ShipmentDate: string | null;
    ShippingAddress: string | null;
    StateID: number;
    StateName: string;
    StoreID: number;
    StoreName: string;
    TaxInvoice: boolean;
    TaxMasterID: number;
    TotalCESSAmt: number;
    TotalCGSTAmt: number;
    TotalDiscount: string;
    TotalDiscountBase: number;
    TotalIGSTAmt: number;
    TotalNetAmountWithOutRounding: string;
    TotalNetAmountWithOutTax: string;
    TotalQuantity: string;
    TotalSGSTAmt: number;
    TotalTax: number;
    TotalTaxBase: string;
    TotalUTGSTAmt: number;
    TotalVATAmount: number;
    InvoiceTaxType: string;
    InvoiceTaxTypeID: number;
}

export interface SaveRetailInvoiceResponse {
    Success: boolean;
    Message: string;
    MessageId: string;
    Data: null;
    Id: number;
    Info: string | null;
    Approve: string | null;
}

export interface RetailInvoiceListItem {
    SalesID: number;
    SalesNo: string;
    SalesDate: string;
    CustomerCode: string | null;
    CustomerName: string;
    Document: string;
    NetAmount: number;
    CreatedBy: string;
    FaClass: string;
    Approve: string;
    ApprovedBY: string;
    TotalRowCount: number;
}

export interface FetchRetailInvoicesParams {
    currentPage?: number;
    customerId?: number;
    fromDate?: string;
    rowsPerPage?: number;
    searchStr?: string;
    toDate?: string;
    companyId?: number;
    finYearId?: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface RetailInvoiceState {
    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    defaultStores: Store[];
    defaultStoresLoading: boolean;
    defaultStoresError: string | null;

    paymentTypes: PaymentType[];
    paymentTypesLoading: boolean;
    paymentTypesError: string | null;

    defaultStates: DefaultState[];
    defaultStatesLoading: boolean;
    defaultStatesError: string | null;

    gstTypes: GSTType[];
    gstTypesLoading: boolean;
    gstTypesError: string | null;

    tableColumns: TableColumn[];
    tableColumnsLoading: boolean;
    tableColumnsError: string | null;

    userFormDocuments: UserFormDocument[];
    userFormDocumentsLoading: boolean;
    userFormDocumentsError: string | null;

    invoiceTaxTypes: InvoiceTaxType[];
    invoiceTaxTypesLoading: boolean;
    invoiceTaxTypesError: string | null;

    customers: Customer[];
    customersLoading: boolean;
    customersError: string | null;

    stores: Store[];
    storesLoading: boolean;
    storesError: string | null;

    states: DefaultState[];
    statesLoading: boolean;
    statesError: string | null;

    productDetails: ProductDetail[];
    productDetailsLoading: boolean;
    productDetailsError: string | null;

    productionItemDetails: ProductionItemDetail[];
    productionItemDetailsLoading: boolean;
    productionItemDetailsError: string | null;

    saveRetailInvoiceLoading: boolean;
    saveRetailInvoiceError: string | null;
    saveRetailInvoiceResponse: SaveRetailInvoiceResponse | null;

    currencies: Currency[];
    currenciesLoading: boolean;
    currenciesError: string | null;

    currencyExRate: CurrencyExRate | null;
    currencyExRateLoading: boolean;
    currencyExRateError: string | null;

    retailInvoiceList: RetailInvoiceListItem[];
    retailInvoiceListLoading: boolean;
    retailInvoiceListError: string | null;
    retailInvoiceListTotalCount: number;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: RetailInvoiceState = {
    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    defaultStores: [],
    defaultStoresLoading: false,
    defaultStoresError: null,

    paymentTypes: [],
    paymentTypesLoading: false,
    paymentTypesError: null,

    defaultStates: [],
    defaultStatesLoading: false,
    defaultStatesError: null,

    gstTypes: [],
    gstTypesLoading: false,
    gstTypesError: null,

    tableColumns: [],
    tableColumnsLoading: false,
    tableColumnsError: null,

    userFormDocuments: [],
    userFormDocumentsLoading: false,
    userFormDocumentsError: null,

    invoiceTaxTypes: [],
    invoiceTaxTypesLoading: false,
    invoiceTaxTypesError: null,

    customers: [],
    customersLoading: false,
    customersError: null,

    stores: [],
    storesLoading: false,
    storesError: null,

    states: [],
    statesLoading: false,
    statesError: null,

    productDetails: [],
    productDetailsLoading: false,
    productDetailsError: null,

    productionItemDetails: [],
    productionItemDetailsLoading: false,
    productionItemDetailsError: null,

    saveRetailInvoiceLoading: false,
    saveRetailInvoiceError: null,
    saveRetailInvoiceResponse: null,

    currencies: [],
    currenciesLoading: false,
    currenciesError: null,

    currencyExRate: null,
    currencyExRateLoading: false,
    currencyExRateError: null,

    retailInvoiceList: [],
    retailInvoiceListLoading: false,
    retailInvoiceListError: null,
    retailInvoiceListTotalCount: 0,
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
    "retailInvoice/fetchDocumentMasters",
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
            url.searchParams.set("DocumentType", "RetailSales");
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

export const fetchDefaultStores = createAsyncThunk<
    Store[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchDefaultStores",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Store/GetDefaultStore"
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

            const data: Store[] = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPaymentTypes = createAsyncThunk<
    PaymentType[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchPaymentTypes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//PaymentType/GetPaymentTypeStartWith"
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

            const data: PaymentType[] = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDefaultStates = createAsyncThunk<
    DefaultState[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchDefaultStates",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//CommonUtility/GetDefaultState"
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

            const json = await response.json();
            const data: DefaultState[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchGSTTypes = createAsyncThunk<
    GSTType[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchGSTTypes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Invoice/GetGSTTypeStartwith"
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

            const json = await response.json();
            const data: GSTType[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchTableColumns = createAsyncThunk<
    TableColumn[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchTableColumns",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetUserTableColumn"
            );
            url.searchParams.set("tableCode", "RetInv_Tbl");

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
            const data: TableColumn[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchUserFormDocuments = createAsyncThunk<
    UserFormDocument[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchUserFormDocuments",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/UserDocument/GetUserFormWiseDocumentDetails"
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

            const json = await response.json();
            const data: UserFormDocument[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchInvoiceTaxTypes = createAsyncThunk<
    InvoiceTaxType[],
    { documentID: number; startWith?: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetInvoiceTaxTypeDetails"
            );
            url.searchParams.set("documentID", String(params.documentID));
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
            const data: InvoiceTaxType[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllInvoiceTaxTypes = createAsyncThunk<
    InvoiceTaxType[],
    { taxMasterId?: number; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchAllInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const taxMasterId = params?.taxMasterId ?? 1;
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetAllInvoiceTaxTypes"
            );
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // Response is a flat array (no Server.Data wrapper)
            const json: { InvoiceTaxTypeID: number; InvoiceTaxType: string }[] = await response.json();
            const data: InvoiceTaxType[] = (json ?? []).map((item) => ({
                DocumentID: 0,
                InvoiceTaxTypeID: item.InvoiceTaxTypeID,
                InvoiceTaxType: item.InvoiceTaxType,
            }));
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCustomers = createAsyncThunk<
    Customer[],
    { isLocalOrder?: boolean; startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchCustomers",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const isLocalOrder = params?.isLocalOrder ?? false;
        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Party/GetAllCustomers"
            );
            url.searchParams.set("isLocalOrder", String(isLocalOrder));
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
            const data: Customer[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchStores = createAsyncThunk<
    Store[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchStores",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Store/GetStoreStartWith"
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

            const json = await response.json();
            const data: Store[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchStateStartWith = createAsyncThunk<
    DefaultState[],
    { countryId?: number; startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchStateStartWith",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const countryId = params?.countryId ?? 0;
        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetStateStartwith"
            );
            url.searchParams.set("CountryID", String(countryId));
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
            const data: DefaultState[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchProductDetails = createAsyncThunk<
    ProductDetail[],
    { searchStr?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchProductDetails",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const searchStr = params?.searchStr ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Item/GetProductDetails"
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();
            const data: ProductDetail[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchProductionItemDetails = createAsyncThunk<
    ProductionItemDetail[],
    {
        asMode?: string;
        customerCode?: string;
        customerId: number;
        designCode?: string;
        invoiceTaxTypeId: number;
        itemCode: string;
        itemId: number;
        companyId?: number;
        finYearId?: number;
    },
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchProductionItemDetails",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Item/GetProductionItemDetails"
            );
            url.searchParams.set("asMode", params.asMode ?? "II");
            url.searchParams.set("companyId", String(companyId));
            url.searchParams.set("customerCode", params.customerCode ?? "");
            url.searchParams.set("customerId", String(params.customerId));
            url.searchParams.set("designCode", params.designCode ?? "");
            url.searchParams.set("invoiceTaxTypeId", String(params.invoiceTaxTypeId));
            url.searchParams.set("itemCode", params.itemCode);
            url.searchParams.set("itemId", String(params.itemId));

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
            const data: ProductionItemDetail[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencies = createAsyncThunk<
    Currency[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchCurrencies",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Currency/GetCurrencyStartwith"
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

            const json = await response.json();
            const data: Currency[] = json?.Server?.Data ?? [];
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyExRate = createAsyncThunk<
    CurrencyExRate,
    { currencyID: number; date: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchCurrencyExRate",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Currency/GetCurrencyExRate"
            );
            url.searchParams.set("currencyID", String(params.currencyID));
            url.searchParams.set("date", params.date);

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
            const data: CurrencyExRate = json?.Server?.Data?.[0];
            if (!data) throw new Error("No exchange rate data returned");
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const saveRetailInvoice = createAsyncThunk<
    SaveRetailInvoiceResponse,
    SaveRetailInvoicePayload,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/saveRetailInvoice",
    async (payload, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state);
        const finYearId = getFinYearId(state);

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/RetailInvoiceOnlymat/SaveChanges",
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();
            const data: SaveRetailInvoiceResponse = json?.Server ?? json;
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchRetailInvoices = createAsyncThunk<
    { data: RetailInvoiceListItem[]; totalCount: number },
    FetchRetailInvoicesParams | void,
    { state: RootState; rejectValue: string }
>(
    "retailInvoice/fetchRetailInvoices",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        const currentPage  = params?.currentPage  ?? 1;
        const customerId   = params?.customerId   ?? 0;
        const fromDate     = params?.fromDate     ?? "";
        const rowsPerPage  = params?.rowsPerPage  ?? 25;
        const searchStr    = params?.searchStr    ?? "";
        const toDate       = params?.toDate       ?? "";

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/RetailInvoiceOnlymat/GetRetailInvoiceOnlymats"
            );
            url.searchParams.set("currentPage",  String(currentPage));
            url.searchParams.set("customerId",   String(customerId));
            url.searchParams.set("fromDate",     fromDate);
            url.searchParams.set("rowsPerPage",  String(rowsPerPage));
            url.searchParams.set("searchStr",    searchStr);
            url.searchParams.set("toDate",       toDate);

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
            const data: RetailInvoiceListItem[] = json?.Server?.Data ?? [];
            const totalCount: number = data[0]?.TotalRowCount ?? 0;
            return { data, totalCount };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const retailInvoiceSlice = createSlice({
    name: "retailInvoice",
    initialState,
    reducers: {
        clearDocumentMasters(state) {
            state.documentMasters = [];
            state.documentMastersLoading = false;
            state.documentMastersError = null;
        },
        clearDefaultStores(state) {
            state.defaultStores = [];
            state.defaultStoresLoading = false;
            state.defaultStoresError = null;
        },
        clearPaymentTypes(state) {
            state.paymentTypes = [];
            state.paymentTypesLoading = false;
            state.paymentTypesError = null;
        },
        clearDefaultStates(state) {
            state.defaultStates = [];
            state.defaultStatesLoading = false;
            state.defaultStatesError = null;
        },
        clearGSTTypes(state) {
            state.gstTypes = [];
            state.gstTypesLoading = false;
            state.gstTypesError = null;
        },
        clearTableColumns(state) {
            state.tableColumns = [];
            state.tableColumnsLoading = false;
            state.tableColumnsError = null;
        },
        clearUserFormDocuments(state) {
            state.userFormDocuments = [];
            state.userFormDocumentsLoading = false;
            state.userFormDocumentsError = null;
        },
        clearInvoiceTaxTypes(state) {
            state.invoiceTaxTypes = [];
            state.invoiceTaxTypesLoading = false;
            state.invoiceTaxTypesError = null;
        },
        clearCustomers(state) {
            state.customers = [];
            state.customersLoading = false;
            state.customersError = null;
        },
        clearStores(state) {
            state.stores = [];
            state.storesLoading = false;
            state.storesError = null;
        },
        clearStates(state) {
            state.states = [];
            state.statesLoading = false;
            state.statesError = null;
        },
        clearProductDetails(state) {
            state.productDetails = [];
            state.productDetailsLoading = false;
            state.productDetailsError = null;
        },
        clearProductionItemDetails(state) {
            state.productionItemDetails = [];
            state.productionItemDetailsLoading = false;
            state.productionItemDetailsError = null;
        },
        clearSaveRetailInvoice(state) {
            state.saveRetailInvoiceLoading = false;
            state.saveRetailInvoiceError = null;
            state.saveRetailInvoiceResponse = null;
        },
        clearRetailInvoiceList(state) {
            state.retailInvoiceList = [];
            state.retailInvoiceListLoading = false;
            state.retailInvoiceListError = null;
            state.retailInvoiceListTotalCount = 0;
        },
        clearCurrencies(state) {
            state.currencies = [];
            state.currenciesLoading = false;
            state.currenciesError = null;
        },
        clearCurrencyExRate(state) {
            state.currencyExRate = null;
            state.currencyExRateLoading = false;
            state.currencyExRateError = null;
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

            // Default Stores
            .addCase(fetchDefaultStores.pending, (state) => {
                state.defaultStoresLoading = true;
                state.defaultStoresError = null;
            })
            .addCase(fetchDefaultStores.fulfilled, (state, action) => {
                state.defaultStoresLoading = false;
                state.defaultStores = action.payload;
            })
            .addCase(fetchDefaultStores.rejected, (state, action) => {
                state.defaultStoresLoading = false;
                state.defaultStoresError = action.payload ?? "Unknown error";
            })

            // Payment Types
            .addCase(fetchPaymentTypes.pending, (state) => {
                state.paymentTypesLoading = true;
                state.paymentTypesError = null;
            })
            .addCase(fetchPaymentTypes.fulfilled, (state, action) => {
                state.paymentTypesLoading = false;
                state.paymentTypes = action.payload;
            })
            .addCase(fetchPaymentTypes.rejected, (state, action) => {
                state.paymentTypesLoading = false;
                state.paymentTypesError = action.payload ?? "Unknown error";
            })

            // Default States
            .addCase(fetchDefaultStates.pending, (state) => {
                state.defaultStatesLoading = true;
                state.defaultStatesError = null;
            })
            .addCase(fetchDefaultStates.fulfilled, (state, action) => {
                state.defaultStoresLoading = false;
                state.defaultStates = action.payload;
            })
            .addCase(fetchDefaultStates.rejected, (state, action) => {
                state.defaultStatesLoading = false;
                state.defaultStatesError = action.payload ?? "Unknown error";
            })

            // GST Types
            .addCase(fetchGSTTypes.pending, (state) => {
                state.gstTypesLoading = true;
                state.gstTypesError = null;
            })
            .addCase(fetchGSTTypes.fulfilled, (state, action) => {
                state.gstTypesLoading = false;
                state.gstTypes = action.payload;
            })
            .addCase(fetchGSTTypes.rejected, (state, action) => {
                state.gstTypesLoading = false;
                state.gstTypesError = action.payload ?? "Unknown error";
            })

            // Table Columns
            .addCase(fetchTableColumns.pending, (state) => {
                state.tableColumnsLoading = true;
                state.tableColumnsError = null;
            })
            .addCase(fetchTableColumns.fulfilled, (state, action) => {
                state.tableColumnsLoading = false;
                state.tableColumns = action.payload;
            })
            .addCase(fetchTableColumns.rejected, (state, action) => {
                state.tableColumnsLoading = false;
                state.tableColumnsError = action.payload ?? "Unknown error";
            })

            // User Form Documents
            .addCase(fetchUserFormDocuments.pending, (state) => {
                state.userFormDocumentsLoading = true;
                state.userFormDocumentsError = null;
            })
            .addCase(fetchUserFormDocuments.fulfilled, (state, action) => {
                state.userFormDocumentsLoading = false;
                state.userFormDocuments = action.payload;
            })
            .addCase(fetchUserFormDocuments.rejected, (state, action) => {
                state.userFormDocumentsLoading = false;
                state.userFormDocumentsError = action.payload ?? "Unknown error";
            })

            // Invoice Tax Types
            .addCase(fetchInvoiceTaxTypes.pending, (state) => {
                state.invoiceTaxTypesLoading = true;
                state.invoiceTaxTypesError = null;
            })
            .addCase(fetchInvoiceTaxTypes.fulfilled, (state, action) => {
                state.invoiceTaxTypesLoading = false;
                state.invoiceTaxTypes = action.payload;
            })
            .addCase(fetchInvoiceTaxTypes.rejected, (state, action) => {
                state.invoiceTaxTypesLoading = false;
                state.invoiceTaxTypesError = action.payload ?? "Unknown error";
            })

            // All Invoice Tax Types (GetAllInvoiceTaxTypes by taxMasterId)
            .addCase(fetchAllInvoiceTaxTypes.pending, (state) => {
                state.invoiceTaxTypesLoading = true;
                state.invoiceTaxTypesError = null;
            })
            .addCase(fetchAllInvoiceTaxTypes.fulfilled, (state, action) => {
                state.invoiceTaxTypesLoading = false;
                state.invoiceTaxTypes = action.payload;
            })
            .addCase(fetchAllInvoiceTaxTypes.rejected, (state, action) => {
                state.invoiceTaxTypesLoading = false;
                state.invoiceTaxTypesError = action.payload ?? "Unknown error";
            })

            // Customers
            .addCase(fetchCustomers.pending, (state) => {
                state.customersLoading = true;
                state.customersError = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.customersLoading = false;
                state.customers = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.customersLoading = false;
                state.customersError = action.payload ?? "Unknown error";
            })

            // Stores
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
                state.storesError = action.payload ?? "Unknown error";
            })

            // States
            .addCase(fetchStateStartWith.pending, (state) => {
                state.statesLoading = true;
                state.statesError = null;
            })
            .addCase(fetchStateStartWith.fulfilled, (state, action) => {
                state.statesLoading = false;
                state.states = action.payload;
            })
            .addCase(fetchStateStartWith.rejected, (state, action) => {
                state.statesLoading = false;
                state.statesError = action.payload ?? "Unknown error";
            })

            // Product Details
            .addCase(fetchProductDetails.pending, (state) => {
                state.productDetailsLoading = true;
                state.productDetailsError = null;
            })
            .addCase(fetchProductDetails.fulfilled, (state, action) => {
                state.productDetailsLoading = false;
                state.productDetails = action.payload;
            })
            .addCase(fetchProductDetails.rejected, (state, action) => {
                state.productDetailsLoading = false;
                state.productDetailsError = action.payload ?? "Unknown error";
            })

            // Production Item Details
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
                state.productionItemDetailsError = action.payload ?? "Unknown error";
            })

            // Save Retail Invoice
            .addCase(saveRetailInvoice.pending, (state) => {
                state.saveRetailInvoiceLoading = true;
                state.saveRetailInvoiceError = null;
                state.saveRetailInvoiceResponse = null;
            })
            .addCase(saveRetailInvoice.fulfilled, (state, action) => {
                state.saveRetailInvoiceLoading = false;
                state.saveRetailInvoiceResponse = action.payload;
            })
            .addCase(saveRetailInvoice.rejected, (state, action) => {
                state.saveRetailInvoiceLoading = false;
                state.saveRetailInvoiceError = action.payload ?? "Unknown error";
            })

            // Retail Invoice List
            .addCase(fetchRetailInvoices.pending, (state) => {
                state.retailInvoiceListLoading = true;
                state.retailInvoiceListError = null;
            })
            .addCase(fetchRetailInvoices.fulfilled, (state, action) => {
                state.retailInvoiceListLoading = false;
                state.retailInvoiceList = action.payload.data;
                state.retailInvoiceListTotalCount = action.payload.totalCount;
            })
            .addCase(fetchRetailInvoices.rejected, (state, action) => {
                state.retailInvoiceListLoading = false;
                state.retailInvoiceListError = action.payload ?? "Unknown error";
            })

            // Currencies
            .addCase(fetchCurrencies.pending, (state) => {
                state.currenciesLoading = true;
                state.currenciesError = null;
            })
            .addCase(fetchCurrencies.fulfilled, (state, action) => {
                state.currenciesLoading = false;
                state.currencies = action.payload;
            })
            .addCase(fetchCurrencies.rejected, (state, action) => {
                state.currenciesLoading = false;
                state.currenciesError = action.payload ?? "Unknown error";
            })

            // Currency Exchange Rate
            .addCase(fetchCurrencyExRate.pending, (state) => {
                state.currencyExRateLoading = true;
                state.currencyExRateError = null;
            })
            .addCase(fetchCurrencyExRate.fulfilled, (state, action) => {
                state.currencyExRateLoading = false;
                state.currencyExRate = action.payload;
            })
            .addCase(fetchCurrencyExRate.rejected, (state, action) => {
                state.currencyExRateLoading = false;
                state.currencyExRateError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearDocumentMasters,
    clearDefaultStores,
    clearPaymentTypes,
    clearDefaultStates,
    clearGSTTypes,
    clearTableColumns,
    clearUserFormDocuments,
    clearInvoiceTaxTypes,
    clearCustomers,
    clearStores,
    clearStates,
    clearProductDetails,
    clearProductionItemDetails,
    clearSaveRetailInvoice,
    clearRetailInvoiceList,
    clearCurrencies,
    clearCurrencyExRate,
} = retailInvoiceSlice.actions;

export default retailInvoiceSlice.reducer;
