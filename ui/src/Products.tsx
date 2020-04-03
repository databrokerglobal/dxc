import React from "react";
import axios from "axios";
import { LOCAL_HOST, fetcher } from "./fetchers";
import useSWR from "swr";
import { IFile } from "./Files";
import { ShoppingBasket } from "@material-ui/icons";
import {
  TextField,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemIcon
} from "@material-ui/core";

interface IProduct {
  ID: string;
  name: string;
  producttype: string;
  uuid?: string;
  host: string;
  Files: IFile[];
}

interface IProductFormValues {
  name: string;
  producttype: string;
  host: string;
  file?: IFile;
  error?: string;
  message?: string;
}

export const ProductForm = () => {
  const [type, setType] = React.useState("API");
  const [name, setName] = React.useState("Sensor 12a");
  const [host, setHost] = React.useState("http://localhost:8080");
  const [file, setFile] = React.useState("weather_data.xlsx");

  const { data } = useSWR("/files", fetcher);
  const fileList = data
    ? data.data.map((file: IFile) => ({ value: file, label: file.name }))
    : null;

  const handleType = (event: any) => {
    setType(event.target.value);
  };

  const handleName = (event: any) => {
    setName(event.target.value);
  };

  const handleHost = (event: any) => {
    setHost(event.target.value);
  };

  const handleFile = (event: any) => {
    setFile(event.target.value);
  };

  const handleSubmit = async (event: any) => {
    const body = {
      host: host ? host : "N/A",
      name: name,
      producttype: type,
      files: data?.data.filter((f: IFile) => f.name === file)
    };

    await axios.post(`${LOCAL_HOST}/product`, body);
  };

  return (
    <div
      style={{
        marginTop: "2%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline"
      }}
    >
      <TextField
        required
        id="name"
        label="Name"
        helperText="Please enter the product name"
        value={name}
        onChange={handleName}
      />
      <TextField
        required
        id="productType"
        select
        label="Type"
        helperText="Please select the product type"
        value={type}
        onChange={handleType}
      >
        {[
          { value: "API", label: "API" },
          { value: "FILE", label: "File" },
          { value: "STREAM", label: "Stream" }
        ].map((o: any) => (
          <MenuItem value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>
      {type !== "FILE" && (
        <TextField
          required={type !== "FILE"}
          id="host"
          label="Host"
          helperText="Please enter the host address"
          value={host}
          onChange={handleHost}
        />
      )}
      {type === "FILE" && (
        <TextField
          required={type === "FILE"}
          id="file"
          select
          label="File"
          helperText="Please select the file to link"
          value={file}
          onChange={handleFile}
        >
          {fileList.length === 0 && (
            <MenuItem value={""}>No files available</MenuItem>
          )}
          {fileList.length > 0 &&
            fileList.map((o: any) => (
              <MenuItem value={o.value}>{o.label}</MenuItem>
            ))}
        </TextField>
      )}
      <Button variant="contained" onClick={handleSubmit}>
        Add
      </Button>
    </div>
  );
};

export const ProductList = () => {
  const { data } = useSWR("/products", fetcher);
  console.log(data);
  return (
    <div>
      {data
        ? (data.data as any).map((p: any) => (
            <List key={p.ID}>
              <ListItem>
                <ListItemIcon>
                  <ShoppingBasket />
                </ListItemIcon>
                {p.name}
              </ListItem>
            </List>
          ))
        : null}
    </div>
  );
};
