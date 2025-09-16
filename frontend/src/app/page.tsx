// src/app/page.tsx
import TodoList from "@/components/todos/TodoList";
import LogoutButton from "@/components/auth/LogoutButton";

export default function HomePage() {
  return (
    <main>
      <div className="fixed w-full z-10 px-6 py-4 bg-white mb-6 flex items-center justify-between shadow">
        <h1 className="text-2xl font-semibold">My Todos</h1>
        <LogoutButton />
      </div>
      <div className="p-6 pt-[92px]">
        <TodoList />
      </div>
    </main>
  );
}
