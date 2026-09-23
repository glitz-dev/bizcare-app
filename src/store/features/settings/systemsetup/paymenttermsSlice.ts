import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PaymentTerm {
    TermsID: number;
    PaymentTerm: string;
    DueDays: number;
}

export interface SavePaymentTermParams {
    TermsID: number;
    PaymentTerm: string;
    DueDays: string;
}

// Full record shape returned by GetPaymentTerms?TermsID=... (richer than the
// list-view PaymentTerm shape returned by GetAllPaymentTermss).
export interface PaymentTermDetail {
    TermsID: number;
    PaymentTerm: string;
    UserID: number;
    CompanyID: number;
    EntryDate: string;
    Status: boolean;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    PaymentTermsGUID: string;
    DueDays: number;
}

// Payload shape expected by UpdatePaymentTerms — essentially the detail
// record with DueDays editable as a string from the form.
export interface UpdatePaymentTermParams {
    TermsID: number;
    PaymentTerm: string;
    UserID: number;
    CompanyID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    PaymentTermsGUID: string;
    Status: boolean;
    DueDays: string;
}

interface PaymentTermsState {
    paymentTermsList: PaymentTerm[];
    paymentTermsLoading: boolean;
    paymentTermsError: string | null;

    paymentTermSaving: boolean;
    paymentTermSaveError: string | null;

    paymentTermDetail: PaymentTermDetail | null;
    paymentTermDetailLoading: boolean;
    paymentTermDetailError: string | null;

    paymentTermUpdating: boolean;
    paymentTermUpdateError: string | null;

    paymentTermDeleting: boolean;
    paymentTermDeleteError: string | null;
}

const initialState: PaymentTermsState = {
    paymentTermsList: [],
    paymentTermsLoading: false,
    paymentTermsError: null,

    paymentTermSaving: false,
    paymentTermSaveError: null,

    paymentTermDetail: null,
    paymentTermDetailLoading: false,
    paymentTermDetailError: null,

    paymentTermUpdating: false,
    paymentTermUpdateError: null,

    paymentTermDeleting: false,
    paymentTermDeleteError: null,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

// This endpoint returns a plain JSON array (no Server envelope).
// On failure, the API can instead return a .NET error object like
// { Message, ExceptionMessage, ExceptionType, StackTrace } — surface that
// instead of a generic status message so failures are debuggable.
async function parseArrayOrThrow<T>(response: Response): Promise<T[]> {
    const text = await response.text();
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    if (!response.ok || !Array.isArray(parsed)) {
        const errorBody = parsed as { ExceptionMessage?: string; Message?: string } | null;
        throw new Error(
            errorBody?.ExceptionMessage ||
                errorBody?.Message ||
                `Request failed with status ${response.status}`
        );
    }
    return parsed as T[];
}

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

// ─── Thunk: Get All Payment Terms ──────────────────────────────────────────────
export const fetchPaymentTerms = createAsyncThunk<
    PaymentTerm[],
    void,
    { state: RootState; rejectValue: string }
>("paymentTerms/fetchPaymentTerms", async (_params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/PaymentTerms/GetAllPaymentTermss`,
            {
                method: "GET",
                headers: {
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            }
        );

        return await parseArrayOrThrow<PaymentTerm>(response);
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch payment terms");
    }
});

// ─── Thunk: Create New Payment Term ────────────────────────────────────────────
export const createPaymentTerm = createAsyncThunk<
    string,
    SavePaymentTermParams,
    { state: RootState; rejectValue: string }
>("paymentTerms/createPaymentTerm", async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/PaymentTerms/CreateNewPaymentTerms`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(params),
            }
        );

        return await parseSaveOrThrow(response);
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to create payment term");
    }
});

// ─── Thunk: Get Single Payment Term ────────────────────────────────────────────
export const fetchPaymentTermById = createAsyncThunk<
    PaymentTermDetail,
    number,
    { state: RootState; rejectValue: string }
>("paymentTerms/fetchPaymentTermById", async (termsId, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/PaymentTerms/GetPaymentTerms?TermsID=${termsId}`,
            {
                method: "GET",
                headers: {
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            }
        );

        const list = await parseArrayOrThrow<PaymentTermDetail>(response);
        if (!list.length) {
            throw new Error(`Payment term ${termsId} not found`);
        }
        return list[0];
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch payment term");
    }
});

// ─── Thunk: Update Payment Term ────────────────────────────────────────────────
export const updatePaymentTerm = createAsyncThunk<
    string,
    UpdatePaymentTermParams,
    { state: RootState; rejectValue: string }
>("paymentTerms/updatePaymentTerm", async (params, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/PaymentTerms/UpdatePaymentTerms`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
                body: JSON.stringify(params),
            }
        );

        return await parseSaveOrThrow(response);
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to update payment term");
    }
});

// ─── Thunk: Delete Payment Term ────────────────────────────────────────────────
export const deletePaymentTerm = createAsyncThunk<
    string,
    { termsId: number; modUserId?: number },
    { state: RootState; rejectValue: string }
>("paymentTerms/deletePaymentTerm", async ({ termsId, modUserId }, { rejectWithValue, getState }) => {
    const token = getCleanToken(getState());
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    const companyId = getCompanyId(getState());
    const finYearId = getFinYearId(getState());

    try {
        const response = await fetch(
            `https://erp.glitzit.com/service/api/PaymentTerms/DeletePaymentTerms?TermsID=${termsId}&ModUserID=${
                modUserId ?? 1
            }`,
            {
                method: "POST",
                headers: {
                    Authorization: token,
                    "x-company-id": String(companyId),
                    "x-finyear-id": String(finYearId),
                },
            }
        );

        return await parseSaveOrThrow(response);
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to delete payment term");
    }
});

// ─── Slice ─────────────────────────────────────────────────────────────────────
const paymentTermsSlice = createSlice({
    name: "paymentTerms",
    initialState,
    reducers: {
        clearPaymentTerms: (state) => {
            state.paymentTermsList = [];
            state.paymentTermsLoading = false;
            state.paymentTermsError = null;
        },
        clearPaymentTermSaveState: (state) => {
            state.paymentTermSaving = false;
            state.paymentTermSaveError = null;
        },
        clearPaymentTermDetail: (state) => {
            state.paymentTermDetail = null;
            state.paymentTermDetailLoading = false;
            state.paymentTermDetailError = null;
        },
        clearPaymentTermUpdateState: (state) => {
            state.paymentTermUpdating = false;
            state.paymentTermUpdateError = null;
        },
        clearPaymentTermDeleteState: (state) => {
            state.paymentTermDeleting = false;
            state.paymentTermDeleteError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPaymentTerms.pending, (state) => {
                state.paymentTermsLoading = true;
                state.paymentTermsError = null;
            })
            .addCase(
                fetchPaymentTerms.fulfilled,
                (state, action: PayloadAction<PaymentTerm[]>) => {
                    state.paymentTermsLoading = false;
                    state.paymentTermsList = action.payload;
                }
            )
            .addCase(fetchPaymentTerms.rejected, (state, action) => {
                state.paymentTermsLoading = false;
                state.paymentTermsError = action.payload ?? "Failed to fetch payment terms";
            })
            .addCase(createPaymentTerm.pending, (state) => {
                state.paymentTermSaving = true;
                state.paymentTermSaveError = null;
            })
            .addCase(createPaymentTerm.fulfilled, (state) => {
                state.paymentTermSaving = false;
            })
            .addCase(createPaymentTerm.rejected, (state, action) => {
                state.paymentTermSaving = false;
                state.paymentTermSaveError = action.payload ?? "Failed to create payment term";
            })
            .addCase(fetchPaymentTermById.pending, (state) => {
                state.paymentTermDetailLoading = true;
                state.paymentTermDetailError = null;
            })
            .addCase(
                fetchPaymentTermById.fulfilled,
                (state, action: PayloadAction<PaymentTermDetail>) => {
                    state.paymentTermDetailLoading = false;
                    state.paymentTermDetail = action.payload;
                }
            )
            .addCase(fetchPaymentTermById.rejected, (state, action) => {
                state.paymentTermDetailLoading = false;
                state.paymentTermDetailError = action.payload ?? "Failed to fetch payment term";
            })
            .addCase(updatePaymentTerm.pending, (state) => {
                state.paymentTermUpdating = true;
                state.paymentTermUpdateError = null;
            })
            .addCase(updatePaymentTerm.fulfilled, (state) => {
                state.paymentTermUpdating = false;
            })
            .addCase(updatePaymentTerm.rejected, (state, action) => {
                state.paymentTermUpdating = false;
                state.paymentTermUpdateError = action.payload ?? "Failed to update payment term";
            })
            .addCase(deletePaymentTerm.pending, (state) => {
                state.paymentTermDeleting = true;
                state.paymentTermDeleteError = null;
            })
            .addCase(deletePaymentTerm.fulfilled, (state, action) => {
                state.paymentTermDeleting = false;
                state.paymentTermsList = state.paymentTermsList.filter(
                    (term) => term.TermsID !== action.meta.arg.termsId
                );
            })
            .addCase(deletePaymentTerm.rejected, (state, action) => {
                state.paymentTermDeleting = false;
                state.paymentTermDeleteError = action.payload ?? "Failed to delete payment term";
            });
    },
});

export const {
    clearPaymentTerms,
    clearPaymentTermSaveState,
    clearPaymentTermDetail,
    clearPaymentTermUpdateState,
    clearPaymentTermDeleteState,
} = paymentTermsSlice.actions;
export default paymentTermsSlice.reducer;
