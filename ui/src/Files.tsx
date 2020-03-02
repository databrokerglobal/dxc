import React from "react";
import { fetcher, LOCAL_HOST } from "./fetchers";
import useSWR from "swr";
import { FormikProps, Form, withFormik } from "formik";
import axios, { AxiosResponse } from "axios";

interface IFile {
  ID: string;
  name: string;
}

export const FilesList = (data: IFile[]) => (
  <div style={{ margin: "3%" }}>
    <h3 style={{ borderWidth: "2px", borderStyle: "solid", padding: "10px" }}>
      Files List
    </h3>
    {data.map(f => (
      <div
        key={f.ID}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          display: "flex",
          padding: "10px",
          alignContent: "center",
          marginBottom: "5px",
          flexDirection: "column"
        }}
      >
        <li>Name: {f.name}</li>
      </div>
    ))}
  </div>
);

export const FilesComponent = () => {
  const { data, error } = useSWR("/files", fetcher);
  return (
    <div style={{ margin: "3%" }}>
      {data?.data ? FilesList(data.data) : <p>Loading...</p>}
      {error ? <p>{error}</p> : null}
      <FileAdd />
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    let file = e.target.files[0];
    let tempData = new FormData();
    tempData.append("file", file);
    props.values.file = tempData;
  };

  return (
    <Form style={{ borderWidth: "1px", borderStyle: "solid", padding: "10px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column"
        }}
      >
        {!resp && (
          <input
            type="file"
            className="visually-hidden"
            onChange={handleFileChange}
          />
        )}
      </div>
      {resp ? (
        <div>
          <p style={{ color: "green", fontSize: "11px" }}>
            {resp.data.replace("<p>", "").replace("</p>", "")}
          </p>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ marginTop: "1%" }}
        >
          Submit
        </button>
      )}
      {errorMsg ? (
        <p style={{ color: "red", fontSize: "11px" }}>{`${errorMsg}`}</p>
      ) : null}
    </Form>
  );
};

const FileForm = withFormik<{}, IFileFormValues>({
  handleSubmit: async values => {
    try {
      resp = await axios.post(`${LOCAL_HOST}/files/upload`, values.file);
    } catch (err) {
      errorMsg = err;
    }
  }
})(InnerProductForm);

export const FileAdd = () => (
  <div style={{ margin: "3%" }}>
    <h3 style={{ borderWidth: "2px", borderStyle: "solid", padding: "10px" }}>
      Add a file
    </h3>
    <FileForm />
  </div>
);
