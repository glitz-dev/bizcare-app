import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /Country/GetAllCountries
// Returns a flat array (no Server envelope wrapper)
export interface CountryItem {
    CountryID: number;
    CountryName: string;
    CountryCode: string;
}

// GET /Country/GetCountry?CountryID=1
// Returns an array containing a single record (no Server envelope wrapper)
export interface CountryDetail {
    CountryID: number;
    CountryName: string;
    CountryCode: string;
    CompanyID: number;
    Status: boolean;
    UserID: number;
    EntryDate: string;
    ModifiedUserID: number | null;
    ModifiedDate: string | null;
    CountryGUID: string;
}

// GET /Country/CheckDuplication?CountryName=...&CountryID=...&CountryCode=...
// Returns a bare boolean (not envelope-wrapped) — true if a duplicate exists
export interface CheckCountryDuplicationResult {
    duplicate: boolean;
}

// POST /Country/CreateNewCountry
// Returns a plain string (e.g. "OK") on success, not a Server-wrapped JSON object.
// Used for BOTH create and edit: for create, send CountryID: 0.
export interface SaveCountryPayload {
    Active: boolean;
    Common: boolean;
    CountryName: string;
    CountryCode: string;
    CountryID: number;
}

export interface SaveCountryResult {
    message: string;
}

// POST /Country/UpdateCountry
// Sends the full country record (same shape as GetCountry). Returns an empty body on success.
export type UpdateCountryPayload = CountryDetail;

export interface UpdateCountryResult {
    message: string;
}

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchCountriesParams {
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface FetchCountryByIdParams {
    countryId: number;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface UpdateCountryParams {
    payload: UpdateCountryPayload;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface CheckCountryDuplicationParams {
    countryName: string;
    countryId?: number;            // default 0
    countryCode?: string;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

export interface SaveCountryParams {
    payload: SaveCountryPayload;
    companyId?: number;            // optional override — defaults to auth state's companyId
    finYearId?: number;            // optional override — defaults to auth state's finYearId
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface CountryState {
    countryList: CountryItem[];
    countryListLoading: boolean;
    countryListError: string | null;

    countryDetail: CountryDetail | null;
    countryDetailLoading: boolean;
    countryDetailError: string | null;

    countryDuplicateResult: CheckCountryDuplicationResult | null;
    countryDuplicateChecking: boolean;
    countryDuplicateError: string | null;

    countrySaveResult: SaveCountryResult | null;
    countrySaving: boolean;
    countrySaveError: string | null;

    countryUpdateResult: UpdateCountryResult | null;
    countryUpdating: boolean;
    countryUpdateError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: CountryState = {
    countryList: [],
    countryListLoading: false,
    countryListError: null,

    countryDetail: null,
    countryDetailLoading: false,
    countryDetailError: null,

    countryDuplicateResult: null,
    countryDuplicateChecking: false,
    countryDuplicateError: null,

    countrySaveResult: null,
    countrySaving: false,
    countrySaveError: null,

    countryUpdateResult: null,
    countryUpdating: false,
    countryUpdateError: null,
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

// 1. GetAllCountries — flat array response (no envelope)
export const fetchCountries = createAsyncThunk<
    CountryItem[],
    FetchCountriesParams | void,
    { state: RootState; rejectValue: string }
>(
    "country/fetchCountries",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? getCompanyId(getState());
        const finYearId = params?.finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Country/GetAllCountries`;

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

            const json: CountryItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 1b. GetCountry — array response containing a single record (no envelope)
export const fetchCountryById = createAsyncThunk<
    CountryDetail | null,
    FetchCountryByIdParams,
    { state: RootState; rejectValue: string }
>(
    "country/fetchCountryById",
    async ({ countryId, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Country/GetCountry?CountryID=${countryId}`;

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

            const json: CountryDetail[] = await response.json();

            // API wraps the single record in an array — unwrap it
            return Array.isArray(json) ? json[0] ?? null : null;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. CheckDuplication — bare boolean response (not envelope-wrapped)
export const checkCountryDuplication = createAsyncThunk<
    CheckCountryDuplicationResult,
    CheckCountryDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "country/checkCountryDuplication",
    async (
        { countryName, countryId = 0, countryCode, companyId, finYearId },
        { rejectWithValue, getState }
    ) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Country/CheckDuplication?CountryName=${encodeURIComponent(
                countryName
            )}&CountryID=${countryId}&CountryCode=${encodeURIComponent(countryCode ?? "")}`;

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

// 3. CreateNewCountry — plain string response (e.g. "OK"); used for both create and edit
export const saveCountry = createAsyncThunk<
    SaveCountryResult,
    SaveCountryParams,
    { state: RootState; rejectValue: string }
>(
    "country/saveCountry",
    async ({ payload, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Country/CreateNewCountry`;

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
            return rejectWithValue(err instanceof Error ? err.message : "Failed to save country");
        }
    }
);

// 4. UpdateCountry — empty response body on success
export const updateCountry = createAsyncThunk<
    UpdateCountryResult,
    UpdateCountryParams,
    { state: RootState; rejectValue: string }
>(
    "country/updateCountry",
    async ({ payload, companyId, finYearId }, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const resolvedCompanyId = companyId ?? getCompanyId(getState());
        const resolvedFinYearId = finYearId ?? getFinYearId(getState());

        try {
            const url = `https://erp.glitzit.com/service/api/Country/UpdateCountry`;

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
            return rejectWithValue(err instanceof Error ? err.message : "Failed to update country");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const countrySlice = createSlice({
    name: "country",
    initialState,
    reducers: {
        clearCountryList(state) {
            state.countryList = [];
            state.countryListError = null;
        },
        clearCountryDetail(state) {
            state.countryDetail = null;
            state.countryDetailError = null;
        },
        clearCountryDuplicateResult(state) {
            state.countryDuplicateResult = null;
            state.countryDuplicateError = null;
        },
        clearCountrySaveResult(state) {
            state.countrySaveResult = null;
            state.countrySaveError = null;
        },
        clearCountryUpdateResult(state) {
            state.countryUpdateResult = null;
            state.countryUpdateError = null;
        },
        resetCountry() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllCountries
            .addCase(fetchCountries.pending, (state) => {
                state.countryListLoading = true;
                state.countryListError = null;
            })
            .addCase(fetchCountries.fulfilled, (state, action) => {
                state.countryListLoading = false;
                state.countryList = action.payload;
            })
            .addCase(fetchCountries.rejected, (state, action) => {
                state.countryListLoading = false;
                state.countryListError = action.payload ?? "Unknown error";
            })
            // GetCountry
            .addCase(fetchCountryById.pending, (state) => {
                state.countryDetailLoading = true;
                state.countryDetailError = null;
            })
            .addCase(fetchCountryById.fulfilled, (state, action) => {
                state.countryDetailLoading = false;
                state.countryDetail = action.payload;
            })
            .addCase(fetchCountryById.rejected, (state, action) => {
                state.countryDetailLoading = false;
                state.countryDetailError = action.payload ?? "Unknown error";
            })
            // CheckDuplication
            .addCase(checkCountryDuplication.pending, (state) => {
                state.countryDuplicateChecking = true;
                state.countryDuplicateError = null;
            })
            .addCase(checkCountryDuplication.fulfilled, (state, action) => {
                state.countryDuplicateChecking = false;
                state.countryDuplicateResult = action.payload;
            })
            .addCase(checkCountryDuplication.rejected, (state, action) => {
                state.countryDuplicateChecking = false;
                state.countryDuplicateError = action.payload ?? "Unknown error";
            })
            // CreateNewCountry
            .addCase(saveCountry.pending, (state) => {
                state.countrySaving = true;
                state.countrySaveError = null;
            })
            .addCase(saveCountry.fulfilled, (state, action) => {
                state.countrySaving = false;
                state.countrySaveResult = action.payload;
            })
            .addCase(saveCountry.rejected, (state, action) => {
                state.countrySaving = false;
                state.countrySaveError = action.payload ?? "Unknown error";
            })
            // UpdateCountry
            .addCase(updateCountry.pending, (state) => {
                state.countryUpdating = true;
                state.countryUpdateError = null;
            })
            .addCase(updateCountry.fulfilled, (state, action) => {
                state.countryUpdating = false;
                state.countryUpdateResult = action.payload;
            })
            .addCase(updateCountry.rejected, (state, action) => {
                state.countryUpdating = false;
                state.countryUpdateError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearCountryList,
    clearCountryDetail,
    clearCountryDuplicateResult,
    clearCountrySaveResult,
    clearCountryUpdateResult,
    resetCountry,
} = countrySlice.actions;

export default countrySlice.reducer;