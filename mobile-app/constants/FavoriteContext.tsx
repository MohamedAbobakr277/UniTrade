import React, { createContext, useContext, useState } from "react";

const FavoriteContext = createContext<any>(null);

export const FavoriteProvider = ({ children }: any) => {

  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {

    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fav) => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }

  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );

};

export const useFavorites = () => useContext(FavoriteContext);