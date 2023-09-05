import { BooksChild, BooksParent, BooksGrandParent } from "../components";

export function BooksLayout() {
  return (
    <>
      <div></div>
      <BooksChild />
      <div></div>
      <BooksParent />
      <div></div>
      <BooksGrandParent />
    </>
  );
}
