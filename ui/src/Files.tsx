import React from "react";
import { fetcher, LOCAL_HOST } from "./fetchers";
import useSWR from "swr";
import { FormikProps, Form, withFormik, isEmptyArray } from "formik";
import axios, { AxiosResponse } from "axios";
import { Input, Button, List, ListItem, ListItemIcon } from "@material-ui/core";
import { InsertDriveFile, Error, CloudOff, Check } from "@material-ui/icons";

export interface IFile {
  ID?: string;
  name: string;
}

export const FilesList = () => {
  const { data, error } = useSWR("/files", fetcher);
  return (
    <div>
      {!error &&
        data &&
        (data.data as any).map((f: any) => (
          <List key={f.ID}>
            <ListItem>
              <ListItemIcon>
                <InsertDriveFile />
              </ListItemIcon>
              {f.name}
            </ListItem>
          </List>
        ))}
      {!error && data && isEmptyArray(data.data) && (
        <List>
          <ListItem>
            <ListItemIcon>
              <CloudOff />
            </ListItemIcon>
            No files linked yet to the DXC
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

interface IFileFormValues {
  file?: FormData;
  error?: string;
  message?: string;
}

let resp: AxiosResponse;
let errorMsg: string;

const InnerProductForm = (props: FormikProps<IFileFormValues>) => {
  const { isSubmitting } = props;
  const [fileSelected, setFileSelected] = React.useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    let file = e.target.files[0];
    let tempData = new FormData();
    tempData.append("file", file);
    props.values.file = tempData;
    setFileSelected(!fileSelected);
  };

  return (
    <Form>
      <div style={{ marginTop: "2%", display: "flex", alignContent: "row" }}>
        {!resp && (
          <Input
            type="file"
            className="visually-hidden"
            onChange={handleFileChange}
          />
        )}
        {resp ? (
          <div
            style={{
              display: "flex",
              alignContent: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Check />
            <p style={{ marginLeft: "5%", flexGrow: 3 }}>
              {resp.data
                .replace("<p>", "")
                .replace("</p>", "")
                .replace(". File checksum result: OK", "")}
            </p>
          </div>
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !fileSelected}
            style={{ marginLeft: "1%" }}
          >
            Submit
          </Button>
        )}
      </div>
      {errorMsg && (
        <div
          style={{
            display: "flex",
            alignContent: "row",
            alignItems: "center",
          }}
        >
          <Error />
          <p style={{ marginLeft: "1%", color: "red" }}>
            {errorMsg.toString().replace("Error: ", "")}
          </p>
        </div>
      )}
    </Form>
  );
};

export const FileForm = withFormik<{}, IFileFormValues>({
  handleSubmit: async (values) => {
    try {
      resp = await axios.post(`${LOCAL_HOST}/files/upload`, values.file);
    } catch (err) {
      errorMsg = err;
    }
  },
})(InnerProductForm);
