/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Sale {
  id: number;
  customerId: number;
  date: string;
  total: number;
  itemIds: number[];
  createdAt?: string;
  updatedAt?: string;
  customer?: any;
  items?: {
    item: any;
  }[];
}

interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [],
  loading: false,
  error: null,
};

const API_URL = "http://localhost:3000/sales"; // Adjust if needed

// Async Thunks
export const fetchSales = createAsyncThunk(
  "sales/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(API_URL);
      return res.data as Sale[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createSale = createAsyncThunk(
  "sales/create",
  async (data: Omit<Sale, "id">, thunkAPI) => {
    try {
      const res = await axios.post(API_URL, data);
      return res.data as Sale;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updateSale = createAsyncThunk(
  "sales/update",
  async ({ id, data }: { id: number; data: Partial<Sale> }, thunkAPI) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}`, data);
      return res.data as Sale;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const deleteSale = createAsyncThunk(
  "sales/delete",
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
const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action: PayloadAction<Sale[]>) => {
        state.sales = action.payload;
        state.loading = false;
      })
      .addCase(fetchSales.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSale.fulfilled, (state, action: PayloadAction<Sale>) => {
        state.sales.push(action.payload);
      })
      .addCase(createSale.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateSale.fulfilled, (state, action: PayloadAction<Sale>) => {
        const index = state.sales.findIndex(
          (sale) => sale.id === action.payload.id
        );
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
      })
      .addCase(updateSale.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSale.fulfilled, (state, action: PayloadAction<number>) => {
        state.sales = state.sales.filter((sale) => sale.id !== action.payload);
      })
      .addCase(deleteSale.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      });
  },
});

export default salesSlice.reducer;
