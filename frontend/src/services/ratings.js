import { db } from "../firebase";
import { runTransaction, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { createNotification } from "./notifications";

/**
 * Submits or updates a rating for a seller.
 * @param {string} sellerId 
 * @param {string} reviewerId 
 * @param {number} newRating 
 */
export const submitRating = async (sellerId, reviewerId, newRating) => {
    if (!sellerId || !reviewerId) throw new Error("Missing user information.");
    if (sellerId === reviewerId) throw new Error("You cannot rate yourself.");
    if (typeof newRating !== 'number' || newRating < 1 || newRating > 5) throw new Error("Rating must be between 1 and 5.");

    const sellerRef = doc(db, "users", sellerId);
    const ratingRef = doc(db, "users", sellerId, "ratings", reviewerId);

    try {
        await runTransaction(db, async (transaction) => {
            const sellerDoc = await transaction.get(sellerRef);
            if (!sellerDoc.exists()) {
                throw new Error("Seller does not exist!");
            }

            const ratingDoc = await transaction.get(ratingRef);
            
            let currentCount = sellerDoc.data().ratingsCount || 0;
            let currentSum = sellerDoc.data().ratingsSum || 0;
            
            let newCount, newSum;

            if (ratingDoc.exists()) {
                // UPDATING existing rating
                const oldRating = ratingDoc.data().rating;
                newCount = currentCount; // Count stays the same
                newSum = currentSum - oldRating + newRating;
            } else {
                // NEW rating
                newCount = currentCount + 1;
                newSum = currentSum + newRating;
            }

            // Prevent division by zero
            const newAvg = newCount === 0 ? 0 : newSum / newCount;

            // Update the seller document
            transaction.update(sellerRef, {
                averageRating: Number(newAvg.toFixed(1)), // Keep it to 1 decimal place
                ratingsCount: newCount,
                ratingsSum: newSum
            });

            // Set the rating document (reviewerId is the document ID)
            transaction.set(ratingRef, {
                reviewerId: reviewerId,
                rating: newRating,
                createdAt: serverTimestamp()
            }, { merge: true });
        });
        
        // Fetch reviewer name to send notification
        try {
            const reviewerRef = doc(db, "users", reviewerId);
            const reviewerSnap = await getDoc(reviewerRef);
            let reviewerName = "A user";
            if (reviewerSnap.exists()) {
                const data = reviewerSnap.data();
                reviewerName = data.name || (data.firstName ? `${data.firstName} ${data.lastName}` : "A user");
            }
            
            await createNotification(sellerId, {
                type: "rating",
                message: `${reviewerName} gave you a ${newRating}-star rating!`,
                link: `/seller/${sellerId}`
            });
        } catch (notifError) {
            console.error("Failed to send rating notification:", notifError);
        }

        return { success: true };
    } catch (error) {
        console.error("Transaction failed: ", error);
        throw error;
    }
};

/**
 * Fetches the user's current rating for a seller, if any.
 * @param {string} sellerId 
 * @param {string} reviewerId 
 * @returns {number|null} The rating (1-5) or null if not rated yet
 */
export const getUserRatingForSeller = async (sellerId, reviewerId) => {
    if (!sellerId || !reviewerId) return null;
    try {
        const ratingRef = doc(db, "users", sellerId, "ratings", reviewerId);
        const ratingDoc = await getDoc(ratingRef);
        if (ratingDoc.exists()) {
            return ratingDoc.data().rating;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user rating:", error);
        return null;
    }
};
