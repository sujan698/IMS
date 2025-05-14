/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Role {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
};

const API_URL = "http://localhost:3000/roles"; // Adjust this URL if needed

// Async Thunks
export const fetchRoles = createAsyncThunk(
  "roles/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(API_URL);
      return res.data as Role[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/create",
  async (data: Omit<Role, "id">, thunkAPI) => {
    try {
      const res = await axios.post(API_URL, data);
      return res.data as Role;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/update",
  async ({ id, data }: { id: number; data: Partial<Role> }, thunkAPI) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}`, data);
      return res.data as Role;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/delete",
  async (id: number, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// Slice
const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        state.roles = state.roles.filter((role) => role.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      });
  },
});

export default rolesSlice.reducer;
