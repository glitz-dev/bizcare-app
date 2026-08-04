import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /Currency/GetCurrencyStartwith/?startWith=...
// Returns an envelope-wrapped array
export interface CurrencyStartWithItem {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

// GET /Company/GetTaxPayerTypeStartWith/?startWith=...
// Returns a plain array (no envelope)
export interface TaxPayerTypeStartWithItem {
    TaxPayerTypeId: number;
    TaxPayerType: string;
    TaxApplicable: boolean;
}

// GET /Company/GetTimeZoneStartWith/?startWith=...
// Returns a plain array (no envelope)
export interface TimeZoneStartWithItem {
    TimeZoneDesc: string;
    TimeZoneID: number;
}

// GET /Company/GetCountryStartWith?startWith=...
// Returns a plain array (no envelope)
export interface CountryStartWithItem {
    CountryName: string;
    CountryID: number;
}

// GET /Company/GetStateStartWith?countryID=...&startWith=...
// Returns a plain array (no envelope)
export interface StateStartWithItem {
    StateName: string;
    StateID: number;
}

// GET /Bank/GetBankStartwith?startWith=...
// Returns a plain array (no envelope)
export interface BankStartWithItem {
    BankID: number;
    BankName: string;
    PostShipmentCredit: number | null;
    PreshipmentCredit: number | null;
    AcHeadID: number;
    AccountNo: string;
}

// GET /CommonUtility/GetLoginDetails
// Returns a plain array (no envelope) — one row per company/branch the user has access to
export interface LoginDetailsItem {
    CompanyId: number;
    BranchId: number;
    FinyearId: number;
    BranchName: string;
    BranchCode: string;
    CompanyName: string;
    UserName: string;
    CompanyCode: string;
    CompanyID: number;
    UserID: number;
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

// ─── Param Types ──────────────────────────────────────────────────────────────

export interface FetchCurrencyStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchTaxPayerTypeStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchTimeZoneStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchCountryStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchStateStartWithParams {
    countryID: number;             // e.g. 95 (India)
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchBankStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// GET /Company/CheckDuplication?Code=...&CompanyName=...&CompanyID=...
// Returns a plain boolean
export interface CheckDuplicationParams {
    code: string;
    companyName: string;
    companyId?: number;            // default 0 (0 = new company)
}

// POST /Company/CreateNewCompany
// Returns the new CompanyID as a plain number
export interface CompanyBankPayload {
    BankName: string;
    BankID: number;
    AccountNo: string;
}

export interface CreateNewCompanyPayload {
    Active: boolean;
    Address1: string;
    Address2: string;
    Address3: string;
    CityName: string;
    Code: string;
    CompanyID: number;
    CompanyName: string;
    ContactPerson: string;
    CountryName: string;
    Currency: string;
    CurrencyID: number;
    Email1: string;
    Email2: string;
    Email3: string;
    GstNo: string;
    LstCompanyBanks: CompanyBankPayload[];
    Phone2: string;
    PrintAddress: string;
    StateName: string;
    TaxPayerType: string;
    TaxPayerTypeID: number;
    TimeZoneDesc: string;
    TimeZoneID: number;
    Website: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface OrganizationState {
    currencyList: CurrencyStartWithItem[];
    currencyLoading: boolean;
    currencyError: string | null;

    taxPayerTypeList: TaxPayerTypeStartWithItem[];
    taxPayerTypeLoading: boolean;
    taxPayerTypeError: string | null;

    timeZoneList: TimeZoneStartWithItem[];
    timeZoneLoading: boolean;
    timeZoneError: string | null;

    countryList: CountryStartWithItem[];
    countryLoading: boolean;
    countryError: string | null;

    stateList: StateStartWithItem[];
    stateLoading: boolean;
    stateError: string | null;

    bankList: BankStartWithItem[];
    bankLoading: boolean;
    bankError: string | null;

    checkDuplicationResult: boolean | null;
    checkDuplicationLoading: boolean;
    checkDuplicationError: string | null;

    createCompanyId: number | null;
    createCompanyLoading: boolean;
    createCompanyError: string | null;

    loginDetailsList: LoginDetailsItem[];
    loginDetailsLoading: boolean;
    loginDetailsError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: OrganizationState = {
    currencyList: [],
    currencyLoading: false,
    currencyError: null,

    taxPayerTypeList: [],
    taxPayerTypeLoading: false,
    taxPayerTypeError: null,

    timeZoneList: [],
    timeZoneLoading: false,
    timeZoneError: null,

    countryList: [],
    countryLoading: false,
    countryError: null,

    stateList: [],
    stateLoading: false,
    stateError: null,

    bankList: [],
    bankLoading: false,
    bankError: null,

    checkDuplicationResult: null,
    checkDuplicationLoading: false,
    checkDuplicationError: null,

    createCompanyId: null,
    createCompanyLoading: false,
    createCompanyError: null,

    loginDetailsList: [],
    loginDetailsLoading: false,
    loginDetailsError: null,
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

// 1. GetCurrencyStartwith — envelope-wrapped response
export const fetchCurrencyStartWith = createAsyncThunk<
    CurrencyStartWithItem[],
    FetchCurrencyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "organization/fetchCurrencyStartWith",
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

// 2. GetTaxPayerTypeStartWith — plain array response
export const fetchTaxPayerTypeStartWith = createAsyncThunk<
    TaxPayerTypeStartWithItem[],
    FetchTaxPayerTypeStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "organization/fetchTaxPayerTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api//Company/GetTaxPayerTypeStartWith/?startWith=${encodeURIComponent(
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

            const data: TaxPayerTypeStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetTimeZoneStartWith — plain array response
export const fetchTimeZoneStartWith = createAsyncThunk<
    TimeZoneStartWithItem[],
    FetchTimeZoneStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "organization/fetchTimeZoneStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api/Company/GetTimeZoneStartWith/?startWith=${encodeURIComponent(
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

            const data: TimeZoneStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetCountryStartWith — plain array response
export const fetchCountryStartWith = createAsyncThunk<
    CountryStartWithItem[],
    FetchCountryStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "organization/fetchCountryStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api//Company/GetCountryStartWith?startWith=${encodeURIComponent(
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

            const data: CountryStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. GetStateStartWith — plain array response
export const fetchStateStartWith = createAsyncThunk<
    StateStartWithItem[],
    FetchStateStartWithParams,
    { state: RootState; rejectValue: string }
>(
    "organization/fetchStateStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;
        const startWith = params.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api//Company/GetStateStartWith?countryID=${
                params.countryID
            }&startWith=${encodeURIComponent(startWith)}`;

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

            const data: StateStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. GetBankStartwith — plain array response
export const fetchBankStartWith = createAsyncThunk<
    BankStartWithItem[],
    FetchBankStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "organization/fetchBankStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;
        const startWith = params?.startWith ?? "";

        try {
            const url = `https://erp.glitzit.com/service/api//Bank/GetBankStartwith?startWith=${encodeURIComponent(
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

            const data: BankStartWithItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 7. CheckDuplication — plain boolean response
export const fetchCheckDuplication = createAsyncThunk<
    boolean,
    CheckDuplicationParams,
    { state: RootState; rejectValue: string }
>(
    "organization/fetchCheckDuplication",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params.companyId ?? 0;
        const headerCompanyId = 1;
        const headerFinYearId = 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Company/CheckDuplication?Code=${encodeURIComponent(
                params.code
            )}&CompanyName=${encodeURIComponent(params.companyName)}&CompanyID=${companyId}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": String(headerCompanyId),
                    "x-finyear-id": String(headerFinYearId),
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data: boolean = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 8. CreateNewCompany — plain number (new CompanyID) response
export const createNewCompany = createAsyncThunk<
    number,
    CreateNewCompanyPayload,
    { state: RootState; rejectValue: string }
>(
    "organization/createNewCompany",
    async (payload, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        try {
            const url = `https://erp.glitzit.com/service/api/Company/CreateNewCompany`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": "1",
                    "x-finyear-id": "2",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data: number = await response.json();
            return data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 9. GetLoginDetails — plain array response
export const fetchGetLoginDetails = createAsyncThunk<
    LoginDetailsItem[],
    void,
    { state: RootState; rejectValue: string }
>(
    "organization/fetchGetLoginDetails",
    async (_, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        try {
            const url = `https://erp.glitzit.com/service/api/CommonUtility/GetLoginDetails`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "x-company-id": "1",
                    "x-finyear-id": "2",
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data: LoginDetailsItem[] = await response.json();
            return data ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const organizationSlice = createSlice({
    name: "organization",
    initialState,
    reducers: {
        clearCurrencyStartWith(state) {
            state.currencyList = [];
            state.currencyError = null;
        },
        clearTaxPayerTypeStartWith(state) {
            state.taxPayerTypeList = [];
            state.taxPayerTypeError = null;
        },
        clearTimeZoneStartWith(state) {
            state.timeZoneList = [];
            state.timeZoneError = null;
        },
        clearCountryStartWith(state) {
            state.countryList = [];
            state.countryError = null;
        },
        clearStateStartWith(state) {
            state.stateList = [];
            state.stateError = null;
        },
        clearBankStartWith(state) {
            state.bankList = [];
            state.bankError = null;
        },
        clearCheckDuplication(state) {
            state.checkDuplicationResult = null;
            state.checkDuplicationError = null;
        },
        clearCreateNewCompany(state) {
            state.createCompanyId = null;
            state.createCompanyError = null;
        },
        clearGetLoginDetails(state) {
            state.loginDetailsList = [];
            state.loginDetailsError = null;
        },
        resetOrganization() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
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

            // GetTaxPayerTypeStartWith
            .addCase(fetchTaxPayerTypeStartWith.pending, (state) => {
                state.taxPayerTypeLoading = true;
                state.taxPayerTypeError = null;
            })
            .addCase(fetchTaxPayerTypeStartWith.fulfilled, (state, action) => {
                state.taxPayerTypeLoading = false;
                state.taxPayerTypeList = action.payload;
            })
            .addCase(fetchTaxPayerTypeStartWith.rejected, (state, action) => {
                state.taxPayerTypeLoading = false;
                state.taxPayerTypeError = action.payload ?? "Unknown error";
            })

            // GetTimeZoneStartWith
            .addCase(fetchTimeZoneStartWith.pending, (state) => {
                state.timeZoneLoading = true;
                state.timeZoneError = null;
            })
            .addCase(fetchTimeZoneStartWith.fulfilled, (state, action) => {
                state.timeZoneLoading = false;
                state.timeZoneList = action.payload;
            })
            .addCase(fetchTimeZoneStartWith.rejected, (state, action) => {
                state.timeZoneLoading = false;
                state.timeZoneError = action.payload ?? "Unknown error";
            })

            // GetCountryStartWith
            .addCase(fetchCountryStartWith.pending, (state) => {
                state.countryLoading = true;
                state.countryError = null;
            })
            .addCase(fetchCountryStartWith.fulfilled, (state, action) => {
                state.countryLoading = false;
                state.countryList = action.payload;
            })
            .addCase(fetchCountryStartWith.rejected, (state, action) => {
                state.countryLoading = false;
                state.countryError = action.payload ?? "Unknown error";
            })

            // GetStateStartWith
            .addCase(fetchStateStartWith.pending, (state) => {
                state.stateLoading = true;
                state.stateError = null;
            })
            .addCase(fetchStateStartWith.fulfilled, (state, action) => {
                state.stateLoading = false;
                state.stateList = action.payload;
            })
            .addCase(fetchStateStartWith.rejected, (state, action) => {
                state.stateLoading = false;
                state.stateError = action.payload ?? "Unknown error";
            })

            // GetBankStartwith
            .addCase(fetchBankStartWith.pending, (state) => {
                state.bankLoading = true;
                state.bankError = null;
            })
            .addCase(fetchBankStartWith.fulfilled, (state, action) => {
                state.bankLoading = false;
                state.bankList = action.payload;
            })
            .addCase(fetchBankStartWith.rejected, (state, action) => {
                state.bankLoading = false;
                state.bankError = action.payload ?? "Unknown error";
            })

            // CheckDuplication
            .addCase(fetchCheckDuplication.pending, (state) => {
                state.checkDuplicationLoading = true;
                state.checkDuplicationError = null;
            })
            .addCase(fetchCheckDuplication.fulfilled, (state, action) => {
                state.checkDuplicationLoading = false;
                state.checkDuplicationResult = action.payload;
            })
            .addCase(fetchCheckDuplication.rejected, (state, action) => {
                state.checkDuplicationLoading = false;
                state.checkDuplicationError = action.payload ?? "Unknown error";
            })

            // CreateNewCompany
            .addCase(createNewCompany.pending, (state) => {
                state.createCompanyLoading = true;
                state.createCompanyError = null;
            })
            .addCase(createNewCompany.fulfilled, (state, action) => {
                state.createCompanyLoading = false;
                state.createCompanyId = action.payload;
            })
            .addCase(createNewCompany.rejected, (state, action) => {
                state.createCompanyLoading = false;
                state.createCompanyError = action.payload ?? "Unknown error";
            })

            // GetLoginDetails
            .addCase(fetchGetLoginDetails.pending, (state) => {
                state.loginDetailsLoading = true;
                state.loginDetailsError = null;
            })
            .addCase(fetchGetLoginDetails.fulfilled, (state, action) => {
                state.loginDetailsLoading = false;
                state.loginDetailsList = action.payload;
            })
            .addCase(fetchGetLoginDetails.rejected, (state, action) => {
                state.loginDetailsLoading = false;
                state.loginDetailsError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearCurrencyStartWith,
    clearTaxPayerTypeStartWith,
    clearTimeZoneStartWith,
    clearCountryStartWith,
    clearStateStartWith,
    clearBankStartWith,
    clearCheckDuplication,
    clearCreateNewCompany,
    clearGetLoginDetails,
    resetOrganization,
} = organizationSlice.actions;

export default organizationSlice.reducer;
