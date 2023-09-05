import booksRepository from "./repository";

export class BooksPresenter {
  load = async (callback) => {
    await booksRepository.getBooks((booksPm) => {
      const booksVm = booksPm.map((bookPm) => {
        return { name: bookPm.name };
      });
      callback(booksVm);
    });
  };
  post = async (fields) => {
    await booksRepository.addBook(fields);
  };
  delete = async () => {
    await booksRepository.removeBooks();
  };
}
