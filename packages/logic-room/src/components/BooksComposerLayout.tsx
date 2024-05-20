import React from "react";
import { BooksComposer } from "./BooksComposer";
import { booksChild, booksParent, booksGrandParent } from "../utils/store";
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
