import { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  addMetamaskWalletListener,
  approveUSDC,
  mintNFT,
  addWalletConnectListener,
} from "./utils/web3.js";
import initModal from "./utils/modal.js";

const Minter = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [approvalAmount, setApprovalAmount] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { address, status } = await getCurrentWalletConnected();
      setWalletAddress(address);
      setStatus(status);
      addWalletConnectListener(setWalletAddress, setStatus);
      addMetamaskWalletListener(setWalletAddress, setStatus);
    };
    init();
    initModal();
  }, []);

  const connectWalletHandler = async (walletName) => {
    const walletResponse = await connectWallet(walletName);
    if (walletResponse) {
      setStatus(walletResponse.status);
      setWalletAddress(walletResponse.address);
    }
  };

  const setApprovalAmountHandler = (event) => {
    setApprovalAmount(event.target.value);
  };

  const onApproveHandler = async (walletAddress) => {
    setStatus("");
    // pre-approve use of USDC by the NFT smart contract on behalf of the user
    if (!approvalAmount) {
      setStatus("Please enter an approval amount");
      return;
    }
    const { status } = await approveUSDC(walletAddress, approvalAmount);
    setStatus(status);
  };

  const onMintHandler = async (walletAddress) => {
    // TODO: Add referral code text field.
    // TODO: Pass referral code text along so that it is logged when a transaction goes through.

    if (paymentType == "matic") {
      const { status } = await mintNFT(walletAddress, paymentType);
      setStatus(status);
    } else {
      // TODO: Put link to Stripe
      window.open("https://stackup.sh/stripe", "_blank").focus();
    }
  };

  return (
    <div className="Minter">
      <div>
        <button
          className="button js-modal-trigger"
          data-target="connect-wallet-modal"
          id="walletButton"
        >
          {walletAddress.length > 0 ? (
            "Connected: " +
            String(walletAddress).substring(0, 6) +
            "..." +
            String(walletAddress).substring(38)
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
        <div id="connect-wallet-modal" className="modal">
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Connect a wallet</p>
              <button className="delete" aria-label="close"></button>
            </header>
            <section className="modal-card-body">
              <p>Connect with one of our available wallet providers:</p>
              <button
                className="button wallet-button"
                onClick={() => connectWalletHandler("metamask")}
              >
                <span className="icon is-small">
                  <img src="/images/metamask.png" alt="Metamask" />
                </span>
                <span>Metamask</span>
              </button>
              <button
                className="button wallet-button"
                onClick={connectWalletHandler}
              >
                <span className="icon is-small">
                  <img src="/images/wallet-connect.png" alt="Wallet Connect" />
                </span>
                <span>Wallet Connect</span>
              </button>
            </section>
          </div>
        </div>
        <a href="https://stackup.sh">
          <div className="logo-container">
            <img src="/images/logotype-blue-white-64.png" alt="Stackup logo" />
          </div>
        </a>
      </div>

      <h1 id="title">Stackup Founding Card</h1>

      <div id="h2-container">
        <h2>
          A limited edition membership that gives you perks in the Stackup
          wallet
        </h2>
      </div>

      <div className="card-container">
        <div className="video-container">
          <video className="video" controls autoPlay loop muted>
            <source src="images/card.webm" type="video/webm" />
          </video>
        </div>
        <div className="card-description">
          <br />
          <p>The Stackup Founding Card NFT gives you access to:</p>
          <ul id="perks-list">
            <li>Lifetime discounts on transaction fees</li>
            <li id="li-gift">A surprise gift box</li>
            <li id="li-card">A physical Stackup card</li>
            <li id="li-irl">Access to in-real-life events</li>
          </ul>
          <br />
          <br />
          <div className="button-group">
            <button
              className="button"
              id="mintButton"
              onClick={() => onMintHandler(walletAddress)}
              disabled={!paymentType}
            >
              Buy NFT
            </button>
          </div>
          <div className="paymentOptions">
            <select
              id="paySelect"
              class="form-control"
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option className="SetPaymentType" value="">
                Select your payment method
              </option>
              <option value="stripe">Credit Card</option>
              <option value="matic">MATIC on Polygon Network</option>
            </select>
            <br />
            <br />
          </div>
        </div>

        <p id="status">{status}</p>

        <br />
      </div>
    </div>
  );
};

export default Minter;
