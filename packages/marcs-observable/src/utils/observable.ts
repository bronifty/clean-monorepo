export interface IObservableMethods {
  publish(): void;
  subscribe(handler: Function): void;
  push(item: any): void;
  compute(): void;
}

export type IObservableProperties = {
  value: any;
  _dependencyArray: IObservable[];
};

export type IObservable = IObservableMethods & IObservableProperties;

export class Observable implements IObservable {
  private _value: any;
  private _subscribers: Function[] = [];
  private _valueFn: Function | null = null;
  private _valueFnArgs: any[] = [];
  static _computeActive: IObservable | null = null;
  _dependencyArray: IObservable[] = [];

  constructor(init: Function | any, ...args: any[]) {
    if (typeof init === "function") {
      this._valueFn = init;
      this._valueFnArgs = args;
      this.compute();
    } else {
      this._value = init;
    }
  }
  get value() {
    if (
      Observable._computeActive &&
      Observable._computeActive !== this &&
      !Observable._computeActive._dependencyArray.includes(this)
    ) {
      Observable._computeActive._dependencyArray.push(this);
    }
    return this._value;
  }
  set value(newVal) {
    if (this._value !== newVal) {
      this._value = newVal;
      this.publish();
    }
  }
  subscribe = (handler: Function) => {
    if (!this._subscribers.includes(handler)) {
      this._subscribers.push(handler);
    }
    return () => {
      const index = this._subscribers.indexOf(handler);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  };
  publish = () => {
    for (const handler of this._subscribers) {
      handler(this.value);
    }
  };
  compute = () => {
    Observable._computeActive = this; // catch child observables having their get accessors called and put them on this.
    const computedValue = this._valueFn
      ? (this._valueFn as Function)(...this._valueFnArgs)
      : null;

    if (computedValue instanceof Promise) {
      computedValue.then((resolvedValue) => {
        this._value = resolvedValue;
      });
    }
    Observable._computeActive = null;
    if (computedValue === this._value) {
      return;
    }
    this._dependencyArray.forEach((dependency) => {
      // dependency.subscribe(() => this.compute());
      this.bindComputedObservable(dependency);
    });
    this._dependencyArray = [];
    this.value = computedValue;
  };
  private bindComputedObservable = (childObservable: IObservable) => {
    childObservable.subscribe(() => this.compute());
  };
  push = (item: any) => {
    if (Array.isArray(this._value)) {
      this._value.push(item);
    } else {
      throw new Error("Push can only be called on an observable array.");
    }
  };
  static delay(ms: number) {
    let timeoutId: number;
    const promise = new Promise((resolve) => {
      timeoutId = setTimeout(resolve, ms);
    });
    const clear = () => clearTimeout(timeoutId);
    return { promise, clear };
  }
}

export class ObservableFactory {
  static create(initialValue: any, ...args: any[]): IObservable {
    return new Observable(initialValue, ...args);
  }
}

// function main() {
//   function childFn() {
//     return 1;
//   }
//   const child = ObservableFactory.create(childFn);
//   console.log(`child.value: ${JSON.stringify(child.value, null, 2)}`);
//   function parentFn() {
//     return child.value + 1;
//   }
//   const parent = ObservableFactory.create(parentFn);
//   console.log(`parent.value: ${JSON.stringify(parent.value, null, 2)}`);
//   function grandparentFn() {
//     return parent.value + 1;
//   }
//   const grandparent = ObservableFactory.create(grandparentFn);
//   console.log(
//     `grandparent.value: ${JSON.stringify(grandparent.value, null, 2)}`
//   );
//   parent.subscribe(function (value) {
//     console.log(
//       `parent update; current value: ${JSON.stringify(value, null, 2)}`
//     );
//   });
//   grandparent.subscribe(function (value) {
//     console.log(
//       `grandparent update; current value: ${JSON.stringify(value, null, 2)}`
//     );
//   });
//   console.log(`child.value = 2`);
//   child.value = 2;
// }
// main();
