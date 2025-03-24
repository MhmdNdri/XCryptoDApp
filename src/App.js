import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnector from "./components/WalletConnector";
import RegistrationForm from "./components/RegistrationForm";
import Profile from "./components/Profile";
import TweetForm from "./components/TweetForm";
import TweetList from "./components/TweetList";
import TokenInfo from "./components/TokenInfo";
import AllTweets from "./components/AllTweets";
import { config } from "./config";
import ProfileABI from "./abis/Profile.json";
import "bulma/css/bulma.min.css";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [ethBalance, setEthBalance] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [profile, setProfile] = useState({ displayName: "", bio: "" });
  const [tweetRefreshTrigger, setTweetRefreshTrigger] = useState(0); // Trigger for TweetList

  useEffect(() => {
    const checkRegistration = async () => {
      if (provider && account) {
        const profileContract = new ethers.Contract(
          config.profileAddress,
          ProfileABI.abi,
          provider
        );

        const userProfile = await profileContract.getProfile(account);

        if (userProfile.displayName.length > 0) {
          setIsRegistered(true);
          setProfile({
            displayName: userProfile.displayName,
            bio: userProfile.bio,
          });
        } else {
          setIsRegistered(false);
        }
      }
    };
    checkRegistration();
  }, [provider, account]);

  const handleTweetPosted = () => {
    setTweetRefreshTrigger((prev) => prev + 1); // Increment to trigger refresh
  };

  return (
    <div className="container">
      <section className="section">
        <h1 className="title">XCrypto SPA</h1>
        <WalletConnector
          setProvider={setProvider}
          setSigner={setSigner}
          setAccount={setAccount}
          setEthBalance={setEthBalance}
        />
        {account && (
          <>
            <TokenInfo provider={provider} account={account} />

            <div class="box">
              <AllTweets signer={signer} />
            </div>

            {!isRegistered ? (
              <RegistrationForm
                signer={signer}
                setIsRegistered={setIsRegistered}
                setProfile={setProfile}
              />
            ) : (
              <>
                <Profile profile={profile} />
                <TweetForm
                  signer={signer}
                  account={account}
                  onTweetPosted={handleTweetPosted} // Pass callback
                />
                <TweetList
                  signer={signer}
                  account={account}
                  refreshTrigger={tweetRefreshTrigger} // Pass trigger
                />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default App;
