import React from "react";
import { Form, Field, FormikProps, withFormik, FormikErrors } from "formik";
import axios from "axios";
import { LOCAL_HOST } from "./fetchers";

interface IProduct {
  ID: string;
  name: string;
  producttype: string;
  host: string;
}

interface IProductFormValues {
  name: string;
  producttype: string;
  host: string;
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
      </div>
    ))}
  </div>
);

const InnerProductForm = (props: FormikProps<IProductFormValues>) => {
  const { touched, errors, isSubmitting } = props;
  return (
    <Form style={{ borderWidth: "1px", borderStyle: "solid", padding: "10px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column"
        }}
      >
        <label style={{ marginBottom: "1%" }}>Name: </label>
        <Field
          type="text"
          name="name"
          style={{ minWidth: "0", width: "10%", marginBottom: "1%" }}
        />
        {touched.name && errors.name && (
          <div style={{ color: "red", fontSize: "9px" }}>{errors.name}</div>
        )}
        <label style={{ marginBottom: "1%" }}>Type: </label>
        <Field
          as="select"
          name="producttype"
          style={{ minWidth: "0", width: "10%", marginBottom: "1%" }}
        >
          <option value="API">API</option>
          <option value="FILE">File</option>
          <option value="STREAM">Stream</option>
        </Field>
        {touched.producttype && errors.producttype && (
          <div style={{ color: "red", fontSize: "9px" }}>
            {errors.producttype}
          </div>
        )}
        <label style={{ marginBottom: "1%" }}>Host: </label>
        <Field
          type="text"
          name="host"
          style={{ minWidth: "0", width: "10%", marginBottom: "1%" }}
        />
        {touched.host && errors.host && (
          <div style={{ color: "red", fontSize: "9px" }}>{errors.host}</div>
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

  validate: (values: IProductFormValues) => {
    let errors: FormikErrors<IProductFormValues> = {};
    if (!values.name) {
      errors.name = "Required";
    }
    if (!values.host) {
      errors.host = "Required";
    }
    if (!values.producttype) {
      errors.producttype = "Required";
    }
    return errors;
  },

  handleSubmit: async (values, formikBag) => {
    try {
      await axios.post(`${LOCAL_HOST}/product`, {
        host: values.host,
        name: values.name,
        producttype: values.producttype
      });
      formikBag.setSubmitting(false);
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
