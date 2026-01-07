import { useState } from "react";
import {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} from "./store/todosApi";

export default function Todo() {
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { data: todos = [], isLoading } = useGetTodosQuery();
  const [addTodo] = useAddTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      await updateTodo({ id: editingId, title });
    } else {
      await addTodo({ title });
    }

    setTitle("");
    setEditingId(null);
  };

  const handleEdit = (todo) => {
    setTitle(todo.title);
    setEditingId(todo.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await deleteTodo(id);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Todo</h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo"
            className="flex-1 border rounded px-3 py-2"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingId ? "Update" : "Add"}
          </button>
        </form>

        <table className="w-full text-sm border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Title</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : todos.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center">
                  add todo
                </td>
              </tr>
            ) : (
              todos.map((todo) => (
                <tr key={todo.id} className="border-t">
                  <td className="p-2">{todo.id}</td>
                  <td className="p-2">{todo.title}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

