import React from "react";
import axios from "axios";
import { LOCAL_HOST, fetcher } from "./fetchers";
import useSWR from "swr";
import { IFile } from "./Files";
import {
  ShoppingBasket,
  Error,
  CloudOff,
  Check,
  ExpandLess,
  ExpandMore,
  InsertDriveFile,
} from "@material-ui/icons";
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
  Collapse,
  Link,
} from "@material-ui/core";
import { isEmptyArray } from "formik";
import { useWindowSize } from "./WindowSizeHook";
import * as Yup from "yup";
import * as R from "ramda";
import { TransferlistContext } from "./Context";

interface IProduct {
  ID?: string;
  name: string;
  producttype: string;
  did?: string;
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
  const [, setFilesToLink] = React.useContext(TransferlistContext);
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
    setFilesToLink(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setFilesToLink(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setFilesToLink(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
    setFilesToLink([]);
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
  const [filesToLink] = React.useContext(TransferlistContext);
  const [body, setBody] = React.useState<IProduct>({
    name: "Product xxx",
    host: "http://example.com",
    producttype: "API",
    files: [],
  });
  const [resp, setResp] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");
  const [width] = useWindowSize();

  // When filesToLink from the TransferListChanges -> update body
  React.useEffect(() => {
    if (body && JSON.stringify(body.files) !== JSON.stringify(filesToLink)) {
      setBody({ ...body, files: filesToLink });
    }
  }, [body, filesToLink]);

  // reset error or response + form
  React.useEffect(() => {
    if (!R.isEmpty(err)) {
      setTimeout(() => {
        setErr("");
        setBody({
          name: "Product xxx",
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
          name: "Product xxx",
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

  const handleType = (event: any) => {
    setBody(R.assoc("producttype", event.target.value, body));
  };

  const handleName = (event: any) => {
    setBody(R.assoc("name", event.target.value, body));
  };

  const handleHost = (event: any) => {
    setBody(R.assoc("host", event.target.value, body));
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
      style={{
        marginTop: "1%",
        flexGrow: 1,
        alignItems:
          body.producttype === "FILE" && width > 600 ? "center" : "normal",
      }}
      direction={width < 590 ? "column" : "row"}
    >
      <Grid item>
        <TextField
          error={body?.name?.length === 0}
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
            error={body?.producttype !== "FILE" && body?.host?.length === 0}
            id="host"
            label="Host"
            helperText="Please enter the host address"
            value={body?.host}
            onChange={handleHost}
          />
        )}
        {body?.producttype === "FILE" && <TransferList />}
      </Grid>
      <Grid item xs={12}>
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
              flexGrow: 2,
            }}
          >
            <Check />
            <p style={{ marginLeft: "2%" }}>{resp}</p>
          </div>
        )}
      </Grid>
    </Grid>
  );
};

export const ProductList = () => {
  const { data, error } = useSWR("/products", fetcher);
  const [open, setOpen] = React.useState<string[]>([]);

  const handleClick = (e: any) => {
    R.contains(e.target.id, open) && e.target.id !== ""
      ? setOpen(R.filter((s) => s !== e.target.id, open))
      : setOpen(R.append(e.target.id, open));
    console.log(open);
  };

  return (
    <Grid container spacing={2}>
      {!error &&
        data &&
        (data.data as any).map((p: any) => (
          <Grid item xs={12}>
            <List key={p.ID}>
              <ListItem id={p.ID} button onClick={handleClick}>
                <ListItemIcon>
                  <ShoppingBasket />
                </ListItemIcon>
                {p.name}
                {open.includes(p.ID.toString()) ? (
                  <ExpandLess id={p.ID} />
                ) : (
                  <ExpandMore id={p.ID} />
                )}
              </ListItem>
              <Collapse
                in={open.includes(p.ID.toString())}
                timeout="auto"
                unmountOnExit
              >
                <List>
                  <ListItem>
                    <ListItemText secondary={`Type: ${p.producttype}`} />
                  </ListItem>
                  {p.producttype !== "FILE" ? (
                    <ListItem>
                      <Grid>
                        <ListItemText secondary={`Host address: `} />
                        <Link href={p.host}>{p.host}</Link>
                      </Grid>
                    </ListItem>
                  ) : (
                    <List>
                      <ListItem>
                        <ListItemText secondary={`File(s): `} />
                      </ListItem>
                      {p.Files.map((f: any) => (
                        <List key={f.ID}>
                          <ListItem>
                            <ListItemIcon>
                              <InsertDriveFile />
                            </ListItemIcon>
                            {f.name}
                          </ListItem>
                        </List>
                      ))}
                    </List>
                  )}
                </List>
              </Collapse>
            </List>
          </Grid>
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
    </Grid>
  );
};
