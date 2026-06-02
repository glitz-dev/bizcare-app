import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SalesQuotationListItem {
    rowAscNum: number;
    rowDescNum: number;
    SalesQuotationID: number;
    QuotationNo: string;
    QuotationDate: string;
    Customer: string;
    ReferenceNo: string;
    NetAmount: number;
    TotalRowCount: number;
}

export interface InvPreference {
    SHOW_BATCHES_WHEN_ITEM_SELECTED: number;
    ALLOW_MULTIPLE_BATCH_CONSUMPTION: number;
    ALLOW_ADD_SUB_ITEMS: number;
    ITEM_STOCK_FROM_MAIN_STORE_ONLY: number;
    SHOW_BATCHES_WHEN_BARCODE_ENTERED: number;
    SHOW_BARCODE: number;
}

export interface TableColumn {
    TableColumnID: number;
    ColumnName: string;
    Show: boolean;
    Width: string;
    ColumnDisplayName: string;
}

export interface QuotationDocument {
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
    CurrencyCode: string | null;
    ExchRate: number | null;
    PaymentTermID: number | null;
    PaymentTerm: string | null;
    StateID: number | null;
    StateCode: string | null;
    StateNumber: string | null;
    PartyAcHeadID: number;
    HeadName: string;
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

export interface ItemDetail {
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

export interface BatchDetail {
    ItemID: number;
    ItemCode: string | null;
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
    SalesRate: number;
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

// ─── Sales Quotation Detail Item (for LstSalesQuotationDetails) ───────────────

export interface SalesQuotationDetailItem {
    ItemName: string;
    ItemID: number;
    ItemCode: string | null;
    ItemDescription: string | null;
    BatchID: number;
    BatchNo?: string | null;
    Barcode?: string | null;
    Quantity?: number | string;
    Rate?: number | string;
    GrossAmount?: number | string;
    DiscountPer?: number | string;
    DiscountAmt?: number | string;
    NetAmount?: number | string;
    TaxCategoryID?: number | null;
    TaxCategoryCode?: string | null;
    TaxValue?: number | null;
    SGST?: number | null;
    CGST?: number | null;
    IGST?: number | null;
    UTGST?: number | null;
    CESS?: number | null;
    VAT?: number | null;
    TaxAmount?: number | string;
    TotalAmount?: number | string;
    UnitMultiplier?: number;
    UnitID?: number;
    UnitName?: string | null;
    Mrp?: number | null;
    SalesRate?: number | null;
    WholeSaleRate?: number | null;
    PurchaseRate?: number | null;
    Hsn?: string | null;
    Description?: string | null;
    CategoryID?: number | null;
    CategoryName?: string | null;
    ItemGroupID?: number | null;
    ItemGroupName?: string | null;
    SubCategoryID?: number | null;
    SubCategoryName?: string | null;
    ItemTypeID?: number;
    ItemType?: string;
    StockTypeID?: number;
    PurchaseUnitID?: number;
    PurchaseUnit?: string;
    SalesUnitID?: number;
    SalesUnit?: string;
    PurchaseUnitMultiplier?: number;
    HeadID?: number | null;
    IsNonStockItem?: boolean;
    [key: string]: any;
}

// ─── Save Sales Quotation Payload ─────────────────────────────────────────────

export interface SaveSalesQuotationPayload {
    QuotationDateStr: string;
    TaxPercHead: string;
    TaxAmountHead: string;
    BillwiseDiscountAmt?: string;
    BillwiseDiscountAmtBase?: string;
    BillwiseDiscountPer?: number;
    Currency: string;
    CurrencyID: number;
    CustomerID: number;
    CustomerName: string;
    DeliveryTime?: string | null;
    DocumentID: number;
    DocumentName: string;
    GrossAmount: string;
    GrossAmountBase?: string;
    InvoiceTaxType: string;
    InvoiceTaxTypeID: number;
    IsGST: boolean;
    LstSalesQuotationDetails: SalesQuotationDetailItem[];
    NetAmount: string;
    NetAmountBase?: string;
    NetTotal: string;
    NetTotalBase?: string;
    OtherAdditionalAmount?: string;
    OtherAdditionalAmountBase?: string;
    OtherDeductionAmount?: string;
    OtherDeductionAmountBase?: string;
    PaymentTerms?: string | null;
    PreNetAmount?: string;
    PreNetAmountBase?: string;
    QuotationDate: string;
    QuotationNo: string;
    TaxMasterID: number;
    TotalDiscount?: string;
    TotalDiscountBase?: string;
    TotalQuantity: string;
    TotalTax: string;
    TotalTaxBase?: string;
    Validity?: string | null;
    [key: string]: any;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchSalesQuotationListParams {
    fromDate?: string;
    toDate?: string;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchInvoiceTaxTypeDetailsParams {
    documentID: number;
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchAllInvoiceTaxTypesParams {
    taxMasterId: number;
    companyId?: number;
    finYearId?: number;
}

export interface FetchAllCustomersParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchItemDetailsParams {
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

export interface FetchBatchDetailsParams {
    invoiceTaxTypeId: number;
    itemCode?: string;
    itemId: number;
    companyId?: number;
    finYearId?: number;
}

export interface SaveSalesQuotationParams {
    payload: SaveSalesQuotationPayload;
    companyId?: number;
    finYearId?: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface SalesQuotationState {
    quotationList: SalesQuotationListItem[];
    quotationListLoading: boolean;
    quotationListError: string | null;
    quotationListTotalRows: number;

    invPreference: InvPreference | null;
    invPreferenceLoading: boolean;
    invPreferenceError: string | null;

    tableColumnList: TableColumn[];
    tableColumnLoading: boolean;
    tableColumnError: string | null;

    quotationDocuments: QuotationDocument[];
    quotationDocumentsLoading: boolean;
    quotationDocumentsError: string | null;

    invoiceTaxTypeDetails: InvoiceTaxTypeDetail[];
    invoiceTaxTypeDetailsLoading: boolean;
    invoiceTaxTypeDetailsError: string | null;

    allInvoiceTaxTypes: AllInvoiceTaxType[];
    allInvoiceTaxTypesLoading: boolean;
    allInvoiceTaxTypesError: string | null;

    customers: Customer[];
    customersLoading: boolean;
    customersError: string | null;

    itemDetails: ItemDetail[];
    itemDetailsLoading: boolean;
    itemDetailsError: string | null;

    batchDetails: BatchDetail[];
    batchDetailsLoading: boolean;
    batchDetailsError: string | null;

    saveLoading: boolean;
    saveError: string | null;
    saveSuccess: boolean;
    savedQuotationNo: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: SalesQuotationState = {
    quotationList: [],
    quotationListLoading: false,
    quotationListError: null,
    quotationListTotalRows: 0,

    invPreference: null,
    invPreferenceLoading: false,
    invPreferenceError: null,

    tableColumnList: [],
    tableColumnLoading: false,
    tableColumnError: null,

    quotationDocuments: [],
    quotationDocumentsLoading: false,
    quotationDocumentsError: null,

    invoiceTaxTypeDetails: [],
    invoiceTaxTypeDetailsLoading: false,
    invoiceTaxTypeDetailsError: null,

    allInvoiceTaxTypes: [],
    allInvoiceTaxTypesLoading: false,
    allInvoiceTaxTypesError: null,

    customers: [],
    customersLoading: false,
    customersError: null,

    itemDetails: [],
    itemDetailsLoading: false,
    itemDetailsError: null,

    batchDetails: [],
    batchDetailsLoading: false,
    batchDetailsError: null,

    saveLoading: false,
    saveError: null,
    saveSuccess: false,
    savedQuotationNo: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    let token = state.auth.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchSalesQuotationList = createAsyncThunk<
    { data: SalesQuotationListItem[]; totalRows: number },
    FetchSalesQuotationListParams | void,
    { state: RootState; rejectValue: string }
>(
    "salesQuotation/fetchSalesQuotationList",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const fromDate    = params?.fromDate    ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
        const toDate      = params?.toDate      ?? new Date().toISOString().split("T")[0];
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const currentPage = params?.currentPage ?? 1;
        const searchStr   = params?.searchStr   ?? "";
        const companyId   = params?.companyId   ?? 1;
        const finYearId   = params?.finYearId   ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/SalesQuotation/ReadAllQuotations");
            url.searchParams.set("FromDate",    fromDate);
            url.searchParams.set("ToDate",      toDate);
            url.searchParams.set("rowsPerPage", String(rowsPerPage));
            url.searchParams.set("currentPage", String(currentPage));
            url.searchParams.set("searchStr",   searchStr);

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

            const json: ServerResponse<SalesQuotationListItem[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch sales quotation list");
            }

            const totalRows = json.Server.Data?.[0]?.TotalRowCount ?? json.Server.Data?.length ?? 0;

            return { data: json.Server.Data, totalRows };
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
    "salesQuotation/fetchInvPreference",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Utils/GetInvPreference");

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
                return rejectWithValue(json.Server?.Message || "Failed to fetch inventory preferences");
            }

            return json.Server.Data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchTableColumns = createAsyncThunk<
    TableColumn[],
    { tableCode?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesQuotation/fetchTableColumns",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const tableCode = params?.tableCode ?? "SalesQuotation_Tbl";
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

export const fetchQuotationDocuments = createAsyncThunk<
    QuotationDocument[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesQuotation/fetchQuotationDocuments",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith");
            url.searchParams.set("DocumentType", "QUOTATION");
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

            // This endpoint returns a raw array (no Server wrapper)
            const json: QuotationDocument[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchInvoiceTaxTypeDetails = createAsyncThunk<
    InvoiceTaxTypeDetail[],
    FetchInvoiceTaxTypeDetailsParams,
    { state: RootState; rejectValue: string }
>(
    "salesQuotation/fetchInvoiceTaxTypeDetails",
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
                return rejectWithValue(json.Server?.Message || "Failed to fetch invoice tax type details");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllInvoiceTaxTypes = createAsyncThunk<
    AllInvoiceTaxType[],
    FetchAllInvoiceTaxTypesParams,
    { state: RootState; rejectValue: string }
>(
    "salesQuotation/fetchAllInvoiceTaxTypes",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { taxMasterId = 1, companyId = 1, finYearId = 2 } = params;

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // This endpoint returns a raw array (no Server wrapper)
            const json: AllInvoiceTaxType[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllCustomers = createAsyncThunk<
    Customer[],
    FetchAllCustomersParams | void,
    { state: RootState; rejectValue: string }
>(
    "salesQuotation/fetchAllCustomers",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Party/GetAllCustomers");
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
                return rejectWithValue(json.Server?.Message || "Failed to fetch customers");
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
    "salesQuotation/fetchItemDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<ItemDetail[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch item details");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchBatchDetails = createAsyncThunk<
    BatchDetail[],
    FetchBatchDetailsParams,
    { state: RootState; rejectValue: string }
>(
    "salesQuotation/fetchBatchDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { invoiceTaxTypeId, itemCode = "", itemId, companyId = 1, finYearId = 2 } = params;

        try {
            const url = new URL("https://erp.glitzit.com/service/api/ItemBatch/GetBatchDetails");
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

            const json: ServerResponse<BatchDetail[]> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to fetch batch details");
            }

            return json.Server.Data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Save Sales Quotation ─────────────────────────────────────────────────────

export const saveSalesQuotation = createAsyncThunk<
    { success: boolean; message: string; quotationNo: string | null },
    SaveSalesQuotationParams,
    { state: RootState; rejectValue: string }
>(
    "salesQuotation/saveSalesQuotation",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const response = await fetch("https://erp.glitzit.com/service/api/SalesQuotation/SaveChanges", {
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

            const json: ServerResponse<null> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to save sales quotation");
            }

            return {
                success: true,
                message: json.Server.Message,
                quotationNo: json.Server.Info ?? null,
            };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const salesQuotationSlice = createSlice({
    name: "salesQuotation",
    initialState,
    reducers: {
        clearQuotationList(state) {
            state.quotationList = [];
            state.quotationListError = null;
            state.quotationListTotalRows = 0;
        },
        clearInvPreference(state) {
            state.invPreference = null;
            state.invPreferenceError = null;
        },
        clearTableColumns(state) {
            state.tableColumnList = [];
            state.tableColumnError = null;
        },
        clearQuotationDocuments(state) {
            state.quotationDocuments = [];
            state.quotationDocumentsError = null;
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
        clearItemDetails(state) {
            state.itemDetails = [];
            state.itemDetailsError = null;
        },
        clearBatchDetails(state) {
            state.batchDetails = [];
            state.batchDetailsError = null;
        },
        clearSaveState(state) {
            state.saveLoading = false;
            state.saveError = null;
            state.saveSuccess = false;
            state.savedQuotationNo = null;
        },
        resetSalesQuotation() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Sales Quotation List
            .addCase(fetchSalesQuotationList.pending, (state) => {
                state.quotationListLoading = true;
                state.quotationListError = null;
            })
            .addCase(fetchSalesQuotationList.fulfilled, (state, action) => {
                state.quotationListLoading = false;
                state.quotationList = action.payload.data;
                state.quotationListTotalRows = action.payload.totalRows;
            })
            .addCase(fetchSalesQuotationList.rejected, (state, action) => {
                state.quotationListLoading = false;
                state.quotationListError = action.payload ?? "Unknown error";
            })

            // Inventory Preferences
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

            // Table Columns
            .addCase(fetchTableColumns.pending, (state) => {
                state.tableColumnLoading = true;
                state.tableColumnError = null;
            })
            .addCase(fetchTableColumns.fulfilled, (state, action) => {
                state.tableColumnLoading = false;
                state.tableColumnList = action.payload;
            })
            .addCase(fetchTableColumns.rejected, (state, action) => {
                state.tableColumnLoading = false;
                state.tableColumnError = action.payload ?? "Unknown error";
            })

            // Quotation Documents
            .addCase(fetchQuotationDocuments.pending, (state) => {
                state.quotationDocumentsLoading = true;
                state.quotationDocumentsError = null;
            })
            .addCase(fetchQuotationDocuments.fulfilled, (state, action) => {
                state.quotationDocumentsLoading = false;
                state.quotationDocuments = action.payload;
            })
            .addCase(fetchQuotationDocuments.rejected, (state, action) => {
                state.quotationDocumentsLoading = false;
                state.quotationDocumentsError = action.payload ?? "Unknown error";
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

            // Item Details
            .addCase(fetchItemDetails.pending, (state) => {
                state.itemDetailsLoading = true;
                state.itemDetailsError = null;
            })
            .addCase(fetchItemDetails.fulfilled, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetails = action.payload;
            })
            .addCase(fetchItemDetails.rejected, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetailsError = action.payload ?? "Unknown error";
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

            // Save Sales Quotation
            .addCase(saveSalesQuotation.pending, (state) => {
                state.saveLoading = true;
                state.saveError = null;
                state.saveSuccess = false;
                state.savedQuotationNo = null;
            })
            .addCase(saveSalesQuotation.fulfilled, (state, action) => {
                state.saveLoading = false;
                state.saveSuccess = action.payload.success;
                state.savedQuotationNo = action.payload.quotationNo;
            })
            .addCase(saveSalesQuotation.rejected, (state, action) => {
                state.saveLoading = false;
                state.saveError = action.payload ?? "Unknown error";
                state.saveSuccess = false;
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearQuotationList,
    clearInvPreference,
    clearTableColumns,
    clearQuotationDocuments,
    clearInvoiceTaxTypeDetails,
    clearAllInvoiceTaxTypes,
    clearCustomers,
    clearItemDetails,
    clearBatchDetails,
    clearSaveState,
    resetSalesQuotation,
} = salesQuotationSlice.actions;

export default salesQuotationSlice.reducer;
