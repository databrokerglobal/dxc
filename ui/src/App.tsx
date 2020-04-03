import React from "react";
import "./App.css";
import { ProductForm, ProductList } from "./Products";
import { FilesList, FileForm } from "./Files";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  Grid
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";

function App() {
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
      <Grid container style={{ marginTop: "2%" }} spacing={2}>
        <Grid item spacing={2} xs={12}>
          <Typography variant="subtitle1">Available files</Typography>
          <Divider />
          <FilesList />
          <Typography variant="subtitle1">Add a file</Typography>
          <Divider />
          <FileForm />
        </Grid>
        <Grid item spacing={2} xs={12}>
          <Typography variant="subtitle1">Available products</Typography>
          <Divider />
          <ProductList />
          <Typography variant="subtitle1">Add a product</Typography>
          <Divider />
          <Grid xs={6}>
            <ProductForm />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
