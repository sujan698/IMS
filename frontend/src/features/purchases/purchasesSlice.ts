/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Purchase {
  id: number;
  vendorId: number;
  date: string;
  totalAmount: number;
  items: { itemId: number; item: any }[];
  vendor?: any;
  [key: string]: any;
}

interface PurchaseState {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
}

const initialState: PurchaseState = {
  purchases: [],
  loading: false,
  error: null,
};

const API_URL = "http://localhost:3000/purchases";

// Async thunks
export const fetchPurchases = createAsyncThunk(
  "purchases/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(API_URL);
      return res.data as Purchase[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createPurchase = createAsyncThunk(
  "purchases/create",
  async (data: Omit<Purchase, "id"> & { itemIds: number[] }, thunkAPI) => {
    try {
      const res = await axios.post(API_URL, data);
      return res.data as Purchase;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updatePurchase = createAsyncThunk(
  "purchases/update",
  async (
    {
      id,
      data,
    }: { id: number; data: Partial<Purchase> & { itemIds: number[] } },
    thunkAPI
  ) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}`, data);
      return res.data as Purchase;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const deletePurchase = createAsyncThunk(
  "purchases/delete",
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
const purchasesSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPurchases.fulfilled,
        (state, action: PayloadAction<Purchase[]>) => {
          state.loading = false;
          state.purchases = action.payload;
        }
      )
      .addCase(fetchPurchases.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(
        createPurchase.fulfilled,
        (state, action: PayloadAction<Purchase>) => {
          state.purchases.push(action.payload);
        }
      )
      .addCase(createPurchase.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      })

      // Update
      .addCase(
        updatePurchase.fulfilled,
        (state, action: PayloadAction<Purchase>) => {
          const index = state.purchases.findIndex(
            (p) => p.id === action.payload.id
          );
          if (index !== -1) {
            state.purchases[index] = action.payload;
          }
        }
      )
      .addCase(updatePurchase.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(
        deletePurchase.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.purchases = state.purchases.filter(
            (p) => p.id !== action.payload
          );
        }
      )
      .addCase(deletePurchase.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      });
  },
});

export default purchasesSlice.reducer;
