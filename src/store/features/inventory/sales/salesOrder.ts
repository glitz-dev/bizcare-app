import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BaseCurrencyPreference {
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

export interface SalesOrderDocument {
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

export interface LoggedInCompany {
    CompanyID: number;
    CompanyName: string;
    Code: string;
}

export interface PaymentType {
    PaymentTypeID: number;
    PaymentTypeName: string;
}

export interface SupplyType {
    SupplyTypeID: number;
    SupplyType: string;
}

export interface CompanyCurrency {
    CompanyID: number;
    CurrencyID: number;
    Currency: string;
    Symbol: string;
}

export interface ItemsCompany {
    Code: string;
    CompanyName: string;
    CompanyID: number;
}

export interface DefaultStatus {
    StatusID: number;
    StatusDetails: string;
}

export interface PendingSalesQuotation {
    SalesQuotationID: number;
    QuotationNo: string;
    QuotationDate: string;
    CustomerID: number;
    CustomerName: string | null;
    NetAmount: number;
}

export interface InvPreference {
    SHOW_BATCHES_WHEN_ITEM_SELECTED: number;
    ALLOW_MULTIPLE_BATCH_CONSUMPTION: number;
    ALLOW_ADD_SUB_ITEMS: number;
    ITEM_STOCK_FROM_MAIN_STORE_ONLY: number;
    SHOW_BATCHES_WHEN_BARCODE_ENTERED: number;
    SHOW_BARCODE: number;
}

export interface UserTableColumn {
    TableColumnID: number;
    ColumnName: string;
    Show: boolean;
    Width: string;
    ColumnDisplayName: string;
}

export interface CurrentUser {
    UserID: number;
    UserName: string;
    Password: string | null;
    CompanyID: number;
    BranchID: number;
    ProjectID: number;
    FinyearID: number;
    FirstName: string;
    UserRoleID: number;
    UserRole: string;
}

export interface DefaultPartyCategory {
    UserPartyCategoryID: number;
    ID: number;
    PartyCategory: string;
}

export interface CurrencyStartWith {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

export interface StockType {
    TypeName: string;
    TypeID: number;
}

export interface GstEnable {
    OptionValue: number;
}

export interface ItemQuality {
    QualityID: number;
    Quality: string;
}

export interface UserFormWiseDocument {
    DocumentID: number;
    UserDocumentID: number;
    DocumentTypeID: number;
    Approve: boolean;
    Disapprove: boolean;
}

export interface Vendor {
    PartyID: number;
    PartyCode: string | null;
    PartyName: string;
    PartyAddress: string | null;
    PhoneNo: string | null;
    PartyGroupName: string | null;
    TotalRowCount: number;
}

export interface InvoiceTaxType {
    DocumentID: number;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string;
}

export interface Bank {
    BankID: number;
    BankName: string;
    PostShipmentCredit: number | null;
    PreshipmentCredit: number | null;
    AcHeadID: number;
    AccountNo: string;
}

export interface PaymentTerm {
    TermsID: number;
    PaymentTerm: string;
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
    FinanceAvailable: boolean | null;
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

export interface CustomerCodeItem {
    CustomerID: number;
    CustomerCode: string | null;
    CustomerName: string;
    CustomerAddress: string | null;
    CurrencyID: number | null;
    Currency: string | null;
    Symbol: string | null;
    ECGCLimit: number | null;
    PaymentTermID: number | null;
    PaymentTerm: string | null;
    PayDaysFromBL: number | null;
    FinanceAvailable: boolean | null;
    FaClass: string | null;
    FaChar: string | null;
    DaysToComplete: number | null;
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

export interface DefaultStore {
    StoreID: number;
    StoreName: string;
}

export interface StoreStartWith {
    StoreID: number;
    StoreName: string;
    CompanyStore: boolean | null;
}

export interface SalesOrderListItem {
    SalesOrderID: number;
    SalesOrderNo: string;
    SalesOrderDate: string;
    PaymentTypeName: string;
    CustomerCode: string | null;
    CustomerName: string;
    StatusDetails: string;
    GrossAmount: number;
    NetAmount: number;
    CreatedBy: string;
    FaClass: string;
    Document: string;
    CountryName: string;
    ApprovedBy: string | null;
    ModifiedBy: string | null;
    ApprovedDate: string | null;
    CreatedDate: string;
}

export interface GetSalesOrdersParams {
    currentPage?: number;
    customerId?: number;
    filterDateType?: number;
    fromDate?: string;
    rowsPerPage?: number;
    searchStr?: string;
    statusId?: number;
    toDate?: string;
    companyId?: number;
    finYearId?: number;
}

export interface SalesOrderDetailItem {
    SlNo: number;
    ItemID: number;
    ItemCode: string;
    ItemName: string;
    SalesUnitID: number;
    SalesUnit: string;
    Quantity: string;
    OrderedQty: number;
    SalesRate: number;
    DiscountPercentage: number;
    DiscountAmount: string;
    GrossAmount: number;
    Amount: string;
    TaxRate: string;
    CGSTPer: number;
    SGSTPer: number;
    CGSTAmt: string;
    SGSTAmt: string;
    IGSTAmt: string;
    UTGSTAmt: string;
    CESSAmt: string;
    VATAmt: string;
    BatchID: number;
    Barcode: string;
    RateOn: string;
    RateBasedOnSqm: boolean;
    UnitMultiplier: number;
    StockAvailable: boolean;
    Label: string;
}

export interface SaveSalesOrderPayload {
    SalesOrderDateStr: string;
    DeliveryWeekStr: string;
    TaxPercHead: string;
    Amendment: boolean;
    Approved: boolean;
    BankID: number;
    BankName: string;
    BillwiseDiscountAmt: string;
    BillwiseDiscountPer: number;
    CBM: string;
    ChequeDate: string | null;
    Currency: string;
    CurrencyID: number;
    CustRefDate: string;
    CustRefDateStr: string;
    CustomerAddress: string | null;
    CustomerCode: string;
    CustomerID: number;
    CustomerName: string;
    DaysToComplete: number | null;
    DeliveryWeek: string;
    DocumentID: number;
    DocumentName: string;
    ECGCLimit: number | null;
    ExRate: number;
    FinanceAvailable: boolean | null;
    GrossAmount: string;
    GrossAmountBase: string;
    Intercompany: boolean;
    InvoiceTaxType: string;
    InvoiceTaxTypeID: number;
    IsGST: boolean;
    IsLocalOrder: boolean;
    LstSalesOrderDetails: SalesOrderDetailItem[];
    ManualyChangedDocNo: boolean;
    MerchantExpPer: number;
    NetAmount: string;
    NetAmountBase: string;
    NetTotal: string;
    NetTotalBase: string;
    OtherAdditionalAmount: string;
    OtherAdditionalAmountBase: string;
    OtherDeductionAmount: string;
    OtherDeductionAmountBase: string;
    PayDaysFromBL: number | null;
    PaymentTerm: string;
    PaymentTermsID: number;
    PaymentTypeID: number;
    PaymentTypeName: string;
    PreNetAmount: string;
    PreNetAmountBase: string;
    Prefix: string;
    ProbableAdvDate: string | null;
    ProdCompletionDate: string | null;
    ProjectedArrivalDate: string | null;
    ReviewDate: string;
    ReviewDateStr: string;
    ReviewedBy: number;
    ReviewedByName: string;
    ReviewedOn: string;
    SalesOrderDate: string;
    SalesOrderNo: string;
    ShipmentDate: string | null;
    StartingNo: number;
    StatusDetails: string;
    StatusID: number;
    StoreID: number;
    StoreName: string;
    Suffix: string | null;
    SupplyType: string;
    SupplyTypeID: number;
    TaxAmountHead: string;
    TaxInvoice: boolean;
    TaxMasterID: number;
    TotalCESSAmt: number;
    TotalCGSTAmt: number;
    TotalDiscount: string;
    TotalDiscountBase: string;
    TotalIGSTAmt: number;
    TotalQuantity: string;
    TotalSGSTAmt: number;
    TotalTax: string;
    TotalTaxBase: string;
    TotalUTGSTAmt: number;
    TotalVATAmount: number;
}

export interface SaveSalesOrderResult {
    Success: boolean;
    Message: string;
    MessageId: string | null;
    Id: number;
    Info: any;
    Approve: any;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface SalesOrderState {
    baseCurrency: BaseCurrencyPreference | null;
    baseCurrencyLoading: boolean;
    baseCurrencyError: string | null;

    salesOrderDocuments: SalesOrderDocument[];
    salesOrderDocumentsLoading: boolean;
    salesOrderDocumentsError: string | null;

    loggedInCompany: LoggedInCompany | null;
    loggedInCompanyLoading: boolean;
    loggedInCompanyError: string | null;

    paymentTypes: PaymentType[];
    paymentTypesLoading: boolean;
    paymentTypesError: string | null;

    defaultSupplyType: SupplyType | null;
    defaultSupplyTypeLoading: boolean;
    defaultSupplyTypeError: string | null;

    companyCurrency: CompanyCurrency | null;
    companyCurrencyLoading: boolean;
    companyCurrencyError: string | null;

    itemsCompanies: ItemsCompany[];
    itemsCompaniesLoading: boolean;
    itemsCompaniesError: string | null;

    defaultStatus: DefaultStatus | null;
    defaultStatusLoading: boolean;
    defaultStatusError: string | null;

    pendingSalesQuotations: PendingSalesQuotation[];
    pendingSalesQuotationsLoading: boolean;
    pendingSalesQuotationsError: string | null;

    statusForCompleted: number | null;
    statusForCompletedLoading: boolean;
    statusForCompletedError: string | null;

    invPreference: InvPreference | null;
    invPreferenceLoading: boolean;
    invPreferenceError: string | null;

    userTableColumns: UserTableColumn[];
    userTableColumnsLoading: boolean;
    userTableColumnsError: string | null;

    currentUser: CurrentUser | null;
    currentUserLoading: boolean;
    currentUserError: string | null;

    defaultPartyCategory: DefaultPartyCategory | null;
    defaultPartyCategoryLoading: boolean;
    defaultPartyCategoryError: string | null;

    currencyList: CurrencyStartWith[];
    currencyListLoading: boolean;
    currencyListError: string | null;

    defaultStockTypes: StockType[];
    defaultStockTypesLoading: boolean;
    defaultStockTypesError: string | null;

    gstEnable: number | null;
    gstEnableLoading: boolean;
    gstEnableError: string | null;

    itemQualities: ItemQuality[];
    itemQualitiesLoading: boolean;
    itemQualitiesError: string | null;

    userFormWiseDocuments: UserFormWiseDocument[];
    userFormWiseDocumentsLoading: boolean;
    userFormWiseDocumentsError: string | null;

    vendors: Vendor[];
    vendorsLoading: boolean;
    vendorsError: string | null;

    invoiceTaxTypes: InvoiceTaxType[];
    invoiceTaxTypesLoading: boolean;
    invoiceTaxTypesError: string | null;

    banks: Bank[];
    banksLoading: boolean;
    banksError: string | null;

    paymentTerms: PaymentTerm[];
    paymentTermsLoading: boolean;
    paymentTermsError: string | null;

    customers: Customer[];
    customersLoading: boolean;
    customersError: string | null;

    customerCodes: CustomerCodeItem[];
    customerCodesLoading: boolean;
    customerCodesError: string | null;

    productDetails: ProductDetail[];
    productDetailsLoading: boolean;
    productDetailsError: string | null;

    productionItemDetail: ProductionItemDetail | null;
    productionItemDetailLoading: boolean;
    productionItemDetailError: string | null;

    defaultStore: DefaultStore | null;
    defaultStoreLoading: boolean;
    defaultStoreError: string | null;

    storeStartWith: StoreStartWith[];
    storeStartWithLoading: boolean;
    storeStartWithError: string | null;

    salesOrders: SalesOrderListItem[];
    salesOrdersLoading: boolean;
    salesOrdersError: string | null;

    saveSalesOrderResult: SaveSalesOrderResult | null;
    saveSalesOrderLoading: boolean;
    saveSalesOrderError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: SalesOrderState = {
    baseCurrency: null,
    baseCurrencyLoading: false,
    baseCurrencyError: null,

    salesOrderDocuments: [],
    salesOrderDocumentsLoading: false,
    salesOrderDocumentsError: null,

    loggedInCompany: null,
    loggedInCompanyLoading: false,
    loggedInCompanyError: null,

    paymentTypes: [],
    paymentTypesLoading: false,
    paymentTypesError: null,

    defaultSupplyType: null,
    defaultSupplyTypeLoading: false,
    defaultSupplyTypeError: null,

    companyCurrency: null,
    companyCurrencyLoading: false,
    companyCurrencyError: null,

    itemsCompanies: [],
    itemsCompaniesLoading: false,
    itemsCompaniesError: null,

    defaultStatus: null,
    defaultStatusLoading: false,
    defaultStatusError: null,

    pendingSalesQuotations: [],
    pendingSalesQuotationsLoading: false,
    pendingSalesQuotationsError: null,

    statusForCompleted: null,
    statusForCompletedLoading: false,
    statusForCompletedError: null,

    invPreference: null,
    invPreferenceLoading: false,
    invPreferenceError: null,

    userTableColumns: [],
    userTableColumnsLoading: false,
    userTableColumnsError: null,

    currentUser: null,
    currentUserLoading: false,
    currentUserError: null,

    defaultPartyCategory: null,
    defaultPartyCategoryLoading: false,
    defaultPartyCategoryError: null,

    currencyList: [],
    currencyListLoading: false,
    currencyListError: null,

    defaultStockTypes: [],
    defaultStockTypesLoading: false,
    defaultStockTypesError: null,

    gstEnable: null,
    gstEnableLoading: false,
    gstEnableError: null,

    itemQualities: [],
    itemQualitiesLoading: false,
    itemQualitiesError: null,

    userFormWiseDocuments: [],
    userFormWiseDocumentsLoading: false,
    userFormWiseDocumentsError: null,

    vendors: [],
    vendorsLoading: false,
    vendorsError: null,

    invoiceTaxTypes: [],
    invoiceTaxTypesLoading: false,
    invoiceTaxTypesError: null,

    banks: [],
    banksLoading: false,
    banksError: null,

    paymentTerms: [],
    paymentTermsLoading: false,
    paymentTermsError: null,

    customers: [],
    customersLoading: false,
    customersError: null,

    customerCodes: [],
    customerCodesLoading: false,
    customerCodesError: null,

    productDetails: [],
    productDetailsLoading: false,
    productDetailsError: null,

    productionItemDetail: null,
    productionItemDetailLoading: false,
    productionItemDetailError: null,

    defaultStore: null,
    defaultStoreLoading: false,
    defaultStoreError: null,

    storeStartWith: [],
    storeStartWithLoading: false,
    storeStartWithError: null,

    salesOrders: [],
    salesOrdersLoading: false,
    salesOrdersError: null,

    saveSalesOrderResult: null,
    saveSalesOrderLoading: false,
    saveSalesOrderError: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    let token = state.auth.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchBaseCurrency = createAsyncThunk<
    BaseCurrencyPreference,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchBaseCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/GeneralPreference/GetPreferenceDetailsByFunction"
            );
            url.searchParams.set("functionName", "BaseCurrency");

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

            const json: ServerResponse<BaseCurrencyPreference> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch base currency preference"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSalesOrderDocuments = createAsyncThunk<
    SalesOrderDocument[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchSalesOrderDocuments",
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
            url.searchParams.set("DocumentType", "SALES_ORDER");
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

            const json: SalesOrderDocument[] = await response.json();

            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchLoggedInCompany = createAsyncThunk<
    LoggedInCompany,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchLoggedInCompany",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Company/GetLoggedInCompany"
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

            const json: ServerResponse<LoggedInCompany[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch logged-in company"
                );
            }

            return json.Server.Data[0];
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
    "salesOrder/fetchPaymentTypes",
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
            if (startWith) url.searchParams.set("startWith", startWith);

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

export const fetchDefaultSupplyType = createAsyncThunk<
    SupplyType,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchDefaultSupplyType",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/CommonUtility/GetDefaultSupplyType"
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

            const json: ServerResponse<SupplyType[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch default supply type"
                );
            }

            return json.Server.Data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCompanyCurrency = createAsyncThunk<
    CompanyCurrency,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchCompanyCurrency",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Company/GetCompanyCurrency"
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

            const json: ServerResponse<CompanyCurrency[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch company currency"
                );
            }

            return json.Server.Data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemsCompanies = createAsyncThunk<
    ItemsCompany[],
    { startWith?: string; intercompany?: boolean; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchItemsCompanies",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const intercompany = params?.intercompany ?? false;
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Company/GetItemsCompanyStartWith"
            );
            url.searchParams.set("intercompany", String(intercompany));
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

            const json: ServerResponse<ItemsCompany[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch items companies"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDefaultStatus = createAsyncThunk<
    DefaultStatus,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchDefaultStatus",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Status/GetDefaultStatus"
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

            const json: ServerResponse<DefaultStatus[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch default status"
                );
            }

            return json.Server.Data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPendingSalesQuotations = createAsyncThunk<
    PendingSalesQuotation[],
    { customerId?: number; salesId?: number; deliveryNoteId?: number; salesOrderId?: number; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchPendingSalesQuotations",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const customerId = params?.customerId ?? 0;
        const salesId = params?.salesId ?? 0;
        const deliveryNoteId = params?.deliveryNoteId ?? 0;
        const salesOrderId = params?.salesOrderId ?? 0;
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/SalesQuotation/GetPendingSalesQuotations"
            );
            url.searchParams.set("customerId", String(customerId));
            url.searchParams.set("salesId", String(salesId));
            url.searchParams.set("deliveryNoteId", String(deliveryNoteId));
            url.searchParams.set("salesOrderId", String(salesOrderId));

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

            const json: ServerResponse<PendingSalesQuotation[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch pending sales quotations"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchStatusForCompleted = createAsyncThunk<
    number,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchStatusForCompleted",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Status/GetStatusForCompleted"
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

            const data: number = await response.json();

            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchInvPreference = createAsyncThunk<
    InvPreference,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchInvPreference",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Utils/GetInvPreference"
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

            const json: ServerResponse<InvPreference[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch inventory preference"
                );
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
    "salesOrder/fetchUserTableColumns",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const tableCode = params?.tableCode ?? "SalesOrder_Tbl";
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<UserTableColumn[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch user table columns"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrentUser = createAsyncThunk<
    CurrentUser,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchCurrentUser",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/User/GetCurrentUser"
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

            const json: ServerResponse<CurrentUser> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch current user"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDefaultPartyCategory = createAsyncThunk<
    DefaultPartyCategory,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchDefaultPartyCategory",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/PartyCategories/GetDefaultPartyCategoryuserwise/"
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

            const json: ServerResponse<DefaultPartyCategory[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch default party category"
                );
            }

            return json.Server.Data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCurrencyList = createAsyncThunk<
    CurrencyStartWith[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchCurrencyList",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            const json: ServerResponse<CurrencyStartWith[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch currency list"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDefaultStockTypes = createAsyncThunk<
    StockType[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchDefaultStockTypes",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/StockType/GetDefaultStockTypes"
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

            const json: StockType[] = await response.json();

            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchGstEnable = createAsyncThunk<
    number,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchGstEnable",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Item/GetGStEnable"
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

            const json: ServerResponse<GstEnable[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch GST enable status"
                );
            }

            return json.Server.Data[0].OptionValue;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemQualityAll = createAsyncThunk<
    ItemQuality[],
    { itemId?: number; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchItemQualityAll",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const itemId = params?.itemId ?? 0;
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Item/GetItemQualityAll"
            );
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<ItemQuality[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch item qualities"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchUserFormWiseDocuments = createAsyncThunk<
    UserFormWiseDocument[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchUserFormWiseDocuments",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            const json: ServerResponse<UserFormWiseDocument[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch user form wise documents"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchVendors = createAsyncThunk<
    Vendor[],
    { currentPage?: number; itemId?: number; rowsPerPage?: number; searchStr?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchVendors",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const currentPage = params?.currentPage ?? 1;
        const itemId = params?.itemId ?? 0;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Item/GetVendorsAll"
            );
            url.searchParams.set("currentPage", String(currentPage));
            url.searchParams.set("itemId", String(itemId));
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
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

            const json: ServerResponse<Vendor[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch vendors"
                );
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
    "salesOrder/fetchInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { documentID } = params;
        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            const json: ServerResponse<InvoiceTaxType[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch invoice tax types"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchBanks = createAsyncThunk<
    Bank[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchBanks",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Bank/GetBankStartwith"
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

            const json: Bank[] = await response.json();

            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPaymentTerms = createAsyncThunk<
    PaymentTerm[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchPaymentTerms",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/PaymentTerms/GetPaymentTermsStartwith"
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

            const json: ServerResponse<PaymentTerm[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch payment terms"
                );
            }

            return json.Server.Data;
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
    "salesOrder/fetchCustomers",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const isLocalOrder = params?.isLocalOrder ?? false;
        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            const json: ServerResponse<Customer[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch customers"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCustomerCodes = createAsyncThunk<
    CustomerCodeItem[],
    { isLocalOrder?: boolean; startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchCustomerCodes",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const isLocalOrder = params?.isLocalOrder ?? false;
        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Party/GetAllCustomerCodes"
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

            const json: ServerResponse<CustomerCodeItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch customer codes"
                );
            }

            return json.Server.Data;
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
    "salesOrder/fetchProductDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            const json: ServerResponse<ProductDetail[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch product details"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchProductionItemDetail = createAsyncThunk<
    ProductionItemDetail,
    {
        itemId: number;
        itemCode: string;
        customerId?: number;
        customerCode?: string;
        invoiceTaxTypeId?: number;
        designCode?: string;
        asMode?: string;
        companyId?: number;
        finYearId?: number;
    },
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchProductionItemDetail",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const {
            itemId,
            itemCode,
            customerId = 0,
            customerCode = "",
            invoiceTaxTypeId = 1,
            designCode = "",
            asMode = "II",
            companyId = 1,
            finYearId = 2,
        } = params;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/Item/GetProductionItemDetails"
            );
            url.searchParams.set("asMode", asMode);
            url.searchParams.set("companyId", String(companyId));
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<ProductionItemDetail[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch production item detail"
                );
            }

            return json.Server.Data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

export const fetchDefaultStore = createAsyncThunk<
    DefaultStore,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchDefaultStore",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/Store/GetDefaultStore",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: DefaultStore[] = await response.json();

            return json[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchStoreStartWith = createAsyncThunk<
    StoreStartWith[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchStoreStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            const json: ServerResponse<StoreStartWith[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch stores"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSalesOrders = createAsyncThunk<
    SalesOrderListItem[],
    GetSalesOrdersParams | void,
    { state: RootState; rejectValue: string }
>(
    "salesOrder/fetchSalesOrders",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const currentPage = params?.currentPage ?? 1;
        const customerId = params?.customerId ?? 0;
        const filterDateType = params?.filterDateType ?? 0;
        const fromDate = params?.fromDate ?? "";
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const searchStr = params?.searchStr ?? "";
        const statusId = params?.statusId ?? 0;
        const toDate = params?.toDate ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/SalesOrder/GetSalesOrders"
            );
            url.searchParams.set("currentPage", String(currentPage));
            url.searchParams.set("customerId", String(customerId));
            url.searchParams.set("filterDateType", String(filterDateType));
            url.searchParams.set("fromDate", fromDate);
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
            url.searchParams.set("searchStr", searchStr);
            url.searchParams.set("statusId", String(statusId));
            url.searchParams.set("toDate", toDate);

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

            const json: ServerResponse<SalesOrderListItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch sales orders"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const saveSalesOrder = createAsyncThunk<
    SaveSalesOrderResult,
    { body: SaveSalesOrderPayload; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesOrder/saveSalesOrder",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/SalesOrder/SaveChanges"
            );

            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(params.body),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<null> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to save sales order"
                );
            }

            return json.Server as SaveSalesOrderResult;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const salesOrderSlice = createSlice({
    name: "salesOrder",
    initialState,
    reducers: {
        clearBaseCurrency(state) {
            state.baseCurrency = null;
            state.baseCurrencyError = null;
        },
        clearSalesOrderDocuments(state) {
            state.salesOrderDocuments = [];
            state.salesOrderDocumentsError = null;
        },
        clearLoggedInCompany(state) {
            state.loggedInCompany = null;
            state.loggedInCompanyError = null;
        },
        clearPaymentTypes(state) {
            state.paymentTypes = [];
            state.paymentTypesError = null;
        },
        clearDefaultSupplyType(state) {
            state.defaultSupplyType = null;
            state.defaultSupplyTypeError = null;
        },
        clearCompanyCurrency(state) {
            state.companyCurrency = null;
            state.companyCurrencyError = null;
        },
        clearItemsCompanies(state) {
            state.itemsCompanies = [];
            state.itemsCompaniesError = null;
        },
        clearDefaultStatus(state) {
            state.defaultStatus = null;
            state.defaultStatusError = null;
        },
        clearPendingSalesQuotations(state) {
            state.pendingSalesQuotations = [];
            state.pendingSalesQuotationsError = null;
        },
        clearStatusForCompleted(state) {
            state.statusForCompleted = null;
            state.statusForCompletedError = null;
        },
        clearInvPreference(state) {
            state.invPreference = null;
            state.invPreferenceError = null;
        },
        clearUserTableColumns(state) {
            state.userTableColumns = [];
            state.userTableColumnsError = null;
        },
        clearCurrentUser(state) {
            state.currentUser = null;
            state.currentUserError = null;
        },
        clearDefaultPartyCategory(state) {
            state.defaultPartyCategory = null;
            state.defaultPartyCategoryError = null;
        },
        clearCurrencyList(state) {
            state.currencyList = [];
            state.currencyListError = null;
        },
        clearDefaultStockTypes(state) {
            state.defaultStockTypes = [];
            state.defaultStockTypesError = null;
        },
        clearGstEnable(state) {
            state.gstEnable = null;
            state.gstEnableError = null;
        },
        clearItemQualities(state) {
            state.itemQualities = [];
            state.itemQualitiesError = null;
        },
        clearUserFormWiseDocuments(state) {
            state.userFormWiseDocuments = [];
            state.userFormWiseDocumentsError = null;
        },
        clearVendors(state) {
            state.vendors = [];
            state.vendorsError = null;
        },
        clearInvoiceTaxTypes(state) {
            state.invoiceTaxTypes = [];
            state.invoiceTaxTypesError = null;
        },
        clearBanks(state) {
            state.banks = [];
            state.banksError = null;
        },
        clearPaymentTerms(state) {
            state.paymentTerms = [];
            state.paymentTermsError = null;
        },
        clearCustomers(state) {
            state.customers = [];
            state.customersError = null;
        },
        clearCustomerCodes(state) {
            state.customerCodes = [];
            state.customerCodesError = null;
        },
        clearProductDetails(state) {
            state.productDetails = [];
            state.productDetailsError = null;
        },
        clearProductionItemDetail(state) {
            state.productionItemDetail = null;
            state.productionItemDetailError = null;
        },
        clearDefaultStore(state) {
            state.defaultStore = null;
            state.defaultStoreError = null;
        },
        clearStoreStartWith(state) {
            state.storeStartWith = [];
            state.storeStartWithError = null;
        },
        clearSalesOrders(state) {
            state.salesOrders = [];
            state.salesOrdersError = null;
        },
        clearSaveSalesOrder(state) {
            state.saveSalesOrderResult = null;
            state.saveSalesOrderError = null;
        },
        resetSalesOrder() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
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

            // Sales Order Documents
            .addCase(fetchSalesOrderDocuments.pending, (state) => {
                state.salesOrderDocumentsLoading = true;
                state.salesOrderDocumentsError = null;
            })
            .addCase(fetchSalesOrderDocuments.fulfilled, (state, action) => {
                state.salesOrderDocumentsLoading = false;
                state.salesOrderDocuments = action.payload;
            })
            .addCase(fetchSalesOrderDocuments.rejected, (state, action) => {
                state.salesOrderDocumentsLoading = false;
                state.salesOrderDocumentsError = action.payload ?? "Unknown error";
            })

            // Logged-In Company
            .addCase(fetchLoggedInCompany.pending, (state) => {
                state.loggedInCompanyLoading = true;
                state.loggedInCompanyError = null;
            })
            .addCase(fetchLoggedInCompany.fulfilled, (state, action) => {
                state.loggedInCompanyLoading = false;
                state.loggedInCompany = action.payload;
            })
            .addCase(fetchLoggedInCompany.rejected, (state, action) => {
                state.loggedInCompanyLoading = false;
                state.loggedInCompanyError = action.payload ?? "Unknown error";
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

            // Default Supply Type
            .addCase(fetchDefaultSupplyType.pending, (state) => {
                state.defaultSupplyTypeLoading = true;
                state.defaultSupplyTypeError = null;
            })
            .addCase(fetchDefaultSupplyType.fulfilled, (state, action) => {
                state.defaultSupplyTypeLoading = false;
                state.defaultSupplyType = action.payload;
            })
            .addCase(fetchDefaultSupplyType.rejected, (state, action) => {
                state.defaultSupplyTypeLoading = false;
                state.defaultSupplyTypeError = action.payload ?? "Unknown error";
            })

            // Company Currency
            .addCase(fetchCompanyCurrency.pending, (state) => {
                state.companyCurrencyLoading = true;
                state.companyCurrencyError = null;
            })
            .addCase(fetchCompanyCurrency.fulfilled, (state, action) => {
                state.companyCurrencyLoading = false;
                state.companyCurrency = action.payload;
            })
            .addCase(fetchCompanyCurrency.rejected, (state, action) => {
                state.companyCurrencyLoading = false;
                state.companyCurrencyError = action.payload ?? "Unknown error";
            })

            // Items Companies
            .addCase(fetchItemsCompanies.pending, (state) => {
                state.itemsCompaniesLoading = true;
                state.itemsCompaniesError = null;
            })
            .addCase(fetchItemsCompanies.fulfilled, (state, action) => {
                state.itemsCompaniesLoading = false;
                state.itemsCompanies = action.payload;
            })
            .addCase(fetchItemsCompanies.rejected, (state, action) => {
                state.itemsCompaniesLoading = false;
                state.itemsCompaniesError = action.payload ?? "Unknown error";
            })

            // Default Status
            .addCase(fetchDefaultStatus.pending, (state) => {
                state.defaultStatusLoading = true;
                state.defaultStatusError = null;
            })
            .addCase(fetchDefaultStatus.fulfilled, (state, action) => {
                state.defaultStatusLoading = false;
                state.defaultStatus = action.payload;
            })
            .addCase(fetchDefaultStatus.rejected, (state, action) => {
                state.defaultStatusLoading = false;
                state.defaultStatusError = action.payload ?? "Unknown error";
            })

            // Pending Sales Quotations
            .addCase(fetchPendingSalesQuotations.pending, (state) => {
                state.pendingSalesQuotationsLoading = true;
                state.pendingSalesQuotationsError = null;
            })
            .addCase(fetchPendingSalesQuotations.fulfilled, (state, action) => {
                state.pendingSalesQuotationsLoading = false;
                state.pendingSalesQuotations = action.payload;
            })
            .addCase(fetchPendingSalesQuotations.rejected, (state, action) => {
                state.pendingSalesQuotationsLoading = false;
                state.pendingSalesQuotationsError = action.payload ?? "Unknown error";
            })

            // Status For Completed
            .addCase(fetchStatusForCompleted.pending, (state) => {
                state.statusForCompletedLoading = true;
                state.statusForCompletedError = null;
            })
            .addCase(fetchStatusForCompleted.fulfilled, (state, action) => {
                state.statusForCompletedLoading = false;
                state.statusForCompleted = action.payload;
            })
            .addCase(fetchStatusForCompleted.rejected, (state, action) => {
                state.statusForCompletedLoading = false;
                state.statusForCompletedError = action.payload ?? "Unknown error";
            })

            // Inventory Preference
            .addCase(fetchInvPreference.pending, (state) => {
                state.invPreferenceLoading = true;
                state.invPreferenceError = null;
            })
            .addCase(fetchInvPreference.fulfilled, (state, action) => {
                state.invPreferenceLoading = false;
                state.invPreference = action.payload;
            })
            .addCase(fetchInvPreference.rejected, (state, action) => {
                state.invPreferenceLoading = false;
                state.invPreferenceError = action.payload ?? "Unknown error";
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

            // Current User
            .addCase(fetchCurrentUser.pending, (state) => {
                state.currentUserLoading = true;
                state.currentUserError = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.currentUserLoading = false;
                state.currentUser = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.currentUserLoading = false;
                state.currentUserError = action.payload ?? "Unknown error";
            })

            // Default Party Category
            .addCase(fetchDefaultPartyCategory.pending, (state) => {
                state.defaultPartyCategoryLoading = true;
                state.defaultPartyCategoryError = null;
            })
            .addCase(fetchDefaultPartyCategory.fulfilled, (state, action) => {
                state.defaultPartyCategoryLoading = false;
                state.defaultPartyCategory = action.payload;
            })
            .addCase(fetchDefaultPartyCategory.rejected, (state, action) => {
                state.defaultPartyCategoryLoading = false;
                state.defaultPartyCategoryError = action.payload ?? "Unknown error";
            })

            // Currency List
            .addCase(fetchCurrencyList.pending, (state) => {
                state.currencyListLoading = true;
                state.currencyListError = null;
            })
            .addCase(fetchCurrencyList.fulfilled, (state, action) => {
                state.currencyListLoading = false;
                state.currencyList = action.payload;
            })
            .addCase(fetchCurrencyList.rejected, (state, action) => {
                state.currencyListLoading = false;
                state.currencyListError = action.payload ?? "Unknown error";
            })

            // Default Stock Types
            .addCase(fetchDefaultStockTypes.pending, (state) => {
                state.defaultStockTypesLoading = true;
                state.defaultStockTypesError = null;
            })
            .addCase(fetchDefaultStockTypes.fulfilled, (state, action) => {
                state.defaultStockTypesLoading = false;
                state.defaultStockTypes = action.payload;
            })
            .addCase(fetchDefaultStockTypes.rejected, (state, action) => {
                state.defaultStockTypesLoading = false;
                state.defaultStockTypesError = action.payload ?? "Unknown error";
            })

            // GST Enable
            .addCase(fetchGstEnable.pending, (state) => {
                state.gstEnableLoading = true;
                state.gstEnableError = null;
            })
            .addCase(fetchGstEnable.fulfilled, (state, action) => {
                state.gstEnableLoading = false;
                state.gstEnable = action.payload;
            })
            .addCase(fetchGstEnable.rejected, (state, action) => {
                state.gstEnableLoading = false;
                state.gstEnableError = action.payload ?? "Unknown error";
            })

            // Item Quality All
            .addCase(fetchItemQualityAll.pending, (state) => {
                state.itemQualitiesLoading = true;
                state.itemQualitiesError = null;
            })
            .addCase(fetchItemQualityAll.fulfilled, (state, action) => {
                state.itemQualitiesLoading = false;
                state.itemQualities = action.payload;
            })
            .addCase(fetchItemQualityAll.rejected, (state, action) => {
                state.itemQualitiesLoading = false;
                state.itemQualitiesError = action.payload ?? "Unknown error";
            })

            // User Form Wise Documents
            .addCase(fetchUserFormWiseDocuments.pending, (state) => {
                state.userFormWiseDocumentsLoading = true;
                state.userFormWiseDocumentsError = null;
            })
            .addCase(fetchUserFormWiseDocuments.fulfilled, (state, action) => {
                state.userFormWiseDocumentsLoading = false;
                state.userFormWiseDocuments = action.payload;
            })
            .addCase(fetchUserFormWiseDocuments.rejected, (state, action) => {
                state.userFormWiseDocumentsLoading = false;
                state.userFormWiseDocumentsError = action.payload ?? "Unknown error";
            })

            // Vendors
            .addCase(fetchVendors.pending, (state) => {
                state.vendorsLoading = true;
                state.vendorsError = null;
            })
            .addCase(fetchVendors.fulfilled, (state, action) => {
                state.vendorsLoading = false;
                state.vendors = action.payload;
            })
            .addCase(fetchVendors.rejected, (state, action) => {
                state.vendorsLoading = false;
                state.vendorsError = action.payload ?? "Unknown error";
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

            // Banks
            .addCase(fetchBanks.pending, (state) => {
                state.banksLoading = true;
                state.banksError = null;
            })
            .addCase(fetchBanks.fulfilled, (state, action) => {
                state.banksLoading = false;
                state.banks = action.payload;
            })
            .addCase(fetchBanks.rejected, (state, action) => {
                state.banksLoading = false;
                state.banksError = action.payload ?? "Unknown error";
            })

            // Payment Terms
            .addCase(fetchPaymentTerms.pending, (state) => {
                state.paymentTermsLoading = true;
                state.paymentTermsError = null;
            })
            .addCase(fetchPaymentTerms.fulfilled, (state, action) => {
                state.paymentTermsLoading = false;
                state.paymentTerms = action.payload;
            })
            .addCase(fetchPaymentTerms.rejected, (state, action) => {
                state.paymentTermsLoading = false;
                state.paymentTermsError = action.payload ?? "Unknown error";
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

            // Customer Codes
            .addCase(fetchCustomerCodes.pending, (state) => {
                state.customerCodesLoading = true;
                state.customerCodesError = null;
            })
            .addCase(fetchCustomerCodes.fulfilled, (state, action) => {
                state.customerCodesLoading = false;
                state.customerCodes = action.payload;
            })
            .addCase(fetchCustomerCodes.rejected, (state, action) => {
                state.customerCodesLoading = false;
                state.customerCodesError = action.payload ?? "Unknown error";
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

            // Production Item Detail
            .addCase(fetchProductionItemDetail.pending, (state) => {
                state.productionItemDetailLoading = true;
                state.productionItemDetailError = null;
            })
            .addCase(fetchProductionItemDetail.fulfilled, (state, action) => {
                state.productionItemDetailLoading = false;
                state.productionItemDetail = action.payload;
            })
            .addCase(fetchProductionItemDetail.rejected, (state, action) => {
                state.productionItemDetailLoading = false;
                state.productionItemDetailError = action.payload ?? "Unknown error";
            })

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

            // Store Start With
            .addCase(fetchStoreStartWith.pending, (state) => {
                state.storeStartWithLoading = true;
                state.storeStartWithError = null;
            })
            .addCase(fetchStoreStartWith.fulfilled, (state, action) => {
                state.storeStartWithLoading = false;
                state.storeStartWith = action.payload;
            })
            .addCase(fetchStoreStartWith.rejected, (state, action) => {
                state.storeStartWithLoading = false;
                state.storeStartWithError = action.payload ?? "Unknown error";
            })

            // Sales Orders List
            .addCase(fetchSalesOrders.pending, (state) => {
                state.salesOrdersLoading = true;
                state.salesOrdersError = null;
            })
            .addCase(fetchSalesOrders.fulfilled, (state, action) => {
                state.salesOrdersLoading = false;
                state.salesOrders = action.payload;
            })
            .addCase(fetchSalesOrders.rejected, (state, action) => {
                state.salesOrdersLoading = false;
                state.salesOrdersError = action.payload ?? "Unknown error";
            })

            // Save Sales Order
            .addCase(saveSalesOrder.pending, (state) => {
                state.saveSalesOrderLoading = true;
                state.saveSalesOrderError = null;
                state.saveSalesOrderResult = null;
            })
            .addCase(saveSalesOrder.fulfilled, (state, action) => {
                state.saveSalesOrderLoading = false;
                state.saveSalesOrderResult = action.payload;
            })
            .addCase(saveSalesOrder.rejected, (state, action) => {
                state.saveSalesOrderLoading = false;
                state.saveSalesOrderError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const { clearBaseCurrency, clearSalesOrderDocuments, clearLoggedInCompany, clearPaymentTypes, clearDefaultSupplyType, clearCompanyCurrency, clearItemsCompanies, clearDefaultStatus, clearPendingSalesQuotations, clearStatusForCompleted, clearInvPreference, clearUserTableColumns, clearCurrentUser, clearDefaultPartyCategory, clearCurrencyList, clearDefaultStockTypes, clearGstEnable, clearItemQualities, clearUserFormWiseDocuments, clearVendors, clearInvoiceTaxTypes, clearBanks, clearPaymentTerms, clearCustomers, clearCustomerCodes, clearProductDetails, clearProductionItemDetail, clearDefaultStore, clearStoreStartWith, clearSalesOrders, clearSaveSalesOrder, resetSalesOrder } = salesOrderSlice.actions;

export default salesOrderSlice.reducer;
