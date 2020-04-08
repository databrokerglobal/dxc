import React from "react";
import axios from "axios";
import { LOCAL_HOST, fetcher } from "./fetchers";
import useSWR from "swr";
import { IFile } from "./Files";
import { ShoppingBasket, Error, CloudOff, Check } from "@material-ui/icons";
import {
  TextField,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Grid,
  Paper,
  Checkbox,
  ListItemText,
  CircularProgress,
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

function not(a: any, b: any) {
  return a.filter((value: any) => b.indexOf(value) === -1);
}

function intersection(a: any, b: any) {
  return a.filter((value: any) => b.indexOf(value) !== -1);
}

export function TransferList() {
  const { data, error } = useSWR("/files", fetcher);
  const [checked, setChecked] = React.useState<any[]>([]);
  const [left, setLeft] = React.useState<any[]>([]);
  const [right, setRight] = React.useState<any[]>([]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  // Only set the files list once in the left
  React.useEffect(() => {
    if (data) {
      if (data.data) {
        if (data.data.length > 0 && left.length === 0 && right.length === 0) {
          console.log(data.data);
          setLeft([...data.data]);
        }
      }
    }
  }, [data, right.length, left.length]);

  const handleToggle = (value: any) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const emptyProductList = () => (
    <List dense component="div" role="list">
      <ListItem key={0} role="listitem" button>
        <ListItemIcon style={{ marginLeft: "1%" }}>
          <Error />
        </ListItemIcon>
        <ListItemText>{"Add file(s) to link to a product"}</ListItemText>
      </ListItem>
    </List>
  );

  const emptyFileList = () => (
    <List dense component="div" role="list">
      <ListItem key={0} role="listitem" button>
        <ListItemIcon style={{ marginLeft: "1%" }}>
          <Error />
        </ListItemIcon>
        <ListItemText>
          {"All files have been selected for a product"}
        </ListItemText>
      </ListItem>
    </List>
  );

  const customList = (items: any) => (
    <List dense component="div" role="list">
      {items.map((value: IFile, index: number) => {
        const labelId = `transfer-list-item-${value}-label`;
        return (
          <ListItem
            key={index}
            role="listitem"
            button
            onClick={handleToggle(value)}
          >
            <ListItemIcon>
              <Checkbox
                checked={checked.indexOf(value) !== -1}
                tabIndex={-1}
                disableRipple
                inputProps={{ "aria-labelledby": labelId }}
              />
            </ListItemIcon>
            <ListItemText id={labelId} primary={value.name} />
          </ListItem>
        );
      })}
      <ListItem />
    </List>
  );

  if (!error && data) {
    return (
      <Grid container spacing={2} justify="center" alignItems="center">
        <Paper>
          <Grid item>
            {left.length === 0 ? emptyFileList() : customList(left)}
          </Grid>
        </Paper>
        <Grid item>
          <Grid container direction="column" alignItems="center">
            <Button
              variant="outlined"
              size="small"
              onClick={handleAllRight}
              disabled={left.length === 0}
              aria-label="move all right"
            >
              ≫
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAllLeft}
              disabled={right.length === 0}
              aria-label="move all left"
            >
              ≪
            </Button>
          </Grid>
        </Grid>
        <Paper>
          <Grid item>
            {right.length === 0 ? emptyProductList() : customList(right)}
          </Grid>
        </Paper>
      </Grid>
    );
  } else if (error) {
    return (
      <div
        style={{ display: "flex", alignContent: "row", alignItems: "center" }}
      >
        <Error />
        <p style={{ marginLeft: "10%", color: "red" }}>
          Error fetching the files
        </p>
      </div>
    );
  } else if (!data && !error) {
    return (
      <div>
        <CircularProgress />
        <p>Fetching files...</p>
      </div>
    );
  } else {
    return null;
  }
}

export const ProductForm = () => {
  const [body, setBody] = React.useState<IProduct>({
    name: "Example 1",
    host: "http://example.com",
    producttype: "API",
    files: [],
  });
  const [resp, setResp] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");

  const [width] = useWindowSize();

  // reset error or response + form
  React.useEffect(() => {
    if (!R.isEmpty(err)) {
      setTimeout(() => {
        setErr("");
        setBody({
          name: "Example 1",
          host: "http://example.com",
          producttype: "API",
          files: [],
        });
      }, 2000);
    }
    if (!R.isEmpty(resp)) {
      setTimeout(() => {
        setResp("");
        setBody({
          name: "Example 1",
          host: "http://example.com",
          producttype: "API",
          files: [],
        });
      }, 2000);
    }
  });

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
    try {
      await axios.post(`${LOCAL_HOST}/product`, body);
      setResp(`Success. Product created.`);
    } catch (error) {
      setErr(error.toString());
    }
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
        {body?.producttype === "FILE" && <TransferList />}
      </Grid>
      <Grid item>
        {R.isEmpty(err) && R.isEmpty(resp) && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!schema.isValidSync(body)}
          >
            Add
          </Button>
        )}
        {!R.isEmpty(err) && R.isEmpty(resp) && (
          <div
            style={{
              display: "flex",
              alignContent: "row",
              alignItems: "center",
            }}
          >
            <Error />
            <p style={{ marginLeft: "1%", color: "red" }}>{err}</p>
          </div>
        )}
        {R.isEmpty(err) && !R.isEmpty(resp) && (
          <div
            style={{
              display: "flex",
              alignContent: "row",
              alignItems: "center",
            }}
          >
            <Check />
            <p style={{ marginLeft: "1%" }}>{resp}</p>
          </div>
        )}
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
