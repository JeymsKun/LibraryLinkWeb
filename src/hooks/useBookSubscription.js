// src/hooks/useBookSubscription.js
import { useEffect } from "react";
import { supabase } from "../supabase/client";

const useBookSubscription = (genres, fetchBooksForGenres) => {
  useEffect(() => {
    const channel = supabase
      .channel("books-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "books" },
        (payload) => {
          console.log("Change received!", payload);
          if (genres.length > 0) {
            fetchBooksForGenres(genres);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [genres, fetchBooksForGenres]);
};

export default useBookSubscription;
