import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentMaster {
    DocumentID: number;
    DocumentName: string;
    SetDefault: boolean;
    PrintModName: string | null;
    Declaration: string | null;
    ShortName: string | null;
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

export interface BaseCurrency {
    OptionValue: number;
    CurrencyID: number;
    Currency: string;
    ExchRate: number;
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

export interface CurrencyOption {
    CurrencyID: number;
    Currency: string;
    CurrencyCode: string | null;
    FaClass: string | null;
    FaChar: string | null;
}

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

export interface CurrencyExRate {
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

export interface AllInvoiceTaxType {
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
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

export interface ItemDetailsWithTax {
    ItemID: number;
    ItemCode: string;
    ItemName: string;
    Description: string | null;
    CategoryID: number;
    CategoryName: string;
    ItemGroupID: number | null;
    ItemGroupName: string | null;
    CategoryID1: number;
    CategoryName1: string;
    ItemTypeID: number;
    ItemType: string;
    StockTypeID: number;
    PurchaseUnitID: number;
    PurchaseUnit: string;
    SalesUnitID: number;
    SalesUnit: string;
    PurchaseUnitMultiplier: number;
    UnitMultiplier: number;
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
}

export interface ServiceBillSale {
    ServiceBillID: number;
    UserID: number;
    InvoiceNo: string;
    InvoiceDate: string;
    PaymentType: string;
    Store: string | null;
    Customer: string;
    TotalQuantity: number;
    NetAmount: number;
    TotalAmt: number;
    ApprovedBy: string;
    Approve: string;
    Approved: boolean;
    DocumentID: number;
    DocumentTypeID: number;
    CustRefNo: string;
    CustRefDate: string | null;
    CreatedDate: string;
    ApprovedDate: string;
    Username: string;
    MobileNo: string;
    MsgSent: boolean;
    Cancelled: boolean;
}

export interface SaveServiceBillPayload {
    TaxPercHead: string;
    TaxAmountHead: string;
    ServiceBillShow: boolean;
    LocalPurchaseShow: boolean;
    Generate: boolean;
    DocumentID: number;
    DocumentName: string;
    InvoiceNo: string;
    InvoiceDate: string;
    InvoiceDateStr: string;
    InvoiceTypeID: number;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
    TaxMasterID: number;
    IsGST: boolean;
    GSTPayableHeadID: number;
    GstReverse: boolean;
    PaymentTypeID: number;
    PaymentTypeName: string;
    CustomerID: number;
    CustomerName: string;
    HeadName: string;
    CustRefNo: string;
    CustRefDate: string;
    SupInvoiceDateStr: string;
    CurrencyID: number;
    Currency: string;
    CurrencyExchRate: number;
    ExchRate: number;
    GrossAmount: string;
    GrossAmountBase: number;
    NetAmount: string;
    NetAmountBase: string;
    NetTotal: string;
    NetTotalBase: string;
    PreNetAmount: string;
    PreNetAmountBase: string;
    Amount: number;
    TotalQuantity: string;
    TotalDiscount: string;
    TotalDiscountBase: number;
    TotalTax: string;
    TotalTaxBase: string;
    TotalSGSTAmt: number;
    TotalCGSTAmt: number;
    TotalIGSTAmt: number;
    TotalUTGSTAmt: number;
    TotalCESSAmt: number;
    TotalVATAmount: number;
    TotalTDS: string;
    TDSApplicableOn: string;
    RoundOff: boolean;
    RoundOffAmount: number;
    Remarks: string;
    RemarksappendStr1: string;
    SalesPurchaseNo: string;
    SalesPurchaseRemarks: string;
    StartDateStr: string;
    EndDateStr: string;
    ChequeDate: string;
    LstServiceBillDetails: ServiceBillDetailItem[];
    LstSalesPurchaseDetail: unknown[];
}

export interface ServiceBillDetailItem {
    ItemID: number;
    ItemCode: string;
    ItemName: string;
    CreditOrDebit: number;
    Name: string;
    colDisabled: boolean;
    HeadID: number;
    StockTypeID: number;
    PurchaseUnitID: number;
    SalesUnitID: number;
    UnitMultiplier: number;
    Quantity: number;
    OrderedQty: number;
    SalesRate: string;
    GrossAmount: string;
    DiscountPercentage: number;
    DiscountAmount: string;
    TaxPercentage: number;
    TaxRate: string;
    SGSTPer: number | null;
    SGSTAmt: string;
    CGSTPer: number | null;
    CGSTAmt: string;
    IGSTPer: number | null;
    IGSTAmt: number;
    UTGSTPer: number | null;
    UTGSTAmt: number;
    CESSPer: number | null;
    CESSAmt: number;
    VATAmt: number;
    NetPRate: string;
    Amount: string;
    Label: string;
}

export interface SaveServiceBillResult {
    invoiceNo: string; 
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface SalesServiceBillState {
    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    paymentTypes: PaymentType[];
    paymentTypesLoading: boolean;
    paymentTypesError: string | null;

    baseCurrencies: BaseCurrency[];
    baseCurrenciesLoading: boolean;
    baseCurrenciesError: string | null;

    tableColumns: TableColumn[];
    tableColumnsLoading: boolean;
    tableColumnsError: string | null;

    invoiceTaxTypeDetails: InvoiceTaxTypeDetail[];
    invoiceTaxTypeDetailsLoading: boolean;
    invoiceTaxTypeDetailsError: string | null;

    customers: Customer[];
    customersLoading: boolean;
    customersError: string | null;

    currencyOptions: CurrencyOption[];
    currencyOptionsLoading: boolean;
    currencyOptionsError: string | null;

    currencyExRate: CurrencyExRate | null;
    currencyExRateLoading: boolean;
    currencyExRateError: string | null;

    allInvoiceTaxTypes: AllInvoiceTaxType[];
    allInvoiceTaxTypesLoading: boolean;
    allInvoiceTaxTypesError: string | null;

    serviceItems: ServiceItem[];
    serviceItemsLoading: boolean;
    serviceItemsError: string | null;

    itemDetailsWithTax: ItemDetailsWithTax | null;
    itemDetailsWithTaxLoading: boolean;
    itemDetailsWithTaxError: string | null;

    serviceBillSales: ServiceBillSale[];
    serviceBillSalesLoading: boolean;
    serviceBillSalesError: string | null;

    saveServiceBillLoading: boolean;
    saveServiceBillError: string | null;
    savedInvoiceNo: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: SalesServiceBillState = {
    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    paymentTypes: [],
    paymentTypesLoading: false,
    paymentTypesError: null,

    baseCurrencies: [],
    baseCurrenciesLoading: false,
    baseCurrenciesError: null,

    tableColumns: [],
    tableColumnsLoading: false,
    tableColumnsError: null,

    invoiceTaxTypeDetails: [],
    invoiceTaxTypeDetailsLoading: false,
    invoiceTaxTypeDetailsError: null,

    customers: [],
    customersLoading: false,
    customersError: null,

    currencyOptions: [],
    currencyOptionsLoading: false,
    currencyOptionsError: null,

    currencyExRate: null,
    currencyExRateLoading: false,
    currencyExRateError: null,

    allInvoiceTaxTypes: [],
    allInvoiceTaxTypesLoading: false,
    allInvoiceTaxTypesError: null,

    serviceItems: [],
    serviceItemsLoading: false,
    serviceItemsError: null,

    itemDetailsWithTax: null,
    itemDetailsWithTaxLoading: false,
    itemDetailsWithTaxError: null,

    serviceBillSales: [],
    serviceBillSalesLoading: false,
    serviceBillSalesError: null,

    saveServiceBillLoading: false,
    saveServiceBillError: null,
    savedInvoiceNo: null,
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
    "salesServiceBill/fetchDocumentMasters",
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
            url.searchParams.set("DocumentType", "Service Bill Sales");
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

export const fetchPaymentTypes = createAsyncThunk<
    PaymentType[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchPaymentTypes",
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

export const fetchBaseCurrencies = createAsyncThunk<
    BaseCurrency[],
    { val?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchBaseCurrencies",
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

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            const data: BaseCurrency[] = json.Server.Data;
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchTableColumns = createAsyncThunk<
    TableColumn[],
    { tableCode: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchTableColumns",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetUserTableColumn"
            );
            url.searchParams.set("tableCode", params.tableCode);

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

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            const data: TableColumn[] = json.Server.Data;
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchInvoiceTaxTypeDetails = createAsyncThunk<
    InvoiceTaxTypeDetail[],
    { documentID: number; startWith?: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchInvoiceTaxTypeDetails",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params.startWith ?? "";
        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

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

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            const data: InvoiceTaxTypeDetail[] = json.Server.Data;
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCustomers = createAsyncThunk<
    Customer[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchCustomers",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Party/GetAllCustomers"
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

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            const data: Customer[] = json.Server.Data;
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyOptions = createAsyncThunk<
    CurrencyOption[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchCurrencyOptions",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Currency/GetCurrencyStartwith/"
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

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            const data: CurrencyOption[] = json.Server.Data;
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyExRate = createAsyncThunk<
    CurrencyExRate,
    { currencyID: number; date?: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchCurrencyExRate",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const date = params.date ?? new Date().toISOString();
        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Currency/GetCurrencyExRate"
            );
            url.searchParams.set("currencyID", String(params.currencyID));
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            const data: CurrencyExRate[] = json.Server.Data;
            if (!data || data.length === 0) {
                throw new Error("No exchange rate data returned");
            }
            return data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllInvoiceTaxTypes = createAsyncThunk<
    AllInvoiceTaxType[],
    { taxMasterId: number; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchAllInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetAllInvoiceTaxTypes"
            );
            url.searchParams.set("taxMasterId", String(params.taxMasterId));

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

export const fetchServiceItems = createAsyncThunk<
    ServiceItem[],
    { itemCategoryID?: number; itemGroupID?: number; itemTypeID?: number; searchStr?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchServiceItems",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Item/GetServiceItem"
            );
            url.searchParams.set("itemCategoryID", String(params?.itemCategoryID ?? 0));
            url.searchParams.set("itemGroupID", String(params?.itemGroupID ?? 0));
            url.searchParams.set("itemTypeID", String(params?.itemTypeID ?? 3));
            url.searchParams.set("searchStr", params?.searchStr ?? "");

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
            return json?.Server?.Data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemDetailsWithTax = createAsyncThunk<
    ItemDetailsWithTax,
    { invoiceTaxTypeId: number; itemID: number; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchItemDetailsWithTax",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Item/GetItemDetailsWithTaxDetails"
            );
            url.searchParams.set("invoiceTaxTypeId", String(params.invoiceTaxTypeId));
            url.searchParams.set("itemID", String(params.itemID));

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
            const data = json?.Server?.Data ?? [];
            if (data.length === 0) return rejectWithValue("No item details found.");
            return data[0] as ItemDetailsWithTax;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllServiceBillSales = createAsyncThunk<
    ServiceBillSale[],
    {
        fromDate: string;
        toDate: string;
        rowsPerPage?: number;
        currentPage?: number;
        searchStr?: string;
        companyId?: number;
        finYearId?: number;
    },
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/fetchAllServiceBillSales",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/ServiceBillSales/ReadAllServiceBillSales"
            );
            url.searchParams.set("FromDate", params.fromDate);
            url.searchParams.set("ToDate", params.toDate);
            url.searchParams.set("rowsPerPage", String(params.rowsPerPage ?? 25));
            url.searchParams.set("documentType", "Service Bill Sales");
            url.searchParams.set("currentPage", String(params.currentPage ?? 1));
            url.searchParams.set("searchStr", params.searchStr ?? "");

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

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as ServiceBillSale[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const saveServiceBill = createAsyncThunk<
    SaveServiceBillResult,
    { payload: SaveServiceBillPayload; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesServiceBill/saveServiceBill",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/ServiceBillSales/SaveChangesForService",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                    body: JSON.stringify(params.payload),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message ?? "Save failed");
            }

            return { invoiceNo: json.Server.Info as string };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const salesServiceBillSlice = createSlice({
    name: "salesServiceBill",
    initialState,
    reducers: {
        clearDocumentMasters(state) {
            state.documentMasters = [];
            state.documentMastersLoading = false;
            state.documentMastersError = null;
        },
        clearPaymentTypes(state) {
            state.paymentTypes = [];
            state.paymentTypesLoading = false;
            state.paymentTypesError = null;
        },
        clearBaseCurrencies(state) {
            state.baseCurrencies = [];
            state.baseCurrenciesLoading = false;
            state.baseCurrenciesError = null;
        },
        clearTableColumns(state) {
            state.tableColumns = [];
            state.tableColumnsLoading = false;
            state.tableColumnsError = null;
        },
        clearInvoiceTaxTypeDetails(state) {
            state.invoiceTaxTypeDetails = [];
            state.invoiceTaxTypeDetailsLoading = false;
            state.invoiceTaxTypeDetailsError = null;
        },
        clearCustomers(state) {
            state.customers = [];
            state.customersLoading = false;
            state.customersError = null;
        },
        clearCurrencyOptions(state) {
            state.currencyOptions = [];
            state.currencyOptionsLoading = false;
            state.currencyOptionsError = null;
        },
        clearCurrencyExRate(state) {
            state.currencyExRate = null;
            state.currencyExRateLoading = false;
            state.currencyExRateError = null;
        },
        clearAllInvoiceTaxTypes(state) {
            state.allInvoiceTaxTypes = [];
            state.allInvoiceTaxTypesLoading = false;
            state.allInvoiceTaxTypesError = null;
        },
        clearServiceItems(state) {
            state.serviceItems = [];
            state.serviceItemsLoading = false;
            state.serviceItemsError = null;
        },
        clearItemDetailsWithTax(state) {
            state.itemDetailsWithTax = null;
            state.itemDetailsWithTaxLoading = false;
            state.itemDetailsWithTaxError = null;
        },
        clearServiceBillSales(state) {
            state.serviceBillSales = [];
            state.serviceBillSalesLoading = false;
            state.serviceBillSalesError = null;
        },
        clearSaveServiceBill(state) {
            state.saveServiceBillLoading = false;
            state.saveServiceBillError = null;
            state.savedInvoiceNo = null;
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

            // Base Currencies
            .addCase(fetchBaseCurrencies.pending, (state) => {
                state.baseCurrenciesLoading = true;
                state.baseCurrenciesError = null;
            })
            .addCase(fetchBaseCurrencies.fulfilled, (state, action) => {
                state.baseCurrenciesLoading = false;
                state.baseCurrencies = action.payload;
            })
            .addCase(fetchBaseCurrencies.rejected, (state, action) => {
                state.baseCurrenciesLoading = false;
                state.baseCurrenciesError = action.payload ?? "Unknown error";
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

            // Invoice Tax Type Details
            .addCase(fetchInvoiceTaxTypeDetails.pending, (state) => {
                state.invoiceTaxTypeDetailsLoading = true;
                state.invoiceTaxTypeDetailsError = null;
            })
            .addCase(fetchInvoiceTaxTypeDetails.fulfilled, (state, action) => {
                state.invoiceTaxTypeDetailsLoading = false;
                state.invoiceTaxTypeDetails = action.payload;
            })
            .addCase(fetchInvoiceTaxTypeDetails.rejected, (state, action) => {
                state.invoiceTaxTypeDetailsLoading = false;
                state.invoiceTaxTypeDetailsError = action.payload ?? "Unknown error";
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

            // Currency Options
            .addCase(fetchCurrencyOptions.pending, (state) => {
                state.currencyOptionsLoading = true;
                state.currencyOptionsError = null;
            })
            .addCase(fetchCurrencyOptions.fulfilled, (state, action) => {
                state.currencyOptionsLoading = false;
                state.currencyOptions = action.payload;
            })
            .addCase(fetchCurrencyOptions.rejected, (state, action) => {
                state.currencyOptionsLoading = false;
                state.currencyOptionsError = action.payload ?? "Unknown error";
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
            // Service Items
            .addCase(fetchServiceItems.pending, (state) => {
                state.serviceItemsLoading = true;
                state.serviceItemsError = null;
            })
            .addCase(fetchServiceItems.fulfilled, (state, action) => {
                state.serviceItemsLoading = false;
                state.serviceItems = action.payload;
            })
            .addCase(fetchServiceItems.rejected, (state, action) => {
                state.serviceItemsLoading = false;
                state.serviceItemsError = action.payload ?? "Unknown error";
            })
            // Item Details With Tax
            .addCase(fetchItemDetailsWithTax.pending, (state) => {
                state.itemDetailsWithTaxLoading = true;
                state.itemDetailsWithTaxError = null;
            })
            .addCase(fetchItemDetailsWithTax.fulfilled, (state, action) => {
                state.itemDetailsWithTaxLoading = false;
                state.itemDetailsWithTax = action.payload;
            })
            .addCase(fetchItemDetailsWithTax.rejected, (state, action) => {
                state.itemDetailsWithTaxLoading = false;
                state.itemDetailsWithTaxError = action.payload ?? "Unknown error";
            })
            // Service Bill Sales
            .addCase(fetchAllServiceBillSales.pending, (state) => {
                state.serviceBillSalesLoading = true;
                state.serviceBillSalesError = null;
            })
            .addCase(fetchAllServiceBillSales.fulfilled, (state, action) => {
                state.serviceBillSalesLoading = false;
                state.serviceBillSales = action.payload;
            })
            .addCase(fetchAllServiceBillSales.rejected, (state, action) => {
                state.serviceBillSalesLoading = false;
                state.serviceBillSalesError = action.payload ?? "Unknown error";
            })
            // Save Service Bill
            .addCase(saveServiceBill.pending, (state) => {
                state.saveServiceBillLoading = true;
                state.saveServiceBillError = null;
                state.savedInvoiceNo = null;
            })
            .addCase(saveServiceBill.fulfilled, (state, action) => {
                state.saveServiceBillLoading = false;
                state.savedInvoiceNo = action.payload.invoiceNo;
            })
            .addCase(saveServiceBill.rejected, (state, action) => {
                state.saveServiceBillLoading = false;
                state.saveServiceBillError = action.payload ?? "Unknown error";
            })
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearDocumentMasters,
    clearPaymentTypes,
    clearBaseCurrencies,
    clearTableColumns,
    clearInvoiceTaxTypeDetails,
    clearCustomers,
    clearCurrencyOptions,
    clearCurrencyExRate,
    clearAllInvoiceTaxTypes,
    clearServiceItems,
    clearItemDetailsWithTax,
    clearServiceBillSales,
    clearSaveServiceBill,
} = salesServiceBillSlice.actions;

export default salesServiceBillSlice.reducer;
