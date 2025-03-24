import React, { useState } from "react";
import { ethers } from "ethers";

const WalletConnector = ({
  setProvider,
  setSigner,
  setAccount,
  account,
  setEthBalance,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      setIsConnecting(true);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);

        setProvider(provider);
        setSigner(signer);
        setAccount(address);
        setEthBalance(ethers.formatEther(balance));
        setIsConnected(true);
      } catch (error) {
        console.error("Connection error:", error);
        alert("Failed to connect wallet");
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setEthBalance("");
    setIsConnected(false);
  };

  return (
    <div className="mb-4">
      {!isConnected ? (
        <button
          className={`button is-primary ${isConnecting ? "is-loading" : ""}`}
          onClick={connectWallet}
          disabled={isConnecting}
        >
          Connect Wallet
        </button>
      ) : (
        <div className="buttons">
          <button className="button is-success is-static">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </button>
          <button className="button is-danger" onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
