import React from "react";
import Error from "../../assets/Error.png";
import "./Error.css";

const ErrorPage = () => {
  return (
    <div>
      <img className="error-image" src={Error} />
    </div>
  );
};

export default ErrorPage;
