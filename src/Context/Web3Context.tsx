"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import contractABI from "@/utils/contractABI.json"; // Assurez-vous d'importer l'ABI correcte

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const contractAddress = "0x123456789abcdef"; // Remplacez par l'adresse du contrat

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Veuillez installer MetaMask !");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      // Vérification que l'ABI est bien chargée
      if (!contractABI || contractABI.length === 0) {
        throw new Error("ABI du contrat introuvable !");
      }

      // Charger le contrat
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);

      // Vérifier que le contrat contient bien les fonctions attendues
      if (contractInstance.owner && contractInstance.heir && contractInstance.notary) {
        determineUserRole(address, contractInstance);
      } else {
        throw new Error("Le contrat ne contient pas les fonctions attendues !");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
    } finally {
      setLoading(false);
    }
  };

  const determineUserRole = async (address, contract) => {
    try {
      if (!contract) {
        console.error("Le contrat n'est pas encore chargé !");
        return;
      }

      const owner = await contract.owner();
      const heir = await contract.heir();
      const notary = await contract.notary();

      if (address.toLowerCase() === owner.toLowerCase()) {
        setRole("owner");
        router.push("/dashboard");
      } else if (address.toLowerCase() === heir.toLowerCase()) {
        setRole("heir");
        router.push("/heir");
      } else if (address.toLowerCase() === notary.toLowerCase()) {
        setRole("notary");
        router.push("/notary");
      } else {
        setRole("guest");
        router.push("/create");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du rôle :", error);
    }
  };

  // Détecter le changement de compte MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          determineUserRole(accounts[0], contract);
        } else {
          // Déconnexion si aucun compte sélectionné
          setAccount(null);
          setRole(null);
          router.push("/");
        }
      });
    }
  }, [contract]);

  return (
    <Web3Context.Provider value={{ account, connectWallet, role, contract, loading
