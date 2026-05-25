import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvPreference {
    SHOW_BATCHES_WHEN_ITEM_SELECTED: number;
    ALLOW_MULTIPLE_BATCH_CONSUMPTION: number;
    ALLOW_ADD_SUB_ITEMS: number;
    ITEM_STOCK_FROM_MAIN_STORE_ONLY: number;
    SHOW_BATCHES_WHEN_BARCODE_ENTERED: number;
    SHOW_BARCODE: number;
}

export interface PaymentType {
    PaymentTypeID: number;
    PaymentTypeName: string;
}

export interface DefaultStore {
    StoreID: number;
    StoreName: string;
}

export interface PendingSalesQuotation {
    SalesQuotationID: number;
    QuotationNo: string;
    QuotationDate: string;
    CustomerID: number;
    CustomerName: string | null;
    NetAmount: number;
}

export interface PendingSalesOrder {
    SalesOrderID: number;
    SalesOrderNo: string;
    SalesOrderDate: string;
    CustomerID: number;
    CustomerName: string | null;
    NetAmount: number;
}

export interface UserTableColumn {
    TableColumnID: number;
    ColumnName: string;
    Show: boolean;
    Width: string;
    ColumnDisplayName: string;
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

export interface InvoiceTaxTypeDetail {
    DocumentID: number;
    InvoiceTaxTypeID: number | null;
    InvoiceTaxType: string | null;
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
    StateID: number | null;
    StateCode: string | null;
    StateNumber: string | null;
    MerchantExpPer: number;
}

export interface Salesman {
    SalesAgentID: number;
    Name: string;
}

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

export interface BatchDetail {
    ItemID: number;
    ItemCode: string;
    ItemName: string;
    Description: string | null;
    PurchaseUnitID: number;
    PurchaseUnit: string;
    SalesUnitID: number;
    SaleUnit: string;
    BatchID: number;
    BatchNo: string | null;
    Barcode: string | null;
    Mrp: number;
    PurchaseRate: number;
    SalesRate: number | null;
    WholeSaleRate: number;
    NetPurchaseRate: number;
    UnitMultiplier: number;
    IsNonStockItem: boolean;
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
}

export interface BatchStoreDetail {
    StoreID: number;
    StoreName: string;
    BatchID: number;
    Barcode: string | null;
    Mrp: number;
    PurchaseRate: number;
    SalesRate: number;
    WholeSaleRate: number;
    NetPurchaseRate: number;
    ExpiaryDate: string | null;
    CurrentQuantity: number;
}

export interface BatchDetailsData {
    Table: BatchDetail[];
    Table1: BatchStoreDetail[];
}

export interface QtnDetailsForDN {
    SalesQuotationID: number;
    QuotationNo: string;
    QuotationDate: string;
    CustomerID: number;
    CustomerName: string | null;
    InvoiceTaxTypeID: number;
    InvoiceTaxType: string | null;
    TotalQuantity: number;
    DocumentID: number;
    StoreID: number | null;
    StoreName: string | null;
    DocumentName: string | null;
    QtnClosed: boolean;
    SalesQuotationTID: number;
    ItemID: number;
    ItemName: string | null;
    ItemCode: string | null;
    IsNonStockItem: number;
    ItemDescription: string | null;
    BatchID: number;
    BarCode: string | null;
    BatchNo: string | null;
    UnitMultiplier: number;
    SalesUnitID: number;
    SalesUnit: string | null;
    SQQty: number;
    DNQty: number;
    BalanceQty: number;
    Quantity: number;
    SalesRate: number;
    DiscountPercentage: number;
    DiscountAmount: number;
    SplittedDiscAmt: number;
    Mrp: number;
    IsNonStockItem1: boolean;
    NetPurchaseRate: number;
    StockTypeID: number;
    StockType: string | null;
    TaxCategoryCode: string | null;
    TaxCategoryId: number;
    InvoiceTaxType1: string | null;
    TaxValue: number;
    SGST: number | null;
    CGST: number | null;
    IGST: number | null;
    UTGST: number | null;
    CESS: number | null;
    VAT: number | null;
}

export interface SalesOrderDetail {
    SalesOrderTID: number;
    SalesOrderMID: number;
    SalesOrderM: null;
    SalesQuotationMID: number | null;
    SalesQuotationTID: number | null;
    CompanyID: number;
    CompanyM: null;
    ItemID: number;
    ItemM: null;
    ItemDescription: string | null;
    BatchID: number;
    ItemBatchM: null;
    Quantity: number;
    UnitMultiplier: number;
    SalesRate: number;
    DiscountPercentage: number;
    DiscountAmount: number;
    SalesUnitID: number;
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
    TaxID: number | null;
    AccTaxM: null;
    TaxPercentage: number;
    TaxRate: number;
    ServiceTaxID: number | null;
    ServiceTax: null;
    ServiceTaxPercentage: number | null;
    Amount: number;
    BranchID: number | null;
    FinYearID: number | null;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    SalesOrderTGuid: string;
    SoldQuantity: number;
    InvoicedQty: number | null;
    SpecID: number | null;
    Specifications: string | null;
    CompanyName: string | null;
    ItemName: string | null;
    ItemCode: string | null;
    ItemStoreName: string | null;
    SizeName: string | null;
    DesignName: string | null;
    DesignCode: string | null;
    ImagePath: string | null;
    SlNo: number;
    Barcode: string | null;
    StockTypeID: number;
    BatchName: string | null;
    SQQty: number;
    ItemLength: number | null;
    ItemBreadth: number | null;
    ItemSqrMeter: number | null;
    SalesUnit: string | null;
    GrossAmount: number;
    CustomerCode: string | null;
    RateBasedOnID: number;
    RateOn: string | null;
    SqmQuantity: number | null;
    PileHeight: number | null;
    Spec: string | null;
    InvDtlCount: number;
    InvQty: number;
    PackingItemCount: number;
}

export interface SelectedSalesOrder {
    SalesOrderID: number;
    SalesOrderNo: string;
    SalesOrderDate: string;
    CustomerID: number;
    PartyMasterM: null;
    StoreID: number | null;
    StoreM: null;
    DocumentID: number;
    DocumentM: null;
    TotalQuantity: number;
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
    OtherAdditionalAmount: number;
    OtherDeductionAmount: number;
    RoundOffAmount: number;
    NetAmount: number;
    Cancelled: boolean;
    CancelledUserID: number | null;
    CancelledDate: string | null;
    Remarks: string | null;
    CompanyID: number;
    BranchID: number;
    FinYearID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    SalesOrderGuid: string;
    SOClosed: boolean | null;
    SOClosedOn: string | null;
    ConsigneeID: number | null;
    PaymentTermsID: number | null;
    PaymentTypeID: number;
    AdvPer: number;
    AdvAmount: number;
    ExRate: number;
    OtherAdditionalAmountBase: number;
    OtherDeductionAmountBase: number;
    GrossAmountBase: number;
    NetAmountBase: number;
    CurrencyID: number;
    CurrencyM: null;
    Approved: boolean;
    ApprovedBy: number | null;
    ApprovedDate: string | null;
    SupplyTypeID: number;
    ReviewedBy: number | null;
    ReviewedOn: string | null;
    LstSalesOrderDetails: SalesOrderDetail[];
    LstSalesOrderAdditionalDetails: any[];
    InvoiceCompleted: boolean | null;
    VoucherTypeID: number;
    CustomerName: string | null;
    Currency: string | null;
    ConsigneeName: string | null;
    ShippingName: string | null;
    StatusDetails: string | null;
    BankName: string | null;
    CorrespondentName: string | null;
    PaymentTypeName: string | null;
    PaymentTerm: string | null;
    PortName: string | null;
    TermsofService: string | null;
    PackingMethod: string | null;
    StoreName: string | null;
    GrossTotal: number | null;
    PreTotal: number | null;
    SupplyType: string | null;
    CustomerAddress: string | null;
    ECGCLimit: number | null;
    DocumentName: string | null;
    FaClass: string | null;
    FaChar: string | null;
    InvoiceTaxType: string | null;
    CustomerCode: string | null;
    CreatedBy: string | null;
    CreatedOn: string | null;
    DaysToComplete: number;
    Prefix: string | null;
    Suffix: string | null;
    DisApprovedBy: string | null;
    DisApprovedDate: string | null;
    DisapproveRemark: string | null;
    AdvPaid: number | null;
    ManualyChangedDocNo: boolean;
    MerchandiserName: string | null;
    ReviewedByName: string | null;
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

// ─── State ────────────────────────────────────────────────────────────────────

interface DeliveryNoteState {
    invPreference: InvPreference | null;
    invPreferenceLoading: boolean;
    invPreferenceError: string | null;

    paymentTypes: PaymentType[];
    paymentTypesLoading: boolean;
    paymentTypesError: string | null;

    defaultStore: DefaultStore | null;
    defaultStoreLoading: boolean;
    defaultStoreError: string | null;

    pendingSalesQuotations: PendingSalesQuotation[];
    pendingSalesQuotationsLoading: boolean;
    pendingSalesQuotationsError: string | null;

    pendingSalesOrders: PendingSalesOrder[];
    pendingSalesOrdersLoading: boolean;
    pendingSalesOrdersError: string | null;

    tableColumns: UserTableColumn[];
    tableColumnsLoading: boolean;
    tableColumnsError: string | null;

    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    invoiceTaxTypeDetails: InvoiceTaxTypeDetail[];
    invoiceTaxTypeDetailsLoading: boolean;
    invoiceTaxTypeDetailsError: string | null;

    allInvoiceTaxTypes: AllInvoiceTaxType[];
    allInvoiceTaxTypesLoading: boolean;
    allInvoiceTaxTypesError: string | null;

    customers: Customer[];
    customersLoading: boolean;
    customersError: string | null;

    salesmen: Salesman[];
    salesmenLoading: boolean;
    salesmenError: string | null;

    itemDetailsForOpeningStock: ItemDetailsForOpeningStock[];
    itemDetailsForOpeningStockLoading: boolean;
    itemDetailsForOpeningStockError: string | null;

    batchDetails: BatchDetailsData | null;
    batchDetailsLoading: boolean;
    batchDetailsError: string | null;

    qtnDetailsForDN: QtnDetailsForDN[];
    qtnDetailsForDNLoading: boolean;
    qtnDetailsForDNError: string | null;

    selectedSalesOrder: SelectedSalesOrder | null;
    selectedSalesOrderLoading: boolean;
    selectedSalesOrderError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: DeliveryNoteState = {
    invPreference: null,
    invPreferenceLoading: false,
    invPreferenceError: null,

    paymentTypes: [],
    paymentTypesLoading: false,
    paymentTypesError: null,

    defaultStore: null,
    defaultStoreLoading: false,
    defaultStoreError: null,

    pendingSalesQuotations: [],
    pendingSalesQuotationsLoading: false,
    pendingSalesQuotationsError: null,

    pendingSalesOrders: [],
    pendingSalesOrdersLoading: false,
    pendingSalesOrdersError: null,

    tableColumns: [],
    tableColumnsLoading: false,
    tableColumnsError: null,

    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    invoiceTaxTypeDetails: [],
    invoiceTaxTypeDetailsLoading: false,
    invoiceTaxTypeDetailsError: null,

    allInvoiceTaxTypes: [],
    allInvoiceTaxTypesLoading: false,
    allInvoiceTaxTypesError: null,

    customers: [],
    customersLoading: false,
    customersError: null,

    salesmen: [],
    salesmenLoading: false,
    salesmenError: null,

    itemDetailsForOpeningStock: [],
    itemDetailsForOpeningStockLoading: false,
    itemDetailsForOpeningStockError: null,

    batchDetails: null,
    batchDetailsLoading: false,
    batchDetailsError: null,

    qtnDetailsForDN: [],
    qtnDetailsForDNLoading: false,
    qtnDetailsForDNError: null,

    selectedSalesOrder: null,
    selectedSalesOrderLoading: false,
    selectedSalesOrderError: null,
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

export const fetchInvPreference = createAsyncThunk<
    InvPreference,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchInvPreference",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

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

export const fetchPaymentTypes = createAsyncThunk<
    PaymentType[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchPaymentTypes",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

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

            // Response is a plain array: [{ PaymentTypeID, PaymentTypeName }, ...]
            const data: PaymentType[] = await response.json();

            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDefaultStore = createAsyncThunk<
    DefaultStore,
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchDefaultStore",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

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

            const data: DefaultStore[] = await response.json();

            return data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchPendingSalesQuotations = createAsyncThunk<
    PendingSalesQuotation[],
    {
        customerId?: number;
        salesId?: number;
        deliveryNoteId?: number;
        salesOrderId?: number;
        companyId?: number;
        finYearId?: number;
    } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchPendingSalesQuotations",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const customerId = params?.customerId ?? 0;
        const salesId = params?.salesId ?? 0;
        const deliveryNoteId = params?.deliveryNoteId ?? 0;
        const salesOrderId = params?.salesOrderId ?? 0;
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

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

export const fetchPendingSalesOrders = createAsyncThunk<
    PendingSalesOrder[],
    {
        customerId?: number;
        deliveryNoteId?: number;
        companyId?: number;
        finYearId?: number;
    } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchPendingSalesOrders",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const customerId = params?.customerId ?? 0;
        const deliveryNoteId = params?.deliveryNoteId ?? 0;
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/SalesOrder/GetPendingSalesOrders"
            );
            url.searchParams.set("customerId", String(customerId));
            url.searchParams.set("deliveryNoteId", String(deliveryNoteId));

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

            const json: ServerResponse<PendingSalesOrder[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch pending sales orders"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchTableColumns = createAsyncThunk<
    UserTableColumn[],
    { tableCode?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchTableColumns",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const tableCode = params?.tableCode ?? "DeliveryNote_Tbl";
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
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch table columns"
                );
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
    "deliveryNote/fetchDocumentMasters",
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
            url.searchParams.set("DocumentType", "DELIVERY NOTE");
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

            // Response is a plain array: [{ DocumentID, DocumentName, ... }, ...]
            const data: DocumentMaster[] = await response.json();

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
    "deliveryNote/fetchInvoiceTaxTypeDetails",
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

            const json: ServerResponse<InvoiceTaxTypeDetail[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch invoice tax type details"
                );
            }

            return json.Server.Data;
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
    "deliveryNote/fetchAllInvoiceTaxTypes",
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

            // Response is a plain array: [{ InvoiceTaxTypeID, InvoiceTaxType }, ...]
            const data: AllInvoiceTaxType[] = await response.json();

            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllCustomers = createAsyncThunk<
    Customer[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchAllCustomers",
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

export const fetchSalesmen = createAsyncThunk<
    Salesman[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchSalesmen",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//ContactPersonDetails/GetSalesmanStartWith"
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

            // Response is a plain array: [{ SalesAgentID, Name }, ...]
            const data: Salesman[] = await response.json();

            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemDetailsForOpeningStock = createAsyncThunk<
    ItemDetailsForOpeningStock[],
    { searchStr?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchItemDetailsForOpeningStock",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const searchStr = params?.searchStr ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Item/GetItemDetailsForOpeningStock"
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

            const json: ServerResponse<ItemDetailsForOpeningStock[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch item details for opening stock"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchBatchDetails = createAsyncThunk<
    BatchDetailsData,
    {
        barcode?: string;
        batchId?: number;
        invoiceTaxTypeId: number;
        itemCode: string;
        itemId: number;
        outTran?: boolean;
        showIfMultipleBatch?: boolean;
        storeId: number;
        companyId?: number;
        finYearId?: number;
    },
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchBatchDetails",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//ItemBatch/GetBatchDetails"
            );
            url.searchParams.set("barcode", params.barcode ?? "");
            url.searchParams.set("batchId", String(params.batchId ?? 0));
            url.searchParams.set("invoiceTaxTypeId", String(params.invoiceTaxTypeId));
            url.searchParams.set("itemCode", params.itemCode);
            url.searchParams.set("itemId", String(params.itemId));
            url.searchParams.set("outTran", String(params.outTran ?? true));
            url.searchParams.set("showIfMultipleBatch", String(params.showIfMultipleBatch ?? true));
            url.searchParams.set("storeId", String(params.storeId));

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

            const json: ServerResponse<BatchDetailsData> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch batch details"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchQtnDetailsForDN = createAsyncThunk<
    QtnDetailsForDN[],
    {
        quotationMID: number;
        invoiceTaxTypeID: number;
        quotationTID?: number;
        companyId?: number;
        finYearId?: number;
    },
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchQtnDetailsForDN",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/SalesQuotation/GetQtnDetailsForDN"
            );
            url.searchParams.set("QuotationMID", String(params.quotationMID));
            url.searchParams.set("InvoiceTaxTypeID", String(params.invoiceTaxTypeID));
            url.searchParams.set("QuotationTID", String(params.quotationTID ?? ""));

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

            const json: ServerResponse<QtnDetailsForDN[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch quotation details for delivery note"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSelectedSalesOrder = createAsyncThunk<
    SelectedSalesOrder,
    { salesOrderID: number; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "deliveryNote/fetchSelectedSalesOrder",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/SalesOrder/GetSelectedSalesOrder"
            );
            url.searchParams.set("SalesOrderID", String(params.salesOrderID));

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

            const json: ServerResponse<SelectedSalesOrder> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(
                    json.Server?.Message || "Failed to fetch selected sales order"
                );
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const deliveryNoteSlice = createSlice({
    name: "deliveryNote",
    initialState,
    reducers: {
        clearInvPreference(state) {
            state.invPreference = null;
            state.invPreferenceError = null;
        },
        clearPaymentTypes(state) {
            state.paymentTypes = [];
            state.paymentTypesError = null;
        },
        clearDefaultStore(state) {
            state.defaultStore = null;
            state.defaultStoreError = null;
        },
        clearPendingSalesQuotations(state) {
            state.pendingSalesQuotations = [];
            state.pendingSalesQuotationsError = null;
        },
        clearPendingSalesOrders(state) {
            state.pendingSalesOrders = [];
            state.pendingSalesOrdersError = null;
        },
        clearTableColumns(state) {
            state.tableColumns = [];
            state.tableColumnsError = null;
        },
        clearDocumentMasters(state) {
            state.documentMasters = [];
            state.documentMastersError = null;
        },
        clearInvoiceTaxTypeDetails(state) {
            state.invoiceTaxTypeDetails = [];
            state.invoiceTaxTypeDetailsError = null;
        },
        clearAllInvoiceTaxTypes(state) {
            state.allInvoiceTaxTypes = [];
            state.allInvoiceTaxTypesError = null;
        },
        clearCustomers(state) {
            state.customers = [];
            state.customersError = null;
        },
        clearSalesmen(state) {
            state.salesmen = [];
            state.salesmenError = null;
        },
        clearItemDetailsForOpeningStock(state) {
            state.itemDetailsForOpeningStock = [];
            state.itemDetailsForOpeningStockError = null;
        },
        clearBatchDetails(state) {
            state.batchDetails = null;
            state.batchDetailsError = null;
        },
        clearQtnDetailsForDN(state) {
            state.qtnDetailsForDN = [];
            state.qtnDetailsForDNError = null;
        },
        clearSelectedSalesOrder(state) {
            state.selectedSalesOrder = null;
            state.selectedSalesOrderError = null;
        },
        resetDeliveryNote() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
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

            // Pending Sales Orders
            .addCase(fetchPendingSalesOrders.pending, (state) => {
                state.pendingSalesOrdersLoading = true;
                state.pendingSalesOrdersError = null;
            })
            .addCase(fetchPendingSalesOrders.fulfilled, (state, action) => {
                state.pendingSalesOrdersLoading = false;
                state.pendingSalesOrders = action.payload;
            })
            .addCase(fetchPendingSalesOrders.rejected, (state, action) => {
                state.pendingSalesOrdersLoading = false;
                state.pendingSalesOrdersError = action.payload ?? "Unknown error";
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
            .addCase(fetchAllCustomers.pending, (state) => {
                state.customersLoading = true;
                state.customersError = null;
            })
            .addCase(fetchAllCustomers.fulfilled, (state, action) => {
                state.customersLoading = false;
                state.customers = action.payload;
            })
            .addCase(fetchAllCustomers.rejected, (state, action) => {
                state.customersLoading = false;
                state.customersError = action.payload ?? "Unknown error";
            })

            // Salesmen
            .addCase(fetchSalesmen.pending, (state) => {
                state.salesmenLoading = true;
                state.salesmenError = null;
            })
            .addCase(fetchSalesmen.fulfilled, (state, action) => {
                state.salesmenLoading = false;
                state.salesmen = action.payload;
            })
            .addCase(fetchSalesmen.rejected, (state, action) => {
                state.salesmenLoading = false;
                state.salesmenError = action.payload ?? "Unknown error";
            })

            // Item Details for Opening Stock
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
                state.itemDetailsForOpeningStockError = action.payload ?? "Unknown error";
            })

            // Batch Details
            .addCase(fetchBatchDetails.pending, (state) => {
                state.batchDetailsLoading = true;
                state.batchDetailsError = null;
            })
            .addCase(fetchBatchDetails.fulfilled, (state, action) => {
                state.batchDetailsLoading = false;
                state.batchDetails = action.payload;
            })
            .addCase(fetchBatchDetails.rejected, (state, action) => {
                state.batchDetailsLoading = false;
                state.batchDetailsError = action.payload ?? "Unknown error";
            })

            // Quotation Details for Delivery Note
            .addCase(fetchQtnDetailsForDN.pending, (state) => {
                state.qtnDetailsForDNLoading = true;
                state.qtnDetailsForDNError = null;
            })
            .addCase(fetchQtnDetailsForDN.fulfilled, (state, action) => {
                state.qtnDetailsForDNLoading = false;
                state.qtnDetailsForDN = action.payload;
            })
            .addCase(fetchQtnDetailsForDN.rejected, (state, action) => {
                state.qtnDetailsForDNLoading = false;
                state.qtnDetailsForDNError = action.payload ?? "Unknown error";
            })

            // Selected Sales Order
            .addCase(fetchSelectedSalesOrder.pending, (state) => {
                state.selectedSalesOrderLoading = true;
                state.selectedSalesOrderError = null;
            })
            .addCase(fetchSelectedSalesOrder.fulfilled, (state, action) => {
                state.selectedSalesOrderLoading = false;
                state.selectedSalesOrder = action.payload;
            })
            .addCase(fetchSelectedSalesOrder.rejected, (state, action) => {
                state.selectedSalesOrderLoading = false;
                state.selectedSalesOrderError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearInvPreference,
    clearPaymentTypes,
    clearDefaultStore,
    clearPendingSalesQuotations,
    clearPendingSalesOrders,
    clearTableColumns,
    clearDocumentMasters,
    clearInvoiceTaxTypeDetails,
    clearAllInvoiceTaxTypes,
    clearCustomers,
    clearSalesmen,
    clearItemDetailsForOpeningStock,
    clearBatchDetails,
    clearQtnDetailsForDN,
    clearSelectedSalesOrder,
    resetDeliveryNote,
} = deliveryNoteSlice.actions;

export default deliveryNoteSlice.reducer;
