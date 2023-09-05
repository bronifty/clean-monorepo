import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Root } from "./routes/root";
import { Index } from "./routes/index";
import ErrorPage from "./error-page";
import { BooksLayout } from "./components/BooksLayout";
import { DescendantsLayout } from "./components/DescendantsLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "books/",
        element: <BooksLayout />,
      },
      {
        path: "dependents/",
        element: <DescendantsLayout />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
