/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3000/customer-vendors";

export const fetchCustomerVendors = createAsyncThunk(
  "customerVendors/fetchAll",
  async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
);

export const fetchCustomerVendorById = createAsyncThunk(
  "customerVendors/fetchById",
  async (id: number) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
);

export const createCustomerVendor = createAsyncThunk(
  "customerVendors/create",
  async (newData: any) => {
    const response = await axios.post(API_URL, newData);
    return response.data;
  }
);

export const updateCustomerVendor = createAsyncThunk(
  "customerVendors/update",
  async ({ id, updatedData }: { id: number; updatedData: any }) => {
    const response = await axios.patch(`${API_URL}/${id}`, updatedData);
    return response.data;
  }
);

export const deleteCustomerVendor = createAsyncThunk(
  "customerVendors/delete",
  async (id: number) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

const customerVendorsSlice = createSlice({
  name: "customerVendors",
  initialState: {
    list: [] as any[],
    selected: null as any,
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    clearSelectedCustomerVendor(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerVendors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomerVendors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchCustomerVendors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch";
      })
      .addCase(fetchCustomerVendorById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createCustomerVendor.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateCustomerVendor.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteCustomerVendor.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearSelectedCustomerVendor } = customerVendorsSlice.actions;
export default customerVendorsSlice.reducer;
