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

      // Fetch all tweets from the contract
      const allTweets = await xCryptoContract.getAllTweets();

      // Map tweets with display names
      const tweetsWithAuthor = await Promise.all(
        allTweets.map(async (tweet) => {
          const profile = await profileContract.getProfile(tweet.author);
          return {
            id: Number(tweet.id),
            author: tweet.author,
            displayName:
              profile[0] && profile[0].length > 0 ? profile[0] : "Anonymous",
            text: tweet.text,
            time: new Date(Number(tweet.time) * 1000).toLocaleString(),
            likes: Number(tweet.like),
          };
        })
      );

      // Sort tweets by time (newest first)
      tweetsWithAuthor.sort((a, b) => b.time.localeCompare(a.time));
      setTweets(tweetsWithAuthor);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setLoading(false);
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
          {tweets.map((tweet) => (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTweets;
