import { BrowserProvider, Contract } from "ethers";
import { toast } from "react-toastify";
import ABI from "../src/constants/ABI.json";
import contractAddress from "../src/constants/contractAddress.json";

export const trimWalletAddress = (address) => {
  return address.substring(0, 6) + "..." + address.substring(address.length - 5, address.length);
};

export const getContract = async () => {
  if (window.ethereum) {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, ABI, signer);
      return contract;
    } catch (error) {
      console.log(error);
    }
  } else {
    return "No metamask found";
  }
};

export const getCurrectAccount = async () => {
  await window.ethereum.enable();
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const account = accounts[0];
  window.ethereum.on("accountsChanged", function (accounts) {
    window.location.reload();
  });
  return account;
};

export const toastMessage = (type, text) => {
  if (type == "success") {
    return toast.success(text, {
      position: "top-center",
      hideProgressBar: "true",
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
  } else {
    return toast.error(text, {
      position: "top-center",
      hideProgressBar: "true",
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
  }
};
