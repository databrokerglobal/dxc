import React from "react";
import "./App.css";
import { DatasourceForm, DatasourcesList } from "./Datasources";
import { Authentication } from "./Authentication";
import { DXCAuthentication } from "./DXCAuthentication";
import { SyncStatusList } from "./SyncStatus";
import { LOCAL_HOST } from "./fetchers";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  Grid,
  Tabs,
  Tab,
  Link,
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { DXCVersion } from "./DXCVersion";

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

  const linkSwagger = LOCAL_HOST + "/swagger/index.html";

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
        <Tab value="pane-VER" label="Version Info" />
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
          {tabValue === "pane-VER" ?
          <Grid item xs={12}>
            <Typography variant="h5">DXC Version</Typography>
            <Divider />
            <Grid style={{ marginTop: "15px", }} item xs={12}>
              <DXCVersion />
            </Grid>
          </Grid> : null}
        {tabValue === "pane-AUTH" ?
          <Grid item xs={12}>
            <Typography variant="h5">DXC Authentication</Typography>
            <Divider />
            <Grid style={{ marginBottom: "40px", }} item xs={12}>
              <DXCAuthentication />
            </Grid>
            <Typography variant="h5">Databroker Authentication</Typography>
            <Divider />
            <Grid style={{ marginBottom: "40px", }} item xs={12}>
              <Authentication />
            </Grid>
            <Typography variant="h5">Access DXC API</Typography>
            <Divider />
            <Grid style={{ marginTop: "15px", marginBottom: "40px", }} item xs={12}>
              <Link href={linkSwagger} target="_blank" rel="noreferrer">
                {linkSwagger}
              </Link>
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
