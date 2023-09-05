import React from "react";
import "./Layout.css";
import { Outlet } from "react-router-dom";

export function Root() {
  return (
    <div className="container">
      <nav className="navbar">
        <a href="/">Home</a>
        <a href="/dependents">Dependents</a>
        <a href="/books">Books</a>
      </nav>
      <main className="content">
        <Outlet />
      </main>
      <footer className="footer">© 2023 Your Company</footer>
    </div>
  );
}
