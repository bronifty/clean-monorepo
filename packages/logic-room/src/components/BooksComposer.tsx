import React from "react";
import { Form } from "ui/src/components";
import { booksChild, IObservable } from "../utils/store"; // observable data
interface IBooksRepository {
  subscribe(callback: Function): Function;
  publish(): void;
  post(data: any): void;
  delete(idx: number): void;
  load(): void;
  // ... other method signatures
}
type BooksRepositoryProperties = {
  _state: IObservable;
  apiUrl: string;
};
class BooksRepository implements IBooksRepository {
  private _state: IObservable;
  apiUrl = "fakedata";
  constructor(init: IObservable) {
    this._state = init;
  }
  subscribe = (callback: (value: any) => void): (() => void) => {
    const unsubscribe = this._state.subscribe(callback);
    console.log(`this._state: ${JSON.stringify(this._state, null, 2)}`);
    console.log(`unsubscribe: ${JSON.stringify(unsubscribe, null, 2)}`);
    return unsubscribe;
  };
  publish = () => {
    this._state.publish();
  };
  post = (data) => {
    this._state.value = [...this._state.value, data];
  };
  delete = (idx) => {
    this._state.value.splice(idx, 1);
  };

  load = () => {
    // Load data from API
  };
  getBooks = async (callback) => {
    this._state.subscribe(callback);
    await this.loadApiData();
    this._state.publish();
  };
  addBook = async (fields) => {
    await this.postApiData(fields);
    await this.loadApiData();
    this._state.publish();
  };
  removeBooks = async () => {
    await this.deleteApiData();
    await this.loadApiData();
    this._state.publish();
  };
  loadApiData = async () => {
    const booksDto = await httpGateway.get(this.apiUrl + "books");
    this._state.value = booksDto.result.map((bookDto) => {
      return bookDto;
    });
  };
  postApiData = async (fields) => {
    await httpGateway.post(this.apiUrl + "books", fields);
  };
  deleteApiData = async () => {
    await httpGateway.delete(this.apiUrl + "reset");
  };
}
const booksRepository = new BooksRepository(booksChild);
export class BooksPresenter {
  load = (callback) => {
    const unload = booksRepository.subscribe((repoModel) => {
      const presenterModel = repoModel.map((data) => {
        return { name: data.name, author: data.author };
      });
      callback(presenterModel);
    });
    booksRepository.publish();
    return unload;
  };
  post = async (fields) => {
    await booksRepository.addBook(fields);
  };
  delete = async () => {
    await booksRepository.removeBooks();
  };
}

export function BooksComposer() {
  const title = "booksComposer same as booksChild data";
  const presenter = new BooksPresenter();
  const data = booksChild;
  const [dataValue, setDataValue] = React.useState([]);
  React.useEffect(() => {
    const dataSubscription = presenter.load((value) => {
      setDataValue(value);
    });
    return () => {
      dataSubscription();
    };
  }, []);

  return (
    <div>
      <h2>{title}</h2>
      <div>{JSON.stringify(dataValue, null, 2)}</div>
      <Form data={data} />
    </div>
  );
}
