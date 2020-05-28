import React from "react";
import axios from "axios";
import { LOCAL_HOST, fetcher } from "./fetchers";
import useSWR from "swr";
import {
  ShoppingBasket,
  Error,
  CloudOff,
  Check,
  ExpandLess,
  ExpandMore,
} from "@material-ui/icons";
import {
  TextField,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Grid,
  ListItemText,
  Collapse,
  Link,
} from "@material-ui/core";
import { isEmptyArray } from "formik";
import { useWindowSize } from "./WindowSizeHook";
import * as Yup from "yup";
import * as R from "ramda";

interface IDatasource {
  ID?: string;
  name: string;
  type: string;
  did?: string;
  host: string;
}

export const DatasourceForm = () => {
  const exampleBody = {
    name: "datasource xxx",
    host: "http://example.com/myfile",
    type: "API",
  };
  const [body, setBody] = React.useState<IDatasource>(exampleBody);
  const [resp, setResp] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");
  const [width] = useWindowSize();

  // reset error or response + form
  React.useEffect(() => {
    if (!R.isEmpty(err)) {
      setTimeout(() => {
        setErr("");
        setBody(exampleBody);
      }, 2000);
    }
    if (!R.isEmpty(resp)) {
      setTimeout(() => {
        setResp("");
        setBody(exampleBody);
      }, 2000);
    }
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    type: Yup.string().required(),
    host: Yup.string().required(),
  });

  const handleType = (event: any) => {
    setBody(R.assoc("type", event.target.value, body));
  };

  const handleName = (event: any) => {
    setBody(R.assoc("name", event.target.value, body));
  };

  const handleHost = (event: any) => {
    setBody(R.assoc("host", event.target.value, body));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${LOCAL_HOST}/datasource`, body);
      setResp(`Success. Datasource created.`);
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
        alignItems: "normal",
      }}
      direction={width < 590 ? "column" : "row"}
    >
      <Grid item>
        <TextField
          error={body?.name?.length === 0}
          required
          id="name"
          label="Name"
          helperText="The name of the data source"
          value={body?.name}
          onChange={handleName}
        />
      </Grid>
      <Grid item>
        <TextField
          required
          id="type"
          select
          label="Type"
          helperText="The name of data source"
          value={body?.type}
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
        <TextField
          required
          error={body?.host?.length === 0}
          id="host"
          label="Host"
          helperText="The host (url) of the data source"
          value={body?.host}
          onChange={handleHost}
        />
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

export const DatasourcesList = () => {
  const { data, error } = useSWR("/datasources", fetcher);
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
        (data.data as any).map((datasource: any) => (
          datasource.did !== "" ? 
          <Grid item xs={12}>
              <List key={datasource.ID}>
                <ListItem id={datasource.ID} button onClick={handleClick}>
                <ListItemIcon>
                  <ShoppingBasket />
                </ListItemIcon>
                  {datasource.name}
                  {open.includes(datasource.ID.toString()) ? (
                    <ExpandLess id={datasource.ID} />
                ) : (
                      <ExpandMore id={datasource.ID} />
                )}
              </ListItem>
              <Collapse
                  in={open.includes(datasource.ID.toString())}
                timeout="auto"
                unmountOnExit
              >
                <List>
                  <ListItem>
                      <ListItemText secondary={`Type: ${datasource.type}`} />
                  </ListItem>
                    <ListItem>
                      <Grid>
                        <ListItemText secondary={`Host address: `} />
                        <Link href={datasource.host}>{datasource.host}</Link>
                      </Grid>
                    </ListItem>
                </List>
              </Collapse>
            </List>
          </Grid> : null
        ))}
      {!error && data && isEmptyArray(data.data) && (
        <List>
          <ListItem>
            <ListItemIcon>
              <CloudOff />
            </ListItemIcon>
            No data source created yet
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
