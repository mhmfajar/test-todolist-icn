// src/app/page.tsx
import TodoList from "@/components/todos/TodoList";
import LogoutButton from "@/components/auth/LogoutButton";

export default function HomePage() {
  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Todos</h1>
        <LogoutButton />
      </div>
      <TodoList />
    </main>
  );
}
