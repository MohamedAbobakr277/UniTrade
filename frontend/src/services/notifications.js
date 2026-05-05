import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

// Create a notification for a specific user
export const createNotification = async (userId, data) => {
    try {
        if (!userId) return;
        const notificationsRef = collection(db, "users", userId, "notifications");
        await addDoc(notificationsRef, {
            ...data,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

// Listen to user's notifications
export const subscribeToNotifications = (userId, callback) => {
    if (!userId) return () => {};
    const q = query(
        collection(db, "users", userId, "notifications"),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(notifications);
    });
};

// Mark notification as read
export const markNotificationAsRead = async (userId, notificationId) => {
    try {
        if (!userId || !notificationId) return;
        const notifRef = doc(db, "users", userId, "notifications", notificationId);
        await updateDoc(notifRef, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};
