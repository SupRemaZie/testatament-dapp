"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";

// Replace with your contract address and ABI
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = [
  {
    "constant": false,
    "inputs": [{ "name": "_documentHash", "type": "string" }],
    "name": "uploadTestament",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
];

export default function Home() {
  const [file, setFile] = useState<File | undefined>();
  const [url, setUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState<boolean>(false);
  const [documentHash, setDocumentHash] = useState<string | undefined>();
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          const signer = await web3Provider.getSigner();
          const userAddress = await signer.getAddress();
          setAccount(userAddress);

          const contractInstance = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing Ethereum:", error);
          alert("Failed to connect to Ethereum. Make sure MetaMask is installed.");
        }
      } else {
        alert("Please install MetaMask to interact with the contract.");
      }
    })();
  }, []);

  const uploadFile = async () => {
    if (!file) {
      alert("No file selected");
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.set("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: data });

      if (!response.ok) {
        throw new Error("Failed to upload file to IPFS");
      }

      const ipfsData = await response.json();
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsData.ipfsHash}`;

      setUrl(ipfsUrl);
      setDocumentHash(ipfsData.ipfsHash); // Store only the hash, not the full URL
    } catch (error) {
      console.error(error);
      alert("Error uploading file to IPFS");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0]);
  };

  const uploadTestamentToContract = async () => {
    if (!documentHash) {
      alert("Please upload a document first.");
      return;
    }

    try {
      if (contract) {
        const tx = await contract.uploadTestament(documentHash);
        await tx.wait();
        alert("Testament document hash successfully stored on the blockchain.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading testament hash to contract.");
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center space-y-6 p-4">
      <h1 className="text-xl font-semibold text-center">Upload a Testament to IPFS</h1>

      {/* File Input */}
      <Input
        type="file"
        onChange={handleChange}
        className="w-full max-w-xs"
      />

      {/* Upload to IPFS Button */}
      <Button
        variant="default"
        disabled={uploading}
        onClick={uploadFile}
        className="w-full max-w-xs"
      >
        {uploading ? "Uploading..." : "Upload Testament to IPFS"}
      </Button>

      {/* Show Uploaded File */}
      {url && (
        <div className="w-full max-w-xs text-center">
          <h2 className="text-lg font-semibold">Uploaded File</h2>
          <img src={url} alt="Uploaded content from IPFS" className="max-w-full rounded-lg" />
          <p className="mt-2 text-sm text-gray-500">View the file on IPFS</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Open in Pinata Gateway
          </a>
        </div>
      )}

      {/* Upload Hash to Smart Contract */}
      <Button
        variant="default"
        onClick={uploadTestamentToContract}
        disabled={!documentHash}
        className="w-full max-w-xs"
      >
        Upload Testament to Smart Contract
      </Button>

      {/* Display Connected Wallet */}
      {account && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Connected Account:</p>
          <p className="text-sm font-semibold text-gray-800">{account}</p>
        </div>
      )}
    </main>
  );
}
