import {
  ObservableFactory,
  IObservable,
} from "marcs-observable/src/utils/observable";
// import { ObservableFactory, IObservable } from "./observable";

const child = ObservableFactory.create(() => 1);
const parent = ObservableFactory.create(() => child.value + 1);
const grandparent = ObservableFactory.create(() => parent.value + 1);

const booksChild = ObservableFactory.create([
  { name: "Book 1", author: "Author 1" },
  { name: "Book 2", author: "Author 2" },
]);
const booksParent = ObservableFactory.create(() => booksChild.value);
const booksGrandParent = ObservableFactory.create(() => booksParent.value);

export {
  child,
  parent,
  grandparent,
  booksChild,
  booksParent,
  booksGrandParent,
};
