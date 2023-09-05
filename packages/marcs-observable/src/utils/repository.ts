import { ObservableFactory, IObservable } from "./observable";
import httpGateway from "./gateway";

class BooksRepository {
  programmersModel = null;
  apiUrl = "fakeurl";

  constructor() {
    this.programmersModel = new Observable([]);
  }

  getBooks = async (callback) => {
    this.programmersModel.subscribe(callback);
    await this.loadApiData();
    this.programmersModel.notify();
  };

  addBook = async (fields) => {
    await this.postApiData(fields);
    await this.loadApiData();
    this.programmersModel.notify();
  };

  removeBooks = async () => {
    await this.deleteApiData();
    await this.loadApiData();
    this.programmersModel.notify();
  };

  loadApiData = async () => {
    const booksDto = await httpGateway.get(this.apiUrl + "books");
    this.programmersModel.value = booksDto.result.map((bookDto) => {
      return bookDto;
    });
  };

  postApiData = async (fields) => {
    await httpGateway.post(this.apiUrl + "books", fields);
  };

  deleteApiData = async () => {
    await httpGateway.get(this.apiUrl + "reset");
  };
}

const booksRepository = new BooksRepository();
export default booksRepository;
