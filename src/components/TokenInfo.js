import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { config } from "../config";
import XCryptoTokenABI from "../abis/XCryptoToken.json";

const TokenInfo = ({ provider, account }) => {
  const [tokenInfo, setTokenInfo] = useState({
    name: "",
    symbol: "",
    decimals: "",
    totalSupply: "",
    balance: "",
  });

  const fetchTokenInfo = async () => {
    if (provider && account) {
      const contract = new ethers.Contract(
        config.xCryptoTokenAddress,
        XCryptoTokenABI.abi,
        provider
      );
      try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const totalSupply = await contract.totalSupply();
        const balance = await contract.balanceOf(account);

        setTokenInfo({
          name,
          symbol,
          decimals: decimals.toString(),
          totalSupply: ethers.formatUnits(totalSupply, decimals),
          balance: ethers.formatUnits(balance, decimals),
        });
      } catch (error) {
        console.error("Error fetching token info:", error);
      }
    }
  };

  useEffect(() => {
    fetchTokenInfo(); // Initial fetch
    const interval = setInterval(fetchTokenInfo, 10000); // Poll every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [provider, account]);

  return (
    <div className="box">
      <h2 className="subtitle">Token Info (XCT)</h2>
      <p>
        <strong>Name:</strong> {tokenInfo.name}
      </p>
      <p>
        <strong>Symbol:</strong> {tokenInfo.symbol}
      </p>
      <p>
        <strong>Decimals:</strong> {tokenInfo.decimals}
      </p>
      <p>
        <strong>Total Supply:</strong> {tokenInfo.totalSupply}{" "}
        {tokenInfo.symbol}
      </p>
      {account && (
        <p>
          <strong>Your Balance:</strong> {tokenInfo.balance} {tokenInfo.symbol}
        </p>
      )}
    </div>
  );
};

export default TokenInfo;
