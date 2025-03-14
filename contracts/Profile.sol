// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IXCrypto {
    function rewardProfile(address _user) external;
}

contract Profile is Ownable {
    IXCrypto public xCryptoContract;

    struct userProfile {
        string displayName;
        string bio;
    }

    mapping(address => userProfile) public profiles;

    constructor(address _xCryptoContract) Ownable(msg.sender) {
        xCryptoContract = IXCrypto(_xCryptoContract);
    }

    function setXCryptoContract(address _xCryptoContract) external onlyOwner {
        xCryptoContract = IXCrypto(_xCryptoContract);
    }

    function setProfile(string memory _displayName, string memory _bio) public {
        require(
            bytes(profiles[msg.sender].displayName).length == 0,
            "Profile already set"
        );
        profiles[msg.sender] = userProfile(_displayName, _bio);
        xCryptoContract.rewardProfile(msg.sender); // Back in action!
    }

    function getProfile(
        address _user
    ) public view returns (userProfile memory) {
        return profiles[_user];
    }
}
