import React from "react";
import { FormPost, MapWithDeleteBtns } from "ui/src/components";

import {
  IObservable,
  booksChild,
  booksParent,
  booksGrandParent,
} from "../utils/store";
// import {
//   IObservable,
//   booksChild,
//   booksParent,
//   booksGrandParent,
// } from "./store.ts";

export type DataRecordType = { name: string; author: string };
export type RequestDTO = { result: DataRecordType[] }; // for the http.get
export type UnsubscribeFunction = () => void;
type ResultMessage = {
  result: "success";
};
type CustomError = "custom error";

export interface IDatabase {
  select(): DataRecordType[];
  insert(dataRecord: DataRecordType): ResultMessage;
  delete(idx: number): ResultMessage;
  load(): ResultMessage;
}
export type DatabaseDataType = { name: string; author: string }[];
export class Database implements IDatabase {
  private _value: DataRecordType[];
  constructor(initialData: DataRecordType[]) {
    this._value = initialData;
  }
  get value() {
    return this._value;
  }
  set value(newValue) {
    this._value = newValue;
  }
  select(): DatabaseDataType {
    return this._value;
  }
  insert(dataRecord: DataRecordType): ResultMessage {
    this._value = [...this._value, dataRecord];
    return { result: "success" };
  }
  delete(idx: number): ResultMessage {
    this._value = [...this._value.slice(0, idx), ...this._value.slice(idx + 1)];
    return { result: "success" };
  }
  load(): RequestDTO {
    this._value = [
      { name: "Book 1", author: "Author 1" },
      { name: "Book 2", author: "Author 2" },
    ];
    return { result: this._value };
  }
}
export class DatabaseFactory {
  static createDatabase(initialData: DatabaseDataType): IDatabase {
    return new Database(initialData);
  }
}
// const initialData = [];
// const initialData = [
//   { name: "Book 1", author: "Author 1" },
//   { name: "Book 2", author: "Author 2" },
// ];
// const booksDatabase = DatabaseFactory.createDatabase(initialData);
export interface IHttpGateway {
  get(path: string): { result: { name: string; author: string }[] };
  post(path: string, dataRecord: DataRecordType): ResultMessage;
  delete(path: string, idx: number): ResultMessage;
  load(): ResultMessage;
}
export class HttpGateway implements IHttpGateway {
  private database: IDatabase;
  constructor(database: IDatabase) {
    this.database = database;
  }
  get = (path: string) => {
    return { result: this.database.select() };
  };
  post = (path: string, dataRecord: DataRecordType): ResultMessage => {
    this.database.insert(dataRecord);
    return { result: this.database.select() };
  };
  delete = (path: string, idx: number): ResultMessage => {
    this.database.delete(idx);
    return { result: "success" };
  };
  load = (): RequestDTO => {
    return this.database.load();
  };
}
export class HttpGatewayFactory {
  static createHttpGateway(database: IDatabase): HttpGateway {
    return new HttpGateway(database);
  }
}
// const booksHttpGateway = HttpGatewayFactory.createHttpGateway(booksDatabase);
interface IRepository {
  publish(): ResultMessage;
  subscribe(callback: (value: any) => void): UnsubscribeFunction;
  get(): ResultMessage;
  set(data: DataRecordType): ResultMessage;
  post(data: DataRecordType): ResultMessage;
  delete(idx: number): ResultMessage;
  load(): ResultMessage;
}
class Repository implements IRepository {
  private _state: IObservable;
  private _dataSubscribers = [];
  private _valueFn;
  apiUrl = "fakedata";
  private httpGateway: IHttpGateway;
  constructor(init: IObservable, httpGateway: IHttpGateway) {
    this._state = init;
    this.httpGateway = httpGateway;
    this._valueFn = this._state._valueFn;
  }
  publish = (): ResultMessage => {
    this._state.publish();
    return { result: "success" };
  };
  subscribe = (callback: (value: any) => void): UnsubscribeFunction => {
    return this._state.subscribe(callback);
  };
  get = (): ResultMessage => {
    const { result } = this.httpGateway.get(this.apiUrl);
    this._state.value = result;
    return { result: "success" };
    // const response = this.httpGateway.get(this.apiUrl);
    // this._state.value = response.result;
    // return { result: "success" };
  };
  set = (data: DataRecordType): ResultMessage => {
    this._state.value = [...this._state.value, data];
    return { result: "success" };
  };
  post = (data: DataRecordType): ResultMessage => {
    const { result } = this.httpGateway.post(this.apiUrl, data);
    // this.get();
    this._state.value = result;
    this.notifyDataSubscribers();
    // Making a deep copy of the array before adding the new data
    // const currentData = JSON.parse(JSON.stringify(this._state.value));
    // console.log(`currentData ${currentData}`);
    // this._state.value = [...currentData, data];
    // this._state.value = [...this._state.value, data];
    // this.get();
    // this.notifyDataSubscribers();
    // this.publish(); // this.get retrieves data and sets this._state.value with it, which calls the observable's own publish method internally. no need for an extra publish
    return { result: "success" };
  };
  setStateWithoutNotification = (data: DatabaseDataType): void => {
    this._state.value = data;
  };
  delete = (idx: number): ResultMessage => {
    this.httpGateway.delete(this.apiUrl, idx);
    this._state.value = [
      ...this._state.value.slice(0, idx),
      ...this._state.value.slice(idx + 1),
    ];
    this.notifyDataSubscribers();
    return { result: "success" };
  };
  load = (): ResultMessage => {
    const { result } = this.httpGateway.load();
    this._state.value = result;
    return { result: "success" };
  };
  subscribeToDataUpdates = (callback) => {
    this._dataSubscribers.push(callback);
    return () => {
      const index = this._dataSubscribers.indexOf(callback);
      if (index > -1) {
        this._dataSubscribers.splice(index, 1);
      }
    };
  };
  notifyDataSubscribers(): void {
    for (const subscriber of this._dataSubscribers) {
      subscriber(this._state.value);
    }
  }
}
export class RepositoryFactory {
  static createRepository(
    observable: IObservable,
    httpGateway: IHttpGateway
  ): Repository {
    return new Repository(observable, httpGateway);
  }
}
export interface IPresenter {
  get(callback: (value: any) => void): () => void;
  set(fields: any): Promise<void>;
  delete(idx: number): Promise<void>;
}
export class Presenter implements IPresenter {
  private booksRepository: IRepository;
  constructor(repository: IRepository) {
    this.booksRepository = repository;
  }
  subscribe = (callback) => {
    return this.booksRepository.subscribe((repoModel) => {
      const presenterModel = repoModel.map((data) => {
        return { name: data.name, author: data.author };
      });
      callback(presenterModel);
    });
  };
  load = () => {
    this.booksRepository.load();
    this.booksRepository.publish();
  };
  set = async (fields) => {
    this.booksRepository.set(fields);
  };
  post = async (fields) => {
    this.booksRepository.post(fields);
  };
  delete = async (idx) => {
    this.booksRepository.delete(idx);
  };
}
export class PresenterFactory {
  static createPresenter(repository: IRepository): Presenter {
    return new Presenter(repository);
  }
}

// booksChild
const childDatabase = DatabaseFactory.createDatabase([]);
const childHttpGateway = HttpGatewayFactory.createHttpGateway(childDatabase);
const childRepository = RepositoryFactory.createRepository(
  booksChild,
  childHttpGateway
);
const childPresenter = PresenterFactory.createPresenter(childRepository);

// booksParent
const parentDatabase = DatabaseFactory.createDatabase([]);
const parentHttpGateway = HttpGatewayFactory.createHttpGateway(parentDatabase);
const parentRepository = RepositoryFactory.createRepository(
  booksParent,
  parentHttpGateway
);
const parentPresenter = PresenterFactory.createPresenter(parentRepository);

// booksGrandParent
const grandParentDatabase = DatabaseFactory.createDatabase([]);
const grandParentHttpGateway =
  HttpGatewayFactory.createHttpGateway(grandParentDatabase);
const grandParentRepository = RepositoryFactory.createRepository(
  booksGrandParent,
  grandParentHttpGateway
);
const grandParentPresenter = PresenterFactory.createPresenter(
  grandParentRepository
);

function repoSubs() {
  childRepository.subscribeToDataUpdates((newData) => {
    // const copiedData = JSON.parse(JSON.stringify(newData));
    // parentDatabase.value = copiedData;
    parentRepository.setStateWithoutNotification(newData);
    parentRepository.notifyDataSubscribers();
  });

  parentRepository.subscribeToDataUpdates((newData) => {
    // const copiedData = JSON.parse(JSON.stringify(newData));
    // grandParentDatabase.value = copiedData;
    grandParentRepository.setStateWithoutNotification(newData);
    grandParentRepository.notifyDataSubscribers();
  });
}
repoSubs();

function main() {
  childPresenter.subscribe((value) => {
    console.log(
      `childPresenter.subscribe (value) => console.log(${JSON.stringify(
        value,
        null,
        2
      )})`
    );
  });
  parentPresenter.subscribe((value) => {
    console.log(
      `parentPresenter.subscribe (value) => console.log(${JSON.stringify(
        value,
        null,
        2
      )})`
    );
  });
  console.log(`childPresenter.load()`);
  childPresenter.load();
  console.log(
    `childPresenter.post({ name: "dummy title", author: "dummy author" });`
  );
  childPresenter.post({ name: "dummy title", author: "dummy author" });
}
main();

// type BooksComposerProps = {
//   observable: IObservable;
// };
export function BooksComposer({ presenter, title }) {
  const [dataValue, setDataValue] = React.useState([]);

  // const title = `${observable._valueFn}`;

  React.useEffect(() => {
    const dataSubscription = presenter.subscribe((value) => {
      setDataValue(value);
    });
    presenter.load();
    return () => {
      dataSubscription();
    };
  }, []);
  return (
    <div>
      <h2>{title}</h2>
      <MapWithDeleteBtns dataValue={dataValue} presenter={presenter} />
      <FormPost presenter={presenter} />
    </div>
  );
}
export function BooksComposerLayout() {
  return (
    <>
      <BooksComposer presenter={childPresenter} title={"childPresenter"} />
      <div></div>
      <BooksComposer presenter={parentPresenter} title={"parentPresenter"} />
      <div></div>
      <BooksComposer
        presenter={grandParentPresenter}
        title={"grandParentPresenter"}
      />
    </>
  );
}
