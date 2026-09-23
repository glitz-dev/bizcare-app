import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponseWrapper<T> {
    Server: {
        Success: boolean;
        Message: string;
        MessageId: string | null;
        Data: T;
        Id: number;
        Info: string | null;
        Approve: boolean | null;
    };
}

// GET /Department/GetDepartmentStartWith?startWith=...
// Returns a flat array (no envelope wrapper)
export interface DepartmentStartWithItem {
    DepartmentName: string;
    DepartmentID: number;
}

// GET /Employee/GetDesignationStartWith?startWith=...
// Returns an envelope-wrapped array
export interface DesignationStartWithItem {
    DesignationName: string;
    DesignationID: number;
}

// POST /Employee/SaveChanges
// Returns an envelope-wrapped response — the saved employee's ID comes back in Data.
// Used for BOTH create and edit: for create, send just the required fields below.
// For edit, also include EmployeeID plus the extra fields your GetEmployeeById
// response already gives you (DepartmentM/DesignationM etc.) — spread the fetched
// EmployeeDetail into this payload, override the fields the user changed, and post it back.
export interface SaveEmployeeChangesPayload {
    Active: boolean;
    Common: boolean;
    DepartmentName: string;
    DepartmentID: number;
    DesignationID: number;
    DesignationName: string;
    EmpCode: string;
    EmpName: string;
    // ── Present when updating an existing employee ──
    EmployeeID?: number;
    BranchID?: number;
    CompanyID?: number;
    DepartmentM?: DepartmentDetail;
    DesignationM?: DesignationDetail;
    EmpMGuid?: string;
    EntryDate?: string;
    ModifiedDate?: string | null;
    ModifiedUserID?: number | null;
    Status?: boolean;
    UserID?: number;
}

export interface SaveEmployeeChangesResult {
    id: number;
    messageId: string | null;
}

// GET /Employee/GetEmployeeList?currentPage=...&rowsPerPage=...&searchStr=...
// Returns an envelope-wrapped array of employee list rows
export interface EmployeeListItem {
    EmployeeID: number;
    EmpCode: string;
    EmpName: string;
    DepartmentName: string;
    DesignationName: string;
    Active: string;
}

// GET /Employee/GetEmployeeById?employeeId=...
// Returns an envelope-wrapped single employee record with nested department/designation
export interface DepartmentDetail {
    Store: unknown | null;
    DepartmentID: number;
    DepartmentCode: string;
    DepartmentName: string;
    CompanyID: number;
    BranchID: number;
    UserID: number;
    EntryDate: string;
    Status: boolean;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    Default: unknown | null;
    StoreID: number | null;
    Common: boolean;
    Active: boolean;
}

export interface DesignationDetail {
    DesignationID: number;
    DesignationCode: string;
    DesignationName: string;
    CompanyID: number;
    BranchID: number;
    UserID: number;
    EntryDate: string;
    Status: boolean;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
}

export interface EmployeeDetail {
    DepartmentM: DepartmentDetail;
    DesignationM: DesignationDetail;
    EmployeeID: number;
    EmpCode: string;
    EmpName: string;
    DepartmentID: number;
    DesignationID: number;
    CompanyID: number;
    BranchID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    EmpMGuid: string;
    Common: boolean;
    Active: boolean;
}

// POST /Employee/DeleteEmployee?ID=...&ModUserID=...
// Returns a bare number (not envelope-wrapped) — 0 on success
export interface DeleteEmployeeResult {
    id: number;
    raw: number;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchEmployeeListParams {
    currentPage?: number;          // default 1
    rowsPerPage?: number;          // default 25
    searchStr?: string;            // default ""
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchDepartmentStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchDesignationStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface SaveEmployeeChangesParams {
    payload: SaveEmployeeChangesPayload;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchEmployeeByIdParams {
    employeeId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface DeleteEmployeeParams {
    id: number;
    modUserId?: number;            // optional override — defaults to auth state's user id
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface EmployeeState {
    employeeList: EmployeeListItem[];
    employeeListLoading: boolean;
    employeeListError: string | null;
    employeeDetail: EmployeeDetail | null;
    employeeDetailLoading: boolean;
    employeeDetailError: string | null;
    employeeDeleteResult: DeleteEmployeeResult | null;
    employeeDeleteLoading: boolean;
    employeeDeleteError: string | null;
    departmentStartWithList: DepartmentStartWithItem[];
    departmentStartWithLoading: boolean;
    departmentStartWithError: string | null;
    designationStartWithList: DesignationStartWithItem[];
    designationStartWithLoading: boolean;
    designationStartWithError: string | null;
    employeeSaveResult: SaveEmployeeChangesResult | null;
    employeeSaveLoading: boolean;
    employeeSaveError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: EmployeeState = {
    employeeList: [],
    employeeListLoading: false,
    employeeListError: null,
    employeeDetail: null,
    employeeDetailLoading: false,
    employeeDetailError: null,
    employeeDeleteResult: null,
    employeeDeleteLoading: false,
    employeeDeleteError: null,
    departmentStartWithList: [],
    departmentStartWithLoading: false,
    departmentStartWithError: null,
    designationStartWithList: [],
    designationStartWithLoading: false,
    designationStartWithError: null,
    employeeSaveResult: null,
    employeeSaveLoading: false,
    employeeSaveError: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    const authState = state as RootState;
    let token = (authState.auth as any)?.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ⚠️ Mirrors the getCompanyId/getFinYearId helpers used by the other modules
// (Goods Receipt, Accounts, Sales, etc). Adjust the state path / localStorage
// keys below if your auth slice stores these under different field names.
const getCompanyId = (state: RootState): number => {
    const authState = state as RootState;
    const companyId =
        (authState.auth as any)?.userData?.companyId ??
        (authState.auth as any)?.userData?.CompanyID ??
        localStorage.getItem("companyId");
    return companyId ? Number(companyId) : 1;
};

const getFinYearId = (state: RootState): number => {
    const authState = state as RootState;
    const finYearId =
        (authState.auth as any)?.userData?.finYearId ??
        (authState.auth as any)?.userData?.FinYearID ??
        localStorage.getItem("finYearId");
    return finYearId ? Number(finYearId) : 2;
};

// ⚠️ Used as ModUserID on DeleteEmployee — the logged-in user's ID. Adjust the
// state path below if your auth slice stores this under a different field name.
const getUserId = (state: RootState): number => {
    const authState = state as RootState;
    const userId =
        (authState.auth as any)?.userData?.userId ??
        (authState.auth as any)?.userData?.UserID ??
        localStorage.getItem("userId");
    return userId ? Number(userId) : 1;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// 1. GetEmployeeList — envelope-wrapped array response, server-side paginated
export const fetchEmployeeList = createAsyncThunk<
    EmployeeListItem[],
    FetchEmployeeListParams | void,
    { state: RootState; rejectValue: string }
>(
    "employee/fetchEmployeeList",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const currentPage = params?.currentPage ?? 1;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Employee/GetEmployeeList?currentPage=${currentPage}&rowsPerPage=${rowsPerPage}&searchStr=${encodeURIComponent(
                searchStr
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<EmployeeListItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch employees.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetDepartmentStartWith — flat array response (no envelope)
export const fetchDepartmentStartWith = createAsyncThunk<
    DepartmentStartWithItem[],
    FetchDepartmentStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "employee/fetchDepartmentStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api//Department/GetDepartmentStartWith?startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: DepartmentStartWithItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetDesignationStartWith — envelope-wrapped array response
export const fetchDesignationStartWith = createAsyncThunk<
    DesignationStartWithItem[],
    FetchDesignationStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "employee/fetchDesignationStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api//Employee/GetDesignationStartWith?startWith=${encodeURIComponent(
                startWith
            )}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<DesignationStartWithItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch designations.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. SaveChanges — envelope-wrapped response; the saved employee's ID is carried in Data
export const saveEmployeeChanges = createAsyncThunk<
    SaveEmployeeChangesResult,
    SaveEmployeeChangesParams,
    { state: RootState; rejectValue: string }
>(
    "employee/saveEmployeeChanges",
    async ({ payload, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Employee/SaveChanges`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(resolvedCompanyId),
                    "x-finyear-id": String(resolvedFinYearId),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<number> = await response.json();

            if (json.Server?.Success) {
                return { id: json.Server.Data, messageId: json.Server.MessageId };
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to save employee.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. GetEmployeeById — envelope-wrapped single-record response with nested department/designation
export const fetchEmployeeById = createAsyncThunk<
    EmployeeDetail,
    FetchEmployeeByIdParams,
    { state: RootState; rejectValue: string }
>(
    "employee/fetchEmployeeById",
    async ({ employeeId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Employee/GetEmployeeById?employeeId=${employeeId}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(resolvedCompanyId),
                    "x-finyear-id": String(resolvedFinYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ApiResponseWrapper<EmployeeDetail> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch employee.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. DeleteEmployee — plain numeric response (not envelope-wrapped); 0 on success
export const deleteEmployee = createAsyncThunk<
    DeleteEmployeeResult,
    DeleteEmployeeParams,
    { state: RootState; rejectValue: string }
>(
    "employee/deleteEmployee",
    async ({ id, modUserId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedModUserId = modUserId ?? getUserId(getState());
        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Employee/DeleteEmployee?ID=${id}&ModUserID=${resolvedModUserId}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(resolvedCompanyId),
                    "x-finyear-id": String(resolvedFinYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // ⚠️ This endpoint returns a bare number (e.g. 0), not the usual
            // ApiResponseWrapper envelope. Treat any successful HTTP response as
            // success; adjust here if a nonzero value actually signals failure.
            const raw = await response.json();

            return { id, raw: Number(raw) };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const employeeSlice = createSlice({
    name: "employee",
    initialState,
    reducers: {
        clearEmployeeList(state) {
            state.employeeList = [];
            state.employeeListError = null;
        },
        clearEmployeeDetail(state) {
            state.employeeDetail = null;
            state.employeeDetailError = null;
        },
        clearEmployeeDeleteResult(state) {
            state.employeeDeleteResult = null;
            state.employeeDeleteError = null;
        },
        clearDepartmentStartWithList(state) {
            state.departmentStartWithList = [];
            state.departmentStartWithError = null;
        },
        clearDesignationStartWithList(state) {
            state.designationStartWithList = [];
            state.designationStartWithError = null;
        },
        clearEmployeeSaveResult(state) {
            state.employeeSaveResult = null;
            state.employeeSaveError = null;
        },
        resetEmployee() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetEmployeeList
            .addCase(fetchEmployeeList.pending, (state) => {
                state.employeeListLoading = true;
                state.employeeListError = null;
            })
            .addCase(fetchEmployeeList.fulfilled, (state, action) => {
                state.employeeListLoading = false;
                state.employeeList = action.payload;
            })
            .addCase(fetchEmployeeList.rejected, (state, action) => {
                state.employeeListLoading = false;
                state.employeeListError = action.payload ?? "Unknown error";
            })
            // GetDepartmentStartWith
            .addCase(fetchDepartmentStartWith.pending, (state) => {
                state.departmentStartWithLoading = true;
                state.departmentStartWithError = null;
            })
            .addCase(fetchDepartmentStartWith.fulfilled, (state, action) => {
                state.departmentStartWithLoading = false;
                state.departmentStartWithList = action.payload;
            })
            .addCase(fetchDepartmentStartWith.rejected, (state, action) => {
                state.departmentStartWithLoading = false;
                state.departmentStartWithError = action.payload ?? "Unknown error";
            })
            // GetDesignationStartWith
            .addCase(fetchDesignationStartWith.pending, (state) => {
                state.designationStartWithLoading = true;
                state.designationStartWithError = null;
            })
            .addCase(fetchDesignationStartWith.fulfilled, (state, action) => {
                state.designationStartWithLoading = false;
                state.designationStartWithList = action.payload;
            })
            .addCase(fetchDesignationStartWith.rejected, (state, action) => {
                state.designationStartWithLoading = false;
                state.designationStartWithError = action.payload ?? "Unknown error";
            })
            // SaveChanges
            .addCase(saveEmployeeChanges.pending, (state) => {
                state.employeeSaveLoading = true;
                state.employeeSaveError = null;
            })
            .addCase(saveEmployeeChanges.fulfilled, (state, action) => {
                state.employeeSaveLoading = false;
                state.employeeSaveResult = action.payload;
            })
            .addCase(saveEmployeeChanges.rejected, (state, action) => {
                state.employeeSaveLoading = false;
                state.employeeSaveError = action.payload ?? "Unknown error";
            })
            // GetEmployeeById
            .addCase(fetchEmployeeById.pending, (state) => {
                state.employeeDetailLoading = true;
                state.employeeDetailError = null;
            })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.employeeDetailLoading = false;
                state.employeeDetail = action.payload;
            })
            .addCase(fetchEmployeeById.rejected, (state, action) => {
                state.employeeDetailLoading = false;
                state.employeeDetailError = action.payload ?? "Unknown error";
            })
            // DeleteEmployee
            .addCase(deleteEmployee.pending, (state) => {
                state.employeeDeleteLoading = true;
                state.employeeDeleteError = null;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.employeeDeleteLoading = false;
                state.employeeDeleteResult = action.payload;
                // Optimistically drop the deleted row from the already-loaded list.
                state.employeeList = state.employeeList.filter(
                    (e) => e.EmployeeID !== action.payload.id
                );
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.employeeDeleteLoading = false;
                state.employeeDeleteError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearEmployeeList,
    clearEmployeeDetail,
    clearEmployeeDeleteResult,
    clearDepartmentStartWithList,
    clearDesignationStartWithList,
    clearEmployeeSaveResult,
    resetEmployee,
} = employeeSlice.actions;

export default employeeSlice.reducer;