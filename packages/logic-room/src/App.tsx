// import React from "react";
// import { Books, Descendants } from "./components";

// import {
//   booksChild,
//   booksParent,
//   booksGrandParent,
//   child,
//   parent,
//   grandparent,
// } from "./utils/store";

// function App() {
//   return (
//     <>
//       <Descendants data={child} title="child" />
//       <Descendants data={parent} title="parent" />
//       <Descendants data={grandparent} title="grandparent" />
//       <Books data={booksChild} title="booksChild" />
//       <Books data={booksParent} title="booksParent" />
//       <Books data={booksGrandParent} title="booksGrandParent" />
//     </>
//   );
// }

// export default App;

import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Books, Descendants } from "./components";

import {
  booksChild,
  booksParent,
  booksGrandParent,
  child,
  parent,
  grandparent,
} from "./store";

function App() {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/dependents">
            <DependentsSection />
          </Route>
          <Route path="/books">
            <BooksSection />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}

function DependentsSection() {
  return (
    <>
      <Descendants data={child} title="child" />
      <Descendants data={parent} title="parent" />
      <Descendants data={grandparent} title="grandparent" />
    </>
  );
}

function BooksSection() {
  return (
    <>
      <Books data={booksChild} title="booksChild" />
      <Books data={booksParent} title="booksParent" />
      <Books data={booksGrandParent} title="booksGrandParent" />
    </>
  );
}

function HomePage() {
  return <div>Welcome to the home page</div>;
}

export default App;
