import React from "react";
import "./App.css";
import useSWR from "swr";
import { fetcher } from "./fetchers";
import { ProductsList, ProductAdd } from "./Products";

function App() {
  const { data, error } = useSWR("/products", fetcher);
  if (error) {
    return (
      <div style={{ margin: "3%" }}>
        <h1
          style={{ borderWidth: "1px", borderStyle: "solid", padding: "10px" }}
        >
          Data eXchange Controller
        </h1>
        <p>Failed to load products data...</p>
        <ProductAdd />
      </div>
    );
  }
  if (!data) {
    return (
      <div style={{ margin: "3%" }}>
        <h1
          style={{ borderWidth: "1px", borderStyle: "solid", padding: "10px" }}
        >
          Data eXchange Controller
        </h1>
        <p>Loading...</p>
        <ProductAdd />
      </div>
    );
  }
  if (data) {
    return (
      <div style={{ margin: "3%" }}>
        <h1
          style={{ borderWidth: "2px", borderStyle: "solid", padding: "10px" }}
        >
          Data eXchange Controller
        </h1>
        {ProductsList(data.data)}
        <ProductAdd />
      </div>
    );
  }
}

export default App;
