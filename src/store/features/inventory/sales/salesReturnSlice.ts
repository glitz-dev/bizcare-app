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

export interface PaymentType {
    PaymentTypeID: number;
    PaymentTypeName: string;
}

export interface Store {
    StoreID: number;
    StoreName: string;
    CompanyStore: boolean | null;
}

export interface StoreStartWith {
    StoreID: number;
    StoreName: string;
    CompanyStore: boolean | null;
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

export interface Customer {
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
    PartyCreditLimitAmt: number | null;
    PartyCreditLimitDays: number | null;
    GSTPayableHeadID: number | null;
    HeadName: string | null;
}

export interface SalesDetail {
    SalesID: number;
    SalesNo: string;
    SalesDate: string;
    firstDescr: string;
    StoreID: number;
    StoreName: string;
}

export interface SalesLineItem {
    SalesTID: number;
    SalesMID: number;
    ItemID: number;
    ItemCode: string | null;
    ItemName: string | null;
    ItemDescription: string | null;
    BatchID: number | null;
    BatchNo: string | null;
    Quantity: number;
    SalesRate: number;
    UnitMultiplier: number;
    DiscountPercentage: number | null;
    DiscountAmount: number | null;
    TaxID: number | null;
    TaxPercentage: number | null;
    TaxAmount: number | null;
    Amount: number;
    GrossAmount: number | null;
    TotalAmount: number | null;
    SalesUnitID: number;
    ItemUnitName: string | null;
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
    ReturnedQty: number | null;
    Returned: boolean | null;
    StoreID: number | null;
    Remarks: string | null;
}

export interface SelectedSalesForReturn {
    SalesID: number;
    SalesNo: string;
    SalesDate: string;
    DocumentID: number;
    CustomerID: number;
    CustomerName: string | null;
    StoreID: number;
    StoreName: string | null;
    PaymentTypeID: number;
    PaymentTypeName: string | null;
    DocumentName: string | null;
    InvoiceTaxTypeID: number;
    CurrencyID: number;
    ExRate: number | null;
    GrossAmount: number | null;
    TotalDiscount: number | null;
    TotalTax: number | null;
    NetAmount: number;
    TotalSGSTAmt: number | null;
    TotalCGSTAmt: number | null;
    TotalIGSTAmt: number | null;
    TotalUTGSTAmt: number | null;
    TotalCESSAmt: number | null;
    RoundOffAmount: number | null;
    Remarks: string | null;
    RefNo: string | null;
    Approve: boolean | null;
    LstSalesDetails: SalesLineItem[];
}

export interface SalesReturnItem {
    rowAscNum: number;
    rowDescNum: number;
    UserID: number;
    SalesReturnMID: number;
    PaymentType: string;
    Store: string;
    Supplier: string;
    ReturnNo: string;
    ReturnDate: string;
    TotalQuantity: number;
    NetAmount: number;
    ApprovedBy: string | null;
    Approve: string;
    DocumentID: number;
}

export interface FetchSalesReturnsParams {
    fromDate: string;
    toDate: string;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    documentType?: string;
    companyId?: number;
    finYearId?: number;
}

// Payload contract derived from the API payload structure
export interface SaveSalesReturnPayload {
    SalesReturnDateStr: string;
    SupplierID: number;
    TaxPercHead: string;
    TaxAmountHead: string;
    BillwiseDiscountAmt: string;
    BillwiseDiscountPer: number;
    ChequeDate: string | null;
    CustomerID: number;
    CustomerName: string;
    DebitHeadName: string;
    DocumentID: number;
    DocumentName: string;
    GrossAmount: string;
    InvoiceTaxType: string;
    InvoiceTaxTypeID: number;
    InvoiceTypeID: number;
    IsGST: boolean;
    LstsalesReturnDetails: any[]; // Maps to the list containing item specifics like FSS 01
    NetAmount: string;
    NetTotal: string;
    OtherAdditionalAmount: string;
    OtherDeductionAmount: string;
    PaymentTypeID: number;
    PaymentTypeName: string;
    PreNetAmount: string;
    ReturnNo: string;
    SalesAcHeadID: number;
    SalesInvoiceNo: string;
    SalesMID: number;
    SalesNo: string;
    SalesReturnDate: string;
    StoreID: number;
    StoreName: string;
    TaxMasterID: number;
    TotalCESSAmt: number;
    TotalCGSTAmt: number;
    TotalDiscount: string;
    TotalIGSTAmt: number;
    TotalQuantity: string;
    TotalSGSTAmt: number;
    TotalTax: string;
    TotalUTGSTAmt: number;
    TotalVATAmount: number;
    TotalVATAmt: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface SalesReturnState {
    documentMasters: DocumentMaster[];
    documentMastersLoading: boolean;
    documentMastersError: string | null;

    paymentTypes: PaymentType[];
    paymentTypesLoading: boolean;
    paymentTypesError: string | null;

    defaultStores: Store[];
    defaultStoresLoading: boolean;
    defaultStoresError: string | null;

    accountHeads: AccountHead[];
    accountHeadsLoading: boolean;
    accountHeadsError: string | null;

    invoiceTaxTypeDetails: InvoiceTaxTypeDetail[];
    invoiceTaxTypeDetailsLoading: boolean;
    invoiceTaxTypeDetailsError: string | null;

    customers: Customer[];
    customersLoading: boolean;
    customersError: string | null;

    storesStartWith: StoreStartWith[];
    storesStartWithLoading: boolean;
    storesStartWithError: string | null;

    salesDetails: SalesDetail[];
    salesDetailsLoading: boolean;
    salesDetailsError: string | null;

    selectedSalesForReturn: SelectedSalesForReturn | null;
    selectedSalesForReturnLoading: boolean;
    selectedSalesForReturnError: string | null;

    salesReturns: SalesReturnItem[];
    salesReturnsLoading: boolean;
    salesReturnsError: string | null;

    // Added states for saving process
    saveSalesReturnLoading: boolean;
    saveSalesReturnError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: SalesReturnState = {
    documentMasters: [],
    documentMastersLoading: false,
    documentMastersError: null,

    paymentTypes: [],
    paymentTypesLoading: false,
    paymentTypesError: null,

    defaultStores: [],
    defaultStoresLoading: false,
    defaultStoresError: null,

    accountHeads: [],
    accountHeadsLoading: false,
    accountHeadsError: null,

    invoiceTaxTypeDetails: [],
    invoiceTaxTypeDetailsLoading: false,
    invoiceTaxTypeDetailsError: null,

    customers: [],
    customersLoading: false,
    customersError: null,

    storesStartWith: [],
    storesStartWithLoading: false,
    storesStartWithError: null,

    salesDetails: [],
    salesDetailsLoading: false,
    salesDetailsError: null,

    selectedSalesForReturn: null,
    selectedSalesForReturnLoading: false,
    selectedSalesForReturnError: null,

    salesReturns: [],
    salesReturnsLoading: false,
    salesReturnsError: null,

    // Initialized fields
    saveSalesReturnLoading: false,
    saveSalesReturnError: null,
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
    "salesReturn/fetchDocumentMasters",
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
            url.searchParams.set("DocumentType", "SALES RETURN");
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
    "salesReturn/fetchPaymentTypes",
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

export const fetchDefaultStores = createAsyncThunk<
    Store[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesReturn/fetchDefaultStores",
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

export const fetchAccountHeads = createAsyncThunk<
    AccountHead[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesReturn/fetchAccountHeads",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//AccountHead/GetAccHeadStart"
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

            const data: AccountHead[] = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllAccountHeads = createAsyncThunk<
    AccountHead[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesReturn/fetchAllAccountHeads",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//AccountHead/GetAllAccHeadStartWith?startWith=Sales+Return"
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

            const data: AccountHead[] = await response.json();
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
    "salesReturn/fetchInvoiceTaxTypeDetails",
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

            const json = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as InvoiceTaxTypeDetail[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchCustomersForReturn = createAsyncThunk<
    Customer[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesReturn/fetchCustomersForReturn",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = getCompanyId(state, params?.companyId);
        const finYearId = getFinYearId(state, params?.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//Party/GetAllCustomersForReturn"
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

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as Customer[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchStoresStartWith = createAsyncThunk<
    StoreStartWith[],
    { startWith?: string; companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "salesReturn/fetchStoresStartWith",
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

            const json = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as StoreStartWith[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSalesDetailsForReturn = createAsyncThunk<
    SalesDetail[],
    { customerID: number; searchStr?: string; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesReturn/fetchSalesDetailsForReturn",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api//SalesReturn/GetSalesDetailsForReturnByCustomerID"
            );
            url.searchParams.set("CustomerID", String(params.customerID));
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

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as SalesDetail[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSelectedSalesForReturn = createAsyncThunk<
    SelectedSalesForReturn,
    { salesInvoiceID: number; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "salesReturn/fetchSelectedSalesForReturn",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/SalesReturn/GetSelectedSalesforSalesReturn"
            );
            url.searchParams.set("SalesInvoiceID", String(params.salesInvoiceID));

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

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as SelectedSalesForReturn;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAllSalesReturns = createAsyncThunk<
    SalesReturnItem[],
    FetchSalesReturnsParams,
    { state: RootState; rejectValue: string }
>(
    "salesReturn/fetchAllSalesReturns",
    async (params, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state, params.companyId);
        const finYearId = getFinYearId(state, params.finYearId);

        try {
            const url = new URL(
                "https://erp.glitzit.com/service/api/SalesReturn/ReadAllSalesReturns"
            );
            url.searchParams.set("FromDate", params.fromDate);
            url.searchParams.set("ToDate", params.toDate);
            url.searchParams.set("rowsPerPage", String(params.rowsPerPage ?? 25));
            url.searchParams.set("currentPage", String(params.currentPage ?? 1));
            url.searchParams.set("searchStr", params.searchStr ?? "");
            url.searchParams.set("documentType", params.documentType ?? "SALES RETURN");

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

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message ?? "API returned failure");
            }

            return json.Server.Data as SalesReturnItem[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// Thunk to submit changes and save the sales return statement
export const saveSalesReturn = createAsyncThunk<
    { Success: boolean; Message: string },
    SaveSalesReturnPayload,
    { state: RootState; rejectValue: string }
>(
    "salesReturn/saveSalesReturn",
    async (payload, { rejectWithValue, getState }) => {
        const state = getState();
        const token = getCleanToken(state);
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(state);
        const finYearId = getFinYearId(state);

        try {
            const url = "https://erp.glitzit.com/service/api/SalesReturn/SaveChanges";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message ?? "Failed to save sales return changes.");
            }

            return {
                Success: json.Server.Success,
                Message: json.Server.Message,
            };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const salesReturnSlice = createSlice({
    name: "salesReturn",
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
        clearDefaultStores(state) {
            state.defaultStores = [];
            state.defaultStoresLoading = false;
            state.defaultStoresError = null;
        },
        clearAccountHeads(state) {
            state.accountHeads = [];
            state.accountHeadsLoading = false;
            state.accountHeadsError = null;
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
        clearSalesDetails(state) {
            state.salesDetails = [];
            state.salesDetailsLoading = false;
            state.salesDetailsError = null;
        },
        clearStoresStartWith(state) {
            state.storesStartWith = [];
            state.storesStartWithLoading = false;
            state.storesStartWithError = null;
        },
        clearSelectedSalesForReturn(state) {
            state.selectedSalesForReturn = null;
            state.selectedSalesForReturnLoading = false;
            state.selectedSalesForReturnError = null;
        },
        clearSalesReturns(state) {
            state.salesReturns = [];
            state.salesReturnsLoading = false;
            state.salesReturnsError = null;
        },
        clearSaveSalesReturnStatus(state) {
            state.saveSalesReturnLoading = false;
            state.saveSalesReturnError = null;
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

            // Account Heads
            .addCase(fetchAccountHeads.pending, (state) => {
                state.accountHeadsLoading = true;
                state.accountHeadsError = null;
            })
            .addCase(fetchAccountHeads.fulfilled, (state, action) => {
                state.accountHeadsLoading = false;
                state.accountHeads = action.payload;
            })
            .addCase(fetchAccountHeads.rejected, (state, action) => {
                state.accountHeadsLoading = false;
                state.accountHeadsError = action.payload ?? "Unknown error";
            })

            // All Account Heads (GetAllAccHeadStartWith — no filter, full list)
            .addCase(fetchAllAccountHeads.pending, (state) => {
                state.accountHeadsLoading = true;
                state.accountHeadsError = null;
            })
            .addCase(fetchAllAccountHeads.fulfilled, (state, action) => {
                state.accountHeadsLoading = false;
                state.accountHeads = action.payload;
            })
            .addCase(fetchAllAccountHeads.rejected, (state, action) => {
                state.accountHeadsLoading = false;
                state.accountHeadsError = action.payload ?? "Unknown error";
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

            // Customers For Return
            .addCase(fetchCustomersForReturn.pending, (state) => {
                state.customersLoading = true;
                state.customersError = null;
            })
            .addCase(fetchCustomersForReturn.fulfilled, (state, action) => {
                state.customersLoading = false;
                state.customers = action.payload;
            })
            .addCase(fetchCustomersForReturn.rejected, (state, action) => {
                state.customersLoading = false;
                state.customersError = action.payload ?? "Unknown error";
            })

            // Stores StartWith
            .addCase(fetchStoresStartWith.pending, (state) => {
                state.storesStartWithLoading = true;
                state.storesStartWithError = null;
            })
            .addCase(fetchStoresStartWith.fulfilled, (state, action) => {
                state.storesStartWithLoading = false;
                state.storesStartWith = action.payload;
            })
            .addCase(fetchStoresStartWith.rejected, (state, action) => {
                state.storesStartWithLoading = false;
                state.storesStartWithError = action.payload ?? "Unknown error";
            })

            // Selected Sales For Return
            .addCase(fetchSelectedSalesForReturn.pending, (state) => {
                state.selectedSalesForReturnLoading = true;
                state.selectedSalesForReturnError = null;
            })
            .addCase(fetchSelectedSalesForReturn.fulfilled, (state, action) => {
                state.selectedSalesForReturnLoading = false;
                state.selectedSalesForReturn = action.payload;
            })
            .addCase(fetchSelectedSalesForReturn.rejected, (state, action) => {
                state.selectedSalesForReturnLoading = false;
                state.selectedSalesForReturnError = action.payload ?? "Unknown error";
            })

            // Sales Details For Return
            .addCase(fetchSalesDetailsForReturn.pending, (state) => {
                state.salesDetailsLoading = true;
                state.salesDetailsError = null;
            })
            .addCase(fetchSalesDetailsForReturn.fulfilled, (state, action) => {
                state.salesDetailsLoading = false;
                state.salesDetails = action.payload;
            })
            .addCase(fetchSalesDetailsForReturn.rejected, (state, action) => {
                state.salesDetailsLoading = false;
                state.salesDetailsError = action.payload ?? "Unknown error";
            })

            // Read All Sales Returns
            .addCase(fetchAllSalesReturns.pending, (state) => {
                state.salesReturnsLoading = true;
                state.salesReturnsError = null;
            })
            .addCase(fetchAllSalesReturns.fulfilled, (state, action) => {
                state.salesReturnsLoading = false;
                state.salesReturns = action.payload;
            })
            .addCase(fetchAllSalesReturns.rejected, (state, action) => {
                state.salesReturnsLoading = false;
                state.salesReturnsError = action.payload ?? "Unknown error";
            })

            // Save Sales Return Submissions
            .addCase(saveSalesReturn.pending, (state) => {
                state.saveSalesReturnLoading = true;
                state.saveSalesReturnError = null;
            })
            .addCase(saveSalesReturn.fulfilled, (state) => {
                state.saveSalesReturnLoading = false;
            })
            .addCase(saveSalesReturn.rejected, (state, action) => {
                state.saveSalesReturnLoading = false;
                state.saveSalesReturnError = action.payload ?? "An error occurred while saving.";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearDocumentMasters,
    clearPaymentTypes,
    clearDefaultStores,
    clearAccountHeads,
    clearInvoiceTaxTypeDetails,
    clearCustomers,
    clearSalesDetails,
    clearStoresStartWith,
    clearSelectedSalesForReturn,
    clearSalesReturns,
    clearSaveSalesReturnStatus,
} = salesReturnSlice.actions;

export default salesReturnSlice.reducer;
