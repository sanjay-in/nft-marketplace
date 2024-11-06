import React from "react";
import { Button } from "react-bootstrap";
import "./ConnectMetamask.css";

const ConnectMetaMask = ({ connectMetaMask }) => {
  return (
    <div className="connect-metamask">
      <p className="connect-metamask-text">Your wallet is not connected</p>
      <Button id="connect-metamask-btn" onClick={connectMetaMask}>
        Connect to MetaMask
      </Button>
    </div>
  );
};

export default ConnectMetaMask;
