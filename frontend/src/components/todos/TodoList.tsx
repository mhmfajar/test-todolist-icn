"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TodoItem from "./TodoItem";
import { useTodosStore } from "@/stores/todos";

export default function TodoList() {
  const {
    todos,
    loading,
    suggestLoading,
    suggestions,
    loadTodos,
    addTodo,
    deleteTodo,
    generateSuggestions,
    clearSuggestions,
    createFromSuggestionsJoin,
  } = useTodosStore();

  const [newText, setNewText] = React.useState("");

  React.useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const disabled = loading || suggestLoading;

  async function onSubmitAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    await addTodo(text);
    setNewText("");
  }

  async function onGenerateSuggestions(e: React.FormEvent) {
    e.preventDefault();
    await generateSuggestions(newText.trim(), 3);
  }

  return (
    <div className="grid gap-4">
      {/* Add form */}
      <form className="flex gap-2" onSubmit={onSubmitAdd}>
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a new todo..."
          disabled={disabled}
        />
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
              onClick={createFromSuggestionsJoin}
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Create single todo from suggestions
            </Button>
            <Button type="button" variant="ghost" onClick={clearSuggestions}>
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
              onUpdate={(text) =>
                fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${todo.id}`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ text }),
                  }
                ).then(() => loadTodos())
              }
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
