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
import * as Yup from "yup";
import * as R from "ramda";

interface IProduct {
  ID?: string;
  name: string;
  producttype: string;
  uuid?: string;
  host: string;
  files: IFile[];
}

export const ProductForm = () => {
  const [body, setBody] = React.useState<IProduct>({
    name: "Example 1",
    host: "http://example.com",
    producttype: "API",
    files: [],
  });
  const [width] = useWindowSize();

  const schema =
    body.producttype !== "FILE"
      ? Yup.object().shape({
          name: Yup.string().required(),
          producttype: Yup.string().required(),
          host: Yup.string().required(),
        })
      : Yup.object().shape({
          name: Yup.string().required(),
          producttype: Yup.string().required(),
          files: Yup.array().min(1),
        });

  const { data } = useSWR("/files", fetcher);

  const fileList = data
    ? data.data.map((file: IFile) => ({ value: file, label: file.name }))
    : null;

  const handleType = (event: any) => {
    setBody(R.assoc("producttype", event.target.value, body));
  };

  const handleName = (event: any) => {
    setBody(R.assoc("name", event.target.value, body));
  };

  const handleHost = (event: any) => {
    setBody(R.assoc("host", event.target.value, body));
  };

  const handleFile = (event: any) => {
    setBody(R.assoc("files", body.files.concat(event.target.value), body));
  };

  const handleSubmit = async () => {
    console.log(body);
    const ok = await schema.isValid(body);
    console.log("schema", schema, "OK", ok);
    if (!ok) return;
    await axios.post(`${LOCAL_HOST}/product`, body);
  };

  return (
    <Grid
      container
      spacing={2}
      style={{ marginTop: "1%" }}
      direction={width < 590 ? "column" : "row"}
    >
      <Grid item>
        <TextField
          error={body?.name.length === 0}
          required
          id="name"
          label="Name"
          helperText="Please enter the product name"
          value={body?.name}
          onChange={handleName}
        />
      </Grid>
      <Grid item>
        <TextField
          required
          id="productType"
          select
          label="Type"
          helperText="Please select the product type"
          value={body?.producttype}
          onChange={handleType}
        >
          {[
            { value: "API", label: "API" },
            { value: "FILE", label: "File" },
            { value: "STREAM", label: "Stream" },
          ].map((o: any, i: number) => (
            <MenuItem key={i.toString()} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item>
        {body?.producttype !== "FILE" && (
          <TextField
            required={body?.producttype !== "FILE"}
            error={body?.producttype !== "FILE" && body?.host.length === 0}
            id="host"
            label="Host"
            helperText="Please enter the host address"
            value={body?.host}
            onChange={handleHost}
          />
        )}
        {body?.producttype === "FILE" && (
          <TextField
            required={body.producttype === "FILE"}
            id="file"
            select
            label="File"
            helperText="Please select the file to link"
            value={body.files.find((f) => f)} // temporary workaround
            onChange={handleFile}
          >
            {fileList.length === 0 && (
              <MenuItem value={""}>No files available</MenuItem>
            )}
            {fileList.length > 0 &&
              fileList.map((o: any, index: number) => (
                <MenuItem key={index} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
          </TextField>
        )}
      </Grid>
      <Grid item>
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
