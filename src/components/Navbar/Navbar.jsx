import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "../../assets/logo.png";
import "./Navbar.css";

const NavigationBar = () => {
  const [activeKey, setActiveKey] = useState(window.location.pathname);

  useEffect(() => {
    setActiveKey(window.location.pathname);
  }, [window.location.pathname]);

  return (
    <div>
      <Navbar id="navbar" expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand className="brand" href="/">
            <span>
              <img className="logo" src={logo} />
            </span>
            <div className="title">NFT Marketplace</div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav id="nav" className="me-auto" activeKey={activeKey}>
              <Nav.Link eventKey="/" id="link" href="/">
                Marketplace
              </Nav.Link>
              <Nav.Link eventKey="/myNFTs" id="link" href="/myNFTs">
                My NFTs
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavigationBar;
