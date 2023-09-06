export interface IObservableMethods {
  publish(): void;
  subscribe(handler: (value: any) => void): void;
  push(item: any): void;
  compute(): void;
  bindComputedObservable(): void;
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
  private _lastPromiseId: number = 0;
  private _isComputing: boolean = false;

  // private _pendingUpdates: Function[] = [];
  // private _isProcessingUpdates: boolean = false;
  // because _computeActive is static and the parent observable is assigned to it during compute of the parent observable's _valueFn, which returns the child's value via get accessor, where we add the child (in its get accessor during the compute cycle of the parent observable) to the _dependencyArray of the parent observable, we must make _dependencyArray non-private aka public so that it can be accessed by the child via the static -aka global- property _computeActive, to which the parent observable is assigned
  // so what that looks like is:
  // 1. parent.compute() assigns parent observable to the global aka "static" member "_computeActive"
  // 2. parent.compute() calls parent._valueFn(...parent._valueFnArgs)
  // 3. parent._valueFn contains child.value, which is called as get value() or the get accessor of the child. Now we have pushed the child observable's get accessor method on top of the call stack, right above the parent's compute method
  // 4. before we access the child's value to return it to the parent's compute function (the call site or calling code), we check to see if the child observable itself is a dependency on the parent's own _dependencyArray, which is accessed as a property of the global aka "static" member of the observable class "_computeActive", to which the parent is assigned (the parent observable is equal to "_computeActive" and its property "_dependencyArray" is accessed via _computeActive._dependencyArray; the way to signify accessing the global or "static" property, which is assigned to an object, and its property is by referencing the name of the observable class as a prefix like so: Observable._computeActive._dependencyArray).
  // 5. If the child is not already on the static Observable._computeActive._dependencyArray to which the parent is assigned (in other words, the parent's dependency array, which is accessed by the child on the call stack via making it a global or static), we push it on there.
  // 6. child.value is returned to the call site or calling code (parent.compute()); if it's a Promise, handle that.
  // 7. loop over the parent's _dependencyArray and subscribe each child to teh compute method of the parent (bindComputedObservable function)
  // 8. nullify the _dependencyArray

  constructor(init: Function | any, ...args: any[]) {
    if (typeof init === "function") {
      this._valueFn = init;
      this._valueFnArgs = args;
      this.compute();
    } else {
      this._value = init;
    }
  }
  // private processPendingUpdates() {
  //   if (this._isProcessingUpdates) return;
  //   this._isProcessingUpdates = true;
  //   while (this._pendingUpdates.length > 0) {
  //     const update = this._pendingUpdates.shift();
  //     if (update) update();
  //   }
  //   this._isProcessingUpdates = false;
  // }
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
    if (newVal instanceof Promise) {
      newVal
        .then((resolvedVal) => {
          this._value = resolvedVal;
          this.publish();
        })
        .catch((error) => {
          console.error("Error resolving value:", error);
        });
    } else {
      this._value = newVal;
      this.publish();
    }
  }

  // set value(newVal) {
  //   this._value = newVal;
  //   this.publish();
  //   // enqueue calls to publish in case there are async values to prevent stale updates
  //   // this._pendingUpdates.push(() => {
  //   // this.publish();
  //   // });
  //   // this.processPendingUpdates();
  // }
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
  computeHandler = () => {
    return this.compute();
  };
  compute = () => {
    if (this._isComputing) {
      // A computation is already in progress, queue or discard this computation
      return;
    }

    this._isComputing = true;
    Observable._computeActive = this;
    const computedValue = this._valueFn
      ? (this._valueFn as Function)(...this._valueFnArgs)
      : null;

    this._lastPromiseId += 1;
    const currentPromiseId = this._lastPromiseId;

    const handleComputedValue = (resolvedValue: any) => {
      if (currentPromiseId !== this._lastPromiseId) return; // Ignore stale promises
      Observable._computeActive = null;
      this._dependencyArray.forEach((dependency) => {
        this.bindComputedObservable(dependency);
      });
      this._dependencyArray = [];
      this.value = resolvedValue;
      this._isComputing = false;
    };
    if (computedValue instanceof Promise) {
      computedValue.then(handleComputedValue);
    } else {
      handleComputedValue(computedValue);
    }
  };
  private bindComputedObservable = (childObservable: IObservable) => {
    childObservable.subscribe(this.computeHandler);
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
//     return new Promise((resolve) => {
//       setTimeout(() => resolve(1), 1000);
//     });
//   }
//   const child = ObservableFactory.create(childFn);
//   child.subscribe((value) => {
//     console.log(
//       `child update; current value: ${JSON.stringify(value, null, 2)}`
//     );
//   });

//   function parentFn() {
//     return new Promise((resolve) => {
//       setTimeout(() => resolve(child.value + 1), 1000);
//     });
//   }
//   const parent = ObservableFactory.create(parentFn);
//   parent.subscribe((value) => {
//     console.log(
//       `parent update; current value: ${JSON.stringify(value, null, 2)}`
//     );
//   });

//   function grandparentFn() {
//     return parent.value + 1;
//   }
//   const grandparent = ObservableFactory.create(grandparentFn);
//   grandparent.subscribe((value) => {
//     console.log(
//       `grandparent update; current value: ${JSON.stringify(value, null, 2)}`
//     );
//   });

//   setTimeout(() => {
//     console.log(`child.value = 2`);
//     child.value = 2;
//   }, 3000);
// }
// main();

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

function main() {
  function childFnPromise() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(1), 1000);
    });
  }
  function parentFn() {
    const childValue = child.value;
    if (childValue instanceof Promise) {
      return childValue.then((val) => val + 1);
    } else {
      return childValue + 1;
    }
  }
  function grandparentFn() {
    const parentValue = parent.value;
    if (parentValue instanceof Promise) {
      return parentValue.then((val) => val + 1);
    } else {
      return parentValue + 1;
    }
  }

  const child = ObservableFactory.create(childFnPromise);
  const parent = ObservableFactory.create(parentFn);
  const grandparent = ObservableFactory.create(grandparentFn);

  // const child = ObservableFactory.create(() => 1);
  // const parent = ObservableFactory.create(() => child.value + 1);
  // const grandparent = ObservableFactory.create(() => parent.value + 1);

  // subscribe to each observable with a console log of their latest value
  child.subscribe((value: any) => {
    console.log(
      `child update; current value: ${JSON.stringify(value, null, 2)}`
    );
  });
  parent.subscribe(function (value: any) {
    console.log(
      `parent update; current value: ${JSON.stringify(value, null, 2)}`
    );
  });
  grandparent.subscribe(function (value: any) {
    console.log(
      `grandparent update; current value: ${JSON.stringify(value, null, 2)}`
    );
  });

  // console.log(`child.value = 2`);
  // child.value = 2;
  setTimeout(() => {
    console.log(
      `child.value after creation: ${JSON.stringify(child.value, null, 2)}`
    );
  }, 2000); // Increased delay
  setTimeout(() => {
    console.log(
      `parent.value after creation: ${JSON.stringify(parent.value, null, 2)}`
    );
  }, 2000); // Increased delay
  setTimeout(() => {
    console.log(
      `grandparent.value after creation: ${JSON.stringify(
        grandparent.value,
        null,
        2
      )}`
    );
  }, 2000); // Increased delay

  setTimeout(() => {
    console.log(`child.value = 22`);
    child.value = new Promise((resolve) => {
      setTimeout(() => {
        resolve(22);
      }, 3000); // Increased delay
    });
  }, 3000); // Delaying the update of child value
  setTimeout(() => {
    console.log(`child.value = 3`);
    child.value = new Promise((resolve) => {
      setTimeout(() => {
        resolve(3);
      }, 10); // Increased delay
    });
  }, 4000); // Delaying the update of child value
}
main();
