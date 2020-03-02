import React from "react";
import { fetcher } from "./fetchers";
import useSWR from "swr";

interface IFile {
  ID: string;
  name: string;
}

export const FilesList = (data: IFile[]) => (
  <div style={{ margin: "3%" }}>
    <h3 style={{ borderWidth: "2px", borderStyle: "solid", padding: "10px" }}>
      Files List
    </h3>
    {data.map(f => (
      <div
        key={f.ID}
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
        <li>Name: {f.name}</li>
      </div>
    ))}
  </div>
);

export const FilesComponent = () => {
  const { data, error } = useSWR("/files", fetcher);
  console.log("jdhfjksadhfasdojkf", data);
  return (
    <div style={{ margin: "3%" }}>
      {data?.data ? FilesList(data.data) : <p>Loading...</p>}
      {error ? <p>{error}</p> : null}
    </div>
  );
};
