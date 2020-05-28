import React from "react";
import "./App.css";
import { DatasourceForm, DatasourcesList } from "./Datasources";
import { Authentication } from "./Authentication";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  Grid,
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useWindowSize } from "./WindowSizeHook";

function App() {
  const [width] = useWindowSize();

  return (
    <Container>
      <CssBaseline />
      <AppBar position="static" style={{ background: "#79E6D0" }}>
        <Toolbar>
          <Typography variant="h6" style={{ color: "black" }}>
            Databroker eXchange Controller
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid
        container
        style={{ marginTop: "2%" }}
        spacing={2}
        direction={width < 1286 ? "column" : "row"}
      >
        <Grid style={{ marginTop: "50px", }} item xs={width < 1286 ? 12 : 6}>
          <Typography variant="subtitle1">Data sources</Typography>
          <Divider />
          <Grid item xs={12}>
            <DatasourcesList />
          </Grid>
          <Typography style={{ marginTop: "20px", }} variant="subtitle1">Add a data source</Typography>
          <Divider />
          <Grid item xs={12}>
            <DatasourceForm />
          </Grid>
        </Grid>
        <Grid style={{ marginTop: "50px", }} item xs={width < 1286 ? 12 : 6}>
          <Typography variant="subtitle1">Authentication</Typography>
          <Divider />
          <Grid item xs={12}>
            <Authentication />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
