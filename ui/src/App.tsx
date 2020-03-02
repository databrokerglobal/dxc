import React from "react";
import "./App.css";
import { ProductComponent } from "./Products";
import { FilesComponent } from "./Files";

function App() {
  return (
    <div style={{ margin: "3%" }}>
      <h1 style={{ borderWidth: "1px", borderStyle: "solid", padding: "10px" }}>
        Data eXchange Controller
      </h1>
      <FilesComponent />
      <ProductComponent />
    </div>
  );
}

export default App;
