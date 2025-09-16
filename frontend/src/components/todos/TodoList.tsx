"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";
import { apiFetch } from "@/lib/apiFetch";
import { Textarea } from "@/components/ui/textarea";

export default function TodoList() {
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [newText, setNewText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = React.useState(false);

  async function loadTodos(page = 1) {
    const res = await apiFetch(`/todos?page=${page}`);
    if (res.ok) {
      const body = await res.json();
      setTodos(body.data);
    }
  }

  async function addTodo(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch("/todos", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (res.ok) await loadTodos();
    } finally {
      setLoading(false);
    }
  }

  async function updateTodo(id: string, text: string) {
    if (!text.trim()) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));

    const res = await apiFetch(`/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      await loadTodos();
    }
  }

  async function deleteTodo(id: string) {
    const res = await apiFetch(`/todos/${id}`, { method: "DELETE" });
    if (res.ok) await loadTodos();
  }

  async function onSubmitAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    await addTodo(text);
    setNewText("");
  }

  async function onGenerateSuggestions(e: React.FormEvent) {
    e.preventDefault();
    const prompt = newText.trim();
    if (!prompt) return;
    setSuggestLoading(true);
    try {
      const res = await apiFetch("/suggestions", {
        method: "POST",
        body: JSON.stringify({ input: prompt, count: 3 }),
      });
      if (res.ok) {
        const body = (await res.json()) as {
          data?: string[];
          suggestions?: string[];
        };
        setSuggestions(body.data ?? body.suggestions ?? []);
      } else {
        setSuggestions([]);
      }
    } finally {
      setSuggestLoading(false);
    }
  }

  React.useEffect(() => {
    loadTodos();
  }, []);

  const disabled = loading || suggestLoading;

  return (
    <div className="grid gap-4">
      {/* Add form */}
      <form className="flex gap-2" onSubmit={onSubmitAdd}>
        <Textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a new todo..."
          disabled={disabled}
        />
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={disabled || !newText.trim()}>
            Add
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onGenerateSuggestions}
            disabled={disabled || !newText.trim()}
          >
            {suggestLoading ? "Generating..." : "Generate Suggestions"}
          </Button>
        </div>
      </form>

      {/* Inline suggestions panel */}
      {suggestions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">Suggestions</h3>
          <ul className="grid gap-2">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2">
            <Button
              onClick={async () => {
                const combined = suggestions.join(", ");
                await addTodo(combined);
                setSuggestions([]);
                setNewText("");
              }}
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Create single todo from suggestions
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSuggestions([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <ul className="grid gap-2">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={(text) => updateTodo(todo.id, text)}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">No todos yet.</p>
        )}
      </ul>
    </div>
  );
}
