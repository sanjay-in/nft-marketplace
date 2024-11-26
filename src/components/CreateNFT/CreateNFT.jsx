import React, { useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { pinata } from "../../../utils/utils.config";
import { getContract, toastMessage } from "../../../utils/utils";
import "./CreateNFT.css";

const CreateNFT = ({ isCreateNFT, setIsCreateNFT }) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const PINATA_GATEWAY_URL = import.meta.env.VITE_PINATA_GATEWAY_URL;
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

  const uploadFileToPinata = async (uploadedFile) => {
    try {
      const blob = new Blob([uploadedFile], { type: image.type });
      const file = new File([blob], "joker-bayt.jpeg");
      const upload = await pinata.upload.file(file);
      return upload;
    } catch (error) {
      console.log(error);
      toastMessage("error", "Failed to upload the file to IPFS");
    }
  };

  const pinFileToIPFS = async () => {
    try {
      const formData = new FormData();

      const file = new File([image], title);
      formData.append("file", file);

      const pinataMetadata = JSON.stringify({
        name: title,
      });
      formData.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formData.append("pinataOptions", pinataOptions);

      const request = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });
      const response = await request.json();
    } catch (error) {
      console.log(error);
      toastMessage("error", "Unable to upload file to IPFS");
    }
  };

  const createMetaData = async (CID) => {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();

      const metadata = {
        title: title.trim(),
        price,
        creator: currentAddress,
        description: description.trim(),
        image: `${PINATA_GATEWAY_URL}/ipfs/${CID}`,
      };

      try {
        await pinata.upload.json({ metadata });
        return metadata;
      } catch (error) {
        console.log("error", error);
        toastMessage("error", "Failed to create metadata");
      }
    }
  };

  const createNFT = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { cid } = await uploadFileToPinata(image);
      await pinFileToIPFS();
      const tokenURI = await createMetaData(cid);

      const parsedPrice = ethers.parseEther(price.toString());
      const imgURL = `https://${PINATA_GATEWAY_URL}/ipfs/${cid}`;
      const tokenString = JSON.stringify(tokenURI);

      const nft = await getContract();
      const listingprice = await nft.getListingPrice();

      const createTokenResponse = await nft.createToken(tokenString, parsedPrice, title.trim(), imgURL, { value: listingprice });
      const createTokenReceipt = await createTokenResponse.wait();
      if (createTokenReceipt.status == 1) {
        localStorage.setItem("nftMinted", "true");
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error);
      toastMessage("error", "Unable to mint NFT. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal show={isCreateNFT} onHide={() => setIsCreateNFT(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => createNFT(e)}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" placeholder="https://ipfs.image.jpeg" onChange={(e) => setImage(e.target.files[0])} autoFocus required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Price (ETH)</Form.Label>
              <Form.Control
                type="number"
                placeholder="0.01 ETH"
                step="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                autoFocus
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>
            <div className="create-nft-button-area">
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Mint NFT"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default CreateNFT;
