import React from "react";
import { Form, MapWithDeleteBtns } from "ui/src/components";
import {
  IObservable,
  booksChild,
  booksParent,
  booksGrandParent,
} from "../utils/store"; // observable data
export interface IDatabase {
  data: DatabaseDataType;
  getData(): DatabaseDataType;
  insertData(newData: { name: string; author: string }): void;
  clearData(): void;
}
export type DatabaseDataType = { name: string; author: string }[];
export class Database implements IDatabase {
  data: DatabaseDataType;
  constructor(initialData: DatabaseDataType) {
    this.data = initialData;
  }
  getData(): DatabaseDataType {
    return this.data;
  }
  insertData(newData: { name: string; author: string }): void {
    this.data.push(newData);
  }
  clearData(): void {
    this.data.length = 0;
  }
}
export class DatabaseFactory {
  static createDatabase(initialData: DatabaseDataType): IDatabase {
    return new Database(initialData);
  }
}
const initialData = [
  { name: "Book 1", author: "Author 1" },
  { name: "Book 2", author: "Author 2" },
];
const booksDatabase = DatabaseFactory.createDatabase(initialData);
export interface IHttpGateway {
  get(path: string): { result: { name: string; author: string }[] };
  post(
    path: string,
    requestDto: { name: string; author: string }
  ): { success: boolean };
  delete(path: string): { success: boolean };
}
export class HttpGateway implements IHttpGateway {
  private database: IDatabase;
  constructor(database: IDatabase) {
    this.database = database;
  }
  get = (path: string) => {
    return { result: this.database.getData() };
  };
  post = (path: string, requestDto: { name: string; author: string }) => {
    this.database.insertData(requestDto);
    return { success: true };
  };
  delete = (path: string) => {
    this.database.clearData();
    return { success: true };
  };
}
export class HttpGatewayFactory {
  static createHttpGateway(database: IDatabase): HttpGateway {
    return new HttpGateway(database);
  }
}
const booksHttpGateway = HttpGatewayFactory.createHttpGateway(booksDatabase);
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
  private httpGateway: IHttpGateway;
  constructor(init: IObservable, httpGateway: IHttpGateway) {
    this._state = init;
    this.httpGateway = httpGateway;
  }
  load = () => {
    const response = this.httpGateway.get(this.apiUrl);
    this._state.value = response.result;
  };
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
export class RepositoryFactory {
  static createRepository(
    observable: IObservable,
    httpGateway: IHttpGateway = booksHttpGateway
  ): Repository {
    return new Repository(observable, httpGateway);
  }
}
export interface IPresenter {
  load(callback: (value: any) => void): () => void;
  post(fields: any): Promise<void>;
  delete(idx: number): Promise<void>;
}
export class Presenter implements IPresenter {
  private booksRepository: IRepository;
  constructor(observable: IObservable) {
    this.booksRepository = RepositoryFactory.createRepository(observable);
  }
  load = (callback) => {
    this.booksRepository.load();
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
export class PresenterFactory {
  static createPresenter(observable: IObservable): Presenter {
    return new Presenter(observable);
  }
}
type BooksComposerProps = {
  observable: IObservable;
};
export function BooksComposer({ observable }: BooksComposerProps) {
  const title = `${observable._valueFn}`;
  const booksPresenter = PresenterFactory.createPresenter(observable);
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
