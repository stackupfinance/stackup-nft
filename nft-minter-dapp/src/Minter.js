import { useEffect, useState } from 'react';
import { 
  connectWallet, 
  getCurrentWalletConnected, 
  addMetamaskWalletListener,
  approveUSDC,
  mintNFT, 
  addWalletConnectListener
} from './utils/web3.js';
import initModal from './utils/modal.js';

const Minter = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [approvalAmount, setApprovalAmount] = useState(0);

  useEffect(() => {
    const init = async() => {
      const { address, status } = await getCurrentWalletConnected();
      setWalletAddress(address);
      setStatus(status);
      addWalletConnectListener(setWalletAddress, setStatus);
      addMetamaskWalletListener(setWalletAddress, setStatus);
    }
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
  }

  const onApproveHandler = async (walletAddress) => {
    setStatus('');
    // pre-approve use of USDC by the NFT smart contract on behalf of the user
    if (!approvalAmount) {
      setStatus('Please enter an approval amount');
      return;
    }
    const { status } = await approveUSDC(walletAddress, approvalAmount);
    setStatus(status);
  };

  const onMintHandler = async (walletAddress) => {
    const { status } = await mintNFT(walletAddress, paymentType);
    setStatus(status);
  };

  return (
    <div className='Minter'>
      <button className='button js-modal-trigger' data-target='connect-wallet-modal' id='walletButton'>
        {walletAddress.length > 0 ? (
          'Connected: ' +
          String(walletAddress).substring(0, 6) +
          '...' +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <div id='connect-wallet-modal' className='modal'>
        <div className='modal-background'></div>
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title'>Connect a wallet</p>
            <button className='delete' aria-label='close'></button>
          </header>
          <section className='modal-card-body'>
            <p>Connect with one of our available wallet providers:</p>
            <button className='button wallet-button' onClick={() => connectWalletHandler('metamask')}>
              <span className='icon is-small'>
                <img src='/images/metamask.png' alt='Metamask' />
              </span>
              <span>Metamask</span>
            </button>
            <button className='button wallet-button' onClick={connectWalletHandler}>
              <span className='icon is-small'>
                <img src='/images/wallet-connect.png' alt='Wallet Connect' />
              </span>
              <span>Wallet Connect</span>
            </button>
          </section>
        </div>
      </div>

      <br></br>
      <div className='logo-container'>
        <img src='/images/logotype-blue-navy-64-height.png' alt='Stackup logo' />
      </div>
      
      <h1 id='title'>NFT Minter</h1>
      <p>
        Simply press 'Mint NFT' to mint your Stackup Founding Membership NFT
      </p>
      <div className='video-container'>
        <video className='video'>
          <source src='images/Stackup_Founding_Membership.mp4' autoPlay='autoplay' loop='loop' type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
        </video>
      </div>
      <br />
      <p><b>Choose a payment option:</b></p>
      <div className="control">
        <label className="radio">
          <input onChange={() => setPaymentType('matic')} type="radio" name="payment" />
          &nbsp;MATIC&nbsp;
        </label>
        <label className="radio">
          <input onChange={() => setPaymentType('usdc')} type="radio" name="payment" />
          &nbsp;USDC&nbsp;
        </label>
      </div>
      <div className="button-group">
        {
          paymentType === 'usdc' && <div>
            <input className="input" id='approveInput' type="text" placeholder="Enter amount in USDC" onChange={setApprovalAmountHandler}></input>
            <button className='button' id='approveButton' onClick={() => onApproveHandler(walletAddress)}>
              Approve
            </button>
          </div>
        }
      </div>
      <div className="button-group">
        <button className='button is-black' id='mintButton' onClick={() => onMintHandler(walletAddress)} disabled={!paymentType}>
          Mint NFT
        </button>
      </div>
      <p id='status'>
        {status}
      </p>
    </div>
  );
};

export default Minter;
