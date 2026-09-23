import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /MachineRegistration/GetAllMachines
// Returns a flat array (no Server envelope wrapper)
export interface MachineItem {
    MachineID: number;
    MachineName: string;
    MachineCode: string;
    MachineIP: string;
    MacID: string;
    StoreID: number;
}

// GET /MachineRegistration/FindMachineRegistration?MachineID=...
// Returns a single object (no Server envelope wrapper) with nested StoreM > BranchM > CurrencyM / TimeZoneM
export interface CurrencyM {
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

export interface TimeZoneM {
    TimeZoneID: number;
    TimeZoneDesc: string;
    OffsetMins: number;
    Active: boolean;
    Status: boolean;
}

export interface BranchM {
    CurrencyM: CurrencyM;
    TimeZoneM: TimeZoneM;
    BranchID: number;
    BranchCode: string;
    BranchName: string;
    LogoPath: string;
    ShortName: string;
    TimeZoneID: number;
    CompanyID: number;
    FinYearID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    Address: string;
    PhoneNo: string;
    BranchGUID: string;
    MobileNo: string | null;
    GSTIN: string;
    CurrencyID: number;
}

export interface StoreM {
    BranchM: BranchM;
    StoreID: number;
    StoreCode: string | null;
    StoreName: string;
    BranchID: number;
    DepartmentID: number | null;
    SetDefault: boolean | null;
    CompanyStore: boolean | null;
    CompanyID: number;
    FinYearID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    StoreGUID: string;
    DepartmentName: string | null;
    Common: boolean;
    Active: boolean;
}

export interface MachineDetail {
    StoreM: StoreM;
    MachineID: number;
    MachineCode: string;
    MachineIP: string;
    MacID: string;
    MachineName: string;
    Status: boolean;
    MachineRegistrationGuid: string;
    StoreID: number;
    CompanyID: number;
    BranchID: number | null;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    TillOpenCommand: string;
}

export interface StoreItem {
    StoreName: string;
    StoreID: number;
    CompanyStore: boolean | null;
}

interface StoreListEnvelope {
    Server: {
        Success: boolean;
        Message: string | null;
        MessageId: string | null;
        Data: StoreItem[] | null;
        Id: number;
        Info: unknown;
        Approve: unknown;
    };
}

// GET /MachineRegistration/CheckDuplication?MachineCode=...&MachineIP=...&MacID=...&MachineName=...&MachineID=...
// Returns a bare boolean (not envelope-wrapped) — true if a duplicate exists
export interface CheckMachineDuplicationResult {
    duplicate: boolean;
}

// POST /MachineRegistration/CreateMachine
// Returns a plain string (e.g. "OK") on success, not a Server-wrapped JSON object.
// For create, send MachineID: 0.
export interface SaveMachinePayload {
    MachineID: number;
    MachineCode: string;
    MachineIP: string;
    MachineName: string;
    MacID: string;
    Store: string;                 // store name
    StoreID: number;
    TillOpenCommand: string;
}

export interface SaveMachineResult {
    message: string;
}

// POST /MachineRegistration/UpdateMachineRegistration
// Sends the full record from FindMachineRegistration plus a Store (store name) field.
// Returns an empty body on success.
export interface UpdateMachinePayload extends MachineDetail {
    Store: string;                 // store name
}

export interface UpdateMachineResult {
    message: string;
}

// GET /MachineRegistration/DeleteMachineRegistration?MachineID=...&ModUserID=...
// Returns a bare value (e.g. 0), not envelope-wrapped.
export interface DeleteMachineResult {
    message: string;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchMachinesParams {
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchMachineByIdParams {
    machineId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface UpdateMachineParams {
    payload: UpdateMachinePayload;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface DeleteMachineParams {
    machineId: number;
    userId?: number;               // optional override — defaults to auth state's user id
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchStoresParams {
    startWith?: string;            // default "" (returns all stores)
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface CheckMachineDuplicationParams {
    machineCode: string;
    machineIP: string;
    macId: string;
    machineName: string;
    machineId?: number;            // default 0
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface SaveMachineParams {
    payload: SaveMachinePayload;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface MachineRegistrationState {
    machineList: MachineItem[];
    machineListLoading: boolean;
    machineListError: string | null;

    machineDetail: MachineDetail | null;
    machineDetailLoading: boolean;
    machineDetailError: string | null;

    storeList: StoreItem[];
    storeListLoading: boolean;
    storeListError: string | null;

    machineDuplicateResult: CheckMachineDuplicationResult | null;
    machineDuplicateChecking: boolean;
    machineDuplicateError: string | null;

    machineSaveResult: SaveMachineResult | null;
    machineSaving: boolean;
    machineSaveError: string | null;

    machineUpdateResult: UpdateMachineResult | null;
    machineUpdating: boolean;
    machineUpdateError: string | null;

    machineDeleteResult: DeleteMachineResult | null;
    machineDeleting: boolean;
    machineDeleteError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: MachineRegistrationState = {
    machineList: [],
    machineListLoading: false,
    machineListError: null,

    machineDetail: null,
    machineDetailLoading: false,
    machineDetailError: null,

    storeList: [],
    storeListLoading: false,
    storeListError: null,

    machineDuplicateResult: null,
    machineDuplicateChecking: false,
    machineDuplicateError: null,

    machineSaveResult: null,
    machineSaving: false,
    machineSaveError: null,

    machineUpdateResult: null,
    machineUpdating: false,
    machineUpdateError: null,

    machineDeleteResult: null,
    machineDeleting: false,
    machineDeleteError: null,
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

const getUserId = (state: RootState): number => {
    const authState = state as RootState;
    const userId =
        (authState.auth as any)?.userData?.userId ??
        (authState.auth as any)?.userData?.UserID ??
        localStorage.getItem("userId");
    return userId ? Number(userId) : 1;
};

// This endpoint returns a plain string (e.g. "OK") on success, not a
// Server-wrapped JSON object. On failure it can return a .NET error object
// like { Message, ExceptionMessage, ExceptionType, StackTrace }.
async function parseSaveOrThrow(response: Response): Promise<string> {
    const text = await response.text();
    if (!response.ok) {
        let parsed: { ExceptionMessage?: string; Message?: string } | null = null;
        try {
            parsed = JSON.parse(text);
        } catch {
            // not JSON — fall through to raw text / status message
        }
        throw new Error(
            parsed?.ExceptionMessage || parsed?.Message || text || `Request failed with status ${response.status}`
        );
    }
    return text;
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

// 1. GetAllMachines — flat array response (no envelope)
export const fetchMachines = createAsyncThunk<
    MachineItem[],
    FetchMachinesParams | void,
    { state: RootState; rejectValue: string }
>(
    "machineRegistration/fetchMachines",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/MachineRegistration/GetAllMachines`;

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

            const json: MachineItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 1b. FindMachineRegistration — single object response (no envelope)
export const fetchMachineById = createAsyncThunk<
    MachineDetail | null,
    FetchMachineByIdParams,
    { state: RootState; rejectValue: string }
>(
    "machineRegistration/fetchMachineById",
    async ({ machineId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/MachineRegistration/FindMachineRegistration?MachineID=${machineId}`;

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

            const json: MachineDetail | null = await response.json();

            return json ?? null;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetStoreStartWith — Server envelope response; the list lives in Server.Data
export const fetchStores = createAsyncThunk<
    StoreItem[],
    FetchStoresParams | void,
    { state: RootState; rejectValue: string }
>(
    "machineRegistration/fetchStores",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Store/GetStoreStartWith?startWith=${encodeURIComponent(
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

            const json: StoreListEnvelope = await response.json();

            if (!json?.Server?.Success) {
                throw new Error(json?.Server?.Message || "Failed to load stores");
            }

            return json.Server.Data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. CheckDuplication — bare boolean response (not envelope-wrapped)
export const checkMachineDuplication = createAsyncThunk<
    CheckMachineDuplicationResult,
    CheckMachineDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "machineRegistration/checkMachineDuplication",
    async (
        { machineCode, machineIP, macId, machineName, machineId = 0, companyId, finYearId },
        { rejectWithValue, getState }
    ) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url =
                `https://erp.glitzit.com/service/api/MachineRegistration/CheckDuplication` +
                `?MachineCode=${encodeURIComponent(machineCode)}` +
                `&MachineIP=${encodeURIComponent(machineIP)}` +
                `&MacID=${encodeURIComponent(macId)}` +
                `&MachineName=${encodeURIComponent(machineName)}` +
                `&MachineID=${machineId}`;

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

            const raw = await response.json();

            return { duplicate: Boolean(raw) };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. CreateMachine — plain string response (e.g. "OK")
export const saveMachine = createAsyncThunk<
    SaveMachineResult,
    SaveMachineParams,
    { state: RootState; rejectValue: string }
>(
    "machineRegistration/saveMachine",
    async ({ payload, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/MachineRegistration/CreateMachine`;

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

            const message = await parseSaveOrThrow(response);

            return { message };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Failed to save machine");
        }
    }
);

// 5. UpdateMachineRegistration — empty response body on success
export const updateMachine = createAsyncThunk<
    UpdateMachineResult,
    UpdateMachineParams,
    { state: RootState; rejectValue: string }
>(
    "machineRegistration/updateMachine",
    async ({ payload, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/MachineRegistration/UpdateMachineRegistration`;

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

            // Success returns no body, so fall back to "OK" when the text is empty
            const text = await parseSaveOrThrow(response);

            return { message: text || "OK" };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Failed to update machine");
        }
    }
);

// 6. DeleteMachineRegistration — bare value response (e.g. 0)
export const deleteMachine = createAsyncThunk<
    DeleteMachineResult,
    DeleteMachineParams,
    { state: RootState; rejectValue: string }
>(
    "machineRegistration/deleteMachine",
    async ({ machineId, userId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedUserId = userId ?? getUserId(getState());
        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/MachineRegistration/DeleteMachineRegistration?MachineID=${machineId}&ModUserID=${resolvedUserId}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(resolvedCompanyId),
                    "x-finyear-id": String(resolvedFinYearId),
                },
            });

            // Reuses the same error parsing as save/update; success returns a bare value like 0
            const text = await parseSaveOrThrow(response);

            return { message: text || "OK" };
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Failed to delete machine");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const machineRegistrationSlice = createSlice({
    name: "machineRegistration",
    initialState,
    reducers: {
        clearMachineList(state) {
            state.machineList = [];
            state.machineListError = null;
        },
        clearMachineDetail(state) {
            state.machineDetail = null;
            state.machineDetailError = null;
        },
        clearMachineUpdateResult(state) {
            state.machineUpdateResult = null;
            state.machineUpdateError = null;
        },
        clearMachineDeleteResult(state) {
            state.machineDeleteResult = null;
            state.machineDeleteError = null;
        },
        clearStoreList(state) {
            state.storeList = [];
            state.storeListError = null;
        },
        clearMachineDuplicateResult(state) {
            state.machineDuplicateResult = null;
            state.machineDuplicateError = null;
        },
        clearMachineSaveResult(state) {
            state.machineSaveResult = null;
            state.machineSaveError = null;
        },
        resetMachineRegistration() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllMachines
            .addCase(fetchMachines.pending, (state) => {
                state.machineListLoading = true;
                state.machineListError = null;
            })
            .addCase(fetchMachines.fulfilled, (state, action) => {
                state.machineListLoading = false;
                state.machineList = action.payload;
            })
            .addCase(fetchMachines.rejected, (state, action) => {
                state.machineListLoading = false;
                state.machineListError = action.payload ?? "Unknown error";
            })
            // FindMachineRegistration
            .addCase(fetchMachineById.pending, (state) => {
                state.machineDetailLoading = true;
                state.machineDetailError = null;
            })
            .addCase(fetchMachineById.fulfilled, (state, action) => {
                state.machineDetailLoading = false;
                state.machineDetail = action.payload;
            })
            .addCase(fetchMachineById.rejected, (state, action) => {
                state.machineDetailLoading = false;
                state.machineDetailError = action.payload ?? "Unknown error";
            })
            // GetStoreStartWith
            .addCase(fetchStores.pending, (state) => {
                state.storeListLoading = true;
                state.storeListError = null;
            })
            .addCase(fetchStores.fulfilled, (state, action) => {
                state.storeListLoading = false;
                state.storeList = action.payload;
            })
            .addCase(fetchStores.rejected, (state, action) => {
                state.storeListLoading = false;
                state.storeListError = action.payload ?? "Unknown error";
            })
            // CheckDuplication
            .addCase(checkMachineDuplication.pending, (state) => {
                state.machineDuplicateChecking = true;
                state.machineDuplicateError = null;
            })
            .addCase(checkMachineDuplication.fulfilled, (state, action) => {
                state.machineDuplicateChecking = false;
                state.machineDuplicateResult = action.payload;
            })
            .addCase(checkMachineDuplication.rejected, (state, action) => {
                state.machineDuplicateChecking = false;
                state.machineDuplicateError = action.payload ?? "Unknown error";
            })
            // CreateMachine
            .addCase(saveMachine.pending, (state) => {
                state.machineSaving = true;
                state.machineSaveError = null;
            })
            .addCase(saveMachine.fulfilled, (state, action) => {
                state.machineSaving = false;
                state.machineSaveResult = action.payload;
            })
            .addCase(saveMachine.rejected, (state, action) => {
                state.machineSaving = false;
                state.machineSaveError = action.payload ?? "Unknown error";
            })
            // UpdateMachineRegistration
            .addCase(updateMachine.pending, (state) => {
                state.machineUpdating = true;
                state.machineUpdateError = null;
            })
            .addCase(updateMachine.fulfilled, (state, action) => {
                state.machineUpdating = false;
                state.machineUpdateResult = action.payload;
            })
            .addCase(updateMachine.rejected, (state, action) => {
                state.machineUpdating = false;
                state.machineUpdateError = action.payload ?? "Unknown error";
            })
            // DeleteMachineRegistration
            .addCase(deleteMachine.pending, (state) => {
                state.machineDeleting = true;
                state.machineDeleteError = null;
            })
            .addCase(deleteMachine.fulfilled, (state, action) => {
                state.machineDeleting = false;
                state.machineDeleteResult = action.payload;
            })
            .addCase(deleteMachine.rejected, (state, action) => {
                state.machineDeleting = false;
                state.machineDeleteError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearMachineList,
    clearMachineDetail,
    clearMachineUpdateResult,
    clearMachineDeleteResult,
    clearStoreList,
    clearMachineDuplicateResult,
    clearMachineSaveResult,
    resetMachineRegistration,
} = machineRegistrationSlice.actions;

export default machineRegistrationSlice.reducer;