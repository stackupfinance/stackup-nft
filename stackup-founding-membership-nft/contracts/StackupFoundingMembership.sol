// contracts/StackupFoundingMembership.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StackupFoundingMembership is ERC721 {
    string public baseURI;
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

    constructor(string memory _name, string memory _symbol, uint256 _price, uint256 _priceUSDC, string memory _baseTokenURI) ERC721(_name, _symbol) {
        baseURI = _baseTokenURI;
        owner = msg.sender;
        price = _price;
        priceUSDC = _priceUSDC;
        usdc = IERC20(usdcTestnetAddress);
        // nextTokenId is initialized to 1, since starting at 0 leads to higher gas cost for the first minter
        _tokenIds.increment();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _uri) public onlyOwner {
        baseURI = _uri;
    }

    function setPrice(uint newPrice) public onlyOwner {
        price = newPrice;
    }

    function setPriceUSDC(uint newPrice) public onlyOwner {
        priceUSDC = newPrice;
    }

    function mint() public onlyOwner returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);

        return newItemId;
    }

    function mintToAddress(address recipient, bool paymentInUSDC) public payable returns (uint256) {
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
        require(address(this).balance > 0, "There are no funds to withdraw.");
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {}

    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }
}