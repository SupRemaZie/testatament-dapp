const hre = require("hardhat");
async function main() {
 const [owner, notary, heir] = await hre.ethers.getSigners();
 console.log(`Owner: ${owner.address}`);
 console.log(`Notary: ${notary.address}`);
 console.log(`Heir: ${heir.address}`);
 const Testament = await hre.ethers.getContractFactory("Testament");
 const testament = await Testament.deploy(
 heir.address,
 notary.address,
 "TestDocumentHash",
 20
 );
 await testament.waitForDeployment();
 console.log(`Testament deployed to: ${testament.target}`);
}
main().catch((error) => {
 console.error(error);
 process.exitCode = 1;
});
