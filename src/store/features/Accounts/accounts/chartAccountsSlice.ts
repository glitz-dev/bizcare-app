import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MajorGroupItem {
    id: number;
    title: string;
    IsGroup: boolean;
    items: MajorGroupItem[];
}

export interface FetchMajorGroupAndGroupsParams {
    companyId?: number;
    finYearId?: number;
}

export interface AcMajorGrpForAcGroupItem {
    MajorGroupName: string;
    MajorGroupID: number;
}

export interface FetchAcMajorGrpForAcGroupParams {
    groupId: number;
    majorGroupId: number;
    companyId?: number;
    finYearId?: number;
}

export interface AccHeadForOpeningItem {
    HeadID: number;
    HeadCode: string | null;
    HeadName: string;
    GroupID: number;
    GroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
    CreditAmount: number;
    DebitAmount: number;
    CurDebitAmount: string;
    CurCreditAmount: string;
    FinYearID: number;
    FinyearName: string;
    Code: string;
    OpBalEdit: boolean;
    TotalRowCount: number;
}

export interface FetchAccHeadsForOpeningParams {
    groupId: number;
    majorGrpId: number;
    pageSize: number;
    page: number;
    companyId?: number;
    finYearId?: number;
}

export interface AccountHeadDetailItem {
    HeadID: number;
    HeadCode: string | null;
    HeadName: string;
    GroupID: number;
    GroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
    Active: boolean;
    Common: boolean;
    OpBalance: number;
    DrOrCr: string;
}

export interface FetchAccHeadParams {
    headId: number;
    companyId?: number;
    finYearId?: number;
}

export interface CheckGroupDuplicationParams {
    groupName: string;
    groupId?: number;
    companyId?: number;
    finYearId?: number;
}

export interface CreateAccountGroupParams {
    GroupID: number;
    GroupName: string;
    LinkGroupID: number;
    LinkGroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
    PLSortOrder: number;
    SelGroupID: number;
    SelGroupName: string;
    companyId?: number;
    finYearId?: number;
}

export interface UpdateAccountGroupParams {
    GroupID: number;
    GroupName: string;
    LinkGroupID: number;
    LinkGroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
    PLSortOrder: number;
    SelGroupID: number;
    SelGroupName: string;
    Active: boolean;
    Common: boolean;
    companyId?: number;
    finYearId?: number;
}

export interface ServerResponse<T> {
    Server: {
        Success: boolean;
        Message: string | null;
        MessageId: string | null;
        Data: T;
        Id: number;
        Info: string | null;
        Approve: boolean | null;
    };
}

export interface CreateAccountHeadParams {
    HeadID: number;
    HeadCode: string;
    HeadName: string;
    GroupID: number;
    GroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
    SelGroupID: number;
    SelGroupName: string;
    OpBalance: number;
    DrOrCr: "Dr" | "Cr";
    Active: boolean;
    Common: boolean;
    companyId?: number;
    finYearId?: number;
}

export interface UpdateAccountHeadParams {
    HeadID: number;
    HeadCode: string | null;
    HeadName: string;
    GroupID: number;
    GroupName: string;
    MajorGroupID: number;
    MajorGroupName: string;
    OpBalance: number;
    DrOrCr: "Dr" | "Cr" | "";
    Active: boolean;
    Common: boolean;
    companyId?: number;
    finYearId?: number;
}

export interface CheckAccountHeadDuplicationParams {
    headName: string;
    headCode: string;
    headId?: number;
    companyId?: number;
    finYearId?: number;
}

export interface DeleteAccountGroupParams {
    groupId: number;
    companyId?: number;
    finYearId?: number;
}

export interface DeleteAccountHeadParams {
    headId: number;
    companyId?: number;
    finYearId?: number;
}

export interface IsUsedAccHeadParams {
    headId: number;
    companyId?: number;
    finYearId?: number;
}

export interface RemoveAccountHeadParams {
    headId: number;
    companyId?: number;
    finYearId?: number;
}

export interface AccGroupStartWithItem {
    GroupName: string;
    GroupID: number;
}

export interface FetchAccGroupStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

export interface MajorGroupStartWithItem {
    MajorGroupName: string;
    MajorGroupID: number;
}

export interface FetchMajorGroupStartWithParams {
    startWith?: string;
    companyId?: number;
    finYearId?: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface ChartAccountState {
    majorGroupList: MajorGroupItem[];
    majorGroupLoading: boolean;
    majorGroupError: string | null;
    acMajorGrpForGroupList: AcMajorGrpForAcGroupItem[];
    acMajorGrpForGroupLoading: boolean;
    acMajorGrpForGroupError: string | null;
    accHeadsForOpeningList: AccHeadForOpeningItem[];
    accHeadsForOpeningLoading: boolean;
    accHeadsForOpeningError: string | null;
    accHeadsForOpeningTotalCount: number;
    groupDuplicationCount: number | null;
    groupDuplicationLoading: boolean;
    groupDuplicationError: string | null;
    createAccountGroupLoading: boolean;
    createAccountGroupError: string | null;
    updateAccountGroupLoading: boolean;
    updateAccountGroupError: string | null;
    createAccountHeadLoading: boolean;
    createAccountHeadError: string | null;
    updateAccountHeadLoading: boolean;
    updateAccountHeadError: string | null;
    headDuplicationExists: boolean | null;
    headDuplicationLoading: boolean;
    headDuplicationError: string | null;
    deleteAccountGroupLoading: boolean;
    deleteAccountGroupError: string | null;
    deleteAccountGroupResult: number | null;
    deleteAccountHeadLoading: boolean;
    deleteAccountHeadError: string | null;
    deleteAccountHeadResult: number | null;
    isUsedAccHeadLoading: boolean;
    isUsedAccHeadError: string | null;
    isUsedAccHeadResult: number | null;
    removeAccountHeadLoading: boolean;
    removeAccountHeadError: string | null;
    removeAccountHeadResult: number | null;
    accGroupStartWithList: AccGroupStartWithItem[];
    accGroupStartWithLoading: boolean;
    accGroupStartWithError: string | null;
    majorGroupStartWithList: MajorGroupStartWithItem[];
    majorGroupStartWithLoading: boolean;
    majorGroupStartWithError: string | null;
    accHeadDetail: AccountHeadDetailItem | null;
    accHeadDetailLoading: boolean;
    accHeadDetailError: string | null;
}

const initialState: ChartAccountState = {
    majorGroupList: [],
    majorGroupLoading: false,
    majorGroupError: null,
    acMajorGrpForGroupList: [],
    acMajorGrpForGroupLoading: false,
    acMajorGrpForGroupError: null,
    accHeadsForOpeningList: [],
    accHeadsForOpeningLoading: false,
    accHeadsForOpeningError: null,
    accHeadsForOpeningTotalCount: 0,
    groupDuplicationCount: null,
    groupDuplicationLoading: false,
    groupDuplicationError: null,
    createAccountGroupLoading: false,
    createAccountGroupError: null,
    updateAccountGroupLoading: false,
    updateAccountGroupError: null,
    createAccountHeadLoading: false,
    createAccountHeadError: null,
    updateAccountHeadLoading: false,
    updateAccountHeadError: null,
    headDuplicationExists: null,
    headDuplicationLoading: false,
    headDuplicationError: null,
    deleteAccountGroupLoading: false,
    deleteAccountGroupError: null,
    deleteAccountGroupResult: null,
    deleteAccountHeadLoading: false,
    deleteAccountHeadError: null,
    deleteAccountHeadResult: null,
    isUsedAccHeadLoading: false,
    isUsedAccHeadError: null,
    isUsedAccHeadResult: null,
    removeAccountHeadLoading: false,
    removeAccountHeadError: null,
    removeAccountHeadResult: null,
    accGroupStartWithList: [],
    accGroupStartWithLoading: false,
    accGroupStartWithError: null,
    majorGroupStartWithList: [],
    majorGroupStartWithLoading: false,
    majorGroupStartWithError: null,
    accHeadDetail: null,
    accHeadDetailLoading: false,
    accHeadDetailError: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

interface AuthState {
    userData?: {
        token?: string | null;
    };
}

const getCleanToken = (state: RootState): string | null => {
    const authState = (state as unknown as { auth?: AuthState }).auth;
    let token = authState?.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Thunk ────────────────────────────────────────────────────────────────────

export const fetchMajorGroupAndGroups = createAsyncThunk<
    MajorGroupItem[],
    FetchMajorGroupAndGroupsParams | void,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/fetchMajorGroupAndGroups",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/AccountHead/GetMajorGroupAndGroups",
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

            const json: MajorGroupItem[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAcMajorGrpForAcGroup = createAsyncThunk<
    AcMajorGrpForAcGroupItem[],
    FetchAcMajorGrpForAcGroupParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/fetchAcMajorGrpForAcGroup",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountHead/GetAcMajorGrpForAcGroup?GroupID=${params.groupId}&MajorGroupID=${params.majorGroupId}`,
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

            const json: AcMajorGrpForAcGroupItem[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccHeadsForOpening = createAsyncThunk<
    AccHeadForOpeningItem[],
    FetchAccHeadsForOpeningParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/fetchAccHeadsForOpening",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountHead/GetAccHeadsForOpening?GroupID=${params.groupId}&MajorGrpID=${params.majorGrpId}&pageSize=${params.pageSize}&page=${params.page}`,
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

            const json: AccHeadForOpeningItem[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const checkGroupDuplication = createAsyncThunk<
    number,
    CheckGroupDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/checkGroupDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const groupId = params.groupId ?? 0;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountGroup/GetDuplication?GroupName=${encodeURIComponent(
                    params.groupName
                )}&GroupID=${groupId}`,
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

            const json: number = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const createAccountGroup = createAsyncThunk<
    string,
    CreateAccountGroupParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/createAccountGroup",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { companyId, finYearId, ...payload } = params;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/AccountGroup/CreateNewAccGroup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId ?? 1),
                        "x-finyear-id": String(finYearId ?? 2),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // API returns a plain-text body (e.g. "OK"), not JSON
            const text = await response.text();
            return text;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const updateAccountGroup = createAsyncThunk<
    void,
    UpdateAccountGroupParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/updateAccountGroup",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { companyId, finYearId, ...payload } = params;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/AccountGroup/UpdateAccGroup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId ?? 1),
                        "x-finyear-id": String(finYearId ?? 2),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // No response body for this api (rename only)
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const createAccountHead = createAsyncThunk<
    ServerResponse<null>,
    CreateAccountHeadParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/createAccountHead",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { companyId, finYearId, ...payload } = params;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/AccountHead/CreateNewAccHead",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId ?? 1),
                        "x-finyear-id": String(finYearId ?? 2),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: ServerResponse<null> = await response.json();

            if (!json.Server?.Success) {
                return rejectWithValue(json.Server?.Message || "Failed to create account head.");
            }

            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const updateAccountHead = createAsyncThunk<
    void,
    UpdateAccountHeadParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/updateAccountHead",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const { companyId, finYearId, ...payload } = params;

        try {
            const response = await fetch(
                "https://erp.glitzit.com/service/api/AccountHead/UpdateAccHead",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId ?? 1),
                        "x-finyear-id": String(finYearId ?? 2),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // No response body for this api
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const checkAccountHeadDuplication = createAsyncThunk<
    boolean,
    CheckAccountHeadDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/checkAccountHeadDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const headId = params.headId ?? 0;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountHead/GetDuplication?HeadName=${encodeURIComponent(
                    params.headName
                )}&HeadCode=${encodeURIComponent(params.headCode)}&HeadID=${headId}`,
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

            const json: boolean = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const deleteAccountGroup = createAsyncThunk<
    number,
    DeleteAccountGroupParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/deleteAccountGroup",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountGroup/DeleteAccGroup?AccGroupID=${params.groupId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // API returns a plain number: 0 = deleted successfully,
            // non-zero = blocked (e.g. group still has linked sub-groups/heads)
            const json: number = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const deleteAccountHead = createAsyncThunk<
    number,
    DeleteAccountHeadParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/deleteAccountHead",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountHead/DeleteAccHeadYN?ID=${params.headId}`,
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

            // API returns a plain number: 1 = deleted successfully,
            // 0/other = blocked (e.g. head still has linked transactions)
            const json: number = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const isUsedAccHead = createAsyncThunk<
    number,
    IsUsedAccHeadParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/isUsedAccHead",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountHead/IsUsedAccHeadYN?ID=${params.headId}`,
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

            // API returns a plain number: 1 = head is used in transactions (cannot delete),
            // 0 = not used (safe to delete)
            const json: number = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const removeAccountHead = createAsyncThunk<
    number,
    RemoveAccountHeadParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/removeAccountHead",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountHead/DeleteAccHead?HeadID=${params.headId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                        "x-company-id": String(companyId),
                        "x-finyear-id": String(finYearId),
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // API returns a plain number: 0 = deleted successfully,
            // non-zero = blocked (e.g. head still has linked transactions)
            const json: number = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccGroupStartWith = createAsyncThunk<
    AccGroupStartWithItem[],
    FetchAccGroupStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/fetchAccGroupStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountGroup/GetAccGroupStartWith?&startWith=${encodeURIComponent(
                    startWith
                )}`,
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

            const json: AccGroupStartWithItem[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchMajorGroupStartWith = createAsyncThunk<
    MajorGroupStartWithItem[],
    FetchMajorGroupStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/fetchMajorGroupStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountGroup/GetMajorGroupStartWith?&startWith=${encodeURIComponent(
                    startWith
                )}`,
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

            const json: MajorGroupStartWithItem[] = await response.json();
            return json;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

export const fetchAccHead = createAsyncThunk<
    AccountHeadDetailItem | null,
    FetchAccHeadParams,
    { state: RootState; rejectValue: string }
>(
    "chartAccount/fetchAccHead",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const response = await fetch(
                `https://erp.glitzit.com/service/api/AccountHead/GetAccHead?AccHeadID=${params.headId}`,
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

            const json: AccountHeadDetailItem[] = await response.json();
            return json?.[0] ?? null;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const chartAccountSlice = createSlice({
    name: "chartAccount",
    initialState,
    reducers: {
        clearMajorGroupList: (state) => {
            state.majorGroupList = [];
            state.majorGroupError = null;
        },
        clearAcMajorGrpForGroupList: (state) => {
            state.acMajorGrpForGroupList = [];
            state.acMajorGrpForGroupError = null;
        },
        clearAccHeadsForOpeningList: (state) => {
            state.accHeadsForOpeningList = [];
            state.accHeadsForOpeningError = null;
            state.accHeadsForOpeningTotalCount = 0;
        },
        clearGroupDuplication: (state) => {
            state.groupDuplicationCount = null;
            state.groupDuplicationError = null;
        },
        clearCreateAccountGroupError: (state) => {
            state.createAccountGroupError = null;
        },
        clearUpdateAccountGroupError: (state) => {
            state.updateAccountGroupError = null;
        },
        clearCreateAccountHeadError: (state) => {
            state.createAccountHeadError = null;
        },
        clearUpdateAccountHeadError: (state) => {
            state.updateAccountHeadError = null;
        },
        clearHeadDuplication: (state) => {
            state.headDuplicationExists = null;
            state.headDuplicationError = null;
        },
        clearDeleteAccountGroup: (state) => {
            state.deleteAccountGroupResult = null;
            state.deleteAccountGroupError = null;
        },
        clearDeleteAccountHead: (state) => {
            state.deleteAccountHeadResult = null;
            state.deleteAccountHeadError = null;
        },
        clearIsUsedAccHead: (state) => {
            state.isUsedAccHeadResult = null;
            state.isUsedAccHeadError = null;
        },
        clearRemoveAccountHead: (state) => {
            state.removeAccountHeadResult = null;
            state.removeAccountHeadError = null;
        },
        clearAccGroupStartWithList: (state) => {
            state.accGroupStartWithList = [];
            state.accGroupStartWithError = null;
        },
        clearMajorGroupStartWithList: (state) => {
            state.majorGroupStartWithList = [];
            state.majorGroupStartWithError = null;
        },
        clearAccHeadDetail: (state) => {
            state.accHeadDetail = null;
            state.accHeadDetailError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMajorGroupAndGroups.pending, (state) => {
                state.majorGroupLoading = true;
                state.majorGroupError = null;
            })
            .addCase(fetchMajorGroupAndGroups.fulfilled, (state, action) => {
                state.majorGroupLoading = false;
                state.majorGroupList = action.payload;
            })
            .addCase(fetchMajorGroupAndGroups.rejected, (state, action) => {
                state.majorGroupLoading = false;
                state.majorGroupError = action.payload ?? "Unknown error";
            })
            .addCase(fetchAcMajorGrpForAcGroup.pending, (state) => {
                state.acMajorGrpForGroupLoading = true;
                state.acMajorGrpForGroupError = null;
            })
            .addCase(fetchAcMajorGrpForAcGroup.fulfilled, (state, action) => {
                state.acMajorGrpForGroupLoading = false;
                state.acMajorGrpForGroupList = action.payload;
            })
            .addCase(fetchAcMajorGrpForAcGroup.rejected, (state, action) => {
                state.acMajorGrpForGroupLoading = false;
                state.acMajorGrpForGroupError = action.payload ?? "Unknown error";
            })
            .addCase(fetchAccHeadsForOpening.pending, (state) => {
                state.accHeadsForOpeningLoading = true;
                state.accHeadsForOpeningError = null;
            })
            .addCase(fetchAccHeadsForOpening.fulfilled, (state, action) => {
                state.accHeadsForOpeningLoading = false;
                state.accHeadsForOpeningList = action.payload;
                state.accHeadsForOpeningTotalCount = action.payload[0]?.TotalRowCount ?? 0;
            })
            .addCase(fetchAccHeadsForOpening.rejected, (state, action) => {
                state.accHeadsForOpeningLoading = false;
                state.accHeadsForOpeningError = action.payload ?? "Unknown error";
            })
            .addCase(checkGroupDuplication.pending, (state) => {
                state.groupDuplicationLoading = true;
                state.groupDuplicationError = null;
            })
            .addCase(checkGroupDuplication.fulfilled, (state, action) => {
                state.groupDuplicationLoading = false;
                state.groupDuplicationCount = action.payload;
            })
            .addCase(checkGroupDuplication.rejected, (state, action) => {
                state.groupDuplicationLoading = false;
                state.groupDuplicationError = action.payload ?? "Unknown error";
            })
            .addCase(createAccountGroup.pending, (state) => {
                state.createAccountGroupLoading = true;
                state.createAccountGroupError = null;
            })
            .addCase(createAccountGroup.fulfilled, (state) => {
                state.createAccountGroupLoading = false;
            })
            .addCase(createAccountGroup.rejected, (state, action) => {
                state.createAccountGroupLoading = false;
                state.createAccountGroupError = action.payload ?? "Unknown error";
            })
            .addCase(updateAccountGroup.pending, (state) => {
                state.updateAccountGroupLoading = true;
                state.updateAccountGroupError = null;
            })
            .addCase(updateAccountGroup.fulfilled, (state) => {
                state.updateAccountGroupLoading = false;
            })
            .addCase(updateAccountGroup.rejected, (state, action) => {
                state.updateAccountGroupLoading = false;
                state.updateAccountGroupError = action.payload ?? "Unknown error";
            })
            .addCase(createAccountHead.pending, (state) => {
                state.createAccountHeadLoading = true;
                state.createAccountHeadError = null;
            })
            .addCase(createAccountHead.fulfilled, (state) => {
                state.createAccountHeadLoading = false;
            })
            .addCase(createAccountHead.rejected, (state, action) => {
                state.createAccountHeadLoading = false;
                state.createAccountHeadError = action.payload ?? "Unknown error";
            })
            .addCase(updateAccountHead.pending, (state) => {
                state.updateAccountHeadLoading = true;
                state.updateAccountHeadError = null;
            })
            .addCase(updateAccountHead.fulfilled, (state) => {
                state.updateAccountHeadLoading = false;
            })
            .addCase(updateAccountHead.rejected, (state, action) => {
                state.updateAccountHeadLoading = false;
                state.updateAccountHeadError = action.payload ?? "Unknown error";
            })
            .addCase(checkAccountHeadDuplication.pending, (state) => {
                state.headDuplicationLoading = true;
                state.headDuplicationError = null;
            })
            .addCase(checkAccountHeadDuplication.fulfilled, (state, action) => {
                state.headDuplicationLoading = false;
                state.headDuplicationExists = action.payload;
            })
            .addCase(checkAccountHeadDuplication.rejected, (state, action) => {
                state.headDuplicationLoading = false;
                state.headDuplicationError = action.payload ?? "Unknown error";
            })
            .addCase(deleteAccountGroup.pending, (state) => {
                state.deleteAccountGroupLoading = true;
                state.deleteAccountGroupError = null;
            })
            .addCase(deleteAccountGroup.fulfilled, (state, action) => {
                state.deleteAccountGroupLoading = false;
                state.deleteAccountGroupResult = action.payload;
            })
            .addCase(deleteAccountGroup.rejected, (state, action) => {
                state.deleteAccountGroupLoading = false;
                state.deleteAccountGroupError = action.payload ?? "Unknown error";
            })
            .addCase(deleteAccountHead.pending, (state) => {
                state.deleteAccountHeadLoading = true;
                state.deleteAccountHeadError = null;
            })
            .addCase(deleteAccountHead.fulfilled, (state, action) => {
                state.deleteAccountHeadLoading = false;
                state.deleteAccountHeadResult = action.payload;
            })
            .addCase(deleteAccountHead.rejected, (state, action) => {
                state.deleteAccountHeadLoading = false;
                state.deleteAccountHeadError = action.payload ?? "Unknown error";
            })
            .addCase(isUsedAccHead.pending, (state) => {
                state.isUsedAccHeadLoading = true;
                state.isUsedAccHeadError = null;
            })
            .addCase(isUsedAccHead.fulfilled, (state, action) => {
                state.isUsedAccHeadLoading = false;
                state.isUsedAccHeadResult = action.payload;
            })
            .addCase(isUsedAccHead.rejected, (state, action) => {
                state.isUsedAccHeadLoading = false;
                state.isUsedAccHeadError = action.payload ?? "Unknown error";
            })
            .addCase(removeAccountHead.pending, (state) => {
                state.removeAccountHeadLoading = true;
                state.removeAccountHeadError = null;
            })
            .addCase(removeAccountHead.fulfilled, (state, action) => {
                state.removeAccountHeadLoading = false;
                state.removeAccountHeadResult = action.payload;
            })
            .addCase(removeAccountHead.rejected, (state, action) => {
                state.removeAccountHeadLoading = false;
                state.removeAccountHeadError = action.payload ?? "Unknown error";
            })
            .addCase(fetchAccGroupStartWith.pending, (state) => {
                state.accGroupStartWithLoading = true;
                state.accGroupStartWithError = null;
            })
            .addCase(fetchAccGroupStartWith.fulfilled, (state, action) => {
                state.accGroupStartWithLoading = false;
                state.accGroupStartWithList = action.payload;
            })
            .addCase(fetchAccGroupStartWith.rejected, (state, action) => {
                state.accGroupStartWithLoading = false;
                state.accGroupStartWithError = action.payload ?? "Unknown error";
            })
            .addCase(fetchMajorGroupStartWith.pending, (state) => {
                state.majorGroupStartWithLoading = true;
                state.majorGroupStartWithError = null;
            })
            .addCase(fetchMajorGroupStartWith.fulfilled, (state, action) => {
                state.majorGroupStartWithLoading = false;
                state.majorGroupStartWithList = action.payload;
            })
            .addCase(fetchMajorGroupStartWith.rejected, (state, action) => {
                state.majorGroupStartWithLoading = false;
                state.majorGroupStartWithError = action.payload ?? "Unknown error";
            })
            .addCase(fetchAccHead.pending, (state) => {
                state.accHeadDetailLoading = true;
                state.accHeadDetailError = null;
            })
            .addCase(fetchAccHead.fulfilled, (state, action) => {
                state.accHeadDetailLoading = false;
                state.accHeadDetail = action.payload;
            })
            .addCase(fetchAccHead.rejected, (state, action) => {
                state.accHeadDetailLoading = false;
                state.accHeadDetailError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearMajorGroupList,
    clearAcMajorGrpForGroupList,
    clearAccHeadsForOpeningList,
    clearGroupDuplication,
    clearCreateAccountGroupError,
    clearUpdateAccountGroupError,
    clearCreateAccountHeadError,
    clearUpdateAccountHeadError,
    clearHeadDuplication,
    clearDeleteAccountGroup,
    clearDeleteAccountHead,
    clearIsUsedAccHead,
    clearRemoveAccountHead,
    clearAccGroupStartWithList,
    clearMajorGroupStartWithList,
    clearAccHeadDetail,
} = chartAccountSlice.actions;

export default chartAccountSlice.reducer;
