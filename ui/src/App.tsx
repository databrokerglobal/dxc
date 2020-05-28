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
  Tabs,
  Tab,
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useWindowSize } from "./WindowSizeHook";

function App() {
  const [width] = useWindowSize();
  const [tabValue, setTabValue] = React.useState<string>("pane-DS");

  const handleChangedTab = (event: any, newValue: string) => {
    setTabValue(newValue);
  };

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
      <Tabs value={tabValue} onChange={handleChangedTab} aria-label="simple tabs example">
        <Tab value="pane-DS" label="Data sources" />
        <Tab value="pane-AUTH" label="Configuration" />
      </Tabs>
      <Grid
        container
        style={{ marginTop: "2%" }}
        spacing={2}
        direction={width < 1286 ? "column" : "row"}
      >
        {tabValue === "pane-DS" ?
          <Grid item xs={width < 1286 ? 12 : 6}>
            <Grid style={{ marginBottom: "50px", }} item xs={12}>
              <DatasourceForm />
            </Grid>
            <Typography variant="h5">Current data sources</Typography>
            <Divider />
            <Grid style={{ marginTop: "15px", }} item xs={12}>
              <DatasourcesList />
            </Grid>
          </Grid> : null}
        {tabValue === "pane-AUTH" ?
          <Grid item xs={width < 1286 ? 12 : 6}>
            <Typography variant="subtitle1">Authentication</Typography>
            <Divider />
            <Grid item xs={12}>
              <Authentication />
            </Grid>
          </Grid> : null}
      </Grid>
    </Container>
  );
}

export default App;
