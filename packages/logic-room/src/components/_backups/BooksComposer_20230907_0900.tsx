import React from "react";
import { Form, MapWithDeleteBtns } from "ui/src/components";
import {
  IObservable,
  booksChild,
  booksParent,
  booksGrandParent,
} from "../utils/store"; // observable data

export type DataRecordType = { name: string; author: string };
export type RequestDTO = { result: DataRecordType[] }; // for the http.get
export type UnsubscribeFunction = () => void;
type ResultMessage = {
  result: "success";
}; // for everything not returning data or the function
type CustomError = "custom error"; // throw a custom error

export interface IDatabase {
  get(): Promise<DataRecordType[]>;
  post(dataRecord: DataRecordType): Promise<ResultMessage>;
  delete(idx: number): Promise<ResultMessage>;
  load(): Promise<ResultMessage>;
}

export class Database implements IDatabase {
  data: DataRecordType[];
  constructor(initialData: DataRecordType[]) {
    this.data = initialData;
  }
  get = async (): Promise<DataRecordType[]> => {
    try {
      console.log(`this.data: ${JSON.stringify(this.data, null, 2)}`);
      return Promise.resolve(this.data);
    } catch (error) {
      throw new Error("custom error");
    }
  };
  post = async (dataRecord: DataRecordType): Promise<ResultMessage> => {
    try {
      this.data.push(dataRecord);
      return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  delete = async (idx: number): Promise<ResultMessage> => {
    try {
      this.data = [...this.data.slice(0, idx), ...this.data.slice(idx + 1)];
      return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  load = (): ResultMessage => {
    try {
      this.data = [
        { name: "Book 1", author: "Author 1" },
        { name: "Book 2", author: "Author 2" },
      ];
      return { result: "success" };
    } catch (error) {
      throw new Error("custom error");
    }
  };
}
export class DatabaseFactory {
  static createDatabase(initialData: DataRecordType[] = []): IDatabase {
    return new Database(initialData);
  }
}
const booksDatabase = DatabaseFactory.createDatabase();

export interface IHttpGateway {
  get(path: string): Promise<RequestDTO>;
  post(path: string, dataRecord: DataRecordType): Promise<ResultMessage>;
  delete(path: string, idx: number): Promise<ResultMessage>;
  load(): Promise<ResultMessage>;
}
export class HttpGateway implements IHttpGateway {
  private database: IDatabase;
  constructor(database: IDatabase) {
    this.database = database;
  }
  get = async (path: string): Promise<RequestDTO> => {
    try {
      const result = await this.database.get();
      console.log(`result: ${JSON.stringify(result, null, 2)}`);
      return Promise.resolve({ result });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  post = async (
    path: string,
    dataRecord: DataRecordType
  ): Promise<ResultMessage> => {
    try {
      // instead of passing the path to a fetch request, we are mocking that with a local db
      await this.database.post(dataRecord);
      return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  delete = async (path: string, idx: number): Promise<ResultMessage> => {
    try {
      await this.database.delete(idx);
      return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  load = (): ResultMessage => {
    try {
      this.database.load();
      return { result: "success" };
    } catch (error) {
      throw new Error("custom error");
    }
  };
}
export class HttpGatewayFactory {
  static createHttpGateway(database: IDatabase): HttpGateway {
    return new HttpGateway(database);
  }
}
const booksHttpGateway = HttpGatewayFactory.createHttpGateway(booksDatabase);
interface IRepository {
  publish(): Promise<ResultMessage>;
  subscribe(callback: (value: any) => void): Promise<UnsubscribeFunction>;
  get(path: string): Promise<ResultMessage>;
  post(requestDto: RequestDTO): Promise<ResultMessage>;
  delete(idx: number): Promise<ResultMessage>;
  load(): Promise<ResultMessage>;
}
class Repository implements IRepository {
  private _state: IObservable;
  apiUrl = "fakedata";
  private httpGateway: IHttpGateway;
  constructor(initObservable: IObservable, httpGateway: IHttpGateway) {
    this._state = initObservable;
    this.httpGateway = httpGateway;
  }
  get = async (): Promise<DataRecordType[]> => {
    try {
      const { result } = await this.httpGateway.get(this.apiUrl);
      this._state.value = result;
      await this.publish();
      return Promise.resolve({ result });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  post = async (requestDto: RequestDTO): Promise<ResultMessage> => {
    try {
      // optimistic update will trigger publish on the observable
      this._state.value = [...this._state.value, requestDto];
      // update the api datastore
      await this.httpGateway.post(this.apiUrl, requestDto);
      // fetch new data; will update repository state and trigger publish on the observable
      await this.get();
      return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  delete = async (idx: number): Promise<ResultMessage> => {
    try {
      // optimistic update will trigger publish on the observable
      this._state.value = [
        ...this._state.value.slice(0, idx),
        ...this._state.value.slice(idx + 1),
      ];
      // update the api datastore
      await this.httpGateway.delete(this.apiUrl, idx);
      // fetch new data; will update repository state and trigger publish on the observable
      await this.get();
      return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  publish = async (): Promise<ResultMessage> => {
    try {
      this._state.publish();
      return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  subscribe = (callback: (value: any) => void): (() => void) => {
    return this._state.subscribe(callback);
  };
  // subscribe = async (
  //   callback: (value: any) => void
  // ): Promise<UnsubscribeFunction> => {
  //   try {
  //     const result = this._state.subscribe(callback);
  //     console.log(`result: ${JSON.stringify(result, null, 2)}`);
  //     return Promise.resolve(result);
  //   } catch (error) {
  //     throw new Error("custom error");
  //   }
  // };
  load = (): ResultMessage => {
    try {
      this.httpGateway.load();
      return { result: "success" };
      // return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
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
  load(): Promise<ResultMessage>;
  post(fields: any): Promise<void>;
  delete(idx: number): Promise<void>;
}
export class Presenter implements IPresenter {
  private booksRepository: IRepository;
  constructor(observable: IObservable) {
    this.booksRepository = RepositoryFactory.createRepository(observable);
  }
  // load = async (): Promise<ResultMessage> => {
  //   try {
  //     await this.booksRepository.load();
  //     return Promise.resolve({ result: "success" });
  //   } catch (error) {
  //     throw new Error("custom error");
  //   }
  // };
  // subscribe = (callback: (value: any) => void): (() => void) => {
  //   return this.booksRepository.subscribe(
  //     (observableDataModel: DataRecordType[]) => {
  //       const presenterDataModel = observableDataModel.map((item) => {
  //         return { name: item.name, author: item.author };
  //       });
  //       callback(presenterDataModel);
  //     }
  //   );
  // };
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
  publish = async (): Promise<ResultMessage> => {
    try {
      this.booksRepository.publish();
      return Promise.resolve({ result: "success" });
    } catch (error) {
      throw new Error("custom error");
    }
  };
  // load = async (callback: (value: DataRecordType[]) => void) => {
  //   await this.booksRepository.init();
  //   const unload = await this.booksRepository.subscribe(
  //     (repoModel: DataRecordType[]) => {
  //       const presenterModel = repoModel.map((data) => {
  //         return { name: data.name, author: data.author };
  //       });
  //       callback(presenterModel);
  //     }
  //   );
  //   console.log(`unload ${JSON.stringify(unload, null, 2)}`);
  //   return unload;
  // };
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
  // React.useEffect(() => {
  //   // const booksRepositoryTest = RepositoryFactory.createRepository(observable);
  //   let unsub: UnsubscribeFunction;
  //   const load = async () => {
  //     try {
  //       await booksPresenter.load();
  //       unsub = booksPresenter.subscribe((val) => setDataValue(val));
  //       await booksPresenter.publish();
  //       // unsub = booksRepositoryTest.subscribe((val) => console.log(val));
  //       // await booksRepositoryTest.init();
  //       // const result = await booksRepositoryTest.get();
  //       // console.log(
  //       //   `booksRepositoryTest.get() ${JSON.stringify(result, null, 2)}`
  //       // );
  //     } catch (error) {}
  //     // console.log(
  //     //   `useEffect testData from booksRepositoryTest.get(): ${JSON.stringify(
  //     //     unsub,
  //     //     null,
  //     //     2
  //     //   )}`
  //     // );
  //   };
  //   load();
  //   return () => {
  //     unsub();
  //   };
  // }, []);
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
