"use client";
import { useState } from "react";

export default function Connection() {
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const connectMetaMask = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                // Demander la connexion au portefeuille MetaMask
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                setIsConnected(true);
            } catch (error) {
                console.error("Erreur lors de la connexion à MetaMask", error);
                setIsConnected(false);
            }
        } else {
            alert("MetaMask n'est pas installé !");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="w-full max-w-sm p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-center">Se connecter à MetaMask</h2>

                {isConnected ? (
                    <div className="text-green-600">
                        <p className="text-lg">Connecté avec l'adresse :</p>
                        <p className="font-mono">{account}</p>
                    </div>
                ) : (
                    <button
                        onClick={connectMetaMask}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Se connecter avec MetaMask
                    </button>
                )}
            </div>
        </div>
    );
}
