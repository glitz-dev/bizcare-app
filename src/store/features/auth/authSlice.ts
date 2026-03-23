import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://erp.glitzit.com/service/api';

export interface Company {
  CompanyName: string;
  CompanyID: number;
  Code: string | null;
  PrintAddress: string | null;
}

export interface FinYear {
  FinYearName: string;
  FinYearID: number;
}

export interface LoginPayload {
  username: string;
  password: string;
  company: Company;
  finYear: FinYear;
}

export interface UserData {
  token: string;
  UserID: number;
  FirstName: string | null;
  CompanyID: number;
  BranchID: number | null;
  FinYearID: number;
  UserName: string;
  CompanyName: string;
  UserRoleID: number;
  UserRole: string;
  FinYearStart: string;
  FinYearEnd: string;
}

interface AuthState {
  companies: Company[];
  finYears: FinYear[];
  selectedCompany: Company | null;
  selectedFinYear: FinYear | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userData: UserData | null;
}

const initialState: AuthState = {
  companies: [],
  finYears: [],
  selectedCompany: null,
  selectedFinYear: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  userData: null,
};

// ==================== Thunks ====================

export const fetchCompanies = createAsyncThunk(
  'auth/fetchCompanies',
  async () => {
    const res = await axios.get(`${BASE_URL}/Company/GetLoginCompanyStartWith?startWith=`);
    return res.data.Server.Data as Company[];
  }
);

export const fetchFinancialYears = createAsyncThunk(
  'auth/fetchFinancialYears',
  async () => {
    const res = await axios.get(`${BASE_URL}/CommonUtility/GetFinancialYearStartWith?startWith=`);
    return res.data.Server.Data as FinYear[];
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password, company, finYear }: LoginPayload, { rejectWithValue }) => {
    const body = {
      CompanyName: company.CompanyName,
      Code: company.Code ?? '',
      CompanyID: company.CompanyID,
      FinYearName: finYear.FinYearName,
      FinYearID: finYear.FinYearID,
      Password: password,
      UserName: username,
      isAutoApprovalEnabled: true,
      projectID: 1,
    };

    try {
      const res = await axios.post(`${BASE_URL}/Account/Token`, body);
      if (!res.data.Server.Success) throw new Error(res.data.Server.Message);
      return res.data.Server.Data as UserData;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.Server?.Message || err.message || 'Login failed');
    }
  }
);

// ==================== Slice ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSelectedCompany: (state, action: PayloadAction<Company | null>) => {
      state.selectedCompany = action.payload;
    },
    setSelectedFinYear: (state, action: PayloadAction<FinYear | null>) => {
      state.selectedFinYear = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userData = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
        if (action.payload.length > 0) state.selectedCompany = action.payload[0];
      })
      .addCase(fetchFinancialYears.fulfilled, (state, action) => {
        state.finYears = action.payload;
        if (action.payload.length > 0) state.selectedFinYear = action.payload[0];
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userData = action.payload;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCompany, setSelectedFinYear, logout, clearError } = authSlice.actions;
export default authSlice.reducer;