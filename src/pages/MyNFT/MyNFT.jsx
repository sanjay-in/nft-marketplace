import React, { useEffect, useState } from "react";
import Nav from "react-bootstrap/Nav";
import { Button, Spinner } from "react-bootstrap";
import CreateNFT from "../../components/CreateNFT/CreateNFT";
import Card from "../../components/Card/Card";
import ConnectMetaMask from "../../components/ConnectMetamask/ConnectMetamask";
import NotFound from "../../components/NotFound/NotFound";
import Loading from "../../components/Loading/Loading";
import { getContract, getCurrectAccount } from "../../../utils/utils";
import "./MyNFT.css";

const MyNFT = () => {
  const [section, setSection] = useState("unsold");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [activeKey, setActiveKey] = useState("1");
  const [isCreateNFT, setIsCreateNFT] = useState(false);

  const getUnsoldNFTs = async () => {
    try {
      const nft = await getContract();
      const unsoldNfts = await nft.fetchUserUnsoldNFTs();
      setData([...unsoldNfts]);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getPurchasedNFTs = async () => {
    try {
      const nft = await getContract();
      const myNFTs = await nft.fetchMyNFTs();
      setData([...myNFTs]);
    } catch (error) {
      console.log("error", error);
    }
  };

  const sectionHandler = (sectionName) => {
    if (sectionName == "unsold") {
      setActiveKey("1");
      setSection(sectionName);
      setLoading(true);
      getUnsoldNFTs();
      setLoading(false);
    } else {
      setSection(sectionName);
      setActiveKey("2");
      setLoading(true);
      getPurchasedNFTs();
      setLoading(false);
    }
  };

  const getNotFoundMesage = () => {
    if (section == "unsold") {
      return "No unsold NFTs";
    } else {
      return "No NFTs bought";
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setIsWalletConnected(true);
      } else {
        setIsWalletConnected(false);
      }
    } catch (error) {
      console.log(error);
      setIsWalletConnected(false);
    }
  };

  useEffect(() => {
    sectionHandler(section);
    connectWallet();
    getCurrectAccount();
  }, [isWalletConnected]);

  return (
    <div>
      <div className="create-nft-btn">
        {isWalletConnected ? (
          <Button variant="primary" onClick={() => setIsCreateNFT(true)}>
            + Create NFT
          </Button>
        ) : (
          <div></div>
        )}
      </div>
      <Nav fill variant="tabs" activeKey={activeKey}>
        <Nav.Item>
          <Nav.Link eventKey="1" onClick={() => sectionHandler("unsold")}>
            My Unsold NFTs
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="2" onClick={() => sectionHandler("bought")}>
            Purchased NFTs
          </Nav.Link>
        </Nav.Item>
      </Nav>
      {!isWalletConnected ? (
        <ConnectMetaMask connectMetaMask={connectWallet} />
      ) : loading ? (
        <Loading text="Loading NFTs" />
      ) : data && data.length == 0 ? (
        <NotFound message={getNotFoundMesage()} />
      ) : (
        <div className="nft-section">
          <div className="nft-section-card-container">
            {data && data.length
              ? data.map((nft) => {
                  return (
                    <Card
                      key={nft.tokenId}
                      id={nft.tokenId}
                      image={nft.imgURL}
                      price={nft.price}
                      seller={nft.seller}
                      title={nft.title}
                      sold={nft.sold}
                    />
                  );
                })
              : null}
          </div>
        </div>
      )}
      {isCreateNFT ? <CreateNFT isCreateNFT={isCreateNFT} setIsCreateNFT={setIsCreateNFT} /> : null}
    </div>
  );
};

export default MyNFT;
