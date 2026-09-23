import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /Bank/GetAccHeadStartWith/?startWith=...
// Returns a plain array (no envelope)
export interface AccHeadStartWithItem {
    HeadName: string;
    HeadID: number;
    MajorGroupID: number;
    LinkGroupID: number;
    GroupID: number;
}

// GET /Currency/GetCurrencyStartwith/?startWith=...
// Returns an envelope-wrapped array
export interface CurrencyStartWithItem {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

// GET /DocumentM/GetDocumentMLists
// Returns a plain array (no envelope)
export interface DocumentMListItem {
    DocumentID: number;
    DocumentName: string;
    ShortName: string | null;
    Prefix: string | null;
    Suffix: string | null;
}

// GET /Bank/GetAllBanks
// Returns a plain array (no envelope)
export interface BankListItem {
    BankID: number;
    BankName: string;
    Address: string | null;
    Phone: string | null;
    Branch: string | null;
    IFSC: string | null;
    ContactPerson: string | null;
    ContactNum: string | null;
    Active: "Active" | "InActive";
    HeadName: string | null;
}

// GET /Bank/GetBank?BankID=... — nested row types (envelope-wrapped response)
export interface BankInterestDetail {
    BankInterestID: number;
    BankID: number;
    PCLFixedRate: number;
    PCFCFixedRate: number;
    RateDate: string;
    CompanyID: number;
    BranchID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    GUID: string;
}

export interface BankFacilityDetail {
    BankFacilityID: number;
    BankID: number;
    PreshipmentCredit: string | null;
    PostShipmentCredit: string | null;
    CompanyID: number;
    BranchID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    BankFGUID: string;
}

export interface BankLoanAcHeadDetail {
    BankLoanID: number;
    BankID: number;
    AccBankM: unknown | null;
    HeadID: number;
    AccHeadM: unknown | null;
    CurrencyID: number;
    CurrencyM: unknown | null;
    DocTypeID: number;
    DocumentTypeM: unknown | null;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    HeadName: string;
    Currency: string;
    DocumentTypeName: string | null;
}

export interface BankDocumentDetail {
    ID: number;
    BankID: number;
    AccBankM: unknown | null;
    DocumentID: number;
    DocumentM: unknown | null;
    Status: boolean;
    CreatedBy: number;
    CreatedDate: string;
    ModifiedBy: number | null;
    ModifiedDate: string | null;
    DocumentName: string;
}

// GET /Bank/GetBank?BankID=...
// Returns an envelope-wrapped single object
export interface BankDetail {
    BankID: number;
    BankName: string;
    Address: string | null;
    Phone: string | null;
    Branch: string | null;
    IFSC: string | null;
    SWIFT: string | null;
    ContactPerson: string | null;
    ContactNum: string | null;
    AcHeadID: number;
    AccHeadM: unknown | null;
    CompanyID: number;
    BranchID: number;
    FinYearID: number;
    Status: boolean;
    Default: unknown | null;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    BankMGUID: string;
    AccountNo: string | null;
    LstBankInterest: BankInterestDetail[];
    LstBankFacility: BankFacilityDetail[];
    LstBankLoanAcHeads: BankLoanAcHeadDetail[];
    LstDocuments: BankDocumentDetail[];
    PreshipmentCredit: string | null;
    PostShipmentCredit: string | null;
    HeadName: string | null;
    Common: boolean;
    Active: boolean;
}

// POST /Bank/UpdateBank — payload row types (superset of the GetBank detail
// rows: RateDateStr and DocumentTypeID appear only in the update payload,
// not in the GetBank response).
export interface UpdateBankInterestRow extends BankInterestDetail {
    RateDateStr: string;
}

export interface UpdateBankLoanAcHeadRow extends BankLoanAcHeadDetail {
    DocumentTypeID: number;
}

// POST /Bank/UpdateBank
// No response body on success — only HTTP status is checked.
export interface UpdateBankPayload extends Omit<BankDetail, "LstBankInterest" | "LstBankLoanAcHeads"> {
    LstBankInterest: UpdateBankInterestRow[];
    LstBankLoanAcHeads: UpdateBankLoanAcHeadRow[];
}

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

// POST /Bank/CreateNewBank — nested row types
export interface BankInterestRow {
    Status: boolean;
    PCLFixedRate: string;
    PCFCFixedRate: string;
    RateDate: string;
}

// Shape unconfirmed beyond an empty object in the sample payload — likely the
// preshipment/postshipment credit fields, kept loose until the API is verified.
export interface BankFacilityRowPayload {
    Status?: boolean;
    PreshipmentCredit?: string;
    PostshipmentCredit?: string;
}

export interface BankLoanAcHeadRow {
    Status: boolean;
    HeadName: string;
    HeadID: number;
    Currency: string;
    CurrencyID: number;
}

export interface BankDocumentRow {
    Status: boolean;
    DocumentName: string;
    DocumentID: number;
}

// POST /Bank/CreateNewBank
// Returns plain text "OK" on success (no JSON envelope)
export interface CreateBankPayload {
    BankID: number;                // 0 for new bank
    BankName: string;
    Branch: string;
    AccountNo: string;
    IFSC: string;
    SWIFT: string;
    AcHeadID: number;
    HeadName: string;
    MajorGroupID: number;
    LinkGroupID: number;
    ContactPerson: string;
    ContactNum: string;
    Address: string;
    Phone: string;
    Active: boolean;
    Common: boolean;
    RateDate: string;
    RateDateStr: string;
    LstBankFacility: BankFacilityRowPayload[];
    LstBankInterest: BankInterestRow[];
    LstBankLoanAcHeads: BankLoanAcHeadRow[];
    LstDocuments: BankDocumentRow[];
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchAccHeadStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchCurrencyStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchAllBanksParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchDocumentMListsParams {
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface CheckBankDuplicationParams {
    bankName: string;
    bankId?: number;               // default 0
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchBankParams {
    bankId: number;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface UpdateBankParams {
    payload: UpdateBankPayload;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface CreateNewBankParams {
    payload: CreateBankPayload;
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface BankState {
    bankList: BankListItem[];
    bankListLoading: boolean;
    bankListError: string | null;

    bankDetail: BankDetail | null;
    bankDetailLoading: boolean;
    bankDetailError: string | null;

    updateBankLoading: boolean;
    updateBankError: string | null;
    updateBankSuccess: boolean;

    accHeadList: AccHeadStartWithItem[];
    accHeadLoading: boolean;
    accHeadError: string | null;

    currencyList: CurrencyStartWithItem[];
    currencyLoading: boolean;
    currencyError: string | null;

    documentList: DocumentMListItem[];
    documentListLoading: boolean;
    documentListError: string | null;

    isDuplicateBank: boolean | null;
    duplicateCheckLoading: boolean;
    duplicateCheckError: string | null;

    createBankLoading: boolean;
    createBankError: string | null;
    createBankSuccess: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: BankState = {
    bankList: [],
    bankListLoading: false,
    bankListError: null,

    bankDetail: null,
    bankDetailLoading: false,
    bankDetailError: null,

    updateBankLoading: false,
    updateBankError: null,
    updateBankSuccess: false,

    accHeadList: [],
    accHeadLoading: false,
    accHeadError: null,

    currencyList: [],
    currencyLoading: false,
    currencyError: null,

    documentList: [],
    documentListLoading: false,
    documentListError: null,

    isDuplicateBank: null,
    duplicateCheckLoading: false,
    duplicateCheckError: null,

    createBankLoading: false,
    createBankError: null,
    createBankSuccess: false,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCleanToken = (state: RootState): string | null => {
    const authState = state as RootState;
    let token = (authState.auth as any)?.userData?.token || localStorage.getItem("token");
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, "").trim();
    return token;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// 0. GetAllBanks — plain array response
export const fetchAllBanks = createAsyncThunk<
    BankListItem[],
    FetchAllBanksParams | void,
    { state: RootState; rejectValue: string }
>(
    "bank/fetchAllBanks",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Bank/GetAllBanks`;

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

            const data: BankListItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 0.5. GetBank — envelope-wrapped single object response
export const fetchBank = createAsyncThunk<
    BankDetail,
    FetchBankParams,
    { state: RootState; rejectValue: string }
>(
    "bank/fetchBank",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Bank/GetBank?BankID=${params.bankId}`;

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

            const json: ApiResponseWrapper<BankDetail> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data;
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch bank.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 0.6. UpdateBank — no response body on success
export const updateBank = createAsyncThunk<
    void,
    UpdateBankParams,
    { state: RootState; rejectValue: string }
>(
    "bank/updateBank",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Bank/UpdateBank`;

            const response = await fetch(url, {
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
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 1. GetAccHeadStartWith — plain array response
export const fetchAccHeadStartWith = createAsyncThunk<
    AccHeadStartWithItem[],
    FetchAccHeadStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "bank/fetchAccHeadStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/Bank/GetAccHeadStartWith/?startWith=${encodeURIComponent(
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

            const data: AccHeadStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetCurrencyStartwith — envelope-wrapped response
export const fetchCurrencyStartWith = createAsyncThunk<
    CurrencyStartWithItem[],
    FetchCurrencyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "bank/fetchCurrencyStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/Currency/GetCurrencyStartwith/?startWith=${encodeURIComponent(
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

            const json: ApiResponseWrapper<CurrencyStartWithItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currencies.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetDocumentMLists — plain array response
export const fetchDocumentMLists = createAsyncThunk<
    DocumentMListItem[],
    FetchDocumentMListsParams | void,
    { state: RootState; rejectValue: string }
>(
    "bank/fetchDocumentMLists",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/DocumentM/GetDocumentMLists`;

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

            const data: DocumentMListItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. CheckDuplication — plain boolean response
export const checkBankDuplication = createAsyncThunk<
    boolean,
    CheckBankDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "bank/checkBankDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const bankId = params.bankId ?? 0;

        try {
            const url = `https://erp.glitzit.com/service/api/Bank/CheckDuplication?BankName=${encodeURIComponent(
                params.bankName
            )}&BankID=${bankId}`;

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

            const text = (await response.text()).trim().toLowerCase();
            return text === "true";
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. CreateNewBank — plain text "OK" response (no envelope)
export const createNewBank = createAsyncThunk<
    void,
    CreateNewBankParams,
    { state: RootState; rejectValue: string }
>(
    "bank/createNewBank",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Bank/CreateNewBank`;

            const response = await fetch(url, {
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

            const text = (await response.text()).trim();
            if (text.toUpperCase() !== "OK") {
                return rejectWithValue(text || "Failed to create bank.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const bankSlice = createSlice({
    name: "bank",
    initialState,
    reducers: {
        clearBankList(state) {
            state.bankList = [];
            state.bankListError = null;
        },
        clearBankDetail(state) {
            state.bankDetail = null;
            state.bankDetailError = null;
        },
        clearUpdateBankStatus(state) {
            state.updateBankError = null;
            state.updateBankSuccess = false;
        },
        clearAccHeadStartWith(state) {
            state.accHeadList = [];
            state.accHeadError = null;
        },
        clearCurrencyStartWith(state) {
            state.currencyList = [];
            state.currencyError = null;
        },
        clearDocumentMLists(state) {
            state.documentList = [];
            state.documentListError = null;
        },
        clearDuplicateCheck(state) {
            state.isDuplicateBank = null;
            state.duplicateCheckError = null;
        },
        clearCreateBankStatus(state) {
            state.createBankError = null;
            state.createBankSuccess = false;
        },
        resetBank() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllBanks
            .addCase(fetchAllBanks.pending, (state) => {
                state.bankListLoading = true;
                state.bankListError = null;
            })
            .addCase(fetchAllBanks.fulfilled, (state, action) => {
                state.bankListLoading = false;
                state.bankList = action.payload;
            })
            .addCase(fetchAllBanks.rejected, (state, action) => {
                state.bankListLoading = false;
                state.bankListError = action.payload ?? "Unknown error";
            })

            // GetBank
            .addCase(fetchBank.pending, (state) => {
                state.bankDetailLoading = true;
                state.bankDetailError = null;
            })
            .addCase(fetchBank.fulfilled, (state, action) => {
                state.bankDetailLoading = false;
                state.bankDetail = action.payload;
            })
            .addCase(fetchBank.rejected, (state, action) => {
                state.bankDetailLoading = false;
                state.bankDetailError = action.payload ?? "Unknown error";
            })

            // UpdateBank
            .addCase(updateBank.pending, (state) => {
                state.updateBankLoading = true;
                state.updateBankError = null;
                state.updateBankSuccess = false;
            })
            .addCase(updateBank.fulfilled, (state) => {
                state.updateBankLoading = false;
                state.updateBankSuccess = true;
            })
            .addCase(updateBank.rejected, (state, action) => {
                state.updateBankLoading = false;
                state.updateBankError = action.payload ?? "Unknown error";
            })

            // GetAccHeadStartWith
            .addCase(fetchAccHeadStartWith.pending, (state) => {
                state.accHeadLoading = true;
                state.accHeadError = null;
            })
            .addCase(fetchAccHeadStartWith.fulfilled, (state, action) => {
                state.accHeadLoading = false;
                state.accHeadList = action.payload;
            })
            .addCase(fetchAccHeadStartWith.rejected, (state, action) => {
                state.accHeadLoading = false;
                state.accHeadError = action.payload ?? "Unknown error";
            })

            // GetCurrencyStartwith
            .addCase(fetchCurrencyStartWith.pending, (state) => {
                state.currencyLoading = true;
                state.currencyError = null;
            })
            .addCase(fetchCurrencyStartWith.fulfilled, (state, action) => {
                state.currencyLoading = false;
                state.currencyList = action.payload;
            })
            .addCase(fetchCurrencyStartWith.rejected, (state, action) => {
                state.currencyLoading = false;
                state.currencyError = action.payload ?? "Unknown error";
            })

            // GetDocumentMLists
            .addCase(fetchDocumentMLists.pending, (state) => {
                state.documentListLoading = true;
                state.documentListError = null;
            })
            .addCase(fetchDocumentMLists.fulfilled, (state, action) => {
                state.documentListLoading = false;
                state.documentList = action.payload;
            })
            .addCase(fetchDocumentMLists.rejected, (state, action) => {
                state.documentListLoading = false;
                state.documentListError = action.payload ?? "Unknown error";
            })

            // CheckDuplication
            .addCase(checkBankDuplication.pending, (state) => {
                state.duplicateCheckLoading = true;
                state.duplicateCheckError = null;
            })
            .addCase(checkBankDuplication.fulfilled, (state, action) => {
                state.duplicateCheckLoading = false;
                state.isDuplicateBank = action.payload;
            })
            .addCase(checkBankDuplication.rejected, (state, action) => {
                state.duplicateCheckLoading = false;
                state.duplicateCheckError = action.payload ?? "Unknown error";
            })

            // CreateNewBank
            .addCase(createNewBank.pending, (state) => {
                state.createBankLoading = true;
                state.createBankError = null;
                state.createBankSuccess = false;
            })
            .addCase(createNewBank.fulfilled, (state) => {
                state.createBankLoading = false;
                state.createBankSuccess = true;
            })
            .addCase(createNewBank.rejected, (state, action) => {
                state.createBankLoading = false;
                state.createBankError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearBankList,
    clearBankDetail,
    clearUpdateBankStatus,
    clearAccHeadStartWith,
    clearCurrencyStartWith,
    clearDocumentMLists,
    clearDuplicateCheck,
    clearCreateBankStatus,
    resetBank,
} = bankSlice.actions;

export default bankSlice.reducer;
