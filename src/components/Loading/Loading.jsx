import React from "react";
import { Spinner } from "react-bootstrap";
import "./Loading.css";

const Loading = ({ text }) => {
  return (
    <div className="loader">
      <Spinner className="spinner" animation="border" variant="secondary" />
      <div className="loading-text">{text}...</div>
    </div>
  );
};

export default Loading;
