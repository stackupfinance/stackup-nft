import Web3 from "web3";
import { pinJSONToIPFS } from "./pinata.js";
import WalletConnectProvider from "@walletconnect/web3-provider";
require("dotenv").config();

const contractABI = require("../contract-abi.json");
const contractAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;

const usdcContractABI = require("../usdc-contract-abi.json");
const usdcContractAddress = process.env.REACT_APP_USDC_CONTRACT_ADDRESS;

// provider for Wallet Connect
const provider = new WalletConnectProvider({
  rpc: {
    80001: "https://matic-mumbai.chainstacklabs.com",
    137: "https://matic-mainnet.chainstacklabs.com",
  },
});

// create web3 instance for Wallet Connect
const web3 = new Web3(provider);

// create contract instances
const nftContract = new web3.eth.Contract(contractABI, contractAddress);
const usdcContract = new web3.eth.Contract(
  usdcContractABI,
  usdcContractAddress
);

export const connectWallet = async (walletName) => {
  const connectMetamask = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const obj = {
          // status: '👆🏽 Write a message in the text-field above.',
          address: addressArray[0],
        };
        return obj;
      } catch (err) {
        return {
          address: "",
          status: "😥 " + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://metamask.io/download.html`}
              >
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };

  const connectWalletConnect = async () => {
    try {
      // Enable session (triggers Wallect Connect QR Code modal)
      await provider.enable();
      // Get Accounts
      const addressArray = await web3.eth.getAccounts();
      const obj = {
        // status: '👆🏽 Write a message in the text-field above.',
        address: addressArray[0],
        provider,
      };
      return obj;
    } catch (error) {
      console.error(error.message);
    }
  };

  if (walletName !== "metamask") return await connectWalletConnect();
  return await connectMetamask();
};

export const getCurrentWalletConnected = async () => {
  // Metamask
  const getConnectedMetamask = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (addressArray.length > 0) {
          return {
            address: addressArray[0],
            // status: '👆🏽 Write a message in the text-field above.',
          };
        } else {
          return {
            address: "",
            // status: '🦊 Connect to Metamask using the top right button.',
          };
        }
      } catch (err) {
        return {
          address: "",
          status: "😥 " + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://metamask.io/download.html`}
              >
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };

  // Wallet Connect
  const getConnectedWalletConnect = async (walletconnect) => {
    try {
      // Get Accounts
      const walletconnectData = JSON.parse(walletconnect);
      if (walletconnectData.accounts && walletconnectData.accounts.length > 0) {
        return {
          address: walletconnectData.accounts[0],
          // status: '👆🏽 Write a message in the text-field above.',
        };
      } else {
        return {
          address: "",
          status: "Connect to Stackup using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  };

  // check if there is an active Wallet Connect session
  const walletconnect = localStorage.getItem("walletconnect");
  if (walletconnect) return await getConnectedWalletConnect(walletconnect);
  return await getConnectedMetamask();
};

export const addWalletConnectListener = (setWalletAddress) => {
  const walletconnect = localStorage.getItem("walletconnect");
  if (walletconnect) {
    try {
      const walletconnectData = JSON.parse(walletconnect);

      // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        setWalletAddress(walletconnectData.accounts[0]);
        console.log(`Account changed: ${accounts}`);
      });

      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        console.log(`ChainId changed: ${chainId}`);
      });

      // Subscribe to session disconnection
      provider.on("disconnect", (code, reason) => {
        setWalletAddress("");
        console.log(code, reason);
      });
    } catch (error) {
      console.error(error.message);
    }
  }
};

export const addMetamaskWalletListener = (setWalletAddress, setStatus) => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress("");
        // setStatus('Connect to a wallet using the top right button.');
      }
    });
  } else {
    setStatus(
      <p>
        {" "}
        🦊{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://metamask.io/download.html`}
        >
          You must install Metamask, a virtual Ethereum wallet, in your browser.
        </a>
      </p>
    );
  }
};

export const approveUSDC = async (address, amount) => {
  const approvalAmount = `${amount}000000`;
  const approveMetamask = async () => {
    try {
      const transactionParameters = {
        to: usdcContractAddress,
        from: address,
        data: usdcContract.methods
          .approve(contractAddress, approvalAmount)
          .encodeABI(),
      };
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      return {
        success: true,
        status: `✅ Check out your transaction on Polygonscan: ${process.env.REACT_APP_POLYGON_TX_HASH_PATH}${txHash}`,
      };
    } catch (error) {
      console.error(error.message);
    }
  };
  const approveWalletConnect = async () => {
    const transactionParameters = {
      to: usdcContractAddress,
      from: address,
      data: usdcContract.methods
        .approve(contractAddress, approvalAmount)
        .encodeABI(),
    };
    try {
      const txHash = await web3.eth.sendTransaction(transactionParameters);
      return {
        success: true,
        status: `✅ Check out your transaction on Polygonscan: ${process.env.REACT_APP_POLYGON_TX_HASH_PATH}${txHash}`,
      };
    } catch (error) {
      return {
        success: false,
        status: `😥 Something went wrong: ${error.message}`,
      };
    }
  };

  // check if there is an active Wallet Connect session
  const walletconnect = localStorage.getItem("walletconnect");
  if (walletconnect) return await approveWalletConnect();
  return await approveMetamask();
};

export const mintNFT = async (walletAddress, paymentType) => {
  const paymentInUSDC = paymentType === "usdc" ? true : false;

  //make metadata
  const metadata = {
    name: "Stackup Founding Membership NFT",
    image: process.env.REACT_APP_NFT_IMG_URL,
    description:
      "The Stackup Founding Membership NFT offers special benefits for early users",
  };

  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    };
  }
  const tokenURI = pinataResponse.pinataUrl;

  const sendTransactionMetaMask = async () => {
    console.log(`

    `);
    const transactionParameters = {
      to: contractAddress,
      from: window.ethereum.selectedAddress,
      data: nftContract.methods
        .mintToAddress(window.ethereum.selectedAddress, tokenURI, paymentInUSDC)
        .encodeABI(),
    };

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      return {
        success: true,
        status: `✅ Check out your transaction on Polygonscan: ${process.env.REACT_APP_POLYGON_TX_HASH_PATH}${txHash}`,
      };
    } catch (error) {
      return {
        success: false,
        status: `😥 Something went wrong: ${error.message}`,
      };
    }
  };

  const sendTransactionWalletConnect = async () => {
    console.log(`
      wallet connect ::::
      contractAddress | ${contractAddress} ::::
      walletAddress | ${walletAddress} ::::
      tokenURI | ${tokenURI} ::::
      paymentInUSDC | ${paymentInUSDC}
    `);
    const transactionParameters = {
      to: contractAddress,
      from: walletAddress,
      data: nftContract.methods
        .mintToAddress(walletAddress, tokenURI, paymentInUSDC)
        .encodeABI(),
    };
    try {
      const txHash = await web3.eth.sendTransaction(transactionParameters);
      return {
        success: true,
        status: `✅ Check out your transaction on Polygonscan: ${process.env.REACT_APP_POLYGON_TX_HASH_PATH}${txHash}`,
      };
    } catch (error) {
      return {
        success: false,
        status: `😥 Something went wrong: ${error.message}`,
      };
    }
  };

  // check if there is an active Wallet Connect session
  const walletconnect = localStorage.getItem("walletconnect");
  if (walletconnect) return await sendTransactionWalletConnect();
  return await sendTransactionMetaMask();
};
