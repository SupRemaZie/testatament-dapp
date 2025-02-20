"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/Context/Web3Context";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OwnerDashboard() {
  const { contract, account } = useWeb3();
  const [testamentInfo, setTestamentInfo] = useState({
    heir: "",
    notary: "",
    isDeceased: false,
    unlockTime: 0,
  });

  const [newHeirAddress, setNewHeirAddress] = useState("");
  const [newNotaryAddress, setNewNotaryAddress] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contract) {
      fetchTestamentInfo();
    }
  }, [contract]);

  const fetchTestamentInfo = async () => {
    try {
      setLoading(true);
      const heir = await contract.heir();
      const notary = await contract.notary();
      const isDeceased = await contract.isDeceased();
      const unlockTime = await contract.unlockTime();

      setTestamentInfo({
        heir,
        notary,
        isDeceased,
        unlockTime: Number(unlockTime) * 1000, // Convert to milliseconds
      });
    } catch (error) {
      console.error("Error fetching testament info:", error);
      toast.error("Failed to retrieve testament information.");
    } finally {
      setLoading(false);
    }
  };

  const updateHeir = async () => {
    try {
      if (!ethers.isAddress(newHeirAddress)) {
        toast.error("Invalid heir address.");
        return;
      }
      const tx = await contract.updateHeir(newHeirAddress);
      toast.info("Transaction pending...");
      await tx.wait();
      toast.success("Heir updated successfully.");
      setNewHeirAddress("");
      fetchTestamentInfo();
    } catch (error) {
      console.error("Error updating heir:", error);
      toast.error("Failed to update heir.");
    }
  };

  const updateNotary = async () => {
    try {
      if (!ethers.isAddress(newNotaryAddress)) {
        toast.error("Invalid notary address.");
        return;
      }
      const tx = await contract.updateNotary(newNotaryAddress);
      toast.info("Transaction pending...");
      await tx.wait();
      toast.success("Notary updated successfully.");
      setNewNotaryAddress("");
      fetchTestamentInfo();
    } catch (error) {
      console.error("Error updating notary:", error);
      toast.error("Failed to update notary.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-2xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Testament Owner Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Loading testament details...</p>
          ) : (
            <div className="space-y-4">
              <p>
                <strong>Heir:</strong> {testamentInfo.heir}
              </p>
              <p>
                <strong>Notary:</strong> {testamentInfo.notary}
              </p>
              <p>
                <strong>Is Deceased:</strong> {testamentInfo.isDeceased
                  ? "Yes"
                  : "No"}
              </p>
              <p>
                <strong>Unlock Time:</strong>{" "}
                {new Date(testamentInfo.unlockTime).toLocaleString()}
              </p>

              {/* Update Heir Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Update Heir</h3>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="New Heir Address"
                    value={newHeirAddress}
                    onChange={(e) => setNewHeirAddress(e.target.value)}
                  />
                  <Button onClick={updateHeir} className="bg-blue-600 hover:bg-blue-700">
                    Update Heir
                  </Button>
                </div>
              </div>

              {/* Update Notary Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Update Notary</h3>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="New Notary Address"
                    value={newNotaryAddress}
                    onChange={(e) => setNewNotaryAddress(e.target.value)}
                  />
                  <Button onClick={updateNotary} className="bg-green-600 hover:bg-green-700">
                    Update Notary
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
