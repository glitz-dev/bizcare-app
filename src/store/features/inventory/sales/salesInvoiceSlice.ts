import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DefaultStore {
    StoreID: number;
    StoreName: string;
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

export interface State {
    StateID: number;
    StateName: string;
}

export interface GSTType {
    GSTTypeID: number;
    GSTType: string;
}

export interface BaseCurrency {
    OptionValue: number;
    CurrencyID: number;
    Currency: string;
    ExchRate: number;
}

export interface UserTableColumn {
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

export interface AllInvoiceTaxType {
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
    StateID: number;
    StateCode: string;
    StateNumber: string;
    MerchantExpPer: number;
}

export interface SalesOrder {
    // The API currently returns null Data due to a server-side error
    // ("Invalid object name 'LoadingPortM'"). Fields below reflect the
    // expected shape once the backend is fixed. Update as needed.
    SalesOrderID: number;
    SalesOrderNo: string;
    SalesOrderDate: string;
    CustomerID: number;
    CustomerName: string;
    Currency: string;
    FilterTypeID: number;
}

export interface SalesOrdersResult {
    data: SalesOrder[];
    totalRecords: number;
    currentPage: number;
    rowsPerPage: number;
}

export interface DeliveryNote {
    DeliveryNoteID: number;
    ProformaNo: string;
    CustCode: string | null;
    ProformaDate: string;
    CurrencyExchRate: number;
    Currency: string;
    CurrencyID: number;
    CustomerID: number;
    CustomerName: string;
    CustomerCode: string | null;
    TotalRowCount: number;
}

export interface DeliveryNotesResult {
    data: DeliveryNote[];
    totalRecords: number;
    currentPage: number;
    rowsPerPage: number;
}

export interface SelectedDNItem {
    Code: string;
    CompanyName: string;
    DeliveryNoteTID: number;
    DeliveryNoteMID: number;
    CompanyID: number;
    CompanyName1: string;
    ItemID: number;
    ItemCode: string;
    ItemName: string;
    ItemDescription: string | null;
    Quantity: number;
    SalesRate: number;
    GrossAmount: number;
    UnitMultiplier: number;
    DiscountPercentage: number;
    DiscountAmount: number;
    TaxPercentage: number;
    Amount: number;
    SalesUnitID: number;
    UnitID: number;
    SalesUnit: string;
    ServiceTaxPercentage: number | null;
    ServiceTaxID: number | null;
    DeliveryNoteNo: string;
    SGSTPer: number | null;
    CGSTPer: number | null;
    IGSTPer: number | null;
    IGSTPerLUT: number | null;
    UTGSTPer: number | null;
    CESSPer: number | null;
    VATPer: number | null;
    SGSTAmt: number | null;
    CGSTAmt: number | null;
    IGSTAmt: number | null;
    IGSTAmtLUT: number | null;
    UTGSTAmt: number | null;
    VATAmt: number | null;
    SoldQuantity: number;
    SalesQuotationMID: number;
    CustomerID: number;
    GrossWgt: number;
    SalesQuotationTID: number;
    SQQty: number;
    RateOn: string;
    PackNo: number;
    Origin: string;
    Percent: number;
    PrintSlNo: number;
    TaxCategoryId: number;
    PaymentTypeID: number;
    PaymentTypeName: string;
}

export interface ServerResponse<T> {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: T;
        Id: number;
        Info: any;
        Approve: any;
    };
}

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

export interface Currency {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

export interface ProductItem {
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

export interface ProductItemDetails {
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
    TaxCategoryId: number | null;
    InvoiceTaxType: string | null;
    TaxValue: number | null;
    SGST: number | null;
    CGST: number | null;
    IGST: number | null;
    UTGST: number | null;
    CESS: number | null;
    VAT: number | null;
    CurrentQuantity: number | null;
}

export interface FetchProductDetailsParams {
    itemId: number;
    itemCode: string;
    customerId: number;
    invoiceTaxTypeId: number;
    asMode?: string;
    customerCode?: string;
    designCode?: string;
    companyId?: number;
    finYearId?: number;
}


export interface SaveSalesInvoicePayload {
    RetInvDateStr: string;
    ReviewDateStr: string;
    StartDateStr: string;
    EndDateStr: string;
    SalesDate: string;
    ReviewDate: string;
    ReviewedOn: string;
    DocumentID: number;
    DocumentName: string;
    SalesNo: string;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
    GSTTypeID: number;
    GSTType: string;
    PaymentTypeID: number;
    PaymentTypeName: string;
    StoreID: number;
    StoreName: string;
    CustomerID: number;
    CustomerName: string;
    CustomerCode: string | null;
    CustomerCodePopup: string | null;
    CurrencyID: number;
    Currency: string;
    ExRate: number;
    ExchRate: number;
    StateID: number;
    StateName: string;
    BillingAddress: string;
    ShippingID: number | null;
    SameShippingAddress: boolean;
    DeliveryNoteID: number;
    ProformaNo: string;
    GrossAmount: string;
    GrossAmountBase: number;
    NetAmount: string;
    PreNetAmount: string;
    PreNetAmountBase: string;
    TotalNetAmountWithOutRounding: string;
    TotalNetAmountWithOutTax: string;
    TotalQuantity: string;
    TotalTax: number;
    TotalTaxBase: string;
    TotalDiscount: string;
    TotalDiscountBase: number;
    TotalCGSTAmt: number;
    TotalSGSTAmt: number;
    TotalIGSTAmt: number;
    TotalUTGSTAmt: number;
    TotalCESSAmt: number;
    TotalVATAmount: number;
    OtherAdditionalAmount: string;
    OtherAdditionalAmountBase: string;
    OtherDeductionAmount: string;
    OtherDeductionAmountBase: string;
    TaxPercHead: string;
    TaxAmountHead: string;
    TaxMasterID: number;
    IsGST: boolean;
    TaxInvoice: boolean;
    Intercompany: boolean;
    IsLocalOrder: boolean;
    ExpIncSalesOrderDocID: number;
    CorrespondentID: number | null;
    CustRefDate: string | null;
    SalesRefDate: string | null;
    ChequeDate: string | null;
    ShipmentDate: string | null;
    ProbableAdvDate: string | null;
    ProdCompletionDate: string | null;
    ProjectedArrivalDate: string | null;
    DeliveryWeek: string | null;
    DateTypeList: { Id: number; Name: string };
    LstSalesDetails: SaveSalesLineDetail[];
    proforms: SaveSalesProform[];
}

export interface SaveSalesLineDetail {
    Code: string;
    CompanyName: string;
    DeliveryNoteTID: number;
    DeliveryNoteMID: number;
    CompanyID: number;
    CompanyName1: string;
    ItemID: number;
    ItemCode: string;
    ItemName: string;
    ItemDescription: string | null;
    Quantity: number;
    SalesRate: number;
    GrossAmount: number;
    UnitMultiplier: number;
    DiscountPercentage: number;
    DiscountAmount: number;
    TaxPercentage: number;
    Amount: number;
    SalesUnitID: number;
    UnitID: number;
    SalesUnit: string;
    ServiceTaxPercentage: number | null;
    ServiceTaxID: number | null;
    DeliveryNoteNo: string;
    SGSTPer: number | null;
    CGSTPer: number | null;
    IGSTPer: number | null;
    IGSTPerLUT: number | null;
    UTGSTPer: number | null;
    CESSPer: number | null;
    VATPer: number | null;
    SGSTAmt: number | null;
    CGSTAmt: number | null;
    IGSTAmt: number | null;
    IGSTAmtLUT: number | null;
    UTGSTAmt: number | null;
    VATAmt: number | null;
    SoldQuantity: number;
    SalesQuotationMID: number;
    CustomerID: number;
    GrossWgt: number;
    SalesQuotationTID: number;
    SQQty: number;
    RateOn: string;
    PackNo: number;
    Origin: string;
    Percent: number;
    PrintSlNo: number;
    TaxCategoryId: number;
    PaymentTypeID: number;
    PaymentTypeName: string;
}

export interface SaveSalesProform {
    DeliveryNoteID: number;
    ProformaNo: string;
    CustCode: string | null;
    ProformaDate: string;
    CurrencyExchRate: number;
    Currency: string;
    CurrencyID: number;
    CustomerID: number;
    CustomerName: string;
    CustomerCode: string | null;
    TotalRowCount: number;
}

export interface SaveSalesInvoiceResult {
    Success: boolean;
    Message: string;
    MessageId: string | null;
    Id: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface SalesInvoiceState {
    defaultStore: DefaultStore | null;
    defaultStoreLoading: boolean;
    defaultStoreError: string | null;

    paymentTypes: PaymentType[];
    paymentTypesLoading: boolean;
    paymentTypesError: string | null;

    defaultState: DefaultState | null;
    defaultStateLoading: boolean;
    defaultStateError: string | null;

    states: State[];
    statesLoading: boolean;
    statesError: string | null;

    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    gstTypes: GSTType[];
    gstTypesLoading: boolean;
    gstTypesError: string | null;

    baseCurrency: BaseCurrency | null;
    baseCurrencyLoading: boolean;
    baseCurrencyError: string | null;

    userTableColumns: UserTableColumn[];
    userTableColumnsLoading: boolean;
    userTableColumnsError: string | null;

    userFormDocuments: UserFormDocument[];
    userFormDocumentsLoading: boolean;
    userFormDocumentsError: string | null;

    invoiceTaxTypes: InvoiceTaxType[];
    invoiceTaxTypesLoading: boolean;
    invoiceTaxTypesError: string | null;

    allInvoiceTaxTypes: AllInvoiceTaxType[];
    allInvoiceTaxTypesLoading: boolean;
    allInvoiceTaxTypesError: string | null;

    customers: Customer[];
    customersLoading: boolean;
    customersError: string | null;

    salesOrders: SalesOrder[];
    salesOrdersTotalRecords: number;
    salesOrdersCurrentPage: number;
    salesOrdersRowsPerPage: number;
    salesOrdersLoading: boolean;
    salesOrdersError: string | null;

    deliveryNotes: DeliveryNote[];
    deliveryNotesTotalRecords: number;
    deliveryNotesCurrentPage: number;
    deliveryNotesRowsPerPage: number;
    deliveryNotesLoading: boolean;
    deliveryNotesError: string | null;

    selectedDNItems: SelectedDNItem[];
    selectedDNItemsLoading: boolean;
    selectedDNItemsError: string | null;

    stores: Store[];
    storesLoading: boolean;
    storesError: string | null;

    currencies: Currency[];
    currenciesLoading: boolean;
    currenciesError: string | null;

    products: ProductItem[];
    productsLoading: boolean;
    productsError: string | null;

    productDetails: ProductItemDetails | null;
    productDetailsLoading: boolean;
    productDetailsError: string | null;

    saveSalesInvoiceLoading: boolean;
    saveSalesInvoiceError: string | null;
    saveSalesInvoiceResult: SaveSalesInvoiceResult | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: SalesInvoiceState = {
    defaultStore: null,
    defaultStoreLoading: false,
    defaultStoreError: null,

    paymentTypes: [],
    paymentTypesLoading: false,
    paymentTypesError: null,

    defaultState: null,
    defaultStateLoading: false,
    defaultStateError: null,

    states: [],
    statesLoading: false,
    statesError: null,

    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    gstTypes: [],
    gstTypesLoading: false,
    gstTypesError: null,

    baseCurrency: null,
    baseCurrencyLoading: false,
    baseCurrencyError: null,

    userTableColumns: [],
    userTableColumnsLoading: false,
    userTableColumnsError: null,

    userFormDocuments: [],
    userFormDocumentsLoading: false,
    userFormDocumentsError: null,

    invoiceTaxTypes: [],
    invoiceTaxTypesLoading: false,
    invoiceTaxTypesError: null,

    allInvoiceTaxTypes: [],
    allInvoiceTaxTypesLoading: false,
    allInvoiceTaxTypesError: null,

    customers: [],
    customersLoading: false,
    customersError: null,

    salesOrders: [],
    salesOrdersTotalRecords: 0,
    salesOrdersCurrentPage: 1,
    salesOrdersRowsPerPage: 25,
    salesOrdersLoading: false,
    salesOrdersError: null,

    deliveryNotes: [],
    deliveryNotesTotalRecords: 0,
    deliveryNotesCurrentPage: 1,
    deliveryNotesRowsPerPage: 25,
    deliveryNotesLoading: false,
    deliveryNotesError: null,

    selectedDNItems: [],
    selectedDNItemsLoading: false,
    selectedDNItemsError: null,

    stores: [],
    storesLoading: false,
    storesError: null,

    currencies: [],
    currenciesLoading: false,
    currenciesError: null,

    products: [],
    productsLoading: false,
    productsError: null,

    productDetails: null,
    productDetailsLoading: false,
    productDetailsError: null,

    saveSalesInvoiceLoading: false,
    saveSalesInvoiceError: null,
    saveSalesInvoiceResult: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    let token = state.auth.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

const getCompanyId = (state: RootState, override?: number): number =>
    override ?? (state.auth.userData as any)?.companyId ?? 1;

const getFinYearId = (state: RootState, override?: number): number =>
    override ?? (state.auth.userData as any)?.finYearId ?? 2;

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDefaultStore = createAsyncThunk<
    DefaultStore,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchDefaultStore",
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
            return data[0];
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
    "salesInvoice/fetchPaymentTypes",
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

export const fetchDefaultState = createAsyncThunk<
    DefaultState,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchDefaultState",
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

            const json: ServerResponse<DefaultState[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch default state");
            }

            return json.Server.Data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchStates = createAsyncThunk<
    State[],
    { startWith?: string; countryId?: number; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchStates",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetStateStartwith/"
            );
            url.searchParams.set("CountryID", String(params?.countryId ?? 0));
            url.searchParams.set("startWith", params?.startWith ?? "");

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

            const json: ServerResponse<State[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch states");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDocumentMasters = createAsyncThunk<
    DocumentMaster[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchDocumentMasters",
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
            url.searchParams.set("DocumentType", "Sales");
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

export const fetchGSTTypes = createAsyncThunk<
    GSTType[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchGSTTypes",
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

            const json: ServerResponse<GSTType[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch GST types");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchBaseCurrency = createAsyncThunk<
    BaseCurrency,
    { val?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchBaseCurrency",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const val = params?.val ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Currency/GetBaseCurrency/"
            );
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<BaseCurrency[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch base currency");
            }

            return json.Server.Data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchUserTableColumns = createAsyncThunk<
    UserTableColumn[],
    { tableCode?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchUserTableColumns",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const tableCode = params?.tableCode ?? "RetInv_Tbl";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<UserTableColumn[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch table columns");
            }

            return json.Server.Data;
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
    "salesInvoice/fetchUserFormDocuments",
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

            const json: ServerResponse<UserFormDocument[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch user form documents");
            }

            return json.Server.Data;
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
    "salesInvoice/fetchInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetInvoiceTaxTypeDetails"
            );
            url.searchParams.set("documentID", String(params.documentID));
            url.searchParams.set("startWith", params.startWith ?? "");

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

            const json: ServerResponse<InvoiceTaxType[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch invoice tax types");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllInvoiceTaxTypes = createAsyncThunk<
    AllInvoiceTaxType[],
    { taxMasterId?: number; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchAllInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetAllInvoiceTaxTypes"
            );
            url.searchParams.set("taxMasterId", String(params?.taxMasterId ?? 0));

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

            const data: AllInvoiceTaxType[] = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCustomers = createAsyncThunk<
    Customer[],
    { startWith?: string; isLocalOrder?: boolean; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchCustomers",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Party/GetAllCustomers");
            url.searchParams.set("isLocalOrder", String(params?.isLocalOrder ?? false));
            url.searchParams.set("startWith", params?.startWith ?? "");

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

            const json: ServerResponse<Customer[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch customers");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSalesOrders = createAsyncThunk<
    SalesOrdersResult,
    {
        rowsPerPage?: number;
        currentPage?: number;
        startDate?: string;
        endDate?: string;
        customerID?: number;
        filterTypeID?: number;
        searchStr?: string;
        companyId?: number;
        finYearId?: number;
    } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchSalesOrders",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        const rowsPerPage = params?.rowsPerPage ?? 25;
        const currentPage = params?.currentPage ?? 1;
        const startDate = params?.startDate ?? "";
        const endDate = params?.endDate ?? "";
        const customerID = params?.customerID ?? 0;
        const filterTypeID = params?.filterTypeID ?? 0;
        const searchStr = params?.searchStr ?? "";

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Invoice/GetAllSalesOrdersForOnlymatBySearch"
            );
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
            url.searchParams.set("currentPage", String(currentPage));
            url.searchParams.set("StartDate", startDate);
            url.searchParams.set("EndDate", endDate);
            url.searchParams.set("CustomerID", String(customerID));
            url.searchParams.set("FilterTypeID", String(filterTypeID));
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

            const json: ServerResponse<SalesOrder[] | null> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch sales orders");
            }

            return {
                data: json.Server.Data ?? [],
                totalRecords: json.Server.Id ?? 0,
                currentPage,
                rowsPerPage,
            };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDeliveryNotes = createAsyncThunk<
    DeliveryNotesResult,
    {
        rowsPerPage?: number;
        currentPage?: number;
        startDate?: string;
        endDate?: string;
        customerID?: number;
        filterTypeID?: number;
        searchStr?: string;
        companyId?: number;
        finYearId?: number;
    } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchDeliveryNotes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        const rowsPerPage = params?.rowsPerPage ?? 25;
        const currentPage = params?.currentPage ?? 1;
        const startDate = params?.startDate ?? "";
        const endDate = params?.endDate ?? "";
        const customerID = params?.customerID ?? 0;
        const filterTypeID = params?.filterTypeID ?? 0;
        const searchStr = params?.searchStr ?? "";

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Invoice/GetAllDNForOnlymatBySearch"
            );
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
            url.searchParams.set("currentPage", String(currentPage));
            url.searchParams.set("StartDate", startDate);
            url.searchParams.set("EndDate", endDate);
            url.searchParams.set("CustomerID", String(customerID));
            url.searchParams.set("FilterTypeID", String(filterTypeID));
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

            const json: ServerResponse<DeliveryNote[] | null> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch delivery notes");
            }

            const firstRow = json.Server.Data?.[0];
            return {
                data: json.Server.Data ?? [],
                totalRecords: firstRow?.TotalRowCount ?? 0,
                currentPage,
                rowsPerPage,
            };
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
    "salesInvoice/fetchStores",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Store/GetStoreStartWith"
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

            const json: ServerResponse<Store[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch stores");
            }

            return json.Server.Data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSelectedDNForRetailInvoice = createAsyncThunk<
    SelectedDNItem[],
    {
        salesOrderID: number;
        invTaxTypeID: number;
        GSTTypeID: number;
        companyId?: number;
        finYearId?: number;
    },
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchSelectedDNForRetailInvoice",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/RetailInvoiceOnlymat/GetSelectedDNForRetailInvoice"
            );
            url.searchParams.set("salesOrderID", String(params.salesOrderID));
            url.searchParams.set("invTaxTypeID", String(params.invTaxTypeID));
            url.searchParams.set("GSTTypeID", String(params.GSTTypeID));

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

            const json: ServerResponse<SelectedDNItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch selected DN items for retail invoice"
                );
            }

            return json.Server.Data ?? [];
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
    "salesInvoice/fetchCurrencies",
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

export const fetchProducts = createAsyncThunk<
    ProductItem[],
    { searchStr?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchProducts",
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

            const json: ServerResponse<ProductItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch products");
            }

            return json.Server.Data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchProductDetails = createAsyncThunk<
    ProductItemDetails,
    FetchProductDetailsParams,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/fetchProductDetails",
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

            const json: ServerResponse<ProductItemDetails[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch product details");
            }

            const data = json.Server.Data;
            if (!data || data.length === 0) {
                return rejectWithValue("No product details found");
            }

            return data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);


export const saveSalesInvoice = createAsyncThunk<
    SaveSalesInvoiceResult,
    SaveSalesInvoicePayload,
    { state: RootState; rejectValue: string }
>(
    "salesInvoice/saveSalesInvoice",
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

            const json: ServerResponse<null> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to save sales invoice");
            }

            return {
                Success: json.Server.Success,
                Message: json.Server.Message,
                MessageId: json.Server.MessageId,
                Id: json.Server.Id,
            };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const salesInvoiceSlice = createSlice({
    name: "salesInvoice",
    initialState,
    reducers: {
        clearDefaultStore(state) {
            state.defaultStore = null;
            state.defaultStoreError = null;
        },
        clearPaymentTypes(state) {
            state.paymentTypes = [];
            state.paymentTypesError = null;
        },
        clearDefaultState(state) {
            state.defaultState = null;
            state.defaultStateError = null;
        },
        clearStates(state) {
            state.states = [];
            state.statesError = null;
        },
        clearDocumentMasters(state) {
            state.documentMasters = [];
            state.documentMastersError = null;
        },
        clearGSTTypes(state) {
            state.gstTypes = [];
            state.gstTypesError = null;
        },
        clearBaseCurrency(state) {
            state.baseCurrency = null;
            state.baseCurrencyError = null;
        },
        clearUserTableColumns(state) {
            state.userTableColumns = [];
            state.userTableColumnsError = null;
        },
        clearUserFormDocuments(state) {
            state.userFormDocuments = [];
            state.userFormDocumentsError = null;
        },
        clearInvoiceTaxTypes(state) {
            state.invoiceTaxTypes = [];
            state.invoiceTaxTypesError = null;
        },
        clearAllInvoiceTaxTypes(state) {
            state.allInvoiceTaxTypes = [];
            state.allInvoiceTaxTypesError = null;
        },
        clearCustomers(state) {
            state.customers = [];
            state.customersError = null;
        },
        clearSalesOrders(state) {
            state.salesOrders = [];
            state.salesOrdersTotalRecords = 0;
            state.salesOrdersCurrentPage = 1;
            state.salesOrdersError = null;
        },
        clearDeliveryNotes(state) {
            state.deliveryNotes = [];
            state.deliveryNotesTotalRecords = 0;
            state.deliveryNotesCurrentPage = 1;
            state.deliveryNotesError = null;
        },
        clearSelectedDNItems(state) {
            state.selectedDNItems = [];
            state.selectedDNItemsError = null;
        },
        clearStores(state) {
            state.stores = [];
            state.storesError = null;
        },
        clearCurrencies(state) {
            state.currencies = [];
            state.currenciesError = null;
        },
        clearProducts(state) {
            state.products = [];
            state.productsError = null;
        },
        clearProductDetails(state) {
            state.productDetails = null;
            state.productDetailsError = null;
        },
        clearSaveSalesInvoice(state) {
            state.saveSalesInvoiceLoading = false;
            state.saveSalesInvoiceError = null;
            state.saveSalesInvoiceResult = null;
        },
        resetSalesInvoice() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Default Store
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
                state.defaultStoreError = action.payload ?? "Unknown error";
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

            // Default State
            .addCase(fetchDefaultState.pending, (state) => {
                state.defaultStateLoading = true;
                state.defaultStateError = null;
            })
            .addCase(fetchDefaultState.fulfilled, (state, action) => {
                state.defaultStateLoading = false;
                state.defaultState = action.payload;
            })
            .addCase(fetchDefaultState.rejected, (state, action) => {
                state.defaultStateLoading = false;
                state.defaultStateError = action.payload ?? "Unknown error";
            })

            // States
            .addCase(fetchStates.pending, (state) => {
                state.statesLoading = true;
                state.statesError = null;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.statesLoading = false;
                state.states = action.payload;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.statesLoading = false;
                state.statesError = action.payload ?? "Unknown error";
            })

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

            // Base Currency
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
                state.baseCurrencyError = action.payload ?? "Unknown error";
            })

            // User Table Columns
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
                state.userTableColumnsError = action.payload ?? "Unknown error";
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

            // All Invoice Tax Types
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
                state.allInvoiceTaxTypesError = action.payload ?? "Unknown error";
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

            // Sales Orders
            .addCase(fetchSalesOrders.pending, (state) => {
                state.salesOrdersLoading = true;
                state.salesOrdersError = null;
            })
            .addCase(fetchSalesOrders.fulfilled, (state, action) => {
                state.salesOrdersLoading = false;
                state.salesOrders = action.payload.data;
                state.salesOrdersTotalRecords = action.payload.totalRecords;
                state.salesOrdersCurrentPage = action.payload.currentPage;
                state.salesOrdersRowsPerPage = action.payload.rowsPerPage;
            })
            .addCase(fetchSalesOrders.rejected, (state, action) => {
                state.salesOrdersLoading = false;
                state.salesOrdersError = action.payload ?? "Unknown error";
            })

            // Delivery Notes
            .addCase(fetchDeliveryNotes.pending, (state) => {
                state.deliveryNotesLoading = true;
                state.deliveryNotesError = null;
            })
            .addCase(fetchDeliveryNotes.fulfilled, (state, action) => {
                state.deliveryNotesLoading = false;
                state.deliveryNotes = action.payload.data;
                state.deliveryNotesTotalRecords = action.payload.totalRecords;
                state.deliveryNotesCurrentPage = action.payload.currentPage;
                state.deliveryNotesRowsPerPage = action.payload.rowsPerPage;
            })
            .addCase(fetchDeliveryNotes.rejected, (state, action) => {
                state.deliveryNotesLoading = false;
                state.deliveryNotesError = action.payload ?? "Unknown error";
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

            // Selected DN Items for Retail Invoice
            .addCase(fetchSelectedDNForRetailInvoice.pending, (state) => {
                state.selectedDNItemsLoading = true;
                state.selectedDNItemsError = null;
            })
            .addCase(fetchSelectedDNForRetailInvoice.fulfilled, (state, action) => {
                state.selectedDNItemsLoading = false;
                state.selectedDNItems = action.payload;
            })
            .addCase(fetchSelectedDNForRetailInvoice.rejected, (state, action) => {
                state.selectedDNItemsLoading = false;
                state.selectedDNItemsError = action.payload ?? "Unknown error";
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
            // Products
            .addCase(fetchProducts.pending, (state) => {
                state.productsLoading = true;
                state.productsError = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.productsLoading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.productsLoading = false;
                state.productsError = action.payload ?? "Unknown error";
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

            // Save Sales Invoice
            .addCase(saveSalesInvoice.pending, (state) => {
                state.saveSalesInvoiceLoading = true;
                state.saveSalesInvoiceError = null;
                state.saveSalesInvoiceResult = null;
            })
            .addCase(saveSalesInvoice.fulfilled, (state, action) => {
                state.saveSalesInvoiceLoading = false;
                state.saveSalesInvoiceResult = action.payload;
            })
            .addCase(saveSalesInvoice.rejected, (state, action) => {
                state.saveSalesInvoiceLoading = false;
                state.saveSalesInvoiceError = action.payload ?? "Unknown error";
            })
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearDefaultStore,
    clearPaymentTypes,
    clearDefaultState,
    clearStates,
    clearDocumentMasters,
    clearGSTTypes,
    clearBaseCurrency,
    clearUserTableColumns,
    clearUserFormDocuments,
    clearInvoiceTaxTypes,
    clearAllInvoiceTaxTypes,
    clearCustomers,
    clearSalesOrders,
    clearDeliveryNotes,
    clearSelectedDNItems,
    clearStores,
    resetSalesInvoice,
    clearCurrencies,
    clearProducts,
    clearProductDetails,
    clearSaveSalesInvoice,
} = salesInvoiceSlice.actions;

export default salesInvoiceSlice.reducer;
