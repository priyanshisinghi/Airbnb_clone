"use client";

import { useUser } from "@/context/UserContext";

export default function UserSwitcher() {
  const { users, selectedUserId, switchUser, loading } = useUser();

  return (
    <div className="border-b border-gray-100 px-4 py-3">
      <label htmlFor="demo-user" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
        Demo user
      </label>
      <select
        id="demo-user"
        value={selectedUserId ?? ""}
        disabled={loading || users.length === 0}
        onChange={(event) => switchUser(Number(event.target.value))}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-gray-900 disabled:bg-gray-50"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.is_host ? "Host" : "Guest"})
          </option>
        ))}
      </select>
    </div>
  );
}
