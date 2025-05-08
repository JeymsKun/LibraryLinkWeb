const useSearchFilter = (books = [], searchTerm = "") => {
  if (!searchTerm.trim()) return books;

  const term = searchTerm.toLowerCase();

  return books.filter((book) =>
    [
      book.title,
      book.author,
      book.isbn,
      book.publisher,
      book.barcode,
      book.description,
      book.genre,
      book.year?.toString(),
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term))
  );
};

export default useSearchFilter;
