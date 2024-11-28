import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import { Button } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import ImageModal from "../../components/Modals/Image/ImageModal";
import ConfirmationModal from "../../components/Modals/Confirmation/ConfirmationModal";
import Loading from "../../components/Loading/Loading";
import ErrorPage from "../Error/Error";
import { getContract, trimWalletAddress, toastMessage, getCurrectAccount } from "../../../utils/utils";
import "./NFTPage.css";

const NFTPage = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [bougnt, setBought] = useState(false);
  const [currectAccount, setCurrentAccount] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const getPageDetails = async () => {
    try {
      setPageLoading(true);
      const nft = await getContract();
      const id = searchParams.get("id");

      const nftDetails = await nft.getTokenToIdListed(id);
      const tokenURI = await nft.tokenURI(id);
      const token = (await tokenURI) ? JSON.parse(tokenURI) : null;

      setDetails({
        title: token.title,
        id: Number(id),
        price: token.price,
        sender: token.creator,
        image: `https://${token.image}`,
        description: token.description,
        sold: nftDetails.sold,
        owner: nftDetails.owner,
      });
      setPageLoading(false);
    } catch (error) {
      console.log(error);
      setPageLoading(false);
    }
  };

  const handleCurrentAccount = async () => {
    const account = await getCurrectAccount();
    setCurrentAccount(account);
  };

  const buyNFT = async () => {
    setLoading(true);
    try {
      const nft = await getContract();
      const id = searchParams.get("id");
      const buyNFTTransactionResponse = await nft.buyNFT(id, { value: ethers.parseEther(details.price.toString()) });
      const buyNFTTransactionReceipt = await buyNFTTransactionResponse.wait();
      if (buyNFTTransactionReceipt.status == 1) {
        setIsConfirmationModalOpen(false);
        setBought(true);
        setLoading(false);
        toastMessage("success", "Congratulations! You have purchased this NFT.");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const isOwner = () => {
    return currectAccount.toLowerCase() == details.owner.toLowerCase();
  };

  useEffect(() => {
    getPageDetails();
    handleCurrentAccount();
  }, [bougnt]);

  return (
    <>
      {pageLoading ? (
        <Loading text="Loading NFT details" />
      ) : details ? (
        <div className="nft-page">
          <div className="nft-page-image-container">
            <div className="nft-page-image-top">
              <a href={details.image} target="_blank">
                <i className="fa fa-external-link" aria-hidden="true" />
              </a>
            </div>
            <img className="nft-page-image" src={details.image} onClick={() => setIsImageModalOpen(true)} />
          </div>
          <div className="nft-page-info-container">
            <div className="nft-page-name">{details.title}</div>
            <div className="nft-page-info">
              <div className="nft-page-price">
                <div className="nft-page-price-heading">{details.sold && !isOwner() ? "Sold" : isOwner() ? "Bought" : "Current"} Price</div>
                <div className="nft-page-price-value">{details.price} ETH</div>
                {isOwner() ? (
                  <div className="nft-page-purchased-text">
                    <i id="nft-page-purchased-icon" className="fa fa-check-circle" aria-hidden="true"></i>Purchased
                  </div>
                ) : (
                  <Button
                    id="nft-page-price-button"
                    variant={details.sold ? "secondary" : "primary"}
                    onClick={() => setIsConfirmationModalOpen(true)}
                    disabled={loading || details.sold}
                  >
                    {details.sold ? "Sold out" : "Buy Now"} <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                  </Button>
                )}
              </div>
              <div className="nft-page-token-info">
                <div className="nft-page-info-heading">
                  Details
                  <hr />
                </div>
                <div className="nft-page-details">
                  <div className="nft-page-detail-heading">Token Id</div>
                  <div className="nft-page-detail">{details.id}</div>
                </div>
                <div className="nft-page-details">
                  <div className="nft-page-detail-heading">Creator</div>
                  <div className="nft-page-detail">{trimWalletAddress(details.sender)}</div>
                </div>
                <div className="nft-page-details">
                  <div className="nft-page-detail-heading">Chain</div>
                  <div className="nft-page-detail">Ethereum</div>
                </div>
              </div>
            </div>
            <div className="nft-page-description">
              <div className="nft-page-description-head">
                <i className="fa fa-info" aria-hidden="true"></i>
                Description
              </div>
              <div className="nft-page-description-paragraph">{details.description}</div>
            </div>
          </div>
          <ImageModal image={details.image} show={isImageModalOpen} handleClose={setIsImageModalOpen} />
          <ConfirmationModal buyNFT={buyNFT} show={isConfirmationModalOpen} handleClose={setIsConfirmationModalOpen} loading={loading} />
          <ToastContainer />
        </div>
      ) : (
        <ErrorPage />
      )}
    </>
  );
};

export default NFTPage;
