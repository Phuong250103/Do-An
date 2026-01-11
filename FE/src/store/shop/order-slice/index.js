import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  payUrl: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/order/create",
      orderData
    );
    return response.data;
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/list/${userId}`
    );
    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/details/${id}`
    );
    return response.data;
  }
);

export const cancelOrder = createAsyncThunk(
  "/order/cancelOrder",
  async (id) => {
    const response = await axios.put(
      `http://localhost:5000/api/shop/order/cancel/${id}`
    );
    return response.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    resetPayUrl: (state) => {
      state.payUrl = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* CREATE MOMO ORDER */
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payUrl = action.payload.payUrl; // từ backend Momo
        state.orderId = action.payload.orderId;

        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId)
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.payUrl = null;
        state.orderId = null;
      })

      /* GET ALL ORDERS */
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      /* GET ORDER DETAILS */
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })

      /* CANCEL ORDER */
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update order in orderList
        const cancelledOrder = action.payload.data;
        const index = state.orderList.findIndex(
          (order) => order._id === cancelledOrder._id
        );
        if (index !== -1) {
          state.orderList[index] = cancelledOrder;
        }
        // Update orderDetails
        if (
          state.orderDetails &&
          state.orderDetails._id === cancelledOrder._id
        ) {
          state.orderDetails = cancelledOrder;
        }
      })
      .addCase(cancelOrder.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetOrderDetails, resetPayUrl } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
