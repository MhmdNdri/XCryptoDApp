// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XCryptoToken is ERC20, Ownable {
    constructor() ERC20("XCryptoToken", "XCT") Ownable(msg.sender) {
        // Mint an initial supply to the contract deployer (optional)
        _mint(msg.sender, 1_000_000 * 10**18); // 1 million tokens with 18 decimals
    }

    // Function to allow the XCrypto contract to mint tokens (controlled by owner or contract)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}