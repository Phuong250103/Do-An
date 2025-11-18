import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
};

// Fetch all options by type
export const fetchOptions = createAsyncThunk(
  "/options/fetchOptions",
  async (type) => {
    const result = await axios.get(
      `http://localhost:5000/api/admin/options/${type}`
    );
    return { type, data: result?.data?.data || [] };
  }
);

// Add new option
export const addOption = createAsyncThunk(
  "/options/addOption",
  async ({ type, name, label, code }) => {
    const result = await axios.post(
      `http://localhost:5000/api/admin/options/${type}`,
      { name, label, code },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { type, data: result?.data?.data };
  }
);

// Edit option
export const editOption = createAsyncThunk(
  "/options/editOption",
  async ({ type, id, name, label, code }) => {
    const result = await axios.put(
      `http://localhost:5000/api/admin/options/${type}/${id}`,
      { name, label, code },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { type, data: result?.data?.data };
  }
);

// Delete option
export const deleteOption = createAsyncThunk(
  "/options/deleteOption",
  async ({ type, id }) => {
    await axios.delete(`http://localhost:5000/api/admin/options/${type}/${id}`);
    return { type, id };
  }
);

const AdminOptionsSlice = createSlice({
  name: "adminOptions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch options
      .addCase(fetchOptions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOptions.fulfilled, (state, action) => {
        state.isLoading = false;
        const { type, data } = action.payload;
        // Map type to state key
        const typeMap = {
          category: "categories",
          brand: "brands",
          size: "sizes",
          color: "colors",
        };
        const typeKey = typeMap[type];
        if (typeKey && state.hasOwnProperty(typeKey)) {
          state[typeKey] = data;
        }
      })
      .addCase(fetchOptions.rejected, (state) => {
        state.isLoading = false;
      })
      // Add option
      .addCase(addOption.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        const typeMap = {
          category: "categories",
          brand: "brands",
          size: "sizes",
          color: "colors",
        };
        const typeKey = typeMap[type];
        if (typeKey && state.hasOwnProperty(typeKey)) {
          state[typeKey].push(data);
        }
      })
      // Edit option
      .addCase(editOption.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        const typeMap = {
          category: "categories",
          brand: "brands",
          size: "sizes",
          color: "colors",
        };
        const typeKey = typeMap[type];
        if (typeKey && state.hasOwnProperty(typeKey)) {
          const index = state[typeKey].findIndex(
            (item) => item._id === data._id
          );
          if (index !== -1) {
            state[typeKey][index] = data;
          }
        }
      })
      // Delete option
      .addCase(deleteOption.fulfilled, (state, action) => {
        const { type, id } = action.payload;
        const typeMap = {
          category: "categories",
          brand: "brands",
          size: "sizes",
          color: "colors",
        };
        const typeKey = typeMap[type];
        if (typeKey && state.hasOwnProperty(typeKey)) {
          state[typeKey] = state[typeKey].filter((item) => item._id !== id);
        }
      });
  },
});

export default AdminOptionsSlice.reducer;
