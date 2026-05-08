import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export interface SellerRating {
  average: number;
  count: number;
}

/**
 * A hook that listens to a seller's rating in real-time from Firestore.
 * It uses the aggregated averageRating and ratingsCount fields in the user document.
 */
export const useSellerRating = (sellerId: string | undefined) => {
  const [rating, setRating] = useState<SellerRating>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = doc(db, "users", sellerId);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRating({
          average: data.averageRating || 0,
          count: data.ratingsCount || 0,
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to seller rating:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sellerId]);

  return { rating, loading };
};
