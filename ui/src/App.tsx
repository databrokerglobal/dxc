import React from "react";
import "./App.css";
import useSWR from "swr";
import { fetcher } from "./fetchers";
import { ProductsList } from "./Products";

function App() {
  const { data, error } = useSWR("/products", fetcher);
  if (error) {
    return (
      <div style={{ margin: "3%" }}>
        <h1>Data eXchange Controller</h1>
        <p>Failed to load products data...</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div style={{ margin: "3%" }}>
        <h1>Data eXchange Controller</h1>
        <p>Loading...</p>
      </div>
    );
  }
  if (data) {
    return (
      <div style={{ margin: "3%" }}>
        <h1>Data eXchange Controller</h1>
        {ProductsList(data.data)}
      </div>
    );
  }
}

export default App;
