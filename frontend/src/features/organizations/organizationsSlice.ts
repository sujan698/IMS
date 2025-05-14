/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Organization {
  id: number;
  name: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrganizationState {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organizations: [],
  loading: false,
  error: null,
};

// Base API URL
const API_URL = "http://localhost:3000/organizations";

// Async thunks
export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL);
      return response.data as Organization[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const createOrganization = createAsyncThunk(
  "organizations/create",
  async (data: Omit<Organization, "id">, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data as Organization;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organizations/update",
  async (
    { id, data }: { id: number; data: Partial<Organization> },
    thunkAPI
  ) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, data);
      return response.data as Organization;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  "organizations/delete",
  async (id: number, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Slice
const organizationSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrganizations.fulfilled,
        (state, action: PayloadAction<Organization[]>) => {
          state.organizations = action.payload;
          state.loading = false;
        }
      )
      .addCase(
        fetchOrganizations.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // Create
      .addCase(
        createOrganization.fulfilled,
        (state, action: PayloadAction<Organization>) => {
          state.organizations.push(action.payload);
        }
      )
      .addCase(
        createOrganization.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
        }
      )

      // Update
      .addCase(
        updateOrganization.fulfilled,
        (state, action: PayloadAction<Organization>) => {
          const index = state.organizations.findIndex(
            (org) => org.id === action.payload.id
          );
          if (index !== -1) {
            state.organizations[index] = action.payload;
          }
        }
      )
      .addCase(
        updateOrganization.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
        }
      )

      // Delete
      .addCase(
        deleteOrganization.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.organizations = state.organizations.filter(
            (org) => org.id !== action.payload
          );
        }
      )
      .addCase(
        deleteOrganization.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
        }
      );
  },
});

export default organizationSlice.reducer;
