import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /AccountGroup/GetAccountGroupList?currentPage=&rowsPerPage=&searchStr=
// Server envelope response; the list lives in Server.Data
export interface AccountGroupItem {
    GroupID: number;
    GroupName: string;
    MajorGroupName: string;
}

interface AccountGroupListEnvelope {
    Server: {
        Success: boolean;
        Message: string | null;
        MessageId: string | null;
        Data: AccountGroupItem[] | null;
        Id: number;
        Info: unknown;
        Approve: unknown;
    };
}

// GET /AccountGroup/GetMajorGroupStartWith?startWith=
// Returns a flat array (no Server envelope wrapper) — for the Major Group combobox
export interface MajorGroupOption {
    MajorGroupName: string;
    MajorGroupID: number;
}

// GET /AccountGroup/GetAccLinkGroupStartWith?MajorGroupID=&startWith=
// Returns a flat array (no Server envelope wrapper) — for the Link Group combobox,
// scoped to the account groups under the selected major group
export interface AccLinkGroupOption {
    GroupName: string;
    GroupID: number;
}

// GET /AccountGroup/GetDuplication?GroupName=&GroupID=
// Returns a plain number (no envelope): 0 = not a duplicate, 1 = duplicate

// POST /AccountGroup/CreateNewAccGroup
// Body is the new account group; returns a plain string ("OK") on success
export interface CreateAccGroupPayload {
    Active: boolean;
    Common: boolean;
    GroupID: number;
    GroupName: string;
    LinkGroupID: number;
    LinkGroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
}

// GET /AccountGroup/GetAccGroup?AccGroupID=
// Returns a flat array (no Server envelope wrapper) with a single full account
// group record — used to populate the edit form
export interface AccGroupDetail {
    LinkGroupName: string;
    GroupID: number;
    GroupName: string;
    MajorGroupName: string;
    MajorGroupID: number;
    LinkGroupID: number;
    PLSortOrder: number | null;
    Common: boolean;
    Active: boolean;
}

// POST /AccountGroup/UpdateAccGroup
// Body is the edited account group; server returns an empty body on success
export type UpdateAccGroupPayload = AccGroupDetail;

// GET /AccountGroup/DeleteGrpYN?ID=
// Returns a plain number (no envelope): 1 = deletion is allowed, 0 = not
// allowed (e.g. the group is in use elsewhere) — checked before DeleteAccGroup

// POST /AccountGroup/DeleteAccGroup?AccGroupID=
// Returns a plain number (no envelope); the server doesn't document the
// success/failure meaning of the value itself, so a successful HTTP response
// is treated as the delete having gone through

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchAccountGroupsParams {
    currentPage?: number;          // default 1
    rowsPerPage?: number;          // default 25
    searchStr?: string;            // default "" (returns all account groups)
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchMajorGroupOptionsParams {
    startWith?: string;            // default "" (returns all major groups)
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchAccLinkGroupOptionsParams {
    majorGroupId: number;
    startWith?: string;            // default "" (returns all account groups under that major group)
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface CheckGroupNameDuplicationParams {
    groupName: string;
    groupId?: number;              // default 0 (new group)
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchAccGroupParams {
    accGroupId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface CheckDeleteAccGroupAllowedParams {
    groupId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface DeleteAccGroupParams {
    accGroupId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface AccountGroupState {
    accountGroupList: AccountGroupItem[];
    accountGroupListLoading: boolean;
    accountGroupListError: string | null;
    accountGroupListCurrentPage: number;
    accountGroupListRowsPerPage: number;
    accountGroupListSearchStr: string;

    majorGroupOptions: MajorGroupOption[];
    majorGroupOptionsLoading: boolean;
    majorGroupOptionsError: string | null;

    accLinkGroupOptions: AccLinkGroupOption[];
    accLinkGroupOptionsLoading: boolean;
    accLinkGroupOptionsError: string | null;

    isDuplicateGroupName: boolean | null;
    duplicationCheckLoading: boolean;
    duplicationCheckError: string | null;

    createAccountGroupLoading: boolean;
    createAccountGroupError: string | null;
    createAccountGroupSuccess: boolean;

    accGroupDetail: AccGroupDetail | null;
    accGroupDetailLoading: boolean;
    accGroupDetailError: string | null;

    updateAccountGroupLoading: boolean;
    updateAccountGroupError: string | null;
    updateAccountGroupSuccess: boolean;

    isDeleteAllowed: boolean | null;
    checkDeleteAllowedLoading: boolean;
    checkDeleteAllowedError: string | null;

    deleteAccountGroupLoading: boolean;
    deleteAccountGroupError: string | null;
    deleteAccountGroupSuccess: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AccountGroupState = {
    accountGroupList: [],
    accountGroupListLoading: false,
    accountGroupListError: null,
    accountGroupListCurrentPage: 1,
    accountGroupListRowsPerPage: 25,
    accountGroupListSearchStr: "",

    majorGroupOptions: [],
    majorGroupOptionsLoading: false,
    majorGroupOptionsError: null,

    accLinkGroupOptions: [],
    accLinkGroupOptionsLoading: false,
    accLinkGroupOptionsError: null,

    isDuplicateGroupName: null,
    duplicationCheckLoading: false,
    duplicationCheckError: null,

    createAccountGroupLoading: false,
    createAccountGroupError: null,
    createAccountGroupSuccess: false,

    accGroupDetail: null,
    accGroupDetailLoading: false,
    accGroupDetailError: null,

    updateAccountGroupLoading: false,
    updateAccountGroupError: null,
    updateAccountGroupSuccess: false,

    isDeleteAllowed: null,
    checkDeleteAllowedLoading: false,
    checkDeleteAllowedError: null,

    deleteAccountGroupLoading: false,
    deleteAccountGroupError: null,
    deleteAccountGroupSuccess: false,
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

// 1. GetAccountGroupList — Server envelope response; the list lives in Server.Data
export const fetchAccountGroups = createAsyncThunk<
    { data: AccountGroupItem[]; currentPage: number; rowsPerPage: number; searchStr: string },
    FetchAccountGroupsParams | void,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/fetchAccountGroups",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const currentPage = params?.currentPage ?? 1;
        const rowsPerPage = params?.rowsPerPage ?? 25;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/GetAccountGroupList?currentPage=${currentPage}&rowsPerPage=${rowsPerPage}&searchStr=${encodeURIComponent(
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

            const json: AccountGroupListEnvelope = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message || "Failed to load account groups");
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

// 2. GetMajorGroupStartWith — flat array response (no envelope)
export const fetchMajorGroupOptions = createAsyncThunk<
    MajorGroupOption[],
    FetchMajorGroupOptionsParams | void,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/fetchMajorGroupOptions",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/GetMajorGroupStartWith?startWith=${encodeURIComponent(
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

            const json: MajorGroupOption[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetAccLinkGroupStartWith — flat array response (no envelope); scoped to a major group
export const fetchAccLinkGroupOptions = createAsyncThunk<
    AccLinkGroupOption[],
    FetchAccLinkGroupOptionsParams,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/fetchAccLinkGroupOptions",
    async ({ majorGroupId, startWith, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedStartWith = startWith ?? "";
        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/GetAccLinkGroupStartWith?MajorGroupID=${majorGroupId}&startWith=${encodeURIComponent(
                resolvedStartWith
            )}`;

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

            const json: AccLinkGroupOption[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetDuplication — plain number response (no envelope): 0 = not duplicate, 1 = duplicate
export const checkAccGroupNameDuplication = createAsyncThunk<
    boolean,
    CheckGroupNameDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/checkAccGroupNameDuplication",
    async ({ groupName, groupId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedGroupId = groupId ?? 0;
        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/GetDuplication?GroupName=${encodeURIComponent(
                groupName
            )}&GroupID=${resolvedGroupId}`;

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

            return Number(text) === 1;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. CreateNewAccGroup — plain string response ("OK") on success
export const createAccountGroup = createAsyncThunk<
    string,
    CreateAccGroupPayload,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/createAccountGroup",
    async (payload, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(getState());
        const finYearId = getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/CreateNewAccGroup`;

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

            const text = (await response.text()).trim();

            if (text !== "OK") {
                throw new Error(text || "Failed to create account group");
            }

            return text;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. GetAccGroup — flat array response (no envelope); single-item array with the
// full record for the requested GroupID, used to populate the edit form
export const fetchAccGroup = createAsyncThunk<
    AccGroupDetail | null,
    FetchAccGroupParams,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/fetchAccGroup",
    async ({ accGroupId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/GetAccGroup?AccGroupID=${accGroupId}`;

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

            const json: AccGroupDetail[] = await response.json();

            return json?.[0] ?? null;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 7. UpdateAccGroup — POST; server returns an empty body on success (no "OK" text)
export const updateAccountGroup = createAsyncThunk<
    void,
    UpdateAccGroupPayload,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/updateAccountGroup",
    async (payload, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = getCompanyId(getState());
        const finYearId = getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/UpdateAccGroup`;

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
            await response.text();
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 8. DeleteGrpYN — plain number response (no envelope): 1 = deletion allowed,
// 0 = not allowed. Same plain-number style as GetDuplication.
export const checkDeleteAccGroupAllowed = createAsyncThunk<
    boolean,
    CheckDeleteAccGroupAllowedParams,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/checkDeleteAccGroupAllowed",
    async ({ groupId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/DeleteGrpYN?ID=${groupId}`;

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

            return Number(text) === 1;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 9. DeleteAccGroup — POST; plain number response. The server doesn't
// document what the number itself means, so success is determined purely by
// the HTTP response being ok (same treatment as UpdateAccGroup's empty body).
export const deleteAccountGroup = createAsyncThunk<
    number,
    DeleteAccGroupParams,
    { state: RootState; rejectValue: string }
>(
    "accountGroup/deleteAccountGroup",
    async ({ accGroupId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/AccountGroup/DeleteAccGroup?AccGroupID=${accGroupId}`;

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

            return Number(text);
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const accountGroupSlice = createSlice({
    name: "accountGroup",
    initialState,
    reducers: {
        clearAccountGroupList(state) {
            state.accountGroupList = [];
            state.accountGroupListError = null;
        },
        clearMajorGroupOptions(state) {
            state.majorGroupOptions = [];
            state.majorGroupOptionsError = null;
        },
        clearAccLinkGroupOptions(state) {
            state.accLinkGroupOptions = [];
            state.accLinkGroupOptionsError = null;
        },
        clearDuplicationCheck(state) {
            state.isDuplicateGroupName = null;
            state.duplicationCheckError = null;
        },
        clearCreateAccountGroupStatus(state) {
            state.createAccountGroupError = null;
            state.createAccountGroupSuccess = false;
        },
        clearAccGroupDetail(state) {
            state.accGroupDetail = null;
            state.accGroupDetailError = null;
        },
        clearUpdateAccountGroupStatus(state) {
            state.updateAccountGroupError = null;
            state.updateAccountGroupSuccess = false;
        },
        clearDeleteAllowedCheck(state) {
            state.isDeleteAllowed = null;
            state.checkDeleteAllowedError = null;
        },
        clearDeleteAccountGroupStatus(state) {
            state.deleteAccountGroupError = null;
            state.deleteAccountGroupSuccess = false;
        },
        resetAccountGroup() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAccountGroupList
            .addCase(fetchAccountGroups.pending, (state) => {
                state.accountGroupListLoading = true;
                state.accountGroupListError = null;
            })
            .addCase(fetchAccountGroups.fulfilled, (state, action) => {
                state.accountGroupListLoading = false;
                state.accountGroupList = action.payload.data;
                state.accountGroupListCurrentPage = action.payload.currentPage;
                state.accountGroupListRowsPerPage = action.payload.rowsPerPage;
                state.accountGroupListSearchStr = action.payload.searchStr;
            })
            .addCase(fetchAccountGroups.rejected, (state, action) => {
                state.accountGroupListLoading = false;
                state.accountGroupListError = action.payload ?? "Unknown error";
            })
            // GetMajorGroupStartWith
            .addCase(fetchMajorGroupOptions.pending, (state) => {
                state.majorGroupOptionsLoading = true;
                state.majorGroupOptionsError = null;
            })
            .addCase(fetchMajorGroupOptions.fulfilled, (state, action) => {
                state.majorGroupOptionsLoading = false;
                state.majorGroupOptions = action.payload;
            })
            .addCase(fetchMajorGroupOptions.rejected, (state, action) => {
                state.majorGroupOptionsLoading = false;
                state.majorGroupOptionsError = action.payload ?? "Unknown error";
            })
            // GetAccLinkGroupStartWith
            .addCase(fetchAccLinkGroupOptions.pending, (state) => {
                state.accLinkGroupOptionsLoading = true;
                state.accLinkGroupOptionsError = null;
            })
            .addCase(fetchAccLinkGroupOptions.fulfilled, (state, action) => {
                state.accLinkGroupOptionsLoading = false;
                state.accLinkGroupOptions = action.payload;
            })
            .addCase(fetchAccLinkGroupOptions.rejected, (state, action) => {
                state.accLinkGroupOptionsLoading = false;
                state.accLinkGroupOptionsError = action.payload ?? "Unknown error";
            })
            // GetDuplication
            .addCase(checkAccGroupNameDuplication.pending, (state) => {
                state.duplicationCheckLoading = true;
                state.duplicationCheckError = null;
            })
            .addCase(checkAccGroupNameDuplication.fulfilled, (state, action) => {
                state.duplicationCheckLoading = false;
                state.isDuplicateGroupName = action.payload;
            })
            .addCase(checkAccGroupNameDuplication.rejected, (state, action) => {
                state.duplicationCheckLoading = false;
                state.duplicationCheckError = action.payload ?? "Unknown error";
            })
            // CreateNewAccGroup
            .addCase(createAccountGroup.pending, (state) => {
                state.createAccountGroupLoading = true;
                state.createAccountGroupError = null;
                state.createAccountGroupSuccess = false;
            })
            .addCase(createAccountGroup.fulfilled, (state) => {
                state.createAccountGroupLoading = false;
                state.createAccountGroupSuccess = true;
            })
            .addCase(createAccountGroup.rejected, (state, action) => {
                state.createAccountGroupLoading = false;
                state.createAccountGroupError = action.payload ?? "Unknown error";
            })
            // GetAccGroup
            .addCase(fetchAccGroup.pending, (state) => {
                state.accGroupDetailLoading = true;
                state.accGroupDetailError = null;
            })
            .addCase(fetchAccGroup.fulfilled, (state, action) => {
                state.accGroupDetailLoading = false;
                state.accGroupDetail = action.payload;
            })
            .addCase(fetchAccGroup.rejected, (state, action) => {
                state.accGroupDetailLoading = false;
                state.accGroupDetailError = action.payload ?? "Unknown error";
            })
            // UpdateAccGroup
            .addCase(updateAccountGroup.pending, (state) => {
                state.updateAccountGroupLoading = true;
                state.updateAccountGroupError = null;
                state.updateAccountGroupSuccess = false;
            })
            .addCase(updateAccountGroup.fulfilled, (state) => {
                state.updateAccountGroupLoading = false;
                state.updateAccountGroupSuccess = true;
            })
            .addCase(updateAccountGroup.rejected, (state, action) => {
                state.updateAccountGroupLoading = false;
                state.updateAccountGroupError = action.payload ?? "Unknown error";
            })
            // DeleteGrpYN
            .addCase(checkDeleteAccGroupAllowed.pending, (state) => {
                state.checkDeleteAllowedLoading = true;
                state.checkDeleteAllowedError = null;
            })
            .addCase(checkDeleteAccGroupAllowed.fulfilled, (state, action) => {
                state.checkDeleteAllowedLoading = false;
                state.isDeleteAllowed = action.payload;
            })
            .addCase(checkDeleteAccGroupAllowed.rejected, (state, action) => {
                state.checkDeleteAllowedLoading = false;
                state.checkDeleteAllowedError = action.payload ?? "Unknown error";
            })
            // DeleteAccGroup
            .addCase(deleteAccountGroup.pending, (state) => {
                state.deleteAccountGroupLoading = true;
                state.deleteAccountGroupError = null;
                state.deleteAccountGroupSuccess = false;
            })
            .addCase(deleteAccountGroup.fulfilled, (state) => {
                state.deleteAccountGroupLoading = false;
                state.deleteAccountGroupSuccess = true;
            })
            .addCase(deleteAccountGroup.rejected, (state, action) => {
                state.deleteAccountGroupLoading = false;
                state.deleteAccountGroupError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearAccountGroupList,
    clearMajorGroupOptions,
    clearAccLinkGroupOptions,
    clearDuplicationCheck,
    clearCreateAccountGroupStatus,
    clearAccGroupDetail,
    clearUpdateAccountGroupStatus,
    clearDeleteAllowedCheck,
    clearDeleteAccountGroupStatus,
    resetAccountGroup,
} = accountGroupSlice.actions;

export default accountGroupSlice.reducer;
