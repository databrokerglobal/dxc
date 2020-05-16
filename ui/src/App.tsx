import React from "react";
import "./App.css";
import { ProductForm, ProductList } from "./Products";
import { FilesList, FileForm, IFile } from "./Files";
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
import { TransferlistContext } from "./Context";

function App() {
  const [width] = useWindowSize();
  const [filesToLink, setFilesToLink] = React.useState<IFile[]>([]);

  return (
    <Container>
      <CssBaseline />
      <AppBar position="static" style={{ background: "#79E6D0" }}>
        <Toolbar>
          <Typography variant="h6" style={{ color: "black" }}>
            Databroker Exchange Controller
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid
        container
        style={{ marginTop: "2%" }}
        spacing={2}
        direction={width < 1286 ? "column" : "row"}
      >
        <Grid item xs={width < 1286 ? 12 : 6}>
          <Typography variant="subtitle1">Available files</Typography>
          <Divider />
          <Grid item xs={12}>
            <FilesList />
          </Grid>
          <Typography variant="subtitle1">Add a file</Typography>
          <Divider />
          <Grid item xs={12}>
            <FileForm />
          </Grid>
        </Grid>
        <Grid item xs={width < 1286 ? 12 : 6}>
          <Typography variant="subtitle1">Available products</Typography>
          <Divider />
          <Grid item xs={12}>
            <ProductList />
          </Grid>
          <Typography variant="subtitle1">Add a product</Typography>
          <Divider />
          <Grid item xs={12}>
            <TransferlistContext.Provider value={[filesToLink, setFilesToLink]}>
              <ProductForm />
            </TransferlistContext.Provider>
          </Grid>
        </Grid>
        <Typography style={{marginTop: "50px",}} variant="subtitle1">Authentication</Typography>
        <Divider />
        <Grid item xs={12}>
          <Authentication />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
