import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { config } from "../config";
import XCryptoABI from "../abis/XCrypto.json";
import ProfileABI from "../abis/Profile.json";

const AllTweets = ({ signer }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signer) return;
    fetchAllTweets();

    const xCryptoContract = new ethers.Contract(
      config.xCryptoAddress,
      XCryptoABI.abi,
      signer
    );
    xCryptoContract.on("NewTweet", () => fetchAllTweets());
    xCryptoContract.on("TweetLiked", () => fetchAllTweets()); // Refresh on likes too
    return () => xCryptoContract.removeAllListeners();
  }, [signer]);

  const fetchAllTweets = async () => {
    try {
      const xCryptoContract = new ethers.Contract(
        config.xCryptoAddress,
        XCryptoABI.abi,
        signer
      );
      const profileContract = new ethers.Contract(
        config.profileAddress,
        ProfileABI.abi,
        signer
      );

      const allTweets = await xCryptoContract.getAllTweets();
      const tweetsWithAuthor = await Promise.all(
        allTweets.map(async (tweet) => {
          const profile = await profileContract.getProfile(tweet.author);
          const userTweets = await xCryptoContract.getAllTweet(tweet.author);
          const updatedTweet = userTweets[tweet.id]; // Get latest data from tweets mapping
          return {
            id: Number(tweet.id),
            author: tweet.author,
            displayName:
              profile[0] && profile[0].length > 0 ? profile[0] : "Anonymous",
            text: tweet.text,
            time: new Date(Number(tweet.time) * 1000).toLocaleString(),
            likes: Number(updatedTweet.like), // Use updated like count
            likers: updatedTweet.likers,
          };
        })
      );

      setTweets(tweetsWithAuthor.sort((a, b) => b.time.localeCompare(a.time)));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setLoading(false);
    }
  };

  const handleLike = async (author, id) => {
    if (!signer) return;
    const xCryptoContract = new ethers.Contract(
      config.xCryptoAddress,
      XCryptoABI.abi,
      signer
    );
    try {
      const tx = await xCryptoContract.likeTweet(author, id);
      await tx.wait();
    } catch (error) {
      console.error("Error liking tweet:", error);
      alert("Failed to like tweet: " + error.message);
    }
  };

  const handleUnlike = async (author, id) => {
    if (!signer) return;
    const xCryptoContract = new ethers.Contract(
      config.xCryptoAddress,
      XCryptoABI.abi,
      signer
    );
    try {
      const tx = await xCryptoContract.unLikeTweet(author, id);
      await tx.wait();
    } catch (error) {
      console.error("Error unliking tweet:", error);
      alert("Failed to unlike tweet: " + error.message);
    }
  };

  if (loading) {
    return <div className="box">Loading tweets...</div>;
  }

  return (
    <div className="box">
      <h2 className="subtitle">All Tweets</h2>
      {tweets.length === 0 ? (
        <p>No tweets found.</p>
      ) : (
        <div className="tweets-list">
          {tweets.map((tweet) => {
            const currentUser = signer
              ? ethers.getAddress(signer.address)
              : null;
            const hasLiked =
              currentUser &&
              tweet.likers.some(
                (liker) => ethers.getAddress(liker) === currentUser
              );

            return (
              <div key={`${tweet.author}-${tweet.id}`} className="card mb-3">
                <div className="card-content">
                  <div className="media">
                    <div className="media-content">
                      <p className="title is-5">{tweet.displayName}</p>
                      <p className="subtitle is-6">
                        @{tweet.author.slice(0, 6)}...{tweet.author.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="content">
                    <p>{tweet.text}</p>
                    <time>{tweet.time}</time>
                    <br />
                    <span>Likes: {tweet.likes}</span>
                    {signer && (
                      <div className="buttons mt-2">
                        {hasLiked ? (
                          <button
                            className="button is-danger is-small"
                            onClick={() => handleUnlike(tweet.author, tweet.id)}
                          >
                            Unlike
                          </button>
                        ) : (
                          <button
                            className="button is-success is-small"
                            onClick={() => handleLike(tweet.author, tweet.id)}
                          >
                            Like
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllTweets;
