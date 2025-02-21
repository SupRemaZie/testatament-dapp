require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
module.exports = {
 solidity: "0.8.28",
 networks: {
 ganache: {
 url: "http://127.0.0.1:8545",
 accounts: [
 process.env.PRIVATE_KEY_GANACHE_OWNER,
 process.env.PRIVATE_KEY_GANACHE_NOTARY,
 process.env.PRIVATE_KEY_GANACHE_HEIR
 ],
 chainId: 1337,
 },
 sepolia: {
 url: "https://sepolia.gateway.tenderly.co/", // 🔥 Utilisation de Tenderly RPC
 accounts: [
 process.env.SEPOLIA_PRIVATE_KEY_OWNER,
 process.env.SEPOLIA_PRIVATE_KEY_NOTARY,
 process.env.SEPOLIA_PRIVATE_KEY_HEIR
 ],
 chainId: 11155111,
 },
 },
};
// 🔥 Ajout de la tâche pour afficher les comptes disponibles
task("accounts", "Affiche la liste des comptes disponibles", async(taskArgs, hre) => {
 const accounts = await hre.ethers.getSigners();
 for (const account of accounts) {
  console.log(account.address);
 }
});