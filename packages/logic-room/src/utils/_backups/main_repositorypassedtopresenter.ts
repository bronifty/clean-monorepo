import {
  IObservable,
  booksChild,
  booksParent,
  booksGrandParent,
} from "./store.ts";

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
  data: DataRecordType[];
  constructor(initialData: DataRecordType[]) {
    this.data = initialData;
  }
  select(): DatabaseDataType {
    return this.data;
  }
  insert(dataRecord: DataRecordType): ResultMessage {
    this.data.push(dataRecord);
    return { result: "success" };
  }
  delete(idx: number): ResultMessage {
    this.data = [...this.data.slice(0, idx), ...this.data.slice(idx + 1)];
    return { result: "success" };
  }
  load(): ResultMessage {
    this.data = [
      { name: "Book 1", author: "Author 1" },
      { name: "Book 2", author: "Author 2" },
    ];
    return { result: "success" };
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
    return { result: "success" };
  };
  delete = (path: string, idx: number): ResultMessage => {
    this.database.delete(idx);
    return { result: "success" };
  };
  load = (): ResultMessage => {
    this.database.load();
    return { result: "success" };
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
  apiUrl = "fakedata";
  private httpGateway: IHttpGateway;
  constructor(init: IObservable, httpGateway: IHttpGateway) {
    this._state = init;
    this.httpGateway = httpGateway;
  }
  publish = (): ResultMessage => {
    this._state.publish();
    return { result: "success" };
  };
  subscribe = (callback: (value: any) => void): UnsubscribeFunction => {
    return this._state.subscribe(callback);
  };
  get = (): ResultMessage => {
    const response = this.httpGateway.get(this.apiUrl);
    this._state.value = response.result;
    return { result: "success" };
  };
  set = (data: DataRecordType): ResultMessage => {
    this._state.value = [...this._state.value, data];
    return { result: "success" };
  };
  post = (data: DataRecordType): ResultMessage => {
    this._state.value = [...this._state.value, data];
    this.httpGateway.post(this.apiUrl, data);
    this.get();
    // this.publish(); // this.get retrieves data and sets this._state.value with it, which calls the observable's own publish method internally. no need for an extra publish
    return { result: "success" };
  };
  delete = (idx: number): ResultMessage => {
    this._state.value = [
      ...this._state.value.slice(0, idx),
      ...this._state.value.slice(idx + 1),
    ];
    this.httpGateway.delete(this.apiUrl, idx);
    this.get();
    this.publish();
    return { result: "success" };
  };
  load = (): ResultMessage => {
    this.httpGateway.load();
    this.get();
    return { result: "success" };
  };
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
  get = (callback) => {
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

function main({ observable }) {
  const database = DatabaseFactory.createDatabase([]);
  const httpGateway = HttpGatewayFactory.createHttpGateway(database);
  const repository = RepositoryFactory.createRepository(
    observable,
    httpGateway
  );
  const presenter = PresenterFactory.createPresenter(repository);

  presenter.get((value) => {
    console.log(value);
  });
  presenter.set({ name: "dummy title", author: "dummy author" });
}
main({ observable: booksChild });
