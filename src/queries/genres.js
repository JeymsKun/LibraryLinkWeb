import { supabase } from "../supabase/client";

export const fetchGenres = async () => {
  const { data, error } = await supabase.from("genres").select("*");

  if (error) {
    throw new Error("Failed to fetch genres: " + error.message);
  }

  return data;
};
