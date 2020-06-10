import React from "react";
import "./App.css";
import { DatasourceForm, DatasourcesList } from "./Datasources";
import { Authentication } from "./Authentication";
import { SyncStatusList } from "./SyncStatus";
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

declare global {
  interface Window {
    DXC_SERVER_HOST: string
  }
}

function App() {
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
      >
        {tabValue === "pane-DS" ?
          <Grid item xs={12}>
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
          <Grid item xs={12}>
            <Typography variant="subtitle1">Authentication</Typography>
            <Divider />
            <Grid style={{ marginBottom: "70px", }} item xs={12}>
              <Authentication />
            </Grid>
            <Typography variant="h5">Last 24h sync</Typography>
            <Divider />
            <Grid style={{ marginTop: "15px", }} item xs={12}>
              <SyncStatusList />
            </Grid>
          </Grid> : null}
      </Grid>
    </Container>
  );
}

export default App;
