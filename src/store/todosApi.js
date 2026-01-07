import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const todosApi = createApi({
  reducerPath: "todosApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3036",

    //allow refresh-token cookie
    credentials: "include",

    // 🔐 Attach access token
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState()?.auth?.accessToken ||
        localStorage.getItem("accessToken");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Todos"],

  endpoints: (builder) => ({
    getTodos: builder.query({
      query: () => "/todos",
      providesTags: ["Todos"],
    }),

    addTodo: builder.mutation({
      query: (body) => ({
        url: "/todos",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Todos"],
    }),

    updateTodo: builder.mutation({
      query: ({ id, title }) => ({
        url: `/todos/${id}`,
        method: "PUT",
        body: { title },
      }),
      invalidatesTags: ["Todos"],
    }),

    deleteTodo: builder.mutation({
      query: (id) => ({
        url: `/todos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Todos"],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todosApi;
