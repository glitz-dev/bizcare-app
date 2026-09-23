import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────────────────────

// GET /Party/GetAllParty?currentPage=...&rowsPerPage=...&searchStr=...
// Returns an envelope-wrapped array
export interface PartyListItem {
    PartyID: number;
    PartyCode: string | null;
    PartyName: string;
    PartyCategory: string;
    PartyAddress: string | null;
    Local: "Local" | "Overseas";
    Active: "Active" | "InActive";
    PartyCreditLimitDays: number;
    PhoneNo: string | null;
    PartyEmail: string | null;
    GSTIN: string | null;
    HeadName: string | null;
    Country: string | null;
    CreatedBy: string;
    CreatedOn: string;
}

// GET /PartyCategories/GetDefaultPartyCategoryuserwise
// Returns an envelope-wrapped array
export interface DefaultPartyCategoryItem {
    UserPartyCategoryID: number;
    ID: number;
    PartyCategory: string;
}

// GET /Currency/GetCurrencyStartwith/?startWith=...
// Returns an envelope-wrapped array
export interface CurrencyItem {
    Currency: string;
    CurrencyID: number;
    FaClass: string | null;
    FaChar: string | null;
    CurrencyCode: string;
}

// GET /PartyCategories/GetPartyCategoryStartWith/?startWith=...
// Returns a raw (non-enveloped) array
export interface PartyCategoryItem {
    PartyCategory: string;
    ID: number;
}

// GET /Company/GetTaxPayerTypeStartWith/?startWith=...
// Returns a raw (non-enveloped) array
export interface TaxPayerTypeItem {
    TaxPayerTypeId: number;
    TaxPayerType: string;
    TaxApplicable: boolean;
}

// GET /CommonUtility/GetCountryStartwith/?startWith=...
// Returns an envelope-wrapped array
export interface CountryItem {
    CountryID: number;
    CountryName: string;
}

// GET /CommonUtility/GetStateStartwith/?CountryID=...&startWith=...
// Returns an envelope-wrapped array
export interface StateItem {
    StateID: number;
    StateName: string;
}

// GET /AccountHead/GetAllAccHeadStartWith?startWith=...
// Returns a raw (non-enveloped) array
export interface AccHeadItem {
    HeadName: string;
    HeadID: number;
}

// GET /Consigne/GetPartyStartWith?startWith=...
// Returns a raw (non-enveloped) array
export interface ConsigneePartyItem {
    PartyName: string;
    PartyID: number;
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

export interface FetchAllPartiesParams {
    currentPage?: number;          // default 1
    rowsPerPage?: number;          // default 50
    searchStr?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchCurrencyStartwithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchPartyCategoryStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchTaxPayerTypeStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchCountryStartwithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchStateStartwithParams {
    countryId: number;
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchAccHeadStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

export interface FetchConsigneePartyStartWithParams {
    startWith?: string;            // default ""
    companyId?: number;            // default 1
    finYearId?: number;            // default 2
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface PartyState {
    partyList: PartyListItem[];
    partyListLoading: boolean;
    partyListError: string | null;
    defaultPartyCategoryList: DefaultPartyCategoryItem[];
    defaultPartyCategoryListLoading: boolean;
    defaultPartyCategoryListError: string | null;
    currencyList: CurrencyItem[];
    currencyListLoading: boolean;
    currencyListError: string | null;
    partyCategoryList: PartyCategoryItem[];
    partyCategoryListLoading: boolean;
    partyCategoryListError: string | null;
    taxPayerTypeList: TaxPayerTypeItem[];
    taxPayerTypeListLoading: boolean;
    taxPayerTypeListError: string | null;
    countryList: CountryItem[];
    countryListLoading: boolean;
    countryListError: string | null;
    stateList: StateItem[];
    stateListLoading: boolean;
    stateListError: string | null;
    accHeadList: AccHeadItem[];
    accHeadListLoading: boolean;
    accHeadListError: string | null;
    consigneePartyList: ConsigneePartyItem[];
    consigneePartyListLoading: boolean;
    consigneePartyListError: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: PartyState = {
    partyList: [],
    partyListLoading: false,
    partyListError: null,
    defaultPartyCategoryList: [],
    defaultPartyCategoryListLoading: false,
    defaultPartyCategoryListError: null,
    currencyList: [],
    currencyListLoading: false,
    currencyListError: null,
    partyCategoryList: [],
    partyCategoryListLoading: false,
    partyCategoryListError: null,
    taxPayerTypeList: [],
    taxPayerTypeListLoading: false,
    taxPayerTypeListError: null,
    countryList: [],
    countryListLoading: false,
    countryListError: null,
    stateList: [],
    stateListLoading: false,
    stateListError: null,
    accHeadList: [],
    accHeadListLoading: false,
    accHeadListError: null,
    consigneePartyList: [],
    consigneePartyListLoading: false,
    consigneePartyListError: null,
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

// 1. GetAllParty — envelope-wrapped array response
export const fetchAllParties = createAsyncThunk<
    PartyListItem[],
    FetchAllPartiesParams | void,
    { state: RootState; rejectValue: string }
>(
    "party/fetchAllParties",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const currentPage = params?.currentPage ?? 1;
        const rowsPerPage = params?.rowsPerPage ?? 50;
        const searchStr = params?.searchStr ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Party/GetAllParty?currentPage=${currentPage}&rowsPerPage=${rowsPerPage}&searchStr=${encodeURIComponent(
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

            const json: ApiResponseWrapper<PartyListItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch parties.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 2. GetDefaultPartyCategoryuserwise — envelope-wrapped array response
export const fetchDefaultPartyCategory = createAsyncThunk<
    DefaultPartyCategoryItem[],
    { companyId?: number; finYearId?: number } | void,
    { state: RootState; rejectValue: string }
>(
    "party/fetchDefaultPartyCategory",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/PartyCategories/GetDefaultPartyCategoryuserwise`;

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

            const json: ApiResponseWrapper<DefaultPartyCategoryItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch default party category.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 3. GetCurrencyStartwith — envelope-wrapped array response
export const fetchCurrencyStartwith = createAsyncThunk<
    CurrencyItem[],
    FetchCurrencyStartwithParams | void,
    { state: RootState; rejectValue: string }
>(
    "party/fetchCurrencyStartwith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

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

            const json: ApiResponseWrapper<CurrencyItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch currency list.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 4. GetPartyCategoryStartWith — raw (non-enveloped) array response
export const fetchPartyCategoryStartWith = createAsyncThunk<
    PartyCategoryItem[],
    FetchPartyCategoryStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "party/fetchPartyCategoryStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/PartyCategories/GetPartyCategoryStartWith/?startWith=${encodeURIComponent(
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

            const json: PartyCategoryItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 5. GetTaxPayerTypeStartWith — raw (non-enveloped) array response
export const fetchTaxPayerTypeStartWith = createAsyncThunk<
    TaxPayerTypeItem[],
    FetchTaxPayerTypeStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "party/fetchTaxPayerTypeStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Company/GetTaxPayerTypeStartWith/?startWith=${encodeURIComponent(
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

            const json: TaxPayerTypeItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 6. GetCountryStartwith — envelope-wrapped array response
export const fetchCountryStartwith = createAsyncThunk<
    CountryItem[],
    FetchCountryStartwithParams | void,
    { state: RootState; rejectValue: string }
>(
    "party/fetchCountryStartwith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/CommonUtility/GetCountryStartwith/?startWith=${encodeURIComponent(
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

            const json: ApiResponseWrapper<CountryItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch country list.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 7. GetStateStartwith — envelope-wrapped array response
export const fetchStateStartwith = createAsyncThunk<
    StateItem[],
    FetchStateStartwithParams,
    { state: RootState; rejectValue: string }
>(
    "party/fetchStateStartwith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const countryId = params.countryId;
        const startWith = params.startWith ?? "";
        const companyId = params.companyId ?? 1;
        const finYearId = params.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/CommonUtility/GetStateStartwith/?CountryID=${countryId}&startWith=${encodeURIComponent(
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

            const json: ApiResponseWrapper<StateItem[]> = await response.json();

            if (json.Server?.Success) {
                return json.Server.Data ?? [];
            } else {
                return rejectWithValue(json.Server?.Message || "Failed to fetch state list.");
            }
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 8. GetAllAccHeadStartWith — raw (non-enveloped) array response
export const fetchAccHeadStartWith = createAsyncThunk<
    AccHeadItem[],
    FetchAccHeadStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "party/fetchAccHeadStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/AccountHead/GetAllAccHeadStartWith?startWith=${encodeURIComponent(
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

            const json: AccHeadItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

// 9. GetPartyStartWith (Consigne) — raw (non-enveloped) array response
export const fetchConsigneePartyStartWith = createAsyncThunk<
    ConsigneePartyItem[],
    FetchConsigneePartyStartWithParams | void,
    { state: RootState; rejectValue: string }
>(
    "party/fetchConsigneePartyStartWith",
    async (params, { rejectWithValue, getState }) => {
        const token = getCleanToken(getState());
        if (!token) return rejectWithValue("No authentication token found. Please login again.");

        const startWith = params?.startWith ?? "";
        const companyId = params?.companyId ?? 1;
        const finYearId = params?.finYearId ?? 2;

        try {
            const url = `https://erp.glitzit.com/service/api/Consigne/GetPartyStartWith?startWith=${encodeURIComponent(
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

            const json: ConsigneePartyItem[] = await response.json();

            return json ?? [];
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : "Network error");
        }
    }
);

const partySlice = createSlice({
    name: "party",
    initialState,
    reducers: {
        clearPartyList(state) {
            state.partyList = [];
            state.partyListError = null;
        },
        clearDefaultPartyCategoryList(state) {
            state.defaultPartyCategoryList = [];
            state.defaultPartyCategoryListError = null;
        },
        clearCurrencyList(state) {
            state.currencyList = [];
            state.currencyListError = null;
        },
        clearPartyCategoryList(state) {
            state.partyCategoryList = [];
            state.partyCategoryListError = null;
        },
        clearTaxPayerTypeList(state) {
            state.taxPayerTypeList = [];
            state.taxPayerTypeListError = null;
        },
        clearCountryList(state) {
            state.countryList = [];
            state.countryListError = null;
        },
        clearStateList(state) {
            state.stateList = [];
            state.stateListError = null;
        },
        clearAccHeadList(state) {
            state.accHeadList = [];
            state.accHeadListError = null;
        },
        clearConsigneePartyList(state) {
            state.consigneePartyList = [];
            state.consigneePartyListError = null;
        },
        resetParty() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // GetAllParty
            .addCase(fetchAllParties.pending, (state) => {
                state.partyListLoading = true;
                state.partyListError = null;
            })
            .addCase(fetchAllParties.fulfilled, (state, action) => {
                state.partyListLoading = false;
                state.partyList = action.payload;
            })
            .addCase(fetchAllParties.rejected, (state, action) => {
                state.partyListLoading = false;
                state.partyListError = action.payload ?? "Unknown error";
            })
            // GetDefaultPartyCategoryuserwise
            .addCase(fetchDefaultPartyCategory.pending, (state) => {
                state.defaultPartyCategoryListLoading = true;
                state.defaultPartyCategoryListError = null;
            })
            .addCase(fetchDefaultPartyCategory.fulfilled, (state, action) => {
                state.defaultPartyCategoryListLoading = false;
                state.defaultPartyCategoryList = action.payload;
            })
            .addCase(fetchDefaultPartyCategory.rejected, (state, action) => {
                state.defaultPartyCategoryListLoading = false;
                state.defaultPartyCategoryListError = action.payload ?? "Unknown error";
            })
            // GetCurrencyStartwith
            .addCase(fetchCurrencyStartwith.pending, (state) => {
                state.currencyListLoading = true;
                state.currencyListError = null;
            })
            .addCase(fetchCurrencyStartwith.fulfilled, (state, action) => {
                state.currencyListLoading = false;
                state.currencyList = action.payload;
            })
            .addCase(fetchCurrencyStartwith.rejected, (state, action) => {
                state.currencyListLoading = false;
                state.currencyListError = action.payload ?? "Unknown error";
            })
            // GetPartyCategoryStartWith
            .addCase(fetchPartyCategoryStartWith.pending, (state) => {
                state.partyCategoryListLoading = true;
                state.partyCategoryListError = null;
            })
            .addCase(fetchPartyCategoryStartWith.fulfilled, (state, action) => {
                state.partyCategoryListLoading = false;
                state.partyCategoryList = action.payload;
            })
            .addCase(fetchPartyCategoryStartWith.rejected, (state, action) => {
                state.partyCategoryListLoading = false;
                state.partyCategoryListError = action.payload ?? "Unknown error";
            })
            // GetTaxPayerTypeStartWith
            .addCase(fetchTaxPayerTypeStartWith.pending, (state) => {
                state.taxPayerTypeListLoading = true;
                state.taxPayerTypeListError = null;
            })
            .addCase(fetchTaxPayerTypeStartWith.fulfilled, (state, action) => {
                state.taxPayerTypeListLoading = false;
                state.taxPayerTypeList = action.payload;
            })
            .addCase(fetchTaxPayerTypeStartWith.rejected, (state, action) => {
                state.taxPayerTypeListLoading = false;
                state.taxPayerTypeListError = action.payload ?? "Unknown error";
            })
            // GetCountryStartwith
            .addCase(fetchCountryStartwith.pending, (state) => {
                state.countryListLoading = true;
                state.countryListError = null;
            })
            .addCase(fetchCountryStartwith.fulfilled, (state, action) => {
                state.countryListLoading = false;
                state.countryList = action.payload;
            })
            .addCase(fetchCountryStartwith.rejected, (state, action) => {
                state.countryListLoading = false;
                state.countryListError = action.payload ?? "Unknown error";
            })
            // GetStateStartwith
            .addCase(fetchStateStartwith.pending, (state) => {
                state.stateListLoading = true;
                state.stateListError = null;
            })
            .addCase(fetchStateStartwith.fulfilled, (state, action) => {
                state.stateListLoading = false;
                state.stateList = action.payload;
            })
            .addCase(fetchStateStartwith.rejected, (state, action) => {
                state.stateListLoading = false;
                state.stateListError = action.payload ?? "Unknown error";
            })
            // GetAllAccHeadStartWith
            .addCase(fetchAccHeadStartWith.pending, (state) => {
                state.accHeadListLoading = true;
                state.accHeadListError = null;
            })
            .addCase(fetchAccHeadStartWith.fulfilled, (state, action) => {
                state.accHeadListLoading = false;
                state.accHeadList = action.payload;
            })
            .addCase(fetchAccHeadStartWith.rejected, (state, action) => {
                state.accHeadListLoading = false;
                state.accHeadListError = action.payload ?? "Unknown error";
            })
            // GetPartyStartWith (Consigne)
            .addCase(fetchConsigneePartyStartWith.pending, (state) => {
                state.consigneePartyListLoading = true;
                state.consigneePartyListError = null;
            })
            .addCase(fetchConsigneePartyStartWith.fulfilled, (state, action) => {
                state.consigneePartyListLoading = false;
                state.consigneePartyList = action.payload;
            })
            .addCase(fetchConsigneePartyStartWith.rejected, (state, action) => {
                state.consigneePartyListLoading = false;
                state.consigneePartyListError = action.payload ?? "Unknown error";
            });
    },
});

// ─── Actions & Reducer ────────────────────────────────────────────────────────

export const {
    clearPartyList,
    clearDefaultPartyCategoryList,
    clearCurrencyList,
    clearPartyCategoryList,
    clearTaxPayerTypeList,
    clearCountryList,
    clearStateList,
    clearAccHeadList,
    clearConsigneePartyList,
    resetParty,
} = partySlice.actions;

export default partySlice.reducer;
