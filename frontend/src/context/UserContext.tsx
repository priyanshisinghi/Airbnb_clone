"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchCurrentUser, fetchUsers } from "@/lib/api";
import { DemoUser } from "@/types/user";

const USER_STORAGE_KEY = "selectedUserId";

interface UserContextValue {
  users: DemoUser[];
  currentUser: DemoUser | null;
  selectedUserId: number | null;
  loading: boolean;
  switchUser: (userId: number) => void;
}

const UserContext = createContext<UserContextValue>({
  users: [],
  currentUser: null,
  selectedUserId: null,
  loading: true,
  switchUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = Number(window.localStorage.getItem(USER_STORAGE_KEY));

    fetchUsers()
      .then((availableUsers) => {
        setUsers(availableUsers);
        const storedUser = availableUsers.find((user) => user.id === storedId);
        const defaultUser = availableUsers.find(
          (user) => user.email === "demo.guest@example.com"
        ) || availableUsers[0];
        const nextUser = storedUser || defaultUser;

        if (!nextUser) return;

        window.localStorage.setItem(USER_STORAGE_KEY, String(nextUser.id));
        setSelectedUserId(nextUser.id);
        return fetchCurrentUser().then(setCurrentUser);
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const switchUser = useCallback(
    (userId: number) => {
      const nextUser = users.find((user) => user.id === userId);
      if (!nextUser) return;

      window.localStorage.setItem(USER_STORAGE_KEY, String(userId));
      setSelectedUserId(userId);
      setCurrentUser(nextUser);
    },
    [users]
  );

  return (
    <UserContext.Provider
      value={{ users, currentUser, selectedUserId, loading, switchUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
