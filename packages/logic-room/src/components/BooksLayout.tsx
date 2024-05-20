import React from "react";
import { BooksChild, BooksParent, BooksGrandParent } from "../components";

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
