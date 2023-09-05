import { BooksChild } from "./BooksChild";
import { BooksParent } from "./BooksParent";
import { BooksGrandParent } from "./BooksGrandParent";

export function BooksLayout() {
  return (
    <>
      <BooksChild />
      <div></div>
      <BooksParent />
      <div></div>
      <BooksGrandParent />
    </>
  );
}
