import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /AccountHead/GetAccountHeadList?currentPage=&rowsPerPage=&searchStr=
// Server envelope response; the list lives in Server.Data
export interface AccountHeadItem {
    HeadID: number;
    HeadCode: string | null;
    HeadName: string | null;
    GroupID: number;
    GroupName: string;
    Active: string; // "Active" | "Inactive"
}

interface AccountHeadListEnvelope {
    Server: {
        Success: boolean;
        Message: string | null;
        MessageId: string | null;
        Data: AccountHeadItem[] | null;
        Id: number;
        Info: unknown;
        Approve: unknown;
    };
}

// GET /AccountGroup/GetAccGroupStartWith?startWith=
// Returns a flat array (no Server envelope wrapper) — for the Account Group combobox
export interface AccGroupOption {
    GroupName: string;
    GroupID: number;
}

// GET /AccountHead/GetAcMajorGrpForAcGroup?GroupID=
// Returns a flat array (no Server envelope wrapper) with a single item — the
// Major Group that the selected Account Group belongs to, used to auto-fill
// the (read-only) Major Group field once an Account Group is chosen
export interface AcMajorGroupOption {
    MajorGroupName: string;
    MajorGroupID: number;
}

// GET /AccountHead/GetDuplication?HeadName=&HeadCode=&HeadID=
// Returns a plain boolean (no envelope): true = duplicate, false = not a duplicate

// POST /AccountHead/CreateNewAccHead
// Body is the new account head; server responds with the standard Server envelope
export interface CreateAccHeadPayload {
    Active: boolean;
    Common: boolean;
    DrOrCr: "Dr" | "Cr";
    GroupID: number;
    GroupName: string;
    HeadCode: string;
    HeadID: number;
    HeadName: string;
    MajorGroupID: number;
    MajorGroupName: string;
}

interface CreateAccHeadEnvelope {
    Server: {
        Success: boolean;
        Message: string | null;
        MessageId: string | null;
        Data: unknown;
        Id: number;
        Info: unknown;
        Approve: unknown;
    };
}

// GET /AccountHead/GetAccHead?AccHeadID=
// Returns a flat array (no Server envelope wrapper) with a single item — the
// full account head detail, used to populate the edit form
export interface AccountHeadDetail {
    HeadID: number;
    HeadCode: string;
    HeadName: string;
    GroupID: number;
    GroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
    Active: boolean;
    Common: boolean;
    OpBalance: number;
    DrOrCr: string; // "Dr" | "Cr" | ""
}

// POST /AccountHead/UpdateAccHead
// Body is the updated account head; server returns an empty response body on success (no envelope)
export interface UpdateAccHeadPayload {
    HeadID: number;
    HeadCode: string;
    HeadName: string;
    GroupID: number;
    GroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
    Active: boolean;
    Common: boolean;
    OpBalance: number;
    DrOrCr: "Dr" | "Cr";
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchAccountHeadsParams {
    currentPage?: number;          // default 1
    rowsPerPage?: number;          // default 25
    searchStr?: string;            // default "" (returns all account heads)
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchAccGroupOptionsParams {
    startWith?: string;            // default "" (returns all account groups)
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchAcMajorGroupForGroupParams {
    groupId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchAccHeadParams {
    accHeadId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface CheckHeadNameDuplicationParams {
    headName: string;
    headCode?: string;             // default ""
    headId?: number;               // default 0 (new head)
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface CheckAccHeadDeletableParams {
    headId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface DeleteAccHeadParams {
    headId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface AccountHeadState {
    accountHeadList: AccountHeadItem[];
    accountHeadListLoading: boolean;
    accountHeadListError: string | null;
    accountHeadListCurrentPage: number;
    accountHeadListRowsPerPage: number;
    accountHeadListSearchStr: string;

    accGroupOptions: AccGroupOption[];
    accGroupOptionsLoading: boolean;
    accGroupOptionsError: string | null;

    acMajorGroupForGroup: AcMajorGroupOption | null;
    acMajorGroupForGroupLoading: boolean;
    acMajorGroupForGroupError: string | null;

    isDuplicateHeadName: boolean | null;
    duplicationCheckLoading: boolean;
    duplicationCheckError: string | null;

    createAccountHeadLoading: boolean;
    createAccountHeadError: string | null;
    createAccountHeadSuccess: boolean;

    accountHeadDetail: AccountHeadDetail | null;
    accountHeadDetailLoading: boolean;
    accountHeadDetailError: string | null;

    updateAccountHeadLoading: boolean;
    updateAccountHeadError: string | null;
    updateAccountHeadSuccess: boolean;

    canDeleteAccHead: boolean | null;
    checkAccHeadDeletableLoading: boolean;
    checkAccHeadDeletableError: string | null;

    deleteAccountHeadLoading: boolean;
    deleteAccountHeadError: string | null;
    deleteAccountHeadSuccess: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AccountHeadState = {
    accountHeadList: [],
    accountHeadListLoading: false,
    accountHeadListError: null,
    accountHeadListCurrentPage: 1,
    accountHeadListRowsPerPage: 25,
    accountHeadListSearchStr: "",

    accGroupOptions: [],
    accGroupOptionsLoading: false,
    accGroupOptionsError: null,

    acMajorGroupForGroup: null,
    acMajorGroupForGroupLoading: false,
    acMajorGroupForGroupError: null,

    isDuplicateHeadName: null,
    duplicationCheckLoading: false,
    duplicationCheckError: null,

    createAccountHeadLoading: false,
    createAccountHeadError: null,
    createAccountHeadSuccess: false,

    accountHeadDetail: null,
    accountHeadDetailLoading: false,
    accountHeadDetailError: null,

    updateAccountHeadLoading: false,
    updateAccountHeadError: null,
    updateAccountHeadSuccess: false,

    canDeleteAccHead: null,
    checkAccHeadDeletableLoading: false,
    checkAccHeadDeletableError: null,

    deleteAccountHeadLoading: false,
    deleteAccountHeadError: null,
    deleteAccountHeadSuccess: false,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    const authState = state as RootState;
    let token = (authState.auth as any)?.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

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

// ─── Thunks ───────────────────────────────────────────────────────────────────

// 1. GetAccountHeadList — Server envelope response; the list lives in Server.Data
export const fetchAccountHeads = createAsyncThunk<
    { data: AccountHeadItem[]; currentPage: number; rowsPerPage: number; searchStr: string },
    FetchAccountHeadsParams | void,
    { state: RootState; rejectValue: string }
>(
    "accountHead/fetchAccountHeads",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const currentPage = params?.currentPage ?? 1;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/GetAccountHeadList?currentPage=${currentPage}&rowsPerPage=${rowsPerPage}&searchStr=${encodeURIComponent(
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

            const json: AccountHeadListEnvelope = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message || "Failed to load account heads");
            }

            return {
                data: json.Server.Data ?? [],
                currentPage,
                rowsPerPage,
                searchStr,
            };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetAccGroupStartWith — flat array response (no envelope) — for the
// Account Group combobox
export const fetchAccGroupOptions = createAsyncThunk<
    AccGroupOption[],
    FetchAccGroupOptionsParams | void,
    { state: RootState; rejectValue: string }
>(
    "accountHead/fetchAccGroupOptions",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/GetAccGroupStartWith?startWith=${encodeURIComponent(
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

            const json: AccGroupOption[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetAcMajorGrpForAcGroup — flat array response (no envelope); single-item
// array with the Major Group that the given Account Group belongs to
export const fetchAcMajorGroupForGroup = createAsyncThunk<
    AcMajorGroupOption | null,
    FetchAcMajorGroupForGroupParams,
    { state: RootState; rejectValue: string }
>(
    "accountHead/fetchAcMajorGroupForGroup",
    async ({ groupId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/GetAcMajorGrpForAcGroup?GroupID=${groupId}`;

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

            const json: AcMajorGroupOption[] = await response.json();

            return json?.[0] ?? null;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetDuplication — plain boolean response (no envelope): true = duplicate
export const checkAccHeadNameDuplication = createAsyncThunk<
    boolean,
    CheckHeadNameDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "accountHead/checkAccHeadNameDuplication",
    async ({ headName, headCode, headId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedHeadCode = headCode ?? "";
        const resolvedHeadId = headId ?? 0;
        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/GetDuplication?HeadName=${encodeURIComponent(
                headName
            )}&HeadCode=${encodeURIComponent(resolvedHeadCode)}&HeadID=${resolvedHeadId}`;

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

            const text = (await response.text()).trim().toLowerCase();

            return text === "true";
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. CreateNewAccHead — POST; Server envelope response (Data is always null)
export const createAccountHead = createAsyncThunk<
    void,
    CreateAccHeadPayload,
    { state: RootState; rejectValue: string }
>(
    "accountHead/createAccountHead",
    async (payload, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(getState());
        const finYearId = getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/CreateNewAccHead`;

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

            const json: CreateAccHeadEnvelope = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message || "Failed to create account head");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. GetAccHead — flat array response (no envelope); single-item array with
// the full account head detail, used to populate the edit form
export const fetchAccountHead = createAsyncThunk<
    AccountHeadDetail | null,
    FetchAccHeadParams,
    { state: RootState; rejectValue: string }
>(
    "accountHead/fetchAccountHead",
    async ({ accHeadId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/GetAccHead?AccHeadID=${accHeadId}`;

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

            const json: AccountHeadDetail[] = await response.json();

            return json?.[0] ?? null;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 7. UpdateAccHead — POST; server returns an empty response body on success (no envelope to parse)
export const updateAccountHead = createAsyncThunk<
    void,
    UpdateAccHeadPayload,
    { state: RootState; rejectValue: string }
>(
    "accountHead/updateAccountHead",
    async (payload, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(getState());
        const finYearId = getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/UpdateAccHead`;

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

            // Server returns an empty body on success — nothing to parse
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 8. DeleteAccHeadYN — GET; plain "1"/"0" text response (no envelope):
// 1 = account head can be deleted, 0 = it's in use / cannot be deleted
export const checkAccHeadDeletable = createAsyncThunk<
    boolean,
    CheckAccHeadDeletableParams,
    { state: RootState; rejectValue: string }
>(
    "accountHead/checkAccHeadDeletable",
    async ({ headId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/DeleteAccHeadYN?ID=${headId}`;

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

            const text = (await response.text()).trim();

            return text === "1";
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 9. DeleteAccHead — GET; plain "1"/"0" text response (no envelope):
// 1 = deleted successfully, 0 = delete failed
export const deleteAccountHead = createAsyncThunk<
    boolean,
    DeleteAccHeadParams,
    { state: RootState; rejectValue: string }
>(
    "accountHead/deleteAccountHead",
    async ({ headId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/DeleteAccHead?HeadID=${headId}`;

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

            const text = (await response.text()).trim();

            if (text !== "1") {
                throw new Error("Unable to delete this account head");
            }

            return true;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const accountHeadSlice = createSlice({
    name: "accountHead",
    initialState,
    reducers: {
        clearAccountHeadList(state) {
            state.accountHeadList = [];
            state.accountHeadListError = null;
        },
        clearAccGroupOptions(state) {
            state.accGroupOptions = [];
            state.accGroupOptionsError = null;
        },
        clearAcMajorGroupForGroup(state) {
            state.acMajorGroupForGroup = null;
            state.acMajorGroupForGroupError = null;
        },
        clearDuplicationCheck(state) {
            state.isDuplicateHeadName = null;
            state.duplicationCheckError = null;
        },
        clearCreateAccountHeadStatus(state) {
            state.createAccountHeadError = null;
            state.createAccountHeadSuccess = false;
        },
        clearAccountHeadDetail(state) {
            state.accountHeadDetail = null;
            state.accountHeadDetailError = null;
        },
        clearUpdateAccountHeadStatus(state) {
            state.updateAccountHeadError = null;
            state.updateAccountHeadSuccess = false;
        },
        clearCheckAccHeadDeletableStatus(state) {
            state.canDeleteAccHead = null;
            state.checkAccHeadDeletableError = null;
        },
        clearDeleteAccountHeadStatus(state) {
            state.deleteAccountHeadError = null;
            state.deleteAccountHeadSuccess = false;
        },
        resetAccountHead() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAccountHeadList
            .addCase(fetchAccountHeads.pending, (state) => {
                state.accountHeadListLoading = true;
                state.accountHeadListError = null;
            })
            .addCase(fetchAccountHeads.fulfilled, (state, action) => {
                state.accountHeadListLoading = false;
                state.accountHeadList = action.payload.data;
                state.accountHeadListCurrentPage = action.payload.currentPage;
                state.accountHeadListRowsPerPage = action.payload.rowsPerPage;
                state.accountHeadListSearchStr = action.payload.searchStr;
            })
            .addCase(fetchAccountHeads.rejected, (state, action) => {
                state.accountHeadListLoading = false;
                state.accountHeadListError = action.payload ?? "Unknown error";
            })
            // GetAccGroupStartWith
            .addCase(fetchAccGroupOptions.pending, (state) => {
                state.accGroupOptionsLoading = true;
                state.accGroupOptionsError = null;
            })
            .addCase(fetchAccGroupOptions.fulfilled, (state, action) => {
                state.accGroupOptionsLoading = false;
                state.accGroupOptions = action.payload;
            })
            .addCase(fetchAccGroupOptions.rejected, (state, action) => {
                state.accGroupOptionsLoading = false;
                state.accGroupOptionsError = action.payload ?? "Unknown error";
            })
            // GetAcMajorGrpForAcGroup
            .addCase(fetchAcMajorGroupForGroup.pending, (state) => {
                state.acMajorGroupForGroupLoading = true;
                state.acMajorGroupForGroupError = null;
            })
            .addCase(fetchAcMajorGroupForGroup.fulfilled, (state, action) => {
                state.acMajorGroupForGroupLoading = false;
                state.acMajorGroupForGroup = action.payload;
            })
            .addCase(fetchAcMajorGroupForGroup.rejected, (state, action) => {
                state.acMajorGroupForGroupLoading = false;
                state.acMajorGroupForGroupError = action.payload ?? "Unknown error";
            })
            // GetDuplication
            .addCase(checkAccHeadNameDuplication.pending, (state) => {
                state.duplicationCheckLoading = true;
                state.duplicationCheckError = null;
            })
            .addCase(checkAccHeadNameDuplication.fulfilled, (state, action) => {
                state.duplicationCheckLoading = false;
                state.isDuplicateHeadName = action.payload;
            })
            .addCase(checkAccHeadNameDuplication.rejected, (state, action) => {
                state.duplicationCheckLoading = false;
                state.duplicationCheckError = action.payload ?? "Unknown error";
            })
            // CreateNewAccHead
            .addCase(createAccountHead.pending, (state) => {
                state.createAccountHeadLoading = true;
                state.createAccountHeadError = null;
                state.createAccountHeadSuccess = false;
            })
            .addCase(createAccountHead.fulfilled, (state) => {
                state.createAccountHeadLoading = false;
                state.createAccountHeadSuccess = true;
            })
            .addCase(createAccountHead.rejected, (state, action) => {
                state.createAccountHeadLoading = false;
                state.createAccountHeadError = action.payload ?? "Unknown error";
            })
            // GetAccHead
            .addCase(fetchAccountHead.pending, (state) => {
                state.accountHeadDetailLoading = true;
                state.accountHeadDetailError = null;
            })
            .addCase(fetchAccountHead.fulfilled, (state, action) => {
                state.accountHeadDetailLoading = false;
                state.accountHeadDetail = action.payload;
            })
            .addCase(fetchAccountHead.rejected, (state, action) => {
                state.accountHeadDetailLoading = false;
                state.accountHeadDetailError = action.payload ?? "Unknown error";
            })
            // UpdateAccHead
            .addCase(updateAccountHead.pending, (state) => {
                state.updateAccountHeadLoading = true;
                state.updateAccountHeadError = null;
                state.updateAccountHeadSuccess = false;
            })
            .addCase(updateAccountHead.fulfilled, (state) => {
                state.updateAccountHeadLoading = false;
                state.updateAccountHeadSuccess = true;
            })
            .addCase(updateAccountHead.rejected, (state, action) => {
                state.updateAccountHeadLoading = false;
                state.updateAccountHeadError = action.payload ?? "Unknown error";
            })
            // DeleteAccHeadYN
            .addCase(checkAccHeadDeletable.pending, (state) => {
                state.checkAccHeadDeletableLoading = true;
                state.checkAccHeadDeletableError = null;
            })
            .addCase(checkAccHeadDeletable.fulfilled, (state, action) => {
                state.checkAccHeadDeletableLoading = false;
                state.canDeleteAccHead = action.payload;
            })
            .addCase(checkAccHeadDeletable.rejected, (state, action) => {
                state.checkAccHeadDeletableLoading = false;
                state.checkAccHeadDeletableError = action.payload ?? "Unknown error";
            })
            // DeleteAccHead
            .addCase(deleteAccountHead.pending, (state) => {
                state.deleteAccountHeadLoading = true;
                state.deleteAccountHeadError = null;
                state.deleteAccountHeadSuccess = false;
            })
            .addCase(deleteAccountHead.fulfilled, (state, action) => {
                state.deleteAccountHeadLoading = false;
                state.deleteAccountHeadSuccess = true;
                // Remove the deleted head from the cached list, if present
                const deletedHeadId = action.meta.arg.headId;
                state.accountHeadList = state.accountHeadList.filter(
                    (head) => head.HeadID !== deletedHeadId
                );
            })
            .addCase(deleteAccountHead.rejected, (state, action) => {
                state.deleteAccountHeadLoading = false;
                state.deleteAccountHeadError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearAccountHeadList,
    clearAccGroupOptions,
    clearAcMajorGroupForGroup,
    clearDuplicationCheck,
    clearCreateAccountHeadStatus,
    clearAccountHeadDetail,
    clearUpdateAccountHeadStatus,
    clearCheckAccHeadDeletableStatus,
    clearDeleteAccountHeadStatus,
    resetAccountHead,
} = accountHeadSlice.actions;

export default accountHeadSlice.reducer;
