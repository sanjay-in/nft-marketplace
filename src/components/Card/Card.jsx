import React from "react";
import { ethers } from "ethers";
import { Card } from "react-bootstrap";
import { trimWalletAddress } from "../../../utils/utils";
import "./Card.css";
import { Link } from "react-router-dom";

const CardComponent = ({ image, price, id, seller, title }) => {
  return (
    <Link
      className="link"
      to={{
        pathname: "/nft",
        search: `?id=${id}`,
      }}
    >
      <div className="card-component" style={{ margin: "1rem" }} href={`/nft/id${id}`}>
        <Card style={{ width: "17rem", border: "none" }}>
          <Card.Img id="card-img" variant="top" src={image} />
          <Card.Body>
            <Card.Title id="card-title">{title}</Card.Title>
            <div className="card-subdetails">
              <div>
                <Card.Subtitle id="card-subdetail-heading" className="mb-2 text-muted">
                  Price
                </Card.Subtitle>
                <Card.Title id="card-title">{ethers.formatEther(price)} ETH</Card.Title>
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
    </Link>
  );
};

export default CardComponent;
