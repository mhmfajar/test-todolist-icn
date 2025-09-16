import { create } from "zustand";
import { apiFetch } from "@/lib/apiFetch";
import type { Todo } from "@/types/todo";

type TodosState = {
  todos: Todo[];
  loading: boolean;
  suggestLoading: boolean;
  suggestions: string[];

  loadTodos: (page?: number) => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;

  generateSuggestions: (prompt: string, count?: number) => Promise<void>;
  clearSuggestions: () => void;
  createFromSuggestionsJoin: () => Promise<void>;
};

export const useTodosStore = create<TodosState>((set, get) => ({
  todos: [],
  loading: false,
  suggestLoading: false,
  suggestions: [],

  loadTodos: async (page = 1) => {
    const res = await apiFetch(`/todos?page=${page}`);
    if (res.ok) {
      const body = await res.json();
      set({ todos: body.data });
    }
  },

  addTodo: async (text: string) => {
    if (!text.trim()) return;
    set({ loading: true });
    try {
      const res = await apiFetch("/todos", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        await get().loadTodos();
      }
    } finally {
      set({ loading: false });
    }
  },

  deleteTodo: async (id: string) => {
    const res = await apiFetch(`/todos/${id}`, { method: "DELETE" });
    if (res.ok) await get().loadTodos();
  },

  generateSuggestions: async (prompt: string, count = 3) => {
    if (!prompt.trim()) return;
    set({ suggestLoading: true });
    try {
      const res = await apiFetch("/suggestions", {
        method: "POST",
        body: JSON.stringify({ input: prompt, count }),
      });
      if (res.ok) {
        const body = await res.json();
        set({ suggestions: body.data ?? body.suggestions ?? [] });
      } else {
        set({ suggestions: [] });
      }
    } finally {
      set({ suggestLoading: false });
    }
  },

  clearSuggestions: () => set({ suggestions: [] }),

  createFromSuggestionsJoin: async () => {
    const all = get().suggestions;
    if (!all.length) return;
    await get().addTodo(all.join(", "));
    set({ suggestions: [] });
  },
}));
