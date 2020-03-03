import React from "react";
import { Form, Field, FormikProps, withFormik } from "formik";
import axios from "axios";
import { LOCAL_HOST, fetcher } from "./fetchers";
import useSWR from "swr";
import { IFile } from "./Files";
import Select from "react-select";

interface IProduct {
  ID: string;
  name: string;
  producttype: string;
  uuid?: string;
  host: string;
  Files: IFile[];
}

interface IProductFormValues {
  name: string;
  producttype: string;
  host: string;
  file?: IFile;
  error?: string;
}

export const ProductsList = (data: IProduct[]) => (
  <div style={{ margin: "3%" }}>
    <h3 style={{ borderWidth: "2px", borderStyle: "solid", padding: "10px" }}>
      Products List
    </h3>
    {data.map(p => (
      <div
        key={p.ID}
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
        <li>Name: {p.name}</li>
        <li>Type: {p.producttype}</li>
        <li>Host: {p.host}</li>
        {p.Files?.length > 0 ? (
          <li>
            Files:
            {p.Files.map((file: IFile) => (
              <ul>
                <li>{file.name}</li>
              </ul>
            ))}
          </li>
        ) : null}
        {p.Files?.length === 0 && p.producttype === "FILE" && (
          <li style={{ color: "red" }}>File: linked file not found...</li>
        )}
      </div>
    ))}
  </div>
);

const InnerProductForm = (props: FormikProps<IProductFormValues>) => {
  const { errors, isSubmitting } = props;
  const { data } = useSWR("/files", fetcher);
  const options = data
    ? data.data.map((file: IFile) => ({ value: file, label: file.name }))
    : null;
  return (
    <Form style={{ borderWidth: "1px", borderStyle: "solid", padding: "10px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "stretch"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            padding: "1% 0% 1% 0%"
          }}
        >
          <label style={{ marginBottom: "1%", padding: "0% 1% 0% 1%" }}>
            Name:
          </label>
          <Field
            placeholder="Product name"
            type="text"
            name="name"
            style={{
              minWidth: "auto",
              width: "20%",
              marginBottom: "1%"
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "flex-start",
            padding: "1% 0% 1% 0%"
          }}
        >
          <label style={{ marginBottom: "1%", padding: "0% 1% 0% 1%" }}>
            Type:
          </label>
          <Select
            as="select"
            name="producttype"
            styles={{ container: base => ({ ...base, flex: 1 }) }}
            options={[
              { value: "FILE", label: "File" },
              { value: "STREAM", label: "Stream" },
              { value: "API", label: "API" }
            ]}
            onChange={v =>
              props.setValues({
                name: props.values.name,
                producttype: (v as any).value,
                host: props.values.host,
                file: props.values.file
              })
            }
          />
        </div>
        {props.values.producttype !== "FILE" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              padding: "1% 0% 1% 0%"
            }}
          >
            <label style={{ marginBottom: "1%", padding: "0% 1% 0% 1%" }}>
              Host:
            </label>
            <Field
              type="text"
              name="host"
              placeholder="http://address:port"
              style={{ minWidth: "auto", width: "20%", marginBottom: "1%" }}
            />
          </div>
        )}
        {props.values.producttype === "FILE" && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "flex-start",
              padding: "1% 0% 1% 0%"
            }}
          >
            <label
              style={{
                marginRight: "1%",
                marginBottom: "1%",
                minWidth: "0",
                padding: "0% 1% 0% 1%"
              }}
            >
              File:
            </label>
            <Select
              style={{ minWidth: "auto" }}
              styles={{ container: base => ({ ...base, flex: 1 }) }}
              name="file"
              as="select"
              options={options}
              onChange={v =>
                props.setValues({
                  name: props.values.name,
                  producttype: props.values.producttype,
                  host: props.values.host,
                  file: (v as any).value
                })
              }
            />
          </div>
        )}
      </div>
      <button type="submit" disabled={isSubmitting} style={{ marginTop: "1%" }}>
        Submit
      </button>
      <p style={{ color: "red", fontSize: "11px" }}>{errors.error}</p>
    </Form>
  );
};

const ProductForm = withFormik<{}, IProductFormValues>({
  mapPropsToValues: props => {
    return {
      name: "",
      producttype: "API",
      host: ""
    };
  },

  handleSubmit: async (values, formikBag) => {
    try {
      if (!values.name) {
        formikBag.setErrors({ error: `Error: a name is required` });
      } else if (values.producttype === "") {
        formikBag.setErrors({ error: `Error: a type must be selected` });
      } else if (values.producttype === "FILE" && values.file === undefined) {
        formikBag.setErrors({ error: `Error: a file must be selected` });
      } else if (values.producttype !== "FILE" && values.host === "") {
        formikBag.setErrors({ error: `Error: a host is required` });
      } else {
        const data = {
          host: values.host ? values.host : "N/A",
          name: values.name,
          producttype: values.producttype,
          files: [
            {
              ID: values.file?.ID,
              name: values.file?.name
            }
          ]
        };
        if (data.producttype !== "FILE") {
          delete data.files;
        }
        await axios.post(`${LOCAL_HOST}/product`, data);
        formikBag.setSubmitting(false);
      }
    } catch (err) {
      formikBag.setErrors({
        error: `Error submitting form: ${err.toString().replace("Error: ", "")}`
      });
    }
  }
})(InnerProductForm);

export const ProductAdd = () => (
  <div style={{ margin: "3%" }}>
    <h3 style={{ borderWidth: "2px", borderStyle: "solid", padding: "10px" }}>
      Add a product
    </h3>
    <ProductForm />
  </div>
);

export const ProductComponent = () => {
  const { data, error } = useSWR("/products", fetcher);
  return (
    <div style={{ margin: "3%" }}>
      {data?.data ? ProductsList(data.data) : <p>Loading...</p>}
      {error ? <p>{error}</p> : null}
      <ProductAdd />
    </div>
  );
};
