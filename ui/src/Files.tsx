import React, { useEffect } from "react";
import { fetcher, LOCAL_HOST } from "./fetchers";
import useSWR from "swr";
import { FormikProps, Form, withFormik, isEmptyArray, FormikBag } from "formik";
import axios from "axios";
import { Input, Button, List, ListItem, ListItemIcon } from "@material-ui/core";
import { InsertDriveFile, Error, CloudOff, Check } from "@material-ui/icons";
import * as R from "ramda";
import * as Yup from "yup";

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

const InnerProductForm = (props: FormikProps<IFileFormValues>) => {
  const { isSubmitting } = props;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    let file = e.target.files[0];
    let tempData = new FormData();
    tempData.append("file", file);
    props.values.file = tempData;
  };

  // When submitting form reset input field
  useEffect(() => {
    if (isSubmitting) {
      (document.getElementById("file-input") as any).value = null;
    }
  });

  useEffect(() => {
    if (!R.isEmpty(props.errors)) {
      setTimeout(() => props.setErrors({}), 2000);
    }
  });

  return (
    <Form>
      <div style={{ marginTop: "2%", display: "flex", alignContent: "row" }}>
        {!props.status && (
          <Input
            id="file-input"
            type="file"
            className="visually-hidden"
            onChange={handleFileChange}
          />
        )}
        {props.status ? (
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
              {props.status.data
                .replace("<p>", "")
                .replace("</p>", "")
                .replace(". File checksum result: OK", "")}
            </p>
          </div>
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            style={{ marginLeft: "1%" }}
          >
            Submit
          </Button>
        )}
      </div>
      {!R.isEmpty(props.errors) && (
        <div
          style={{
            display: "flex",
            alignContent: "row",
            alignItems: "center",
          }}
        >
          <Error />
          <p style={{ marginLeft: "1%", color: "red" }}>
            {props.errors.file ? "Please select a file" : ""}
            <br />
            {!props.errors.file &&
            props.errors.message &&
            props.errors.message.includes("404")
              ? `${props.errors.message}. ` +
                "\n" +
                "Did you select a file from the correct directory?"
              : ""}
          </p>
        </div>
      )}
    </Form>
  );
};

export const FileForm = withFormik<{}, IFileFormValues>({
  validationSchema: Yup.object().shape({ file: Yup.mixed().required() }),
  handleSubmit: async (
    values: IFileFormValues,
    formikBag: FormikBag<{}, IFileFormValues>
  ) => {
    try {
      formikBag.setSubmitting(true);
      const resp = await axios.post(`${LOCAL_HOST}/files/upload`, values.file);
      formikBag.setSubmitting(false);
      formikBag.setStatus(resp);
      setTimeout(() => formikBag.resetForm(), 2000);
    } catch (err) {
      formikBag.setErrors(err);
      setTimeout(() => formikBag.resetForm(), 2000);
    }
  },
})(InnerProductForm);
