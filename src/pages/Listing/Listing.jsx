import React, { useEffect, useState } from "react";
import Card from "../../components/Card/Card";
import NotFound from "../../components/NotFound/NotFound";
import Loading from "../../components/Loading/Loading";
import { ToastContainer } from "react-toastify";
import { getContract, toastMessage } from "../../../utils/utils";
import coverImage from "../../assets/cover.png";
import "./Listing.css";

const Listing = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getListedNFTs = async () => {
    setLoading(true);
    try {
      const nft = await getContract();
      const listedNFTs = await nft.fetchListedNFTs();
      setData([...listedNFTs]);
    } catch (error) {
      console.log("error", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getListedNFTs();
    if (localStorage.getItem("nftMinted")) {
      toastMessage("success", "NFT minted successfully.");
      localStorage.removeItem("nftMinted");
    }
  }, []);

  return (
    <div className="listing-page">
      {loading ? (
        <Loading text="Loading NFTs" />
      ) : (
        <>
          <img className="listing-page-cover" src={coverImage} />
          <div className="listing-page-title">Listed NFTs</div>
          <hr className="listing-page-title-line" />
          <div className="listing-page-card-container">
            {data && data.length ? (
              data.map((nft) => {
                return <Card key={nft.tokenId} id={nft.tokenId} image={nft.imgURL} price={nft.price} seller={nft.seller} title={nft.title} />;
              })
            ) : (
              <div className="listing-page-notfound-container">
                <NotFound message="No listed NFTs" />
              </div>
            )}
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default Listing;
