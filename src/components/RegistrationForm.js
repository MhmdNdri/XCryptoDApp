import React, { useState } from "react";
import { ethers } from "ethers";
import { config } from "../config";
import ProfileABI from "../abis/Profile.json";
import XCryptoABI from "../abis/XCrypto.json";

const RegistrationForm = ({ signer, setIsRegistered, setProfile }) => {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const register = async () => {
    if (!signer || !displayName || !bio) return alert("Invalid input");

    const profileContract = new ethers.Contract(
      config.profileAddress,
      ProfileABI.abi,
      signer
    );
    const xCryptoContract = new ethers.Contract(
      config.xCryptoAddress,
      XCryptoABI.abi,
      signer
    );

    setIsLoading(true);
    try {
      const xCryptoOwner = await xCryptoContract.owner();
      const xCryptoProfileAddr = await xCryptoContract.profileAddress();
      const xCryptoTokenAddr = await xCryptoContract.xCryptoToken();
      const tokenContract = new ethers.Contract(
        xCryptoTokenAddr,
        ["function balanceOf(address) view returns (uint256)"],
        signer
      );
      const xCryptoBalance = await tokenContract.balanceOf(
        config.xCryptoAddress
      );

      console.log("Debugging Registration:");
      console.log("Caller:", await signer.getAddress());
      console.log("Profile contract:", config.profileAddress);
      console.log("XCrypto owner:", xCryptoOwner);
      console.log("XCrypto profileAddress:", xCryptoProfileAddr);
      console.log("XCrypto token balance:", ethers.formatEther(xCryptoBalance));

      const tx = await profileContract.setProfile(displayName, bio);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");

      setIsRegistered(true);
      setProfile({ displayName, bio });
      alert("Registration successful! You received 100 XCT.");
    } catch (error) {
      console.error("Registration error:", error);
      if (error.data) {
        try {
          const decodedError = profileContract.interface.parseError(error.data);
          console.log("Decoded revert reason:", decodedError);
        } catch (decodeErr) {
          console.log("Could not decode error, raw data:", error.data);
        }
      }
      alert("Registration failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="box">
      <h2 className="subtitle">Register Your Profile</h2>
      <div className="field">
        <label className="label">Display Name</label>
        <div className="control">
          <input
            className="input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="field">
        <label className="label">Bio</label>
        <div className="control">
          <textarea
            className="textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter your bio"
            disabled={isLoading}
          />
        </div>
      </div>
      <button
        className={`button is-success ${isLoading ? "is-loading" : ""}`}
        onClick={register}
        disabled={isLoading}
      >
        Register
      </button>
    </div>
  );
};

export default RegistrationForm;
