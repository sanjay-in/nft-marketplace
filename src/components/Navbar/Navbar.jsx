import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./Navbar.css";

const NavigationBar = () => {
  return (
    <div>
      <Navbar id="navbar" expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#home">
            <div className="title">NFT Marketplace</div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav id="nav" className="me-auto">
              <Nav.Link id="link" href="#home">
                Marketplace
              </Nav.Link>
              <Nav.Link id="link" href="#link">
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
