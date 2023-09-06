import React from "react";
import { Form } from "ui/src/components";
import { booksChild, IObservable } from "../utils/store"; // observable data
interface IRepository {
  subscribe(callback: Function): Function;
  publish(): void;
  post(data: any): void;
  delete(idx: number): void;
  load(): void;
  // ... other method signatures
}
type RepositoryProperties = {
  _state: IObservable;
  apiUrl: string;
};
class Repository implements IRepository {
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
    this._state.value = [
      ...this._state.value.slice(0, idx),
      ...this._state.value.slice(idx + 1),
    ];
  };
}
const booksRepository = new Repository(booksChild);

export interface IPresenter {
  load(callback: (value: any) => void): () => void;
  post(fields: any): Promise<void>;
  delete(idx: number): Promise<void>;
}
export class Presenter implements IPresenter {
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
  delete = async (idx) => {
    booksRepository.delete(idx);
  };
}

export function BooksComposer() {
  const title = "booksComposer same as booksChild data";
  const booksPresenter = new Presenter();
  const data = booksChild;
  const [dataValue, setDataValue] = React.useState([]);
  React.useEffect(() => {
    const dataSubscription = booksPresenter.load((value) => {
      setDataValue(value);
    });
    return () => {
      dataSubscription();
    };
  }, []);

  return (
    <div>
      <h2>{title}</h2>
      <div>
        {dataValue?.map((val, idx) => (
          <>
            <div key={idx}>
              <span>{val.name}</span> |<span>{val.author}</span>
            </div>
            <button onClick={() => booksPresenter.delete(idx)}>Delete</button>
          </>
        ))}
      </div>
      {/* <div>{JSON.stringify(dataValue, null, 2)}</div> */}
      <Form data={booksPresenter} />
      <button onClick={() => booksPresenter.delete()}>delete</button>
    </div>
  );
}
