import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define our base API
export interface AuthState {
  token: string | null;
}

export interface LocalRootState {
  auth: AuthState;
}
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as LocalRootState)?.auth?.token;

      // If we have a token, add it to the headers
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    "Users",
    "Roles",
    "Organizations",
    "Items",
    "CustomerVendors",
    "Sales",
    "Purchases",
  ],
  endpoints: (builder) => ({
    // Users endpoints
    getUsers: builder.query({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getUserById: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (id) => [{ type: "Users", id }],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: "users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `users/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ({ id }) => [{ type: "Users", id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // Roles endpoints
    getRoles: builder.query({
      query: () => "roles",
      providesTags: ["Roles"],
    }),
    getRoleById: builder.query({
      query: (id) => `roles/${id}`,
      providesTags: (id) => [{ type: "Roles", id }],
    }),
    createRole: builder.mutation({
      query: (roleData) => ({
        url: "roles",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: ["Roles"],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...roleData }) => ({
        url: `roles/${id}`,
        method: "PUT",
        body: roleData,
      }),
      invalidatesTags: ({ id }) => [{ type: "Roles", id }],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),

    // Items endpoints
    getItems: builder.query({
      query: () => "items",
      providesTags: ["Items"],
    }),
    getItemById: builder.query({
      query: (id) => `items/${id}`,
      providesTags: ({ id }) => [{ type: "Items", id }],
    }),
    createItem: builder.mutation({
      query: (itemData) => ({
        url: "items",
        method: "POST",
        body: itemData,
      }),
      invalidatesTags: ["Items"],
    }),
    updateItem: builder.mutation({
      query: ({ id, ...itemData }) => ({
        url: `items/${id}`,
        method: "PUT",
        body: itemData,
      }),
      invalidatesTags: ({ id }) => [{ type: "Items", id }],
    }),
    deleteItem: builder.mutation({
      query: (id) => ({
        url: `items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Items"],
    }),

    // CustomerVendors endpoints
    getCustomerVendors: builder.query({
      query: () => "customer-vendors",
      providesTags: ["CustomerVendors"],
    }),
    getCustomerVendorById: builder.query({
      query: (id) => `customer-vendors/${id}`,
      providesTags: (id) => [{ type: "CustomerVendors", id }],
    }),
    createCustomerVendor: builder.mutation({
      query: (data) => ({
        url: "customer-vendors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CustomerVendors"],
    }),
    updateCustomerVendor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `customer-vendors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ({ id }) => [{ type: "CustomerVendors", id }],
    }),
    deleteCustomerVendor: builder.mutation({
      query: (id) => ({
        url: `customer-vendors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerVendors"],
    }),

    // Sales endpoints
    getSales: builder.query({
      query: () => "sales",
      providesTags: ["Sales"],
    }),
    getSaleById: builder.query({
      query: (id) => `sales/${id}`,
      providesTags: (id) => [{ type: "Sales", id }],
    }),
    createSale: builder.mutation({
      query: (saleData) => ({
        url: "sales",
        method: "POST",
        body: saleData,
      }),
      invalidatesTags: ["Sales", "Items"],
    }),
    updateSale: builder.mutation({
      query: ({ id, ...saleData }) => ({
        url: `sales/${id}`,
        method: "PUT",
        body: saleData,
      }),
      invalidatesTags: ({ id }) => [{ type: "Sales", id }, "Items"],
    }),
    deleteSale: builder.mutation({
      query: (id) => ({
        url: `sales/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sales", "Items"],
    }),

    // Purchases endpoints
    getPurchases: builder.query({
      query: () => "purchases",
      providesTags: ["Purchases"],
    }),
    getPurchaseById: builder.query({
      query: (id) => `purchases/${id}`,
      providesTags: (id) => [{ type: "Purchases", id }],
    }),
    createPurchase: builder.mutation({
      query: (purchaseData) => ({
        url: "purchases",
        method: "POST",
        body: purchaseData,
      }),
      invalidatesTags: ["Purchases", "Items"],
    }),
    updatePurchase: builder.mutation({
      query: ({ id, ...purchaseData }) => ({
        url: `purchases/${id}`,
        method: "PUT",
        body: purchaseData,
      }),
      invalidatesTags: ({ id }) => [{ type: "Purchases", id }, "Items"],
    }),
    deletePurchase: builder.mutation({
      query: (id) => ({
        url: `purchases/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Purchases", "Items"],
    }),

    // Dashboard endpoints
    getDashboardStats: builder.query({
      query: () => "dashboard/stats",
      providesTags: ["Users", "Items", "Sales", "Purchases"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,

  // Roles
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,

  // Items
  useGetItemsQuery,
  useGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,

  // CustomerVendors
  useGetCustomerVendorsQuery,
  useGetCustomerVendorByIdQuery,
  useCreateCustomerVendorMutation,
  useUpdateCustomerVendorMutation,
  useDeleteCustomerVendorMutation,

  // Sales
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,

  // Purchases
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,

  // Dashboard
  useGetDashboardStatsQuery,
} = api;
