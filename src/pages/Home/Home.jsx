import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Listing from "../Listing/Listing";
import NFTPage from "../NFTPage/NFTPage";
import MyNFT from "../MyNFT/MyNFT";
import Error from "../Error/Error";
import "./Home.css";

const Home = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Listing />,
      errorElement: <Error />,
    },
    {
      path: "myNFTs",
      element: <MyNFT />,
    },
    {
      path: `nft`,
      element: <NFTPage />,
    },
  ]);
  return (
    <>
      <Navbar />
      <RouterProvider router={router} />
    </>
  );
};

export default Home;
