/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/slices/itemsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Item {
  id: number;
  name: string;
  quantity: number;
  price: number;
  description?: string;
  discount?: number;
  discount_type?: string;
  tax?: number;
  itemOrganizationId?: number;
  organizationId?: number;
}

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: ItemsState = {
  items: [],
  loading: false,
  error: null,
};

// API Base URL (adjust if needed)
const API_BASE_URL = "http://localhost:3000"; // or wherever your backend runs

// Thunks
export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async (organizationId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/items/${organizationId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch items"
      );
    }
  }
);

export const createItem = createAsyncThunk(
  "items/createItem",
  async (newItem: Omit<Item, "id">, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/items`, newItem);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create item"
      );
    }
  }
);

export const updateItem = createAsyncThunk(
  "items/updateItem",
  async (
    {
      id,
      organizationId,
      updatedData,
    }: { id: number; organizationId: number; updatedData: Partial<Item> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/items/${id}`, {
        ...updatedData,
        organizationId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update item"
      );
    }
  }
);

export const deleteItem = createAsyncThunk(
  "items/deleteItem",
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/items/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete item"
      );
    }
  }
);

// Slice
const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<Item[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action: PayloadAction<Item>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateItem.fulfilled, (state, action: PayloadAction<Item>) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default itemsSlice.reducer;
