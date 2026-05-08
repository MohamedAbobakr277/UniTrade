import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../app/services/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface NotificationContextType {
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType>({ unreadCount: 0 });

/**
 * Resolves whether a notification document is "unread".
 * Handles both field names: `read` and `isRead`, and treats
 * documents with neither field as unread (safe default).
 */
function isDocUnread(data: Record<string, any>): boolean {
  if (typeof data.isRead === "boolean") return !data.isRead;
  if (typeof data.read === "boolean") return !data.read;
  return true; // missing field → treat as unread
}

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let notifUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      // Tear down any previous listener
      if (notifUnsub) {
        notifUnsub();
        notifUnsub = null;
      }

      if (!user) {
        setUnreadCount(0);
        return;
      }

      // Listen to the full collection and count client-side so we handle
      // both `read` and `isRead` field names without Firestore compound queries.
      notifUnsub = onSnapshot(
        collection(db, "users", user.uid, "notifications"),
        (snap) => {
          const count = snap.docs.filter((d) => isDocUnread(d.data())).length;
          setUnreadCount(count);
        },
        () => setUnreadCount(0)
      );
    });

    return () => {
      authUnsub();
      if (notifUnsub) notifUnsub();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
