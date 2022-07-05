// contracts/StackupFoundingMembership.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StackupFoundingMembership is ERC721URIStorage {
    address public owner;
    uint public price;
    uint public priceUSDC;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // USDC mumbai testnet address
    address private immutable usdcTestnetAddress = 0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e;
    // USDC mainnet address
    address private immutable usdcAddress = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    IERC20 private usdc;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        owner = msg.sender;
        price = 109.0 ether;
        priceUSDC = 50000000.0; // 6 decimals
        usdc = IERC20(usdcAddress);
    }

    function setPrice(uint newPrice) public onlyOwner {
        price = newPrice;
    }

    function setPriceUSDC(uint newPrice) public onlyOwner {
        priceUSDC = newPrice;
    }

    function mint(string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function mintToAddress(address recipient, string memory tokenURI, bool paymentInUSDC) public payable returns (uint256) {
        bool paymentSucceeded = false;

        if (paymentInUSDC) {
            paymentSucceeded = payInUsdc();
        } else {
            require(msg.value > price);
            paymentSucceeded = true;
        }

        require(paymentSucceeded == true, "Payment was not successful");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function approveUSDC(uint amount) public returns (bool) {
        bool succeeded = usdc.approve(address(this), amount);
        return succeeded;
    }

    function allowanceUSDC() public view returns (uint) {
        uint allowance = usdc.allowance(msg.sender, address(this));
        return allowance;
    }

    function payInUsdc() public payable returns (bool) {
        uint allowance = usdc.allowance(msg.sender, address(this));
        require(allowance >= priceUSDC, "Check the token allowance");
        bool succeeded = usdc.transferFrom(msg.sender, address(this), priceUSDC);
        return succeeded;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getUsdcBalance() public view returns (uint) {
        return usdc.balanceOf(address(this));
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {}

    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }
}