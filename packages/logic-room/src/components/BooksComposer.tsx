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
    return this._state.subscribe(callback);
  };
  publish = () => {
    this._state.publish();
  };
  post = (data) => {
    this._state.value = [...this._state.value, data];
  };
  delete = (idx) => {
    this._state.value = this._state.value.splice(idx, 1);
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
    booksRepository.post(fields);
  };
  delete = async () => {
    booksRepository.delete(1);
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
      <button onClick={() => presenter.delete()}>delete</button>
    </div>
  );
}
