// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface Iprofile {
    struct userProfile {
        string displayName;
        string bio;
    }

    function getProfile(
        address _user
    ) external view returns (userProfile memory);
}

contract XCrypto is Ownable {
    Iprofile profileContract;
    IERC20 public xCryptoToken; // Reference to the XCryptoToken contract

    struct tweet {
        uint256 id;
        address author;
        string text;
        uint256 time;
        uint64 like;
        address[] likers;
    }

    mapping(address => tweet[]) public tweets;

    // Token amounts (adjustable)
    uint256 public constant PROFILE_REWARD = 100 * 10 ** 18; // 100 XCT for creating a profile
    uint256 public constant POST_COST = 5 * 10 ** 18; // 5 XCT deducted per post
    uint256 public constant LIKE_REWARD = 1 * 10 ** 18; // 1 XCT per like to the author

    event NewTweet(
        uint256 id,
        address indexed author,
        string text,
        uint256 time
    );
    event TweetLiked(
        address[] likers,
        address currentLiker,
        uint64 like,
        uint256 id
    );
    event ProfileReward(address indexed user, uint256 amount);
    event PostDeduction(address indexed user, uint256 amount);
    event LikeReward(address indexed author, uint256 amount);

    modifier onlyRegistered() {
        Iprofile.userProfile memory user = profileContract.getProfile(
            msg.sender
        );
        require(bytes(user.displayName).length > 0, "User is not registered");
        _;
    }

    constructor(
        address _profileContract,
        address _tokenContract
    ) Ownable(msg.sender) {
        profileContract = Iprofile(_profileContract);
        xCryptoToken = IERC20(_tokenContract);
    }

    function isInArray(
        address[] memory arr,
        address target
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return true;
            }
        }
        return false;
    }

    function rewardProfile(address _user) external onlyOwner {
        require(
            xCryptoToken.transfer(_user, PROFILE_REWARD),
            "Token transfer failed"
        );
        emit ProfileReward(_user, PROFILE_REWARD);
    }

    function post(string memory _tweet) public onlyRegistered {
        require(bytes(_tweet).length <= 280, "Tweet is too LOOONG");
        require(
            xCryptoToken.transferFrom(msg.sender, address(this), POST_COST),
            "Insufficient tokens or approval for posting"
        );

        tweet memory newTweet = tweet({
            id: tweets[msg.sender].length,
            author: msg.sender,
            text: _tweet,
            time: block.timestamp,
            like: 0,
            likers: new address[](0)
        });

        tweets[msg.sender].push(newTweet);

        emit NewTweet(
            newTweet.id,
            newTweet.author,
            newTweet.text,
            newTweet.time
        );
        emit PostDeduction(msg.sender, POST_COST);
    }

    function getAllTweet(address _user) public view returns (tweet[] memory) {
        return tweets[_user];
    }

    function getSomething(
        address _user,
        uint _index
    ) public view returns (address[] memory) {
        return tweets[_user][_index].likers;
    }

    function likeTweet(address _author, uint256 _id) external onlyRegistered {
        require(tweets[_author][_id].id == _id, "Tweet does not exist");
        require(
            !isInArray(tweets[_author][_id].likers, msg.sender),
            "Already liked"
        );

        tweets[_author][_id].likers.push(msg.sender);
        tweets[_author][_id].like++;

        // Reward the tweet author with tokens
        require(
            xCryptoToken.transfer(_author, LIKE_REWARD),
            "Token transfer to author failed"
        );

        emit TweetLiked(
            tweets[_author][_id].likers,
            msg.sender,
            tweets[_author][_id].like,
            tweets[_author][_id].id
        );
        emit LikeReward(_author, LIKE_REWARD);
    }

    function unLikeTweet(address _author, uint256 _id) external onlyRegistered {
        require(tweets[_author][_id].id == _id, "tweet not exists");
        require(tweets[_author][_id].like > 0, "tweet has no likes");
        require(
            isInArray(tweets[_author][_id].likers, msg.sender),
            "you didn't liked"
        );

        for (uint256 i = 0; i <= tweets[_author][_id].likers.length; i++) {
            if (tweets[_author][_id].likers[i] == msg.sender) {
                for (
                    uint256 j = i;
                    j < tweets[_author][_id].likers.length - 1;
                    j++
                ) {
                    tweets[_author][_id].likers[j] = tweets[_author][_id]
                        .likers[j + 1];
                }
                tweets[_author][_id].likers.pop(); // Remove the last element
                tweets[_author][_id].like--; // Decrease like count
                break;
            }
        }
    }

    function getTotalUserLikes(address _author) external view returns (uint) {
        uint totalLikes;
        for (uint i; i < tweets[_author].length; i++) {
            totalLikes += tweets[_author][i].like;
        }
        return totalLikes;
    }

    function getUserBalance(address _user) public view returns (uint256) {
        return xCryptoToken.balanceOf(_user);
    }
}
