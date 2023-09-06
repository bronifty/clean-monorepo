import React from "react";
import { Form, MapWithDeleteBtns } from "ui/src/components";
import { booksChild, IObservable } from "../utils/store"; // observable data
interface IRepository {
  subscribe(callback: Function): Function;
  publish(): void;
  post(data: any): void;
  delete(idx: number): void;
  load(): void;
}
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
export interface IPresenter {
  load(callback: (value: any) => void): () => void;
  post(fields: any): Promise<void>;
  delete(idx: number): Promise<void>;
}
export class Presenter implements IPresenter {
  private booksRepository: IRepository;
  constructor(observable: IObservable) {
    this.booksRepository = new Repository(observable);
  }
  load = (callback) => {
    const unload = this.booksRepository.subscribe((repoModel) => {
      const presenterModel = repoModel.map((data) => {
        return { name: data.name, author: data.author };
      });
      callback(presenterModel);
    });
    this.booksRepository.publish();
    return unload;
  };
  post = async (fields) => {
    this.booksRepository.post(fields);
  };
  delete = async (idx) => {
    this.booksRepository.delete(idx);
  };
}
type BooksComposerProps = {
  observable: IObservable;
};
export function BooksComposer({ observable }: BooksComposerProps) {
  const title = "booksComposer same as booksChild data";
  const booksPresenter = new Presenter(observable);
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
      <MapWithDeleteBtns dataValue={dataValue} presenter={booksPresenter} />
      <Form data={booksPresenter} />
    </div>
  );
}

export function BooksComposerLayout() {
  return (
    <>
      <BooksComposer observable={booksChild} />
      <div></div>
      <BooksComposer observable={booksParent} />
      <div></div>
      <BooksComposer observable={booksGrandParent} />
    </>
  );
}
