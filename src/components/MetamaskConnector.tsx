"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

const MetaMaskConnector: React.FC = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const checkMetaMask = useCallback((): boolean => {
        if (!window.ethereum) {
            setError("MetaMask is not installed. Please install it.");
            return false;
        }
        return true;
    }, []);

    // Connect MetaMask Automatically if Previously Connected
    useEffect(() => {
        const connectAutomatically = async () => {
            if (!checkMetaMask()) return;

            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts: string[] = await window.ethereum.request({ method: "eth_accounts" });

                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            } catch (err) {
                setError((err as Error).message || "Failed to connect automatically.");
            }
        };

        connectAutomatically();
    }, [checkMetaMask]);

    // Manual Connect Wallet Function
    const connectWallet = useCallback(async () => {
        try {
            if (!checkMetaMask()) return;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });

            setAccount(accounts[0]);
            setError("");
        } catch (err) {
            setError((err as Error).message || "An error occurred while connecting.");
        }
    }, [checkMetaMask]);

    // Handle account and network changes
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts: string[]) => {
            setAccount(accounts.length ? accounts[0] : null);
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum.removeListener("chainChanged", handleChainChanged);
        };
    }, []);

    return (
        <div className="p-4 border rounded-lg shadow-lg text-center">
            {account ? (
                <p className="text-green-500 font-bold">Connected: {account}</p>
            ) : (
                <button
                    onClick={connectWallet}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Connect MetaMask
                </button>
            )}
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default MetaMaskConnector;
