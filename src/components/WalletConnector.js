import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletConnector = ({
  setProvider,
  setSigner,
  setAccount,
  setEthBalance,
  account,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("disconnect", handleDisconnect);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      console.log("MetaMask is locked or no accounts available");
      disconnectWallet();
    } else {
      console.log("Switched account:", accounts[0]);
      await handleAccountChange(accounts[0]);
    }
  };

  const handleDisconnect = () => {
    console.log("MetaMask disconnected");
    disconnectWallet();
  };

  const handleAccountChange = async (newAccount) => {
    const provider = new ethers.BrowserProvider(window.ethereum, "any");
    const signer = await provider.getSigner();
    const balance = await provider.getBalance(newAccount);

    setProvider(provider);
    setSigner(signer);
    setAccount(newAccount);
    setEthBalance(ethers.formatEther(balance));
    setIsConnected(true);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    console.log("Connecting wallet...");
    setIsConnecting(true);

    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      console.log("Connected:", accounts[0]);
      await handleAccountChange(accounts[0]);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
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
            Connected:{" "}
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : "Loading..."}
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
