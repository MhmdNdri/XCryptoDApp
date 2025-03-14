async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy XCryptoToken
  const XCryptoToken = await ethers.getContractFactory("XCryptoToken");
  const xCryptoToken = await XCryptoToken.deploy();
  await xCryptoToken.deployed();
  console.log("XCryptoToken deployed to:", xCryptoToken.address);

  // Deploy XCrypto with placeholder Profile address
  const XCrypto = await ethers.getContractFactory("XCrypto");
  const xCrypto = await XCrypto.deploy(
    ethers.constants.AddressZero,
    xCryptoToken.address
  );
  await xCrypto.deployed();
  console.log("XCrypto deployed to:", xCrypto.address);

  // Deploy Profile with XCrypto address
  const Profile = await ethers.getContractFactory("Profile");
  const profile = await Profile.deploy(xCrypto.address);
  await profile.deployed();
  console.log("Profile deployed to:", profile.address);

  // Link Profile to XCrypto
  await xCrypto.setProfileContract(profile.address);
  console.log("Profile contract set in XCrypto:", profile.address);

  // Mint some tokens to XCrypto for rewards (e.g., 10,000 XCT)
  await xCryptoToken.mint(xCrypto.address, ethers.utils.parseEther("10000"));
  console.log("Minted 10,000 XCT to XCrypto for rewards");

  console.log("Deployed addresses:");
  console.log("XCryptoToken:", xCryptoToken.address);
  console.log("XCrypto:", xCrypto.address);
  console.log("Profile:", profile.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
