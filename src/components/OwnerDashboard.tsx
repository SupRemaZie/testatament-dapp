"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/Context/Web3Context";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OwnerDashboard() {
  const { contract, account, provider } = useWeb3(); // Ajout de provider pour signer les transactions
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

      if (!contract) {
        throw new Error("Le contrat n'est pas encore chargé !");
      }

      const heir = await contract.heir?.();
      const notary = await contract.notary?.();
      const isDeceased = await contract.isDeceased?.();
      const unlockTime = await contract.unlockTime?.();

      if (heir && notary !== undefined && isDeceased !== undefined && unlockTime !== undefined) {
        setTestamentInfo({
          heir,
          notary,
          isDeceased,
          unlockTime: Number(unlockTime) * 1000, // Convertir en millisecondes
        });
      } else {
        throw new Error("Impossible de récupérer certaines informations du testament.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      toast.error("Impossible de récupérer les informations du testament.");
    } finally {
      setLoading(false);
    }
  };

  const updateHeir = async () => {
    try {
      if (!ethers.isAddress(newHeirAddress)) {
        toast.error("Adresse d'héritier invalide.");
        return;
      }

      if (!contract || !provider) {
        throw new Error("Contrat ou provider non disponible !");
      }

      const signer = await provider.getSigner(); // Obtenir le signer
      const contractWithSigner = contract.connect(signer); // Connecter le contrat au signer
      const tx = await contractWithSigner.updateHeir(newHeirAddress);

      toast.info("Transaction en cours...");
      await tx.wait();
      toast.success("Héritier mis à jour avec succès.");
      setNewHeirAddress("");
      fetchTestamentInfo();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'héritier :", error);
      toast.error("Échec de la mise à jour de l'héritier.");
    }
  };

  const updateNotary = async () => {
    try {
      if (!ethers.isAddress(newNotaryAddress)) {
        toast.error("Adresse du notaire invalide.");
        return;
      }

      if (!contract || !provider) {
        throw new Error("Contrat ou provider non disponible !");
      }

      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.updateNotary(newNotaryAddress);

      toast.info("Transaction en cours...");
      await tx.wait();
      toast.success("Notaire mis à jour avec succès.");
      setNewNotaryAddress("");
      fetchTestamentInfo();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du notaire :", error);
      toast.error("Échec de la mise à jour du notaire.");
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
            <p className="text-gray-600">Chargement des détails du testament...</p>
          ) : (
            <div className="space-y-4">
              <p>
                <strong>Héritier :</strong> {testamentInfo.heir}
              </p>
              <p>
                <strong>Notaire :</strong> {testamentInfo.notary}
              </p>
              <p>
                <strong>Décédé :</strong> {testamentInfo.isDeceased ? "Oui" : "Non"}
              </p>
              <p>
                <strong>Date de déverrouillage :</strong>{" "}
                {new Date(testamentInfo.unlockTime).toLocaleString()}
              </p>

              {/* Section Mise à Jour de l'Héritier */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Mise à jour de l'héritier</h3>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="Nouvelle adresse de l'héritier"
                    value={newHeirAddress}
                    onChange={(e) => setNewHeirAddress(e.target.value)}
                  />
                  <Button onClick={updateHeir} className="bg-blue-600 hover:bg-blue-700">
                    Mettre à jour
                  </Button>
                </div>
              </div>

              {/* Section Mise à Jour du Notaire */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Mise à jour du notaire</h3>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="Nouvelle adresse du notaire"
                    value={newNotaryAddress}
                    onChange={(e) => setNewNotaryAddress(e.target.value)}
                  />
                  <Button onClick={updateNotary} className="bg-green-600 hover:bg-green-700">
                    Mettre à jour
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
