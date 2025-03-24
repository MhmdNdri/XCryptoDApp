import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { config } from "../config";
import XCryptoABI from "../abis/XCrypto.json";

const TweetList = ({ signer, account, refreshTrigger }) => {
  // Add refreshTrigger prop
  const [tweets, setTweets] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});

  const fetchTweets = async () => {
    if (!signer || !account) return;

    const xCryptoContract = new ethers.Contract(
      config.xCryptoAddress,
      XCryptoABI.abi,
      signer
    );

    try {
      const userTweets = await xCryptoContract.getAllTweet(account);
      const formattedTweets = userTweets.map((tweet) => ({
        id: Number(tweet.id),
        text: tweet.text,
        time: new Date(Number(tweet.time) * 1000).toLocaleString(),
        likes: Number(tweet.like),
        author: tweet.author,
        likers: tweet.likers.map((liker) => liker.toLowerCase()), // Normalize addresses
      }));
      setTweets(formattedTweets);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };

  useEffect(() => {
    fetchTweets(); // Initial fetch
    const interval = setInterval(fetchTweets, 10000); // Poll every 10 seconds
    return () => clearInterval(interval); // Cleanup
  }, [signer, account]);

  useEffect(() => {
    if (refreshTrigger) fetchTweets(); // Refresh when triggered
  }, [refreshTrigger]);

  const handleLike = async (tweetId) => {
    if (!signer) return;

    setLoadingStates((prev) => ({ ...prev, [tweetId]: "liking" }));
    const xCryptoContract = new ethers.Contract(
      config.xCryptoAddress,
      XCryptoABI.abi,
      signer
    );

    try {
      const tx = await xCryptoContract.likeTweet(account, tweetId);
      await tx.wait();
      fetchTweets();
    } catch (error) {
      console.error("Error liking tweet:", error);
      alert("Failed to like tweet: " + error.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [tweetId]: false }));
    }
  };

  const handleUnlike = async (tweetId) => {
    if (!signer) return;

    setLoadingStates((prev) => ({ ...prev, [tweetId]: "unliking" }));
    const xCryptoContract = new ethers.Contract(
      config.xCryptoAddress,
      XCryptoABI.abi,
      signer
    );

    try {
      const tx = await xCryptoContract.unLikeTweet(account, tweetId);
      await tx.wait();
      fetchTweets();
    } catch (error) {
      console.error("Error unliking tweet:", error);
      alert("Failed to unlike tweet: " + error.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [tweetId]: false }));
    }
  };

  const isLikedByUser = (likers) => {
    return likers.includes(account.toLowerCase()); // Normalize account address
  };

  return (
    <div className="box">
      <h2 className="subtitle has-text-weight-semibold">Your Tweets</h2>
      {tweets.length === 0 ? (
        <p className="has-text-grey">No tweets yet.</p>
      ) : (
        <div>
          {tweets
            .slice()
            .reverse()
            .map((tweet) => (
              <article key={tweet.id} className="media mb-4">
                <div className="media-content">
                  <div className="content">
                    <p className="is-size-5">{tweet.text}</p>
                    <p className="is-size-7 has-text-grey">
                      Posted on: {tweet.time} |{" "}
                      <span className="has-text-weight-medium">
                        Likes: {tweet.likes}
                      </span>
                    </p>
                  </div>
                  <nav className="level is-mobile">
                    <div className="level-left">
                      {isLikedByUser(tweet.likers) ? (
                        <button
                          className={`button is-small is-outlined is-danger ${
                            loadingStates[tweet.id] === "unliking"
                              ? "is-loading"
                              : ""
                          }`}
                          onClick={() => handleUnlike(tweet.id)}
                          disabled={!!loadingStates[tweet.id]}
                        >
                          <span className="icon is-small">
                            <i className="fas fa-thumbs-down"></i>
                          </span>
                          <span>Unlike</span>
                        </button>
                      ) : (
                        <button
                          className={`button is-small is-primary ${
                            loadingStates[tweet.id] === "liking"
                              ? "is-loading"
                              : ""
                          }`}
                          onClick={() => handleLike(tweet.id)}
                          disabled={!!loadingStates[tweet.id]}
                        >
                          <span className="icon is-small">
                            <i className="fas fa-thumbs-up"></i>
                          </span>
                          <span>Like</span>
                        </button>
                      )}
                    </div>
                  </nav>
                </div>
              </article>
            ))}
        </div>
      )}
    </div>
  );
};

export default TweetList;
