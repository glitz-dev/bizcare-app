import { RootState } from "@/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// ─── Types ────────────────────────────────────────────────────────────────────

export interface IndentOrder {
    IndentID: number;
    IndentNo: string;
    IndentDate: string;
    TotalQuantity: number;
    IndentCompleted: boolean;
    DepartmentID: number;
    DepartmentName: string;
    ItemTypeID: number;
    ItemType: string | null;
    Remarks: string | null;
    Approve: string;
    ApprovedBY: string | null;
    UserName: string | null;
    SubDepartmentName: string | null;
    EmpName: string;
    salesorderId: number | null;
    CategoryName: string;
    CategoryID: number;
    SubCategoryName: string;
    SubCategoryID: number;
    DocumentName: string;
    POStatus: string;
    apprve: boolean;
    SalesOrderNo: string | null;
    CreatedDate: string;
    ApprovedDate: string;
}

export interface IndentDetail {
    BarCode?: string;
    DesignID: number;
    Hsn: string;
    ItemCode: string;
    ItemID: number;
    ItemName: string;
    Quantity: string;
    RequiredDate: string;
    SalesUnit: string;
    SalesUnitID: number;
    SizeID: number;
    Spec: string;
    SpecID: number;
    StoreID: number;
    Unit: string;
    UnitID: number;
    UnitMultiplier: number;
}

export interface FetchIndentParams {
    from: string;
    to: string;
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    itemid?: number;
    companyId?: number;
    finYearId?: number;
}

export interface ItemDetail {
    Quantity: number;
    PurchaseOrdQty: number;
    ItemName: string;
    InpassQty: number;
}

export interface DocumentType {
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

export interface ItemCategory {
    CategoryName: string;
    CategoryID: number;
}

export interface ItemSubCategory {
    SubCategoryName: string;
    SubCatDescription: string | null;
    SubCategoryID: number;
    CategoryID: number;
    CategoryName: string;
    Common: boolean;
    Active: boolean;
}

export interface IndentItem {
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Description: string | null;
    CategoryID: number;
    CategoryName: string;
    ItemGroupID: number | null;
    ItemGroupName: string | null;
    SubCategoryID: number;
    SubCategoryName: string;
    ItemTypeID: number;
    ItemType: string;
    StockTypeID: number;
    PurchaseUnitID: number;
    UnitMultiplier: number;
    HeadID: number | null;
}

export interface BasicItemDetail {
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Hsn: string | null;
    Description: string | null;
    PurchaseUnitID: number;
    PurchaseUnit: string;
    SalesUnitID: number;
    SaleUnit: string;
    StockUnitID: number;
    StockUnit: string;
    SalesRate: number | null;
    UnitMultiplier: number;
    IsNonStockItem: boolean;
    DesignID: number | null;
    DesignCode: string | null;
    DesignName: string | null;
    ImagePath: string | null;
    CustRefNo: string | null;
}

export interface ItemSpec {
    SpecID: number;
    Spec: string;
}

export interface Employee {
    EmpName: string;
    EmployeeID: number;
}

export interface Department {
    DepartmentName: string;
    DepartmentID: number;
}

export interface ItemStock {
    Quantity: number;
}

export interface CreateIndentPayload {
    CategoryID: number;
    CategoryName: string;
    Department: string;
    DepartmentID: number;
    DocumentID: number;
    DocumentName: string;
    EmpName: string;
    EmployeeID: number;
    IndentDate: string;
    IndentDateStr: string;
    IndentNo: string;
    InvoiceNo?: string | null;
    ItemTypeID: number;
    LstIndentDetails: IndentDetail[];
    SalesOrderID?: number | null;
    SubCategoryID: number;
    SubCategoryName: string;
    TotalQuantity: string;
}

export interface SaveIndentResponse {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string;
        Data: null;
        Id: number;
        Info: null;
        Approve: null;
    };
}

export interface SelectedIndent {
    IndentID: number;
    IndentNo: string;
    IndentDate: string;
    TotalQuantity: number;
    DocumentID: number;
    DocumentName: string;
    IndentCompleted: boolean;
    ItemTypeID: number;
    ItemType: string | null;
    DepartmentID: number;
    Department: string;
    SubDepartmentID: number | null;
    SubDepartmentName: string | null;
    Remarks: string | null;
    EmployeeID: number;
    EmpName: string;
    IndentTID: number;
    IndentMasterID: number;
    ItemID: number;
    ItemCode: string | null;
    ItemName: string;
    Hsn: string;
    UnitID: number;
    Unit: string;
    Quantity: number;
    BatchID: number | null;
    BatchNo: string | null;
    BarCode: string | null;
    Description: string | null;
    RequiredDate: string;
    Approve: boolean;
    SpecID: number;
    Spec: string | null;
    InvoiceNo: string | null;
    SalesOrderID: number | null;
    CategoryName: string;
    CategoryID: number;
    SubCategoryID: number;
    SubCategoryName: string;
}

interface fetchDocumentTypesParams {
    companyId: number;
    finYearId: number;
}

interface fetchItemCategoriesParams {
    companyId: number;
    finYearId: number;
}

interface fetchItemSubCategoriesParams {
    categoryId: number;
    companyId?: number;
    finYearId?: number;
}

interface fetchSalesOrdersParams {
    rowsPerPage?: number;
    currentPage?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

interface fetchIndentItemsParams {
    itemCategoryID?: number;
    searchStr?: string;
    companyId?: number;
    finYearId?: number;
}

interface FetchBasicItemParams {
    itemId: number;
    itemCode?: string;
    asMode?: string;
}

interface fetchItemSpecsParams {
    itemId: number;
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

interface fetchEmployeesParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

interface fetchDepartmentsParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

interface saveIndentParams {
    companyId?: number;
    finYearId?: number;
}

export interface SalesOrder {
    OrderNo: string;
    OrderDate: string;
    ApprovedBy: string | null;
    ApprovedDate: string | null;
    ApprovedTime: string | null;
    CustCode: string;
    InvoiceNo: string;
    SalesOrderID: number;
    PartyName: string;
    PartyCode: string | null;
    PartyID: number;
    SalesOrderDate: string;
}

interface ProcurementState {
    indentOrders: IndentOrder[];
    items: Item[];
    indentItems: IndentItem[];
    itemDetails: ItemDetail[];
    documentTypes: DocumentType[];
    itemCategories: ItemCategory[];
    itemSubCategories: ItemSubCategory[];
    salesOrders: SalesOrder[];
    basicItemDetail: BasicItemDetail | null;
    itemSpecs: ItemSpec[];
    employees: Employee[];
    departments: Department[];
    itemStock: ItemStock | null;
    selectedIndent: SelectedIndent[];
    salesOrdersLoading: boolean;
    salesOrdersError: string | null;
    itemSubCategoriesLoading: boolean;
    itemSubCategoriesError: string | null;
    itemCategoriesLoading: boolean;
    itemCategoriesError: string | null;
    documentTypesLoading: boolean;
    documentTypesError: string | null;
    itemDetailsLoading: boolean;
    itemDetailsError: string | null;
    itemsLoading: boolean;
    itemsError: string | null;
    loading: boolean;
    error: string | null;
    indentItemsLoading: boolean;
    indentItemsError: string | null;
    basicItemDetailLoading: boolean;
    basicItemDetailError: string | null;
    itemSpecsLoading: boolean;
    itemSpecsError: string | null;
    employeesLoading: boolean;
    employeesError: string | null;
    departmentsLoading: boolean;
    departmentsError: string | null;
    itemStockLoading: boolean;
    itemStockError: string | null;
    saveIndentLoading: boolean;
    saveIndentError: string | null;
    selectedIndentLoading: boolean;
    selectedIndentError: string | null;
}

const initialState: ProcurementState = {
    indentOrders: [],
    indentItems: [],
    items: [],
    itemDetails: [],
    documentTypes: [],
    itemCategories: [],
    itemSubCategories: [],
    salesOrders: [],
    basicItemDetail: null,
    itemSpecs: [],
    employees: [],
    departments: [],
    itemStock: null,
    selectedIndent: [],
    salesOrdersLoading: false,
    salesOrdersError: null,
    itemSubCategoriesLoading: false,
    itemSubCategoriesError: null,
    itemCategoriesLoading: false,
    itemCategoriesError: null,
    documentTypesLoading: false,
    documentTypesError: null,
    itemDetailsLoading: false,
    itemDetailsError: null,
    itemsLoading: false,
    itemsError: null,
    loading: false,
    error: null,
    indentItemsLoading: false,
    indentItemsError: null,
    basicItemDetailLoading: false,
    basicItemDetailError: null,
    itemSpecsLoading: false,
    itemSpecsError: null,
    employeesLoading: false,
    employeesError: null,
    departmentsLoading: false,
    departmentsError: null,
    itemStockLoading: false,
    itemStockError: null,
    saveIndentLoading: false,
    saveIndentError: null,
    selectedIndentLoading: false,
    selectedIndentError: null,
};

export interface Item {
    ItemID: number;
    ItemName: string;
    ItemCode: string | null;
}

/// ─── Helpers ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    let token = state.auth.userData?.token || localStorage.getItem("token");
    if (!token) return null;

    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Async Thunk ──────────────────────────────────────────────────────────────

export const fetchItems = createAsyncThunk<
    Item[],
    void,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItems",
    async (_, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        console.log("🔑 Sending Authorization (Items):", token); // ← debug

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Item/GetallItemsIndent/");
            url.searchParams.set("searchStr", "");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch items");
            }

            return json.Server.Data as Item[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchIndentOrders = createAsyncThunk<
    IndentOrder[],
    FetchIndentParams,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchIndentOrders",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Indent/ReadAllIndentOrder");

            url.searchParams.set("From", params.from);
            url.searchParams.set("To", params.to);
            url.searchParams.set("rowsPerPage", String(params.rowsPerPage ?? 25));
            url.searchParams.set("currentPage", String(params.currentPage ?? 1));
            url.searchParams.set("searchStr", params.searchStr ?? "");
            url.searchParams.set("itemid", String(params.itemid ?? 0));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "x-company-id": String(params.companyId),
                    "x-finyear-id": String(params.finYearId),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Unknown API error");
            }

            return json.Server.Data as IndentOrder[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemDetail = createAsyncThunk<
    ItemDetail[],
    number,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItemDetail",
    async (indentID, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Indent/GetItemDetail");
            url.searchParams.set("IndentID", String(indentID));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch item details");
            }

            return json.Server.Data as ItemDetail[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDocumentTypes = createAsyncThunk<
    DocumentType[],
    fetchDocumentTypesParams,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchDocumentTypes",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/DocumentM/GetDocumentStartWith");
            url.searchParams.set("DocumentType", "Indent");
            url.searchParams.set("startWith", "");   // empty as per your example

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                    "x-company-id": String(params.companyId),
                    "x-finyear-id": String(params.finYearId),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            // This API returns array directly (not wrapped in { Server: {...} })
            if (!Array.isArray(json)) {
                return rejectWithValue("Invalid response format");
            }

            return json as DocumentType[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemCategories = createAsyncThunk<
    ItemCategory[],
    fetchItemCategoriesParams,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItemCategories",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/ItemCategory/GetItemCategorysStartWith");
            url.searchParams.set("startWith", "");   // empty as per your example

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                    "x-company-id": String(params.companyId),
                    "x-finyear-id": String(params.finYearId),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            // This API returns array directly
            if (!Array.isArray(json)) {
                return rejectWithValue("Invalid response format");
            }

            return json as ItemCategory[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemSubCategories = createAsyncThunk<
    ItemSubCategory[],
    fetchItemSubCategoriesParams,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItemSubCategories",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/ItemSubCategory/GetItemSubCategory");

            url.searchParams.set("id", String(params.categoryId));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                    "x-company-id": String(params.companyId || 1),
                    "x-finyear-id": String(params.finYearId || 2024),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch sub categories");
            }

            return json.Server.Data as ItemSubCategory[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSalesOrders = createAsyncThunk<
    SalesOrder[],
    fetchSalesOrdersParams | void,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchSalesOrders",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/SalesOrder/GetSalesOrderNoBySearch");

            url.searchParams.set("rowsPerPage", String(params?.rowsPerPage ?? 10));
            url.searchParams.set("currentPage", String(params?.currentPage ?? 1));
            url.searchParams.set("searchStr", params?.searchStr ?? "");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(params?.companyId || 1),
                    "x-finyear-id": String(params?.finYearId || 2024),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch sales orders");
            }

            return json.Server.Data as SalesOrder[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemsForIndent = createAsyncThunk<
    IndentItem[],
    fetchIndentItemsParams | void,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItemsForIndent",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        const safeParams = params ?? {};

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Item/GetItemDetailsForIndent");
            url.searchParams.set("itemCategoryID", String(safeParams.itemCategoryID ?? 0));
            url.searchParams.set("searchStr", safeParams.searchStr ?? "");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    ...(safeParams.companyId && { "x-company-id": String(safeParams.companyId) }),
                    ...(safeParams.finYearId && { "x-finyear-id": String(safeParams.finYearId) }),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch items");
            }

            return json.Server.Data as IndentItem[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchBasicItemDetails = createAsyncThunk<
    BasicItemDetail,
    FetchBasicItemParams,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchBasicItemDetails",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Item/GeBasicItemDetails");

            url.searchParams.set("asMode", params.asMode ?? "II");
            url.searchParams.set("customerCode", "");
            url.searchParams.set("customerId", "0");
            url.searchParams.set("designCode", "");
            url.searchParams.set("hsnCode", "");
            if (params.itemCode) url.searchParams.set("itemCode", params.itemCode);
            if (params.itemId) url.searchParams.set("itemId", String(params.itemId));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch item details");
            }

            const data = json.Server.Data as BasicItemDetail[];
            if (!data || data.length === 0) {
                return rejectWithValue("No item data returned");
            }

            return data[0];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemSpecs = createAsyncThunk<
    ItemSpec[],
    fetchItemSpecsParams,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItemSpecs",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Item/GetSpecificationsOfSelectedItem");
            url.searchParams.set("ItemID", String(params.itemId));
            url.searchParams.set("startWith", params.startWith ?? "");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(params?.companyId || 1),
                    "x-finyear-id": String(params?.finYearId || 2024),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch specifications");
            }

            return json.Server.Data as ItemSpec[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchEmployees = createAsyncThunk<
    Employee[],
    fetchEmployeesParams | void,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchEmployees",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Employee/GetEmployeeStartWith");
            url.searchParams.set("startWith", params?.startWith ?? "");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(params?.companyId || 1),
                    "x-finyear-id": String(params?.finYearId || 2024),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!Array.isArray(json)) {
                return rejectWithValue("Invalid response format from Employee API");
            }

            return json as Employee[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchDepartments = createAsyncThunk<
    Department[],
    fetchDepartmentsParams | void,
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchDepartments",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Department/GetDepartmentStartWith");
            url.searchParams.set("startWith", params?.startWith ?? "");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(params?.companyId || 1),
                    "x-finyear-id": String(params?.finYearId || 2024),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            // This API returns a direct array (no { Server: {...} } wrapper)
            if (!Array.isArray(json)) {
                return rejectWithValue("Invalid response format from Department API");
            }

            return json as Department[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchItemStock = createAsyncThunk<
    ItemStock,
    {
        DesignID?: number;
        ItemID: number;
        SizeID?: number;
        SpecID?: number;
        StoreID?: number;
        companyId?: number;
        finYearId?: number;
    },
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchItemStock",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Item/GetStockforSelectedItem");

            url.searchParams.set("DesignID", String(params.DesignID ?? 0));
            url.searchParams.set("ItemID", String(params.ItemID));
            url.searchParams.set("SizeID", String(params.SizeID ?? 0));
            url.searchParams.set("SpecID", String(params.SpecID ?? 0));
            url.searchParams.set("StoreID", String(params.StoreID ?? 1));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(params?.companyId || 1),
                    "x-finyear-id": String(params?.finYearId || 2024),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch item stock");
            }

            const data = json.Server.Data as ItemStock[];

            if (!data || data.length === 0) {
                return { Quantity: 0 }; // Return default zero stock
            }

            return data[0]; // API returns array with one object
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const saveIndent = createAsyncThunk<
    SaveIndentResponse,
    { payload: CreateIndentPayload; companyId?: number; finYearId?: number },
    { state: RootState; rejectWithValue: string }
>(
    "procurement/saveIndent",
    async (arg, { rejectWithValue, getState }) => {
        const { payload, companyId, finYearId } = arg;
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = "https://erp.glitzit.com/service/api/Indent/SaveChanges";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json, text/plain, */*",
                    Authorization: token,
                    "x-company-id": String(companyId || 1),
                    "x-finyear-id": String(finYearId || 2),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to save purchase indent");
            }

            return json as SaveIndentResponse;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchSelectedIndent = createAsyncThunk<
    SelectedIndent[],
    { indentID: number; companyId?: number; finYearId?: number },
    { state: RootState; rejectValue: string }
>(
    "procurement/fetchSelectedIndent",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) {
            return rejectWithValue("No authentication token found. Please login again.");
        }

        try {
            const url = new URL("https://erp.glitzit.com/service/api/Indent/GetSelectedIndent");
            url.searchParams.set("IndentID", String(params.indentID));

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                    ...(params.companyId !== undefined && { "x-company-id": String(params.companyId) }),
                    ...(params.finYearId !== undefined && { "x-finyear-id": String(params.finYearId) }),
                },
            });

            if (!response.ok) {
                return rejectWithValue(`HTTP error: ${response.status}`);
            }

            const json = await response.json();

            if (!json?.Server?.Success) {
                return rejectWithValue(json?.Server?.Message ?? "Failed to fetch selected indent");
            }

            return json.Server.Data as SelectedIndent[];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const procurementSlice = createSlice({
    name: "procurement",
    initialState,
    reducers: {
        clearIndentOrders(state) {
            state.indentOrders = [];
            state.error = null;
        },
        clearItemDetails(state) {
            state.itemDetails = [];
            state.itemDetailsError = null;
        },
        clearDocumentTypes(state) {
            state.documentTypes = [];
            state.documentTypesError = null;
        },
        clearItemCategories(state) {
            state.itemCategories = [];
            state.itemCategoriesError = null;
        },
        clearItemSubCategories(state) {
            state.itemSubCategories = [];
            state.itemSubCategoriesError = null;
        },
        clearSalesOrders(state) {
            state.salesOrders = [];
            state.salesOrdersError = null;
        },
        clearIndentItems(state) {
            state.indentItems = [];
            state.indentItemsError = null;
        },
        clearBasicItemDetail(state) {
            state.basicItemDetail = null;
            state.basicItemDetailError = null;
        },
        clearItemSpecs(state) {
            state.itemSpecs = [];
            state.itemSpecsError = null;
        },
        clearEmployees(state) {
            state.employees = [];
            state.employeesError = null;
        },
        clearDepartments(state) {
            state.departments = [];
            state.departmentsError = null;
        },
        clearItemStock(state) {
            state.itemStock = null;
            state.itemStockError = null;
        },
        clearSelectedIndent(state) {
            state.selectedIndent = [];
            state.selectedIndentError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchIndentOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIndentOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.indentOrders = action.payload;
            })
            .addCase(fetchIndentOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Something went wrong";
            })
            .addCase(fetchItems.pending, (state) => {
                state.itemsLoading = true;
                state.itemsError = null;
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                state.itemsLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.itemsLoading = false;
                state.itemsError = action.payload ?? "Failed to load items";
            })
            .addCase(fetchItemDetail.pending, (state) => {
                state.itemDetailsLoading = true;
                state.itemDetailsError = null;
            })
            .addCase(fetchItemDetail.fulfilled, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetails = action.payload;
            })
            .addCase(fetchItemDetail.rejected, (state, action) => {
                state.itemDetailsLoading = false;
                state.itemDetailsError = action.payload ?? "Failed to load item details";
            })
            .addCase(fetchDocumentTypes.pending, (state) => {
                state.documentTypesLoading = true;
                state.documentTypesError = null;
            })
            .addCase(fetchDocumentTypes.fulfilled, (state, action) => {
                state.documentTypesLoading = false;
                state.documentTypes = action.payload;
            })
            .addCase(fetchDocumentTypes.rejected, (state, action) => {
                state.documentTypesLoading = false;
                state.documentTypesError = action.payload ?? "Failed to load document types";
            })
            .addCase(fetchItemCategories.pending, (state) => {
                state.itemCategoriesLoading = true;
                state.itemCategoriesError = null;
            })
            .addCase(fetchItemCategories.fulfilled, (state, action) => {
                state.itemCategoriesLoading = false;
                state.itemCategories = action.payload;
            })
            .addCase(fetchItemCategories.rejected, (state, action) => {
                state.itemCategoriesLoading = false;
                state.itemCategoriesError = action.payload ?? "Failed to load item categories";
            })
            .addCase(fetchItemSubCategories.pending, (state) => {
                state.itemSubCategoriesLoading = true;
                state.itemSubCategoriesError = null;
            })
            .addCase(fetchItemSubCategories.fulfilled, (state, action) => {
                state.itemSubCategoriesLoading = false;
                state.itemSubCategories = action.payload;
            })
            .addCase(fetchItemSubCategories.rejected, (state, action) => {
                state.itemSubCategoriesLoading = false;
                state.itemSubCategoriesError = action.payload ?? "Failed to load sub categories";
            })
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
                state.salesOrdersError = action.payload ?? "Failed to load sales orders";
            })
            .addCase(fetchItemsForIndent.pending, (state) => {
                state.indentItemsLoading = true;
                state.indentItemsError = null;
            })
            .addCase(fetchItemsForIndent.fulfilled, (state, action) => {
                state.indentItemsLoading = false;
                state.indentItems = action.payload;
            })
            .addCase(fetchItemsForIndent.rejected, (state, action) => {
                state.indentItemsLoading = false;
                state.indentItemsError = action.payload ?? "Failed to load items for indent";
            })
            .addCase(fetchBasicItemDetails.pending, (state) => {
                state.basicItemDetailLoading = true;
                state.basicItemDetailError = null;
            })
            .addCase(fetchBasicItemDetails.fulfilled, (state, action) => {
                state.basicItemDetailLoading = false;
                state.basicItemDetail = action.payload;
            })
            .addCase(fetchBasicItemDetails.rejected, (state, action) => {
                state.basicItemDetailLoading = false;
                state.basicItemDetailError = action.payload ?? "Failed to load basic item details";
            })
            .addCase(fetchItemSpecs.pending, (state) => {
                state.itemSpecsLoading = true;
                state.itemSpecsError = null;
            })
            .addCase(fetchItemSpecs.fulfilled, (state, action) => {
                state.itemSpecsLoading = false;
                state.itemSpecs = action.payload;
            })
            .addCase(fetchItemSpecs.rejected, (state, action) => {
                state.itemSpecsLoading = false;
                state.itemSpecsError = action.payload ?? "Failed to load specifications";
            })
            .addCase(fetchEmployees.pending, (state) => {
                state.employeesLoading = true;
                state.employeesError = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.employeesLoading = false;
                state.employees = action.payload;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.employeesLoading = false;
                state.employeesError = action.payload ?? "Failed to load employees";
            })
            .addCase(fetchDepartments.pending, (state) => {
                state.departmentsLoading = true;
                state.departmentsError = null;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.departmentsLoading = false;
                state.departments = action.payload;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.departmentsLoading = false;
                state.departmentsError = action.payload ?? "Failed to load departments";
            })
            .addCase(fetchItemStock.pending, (state) => {
                state.itemStockLoading = true;
                state.itemStockError = null;
            })
            .addCase(fetchItemStock.fulfilled, (state, action) => {
                state.itemStockLoading = false;
                state.itemStock = action.payload;
            })
            .addCase(fetchItemStock.rejected, (state, action) => {
                state.itemStockLoading = false;
                state.itemStockError = action.payload ?? "Failed to load item stock";
                state.itemStock = null;
            })
            .addCase(saveIndent.pending, (state) => {
                state.saveIndentLoading = true;
                state.saveIndentError = null;
            })
            .addCase(saveIndent.fulfilled, (state) => {
                state.saveIndentLoading = false;
            })
            .addCase(saveIndent.rejected, (state, action) => {
                state.saveIndentLoading = false;
                state.saveIndentError = typeof action.payload === 'string' ? action.payload : "Failed to save purchase indent";
            })
            .addCase(fetchSelectedIndent.pending, (state) => {
                state.selectedIndentLoading = true;
                state.selectedIndentError = null;
            })
            .addCase(fetchSelectedIndent.fulfilled, (state, action) => {
                state.selectedIndentLoading = false;
                state.selectedIndent = action.payload;
            })
            .addCase(fetchSelectedIndent.rejected, (state, action) => {
                state.selectedIndentLoading = false;
                state.selectedIndentError = action.payload ?? "Failed to load selected indent";
            })
    },
});

export const { clearIndentOrders, clearItemDetails, clearDocumentTypes, clearItemCategories, clearItemSubCategories, clearSalesOrders, clearIndentItems, clearBasicItemDetail, clearItemSpecs, clearEmployees, clearDepartments, clearItemStock, clearSelectedIndent } = procurementSlice.actions;
export default procurementSlice.reducer;