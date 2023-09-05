import {
  BooksComposer,
  BooksChild,
  BooksParent,
  BooksGrandParent,
} from "../components";

export function BooksLayout() {
  return (
    <>
      <BooksComposer />
      <div></div>
      <BooksChild />
      <div></div>
      <BooksParent />
      <div></div>
      <BooksGrandParent />
    </>
  );
}
