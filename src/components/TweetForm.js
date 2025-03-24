import React, { useState } from "react";
import { ethers } from "ethers";
import { config } from "../config";
import XCryptoTokenABI from "../abis/XCryptoToken.json";
import XCryptoABI from "../abis/XCrypto.json";

const TweetForm = ({ signer, account, onTweetPosted }) => {
  // Add callback prop
  const [tweetText, setTweetText] = useState("");
  const [balances, setBalances] = useState({ pre: "", post: "" });
  const [isLoading, setIsLoading] = useState(false);

  const postTweet = async () => {
    if (!signer || !tweetText) return;

    const tokenContract = new ethers.Contract(
      config.xCryptoTokenAddress,
      XCryptoTokenABI.abi,
      signer
    );
    const xCryptoContract = new ethers.Contract(
      config.xCryptoAddress,
      XCryptoABI.abi,
      signer
    );

    setIsLoading(true);
    try {
      const preBalance = await tokenContract.balanceOf(account);
      console.log("Balance:", ethers.formatEther(preBalance));
      if (preBalance < ethers.parseEther("5"))
        throw new Error("Insufficient balance");

      const approveTx = await tokenContract.approve(
        config.xCryptoAddress,
        ethers.parseEther("5")
      );
      await approveTx.wait();

      const postTx = await xCryptoContract.post(tweetText);
      await postTx.wait();

      const postBalance = await tokenContract.balanceOf(account);
      setBalances({
        pre: ethers.formatEther(preBalance),
        post: ethers.formatEther(postBalance),
      });
      setTweetText("");
      if (onTweetPosted) onTweetPosted(); // Trigger refresh in TweetList
    } catch (error) {
      console.error("Tweet posting error:", error);
      alert("Failed to post tweet: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="box">
      <h2 className="subtitle">Post a Tweet (5 XCT)</h2>
      <div className="field">
        <div className="control">
          <input
            className="input"
            type="text"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="Enter your tweet"
            disabled={isLoading}
          />
        </div>
      </div>
      <button
        className={`button is-info ${isLoading ? "is-loading" : ""}`}
        onClick={postTweet}
        disabled={isLoading}
      >
        Post Tweet
      </button>
      {balances.pre && (
        <div className="mt-2">
          <p>
            <strong>Pre-transaction Balance:</strong> {balances.pre} XCT
          </p>
          <p>
            <strong>Post-transaction Balance:</strong> {balances.post} XCT
          </p>
        </div>
      )}
    </div>
  );
};

export default TweetForm;
