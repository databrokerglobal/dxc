import React from "react";

interface IProduct {
  ID: string;
  name: string;
  producttype: string;
  host: string;
}

export const ProductsList = (data: IProduct[]) => (
  <div style={{ margin: "3%" }}>
    <h3>Products</h3>
    {data.map(p => (
      <div
        key={p.ID}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          display: "flex",
          padding: "10px",
          alignContent: "center",
          marginBottom: "5px",
          flexDirection: "column"
        }}
      >
        <li>Name: {p.name}</li>
        <li>Type: {p.producttype}</li>
        <li>Host: {p.host}</li>
      </div>
    ))}
  </div>
);
