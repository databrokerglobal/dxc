import React from "react";
import axios from "axios";
import { LOCAL_HOST, fetcher } from "./fetchers";
import useSWR from "swr";
import { IFile } from "./Files";
import { ShoppingBasket, Error, CloudOff } from "@material-ui/icons";
import {
  TextField,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Grid,
} from "@material-ui/core";
import { isEmptyArray } from "formik";
import { useWindowSize } from "./WindowSizeHook";

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
  const [file, setFile] = React.useState<IFile>();
  const [width] = useWindowSize();

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
    console.log(event.target.value);
    setFile(event.target.value);
  };

  const handleSubmit = async (event: any) => {
    const body = {
      host: host,
      name: name,
      producttype: type,
      files: file ? data?.data.filter((f: IFile) => f.name === file.name) : [],
    };

    await axios.post(`${LOCAL_HOST}/product`, body);
  };

  return (
    <Grid
      container
      spacing={2}
      style={{ marginTop: "1%" }}
      direction={width < 590 ? "column" : "row"}
    >
      <Grid item spacing={2}>
        <TextField
          error={name.length === 0}
          required
          id="name"
          label="Name"
          helperText="Please enter the product name"
          value={name}
          onChange={handleName}
        />
      </Grid>
      <Grid item spacing={2}>
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
            { value: "STREAM", label: "Stream" },
          ].map((o: any) => (
            <MenuItem value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item spacing={2}>
        {type !== "FILE" && (
          <TextField
            required={type !== "FILE"}
            error={type !== "FILE" && host.length === 0}
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
      </Grid>
      <Grid item spacing={2}>
        <Button variant="contained" onClick={handleSubmit}>
          Add
        </Button>
      </Grid>
    </Grid>
  );
};

export const ProductList = () => {
  const { data, error } = useSWR("/products", fetcher);
  return (
    <div>
      {!error &&
        data &&
        (data.data as any).map((p: any) => (
          <List key={p.ID}>
            <ListItem>
              <ListItemIcon>
                <ShoppingBasket />
              </ListItemIcon>
              {p.name}
            </ListItem>
          </List>
        ))}
      {!error && data && isEmptyArray(data.data) && (
        <List>
          <ListItem>
            <ListItemIcon>
              <CloudOff />
            </ListItemIcon>
            No products created yet
          </ListItem>
        </List>
      )}
      {error && error.toString().length > 0 && (
        <div
          style={{ display: "flex", alignContent: "row", alignItems: "center" }}
        >
          <Error />
          <p style={{ marginLeft: "1%", color: "red" }}>
            {error.toString().replace("Error: ", "")}
          </p>
        </div>
      )}
    </div>
  );
};
