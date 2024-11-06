import React from "react";
import { Card } from "react-bootstrap";
import { trimWalletAddress } from "../../../utils/utils";
import "./Card.css";

const CardComponent = ({ image, price, id, seller, title }) => {
  return (
    <div className="card-component" style={{ margin: "1rem" }}>
      <Card style={{ width: "17rem", border: "none" }}>
        <Card.Img id="card-img" variant="top" src={image} />
        <Card.Body>
          <Card.Title id="card-title">{title}</Card.Title>
          <div className="card-subdetails">
            <div>
              <Card.Subtitle id="card-subdetail-heading" className="mb-2 text-muted">
                Price
              </Card.Subtitle>
              <Card.Title id="card-title">{price} ETH</Card.Title>
            </div>
            <div>
              <Card.Subtitle id="card-subdetail-heading" className="mb-2 text-muted">
                Creator
              </Card.Subtitle>
              <Card.Title id="card-title">{trimWalletAddress(seller)}</Card.Title>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CardComponent;
