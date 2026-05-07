import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc, where, getDocs, deleteDoc } from "firebase/firestore";
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

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
    try {
        if (!userId) return;
        const notifsRef = collection(db, "users", userId, "notifications");
        const q = query(notifsRef, where("read", "==", false));
        const querySnapshot = await getDocs(q);
        
        const updates = querySnapshot.docs.map(doc => 
            updateDoc(doc.ref, { read: true })
        );
        
        await Promise.all(updates);
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
};

// Delete a single notification
export const deleteNotification = async (userId, notificationId) => {
    try {
        if (!userId || !notificationId) return;
        const notifRef = doc(db, "users", userId, "notifications", notificationId);
        await deleteDoc(notifRef);
    } catch (error) {
        console.error("Error deleting notification:", error);
    }
};

// Notify users who favorited an item about a price drop
export const notifyPriceDrop = async (productId, productTitle, oldPrice, newPrice) => {
    try {
        if (!productId) return;
        
        // Find all users who have this product in their favourites
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("favourites", "array-contains", productId));
        const querySnapshot = await getDocs(q);
        
        const notifications = querySnapshot.docs.map(userDoc => {
            const userId = userDoc.id;
            return createNotification(userId, {
                type: "price_drop",
                message: `Price drop! 💸 The item "${productTitle}" is now EGP ${newPrice} (was EGP ${oldPrice})`,
                productId: productId,
                link: `/item/${productId}`
            });
        });

        await Promise.all(notifications);
    } catch (error) {
        console.error("Error sending price drop notifications:", error);
    }
};

// Notify users who favorited an item that it has been sold
export const notifyItemSold = async (productId, productTitle) => {
    try {
        if (!productId) return;
        
        // Find all users who have this product in their favourites
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("favourites", "array-contains", productId));
        const querySnapshot = await getDocs(q);
        
        const notifications = querySnapshot.docs.map(userDoc => {
            const userId = userDoc.id;
            return createNotification(userId, {
                type: "item_sold",
                message: `Update: The item "${productTitle}" you favorited has been sold. 🛍️`,
                productId: productId,
                link: `/item/${productId}`
            });
        });

        await Promise.all(notifications);
    } catch (error) {
        console.error("Error sending item sold notifications:", error);
    }
};


