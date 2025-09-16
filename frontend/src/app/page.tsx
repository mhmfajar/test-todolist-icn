import TodoList from "@/components/todos/TodoList";
import LogoutButton from "@/components/auth/LogoutButton";
import { useAuthStore } from "@/stores/auth";
import { useEffect } from "react";

export default function HomePage() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => hydrate(), [hydrate]);

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
