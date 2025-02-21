import { useState, useEffect } from "react";
import {
  connectWallet,
  isDeceased,
  getHeir,
  getNotary,
  getTestator,
  getUnlockTime,
  getDocumentHash,
  confirmDeath,
  unlockTestament,
  setTestament
} from "@/utils/ethers";

export default function Testament() {
  const [account, setAccount] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isDeceasedStatus, setIsDeceasedStatus] = useState<boolean>(false);
  const [unlockTime, setUnlockTime] = useState<string | null>(null);
  const [heirAddress, setHeirAddress] = useState<string | null>(null);
  const [notaryAddress, setNotaryAddress] = useState<string | null>(null);
  const [testatorAddress, setTestatorAddress] = useState<string | null>(null);
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [testamentContent, setTestamentContent] = useState<string>("");
  
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const wallet = await connectWallet();
      if (!wallet) {
        alert("Metamask non connecté. Veuillez l'installer et vous connecter.");
        return;
      }
      setAccount(wallet);
      await fetchContractData(wallet);
    } catch (error) {
      alert("Erreur connexion Metamask : " + error);
    }
  };

  const fetchContractData = async (userAccount: string) => {
    try {
      const heir = await getHeir();
      const notary = await getNotary();
      const testator = await getTestator();

      setHeirAddress(heir || "Non défini !");
      setNotaryAddress(notary || "Non défini !");
      setTestatorAddress(testator || "Non défini !");

      setIsDeceasedStatus(await isDeceased());
      setUnlockTime(new Date((await getUnlockTime()) * 1000).toLocaleString());
      
      if (userAccount.toLowerCase() === heir?.toLowerCase()) setRole("Héritier");
      else if (userAccount.toLowerCase() === notary?.toLowerCase()) setRole("Notaire");
      else if (userAccount.toLowerCase() === testator?.toLowerCase()) setRole("Testateur");
      else setRole("Inconnu");
    } catch (error) {
      alert("Erreur récupération contrat : " + error);
    }
  };

  const handleUnlockTestament = async () => {
    try {
      const docHash = await unlockTestament();
      setDocumentHash(docHash);
      setTestamentContent("Contenu du testament récupéré depuis IPFS... (exemple)");
    } catch (error) {
      alert("Erreur lors du déverrouillage : " + error);
    }
  };

  const handleSetTestament = async () => {
    try {
      await setTestament(testamentContent);
      alert("Testament mis à jour avec succès !");
    } catch (error) {
      alert("Erreur lors de l'enregistrement du testament : " + error);
    }
  };

  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Testament DApp</h1>

      {!account ? (
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={checkWalletConnection}>
          Connecter Metamask
        </button>
      ) : (
        <p className="text-green-600">Compte connecté : {account}</p>
      )}

      {account && (
        <>
          <p className="mt-4">Rôle : <strong>{role || "Inconnu"}</strong></p>
          <p>Déverrouillage prévu : <strong>{unlockTime || "..."}</strong></p>
          <p>Le testateur est-il décédé ? <strong>{isDeceasedStatus ? "Oui" : "Non"}</strong></p>
          <p>Héritier enregistré : <strong>{heirAddress || "Non défini !"}</strong></p>
          <p>Notaire enregistré : <strong>{notaryAddress || "Non défini !"}</strong></p>
          <p>Testateur enregistré : <strong>{testatorAddress || "Non défini !"}</strong></p>

          {role === "Notaire" && !isDeceasedStatus && (
            <button className="bg-red-500 text-white px-4 py-2 mt-4 rounded" onClick={confirmDeath}>
              Confirmer le décès
            </button>
          )}

          {role === "Héritier" && isDeceasedStatus && (
            <button className="bg-green-500 text-white px-4 py-2 mt-4 rounded" onClick={handleUnlockTestament}>
              Déverrouiller le testament
            </button>
          )}

          {documentHash && (
            <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded">
              <h2 className="text-xl font-bold">Testament déverrouillé :</h2>
              <p className="text-lg break-all">{testamentContent}</p>
            </div>
          )}

          {role === "Testateur" && (
            <div className="mt-6">
              <h2 className="text-xl font-bold">Définir / Modifier le Testament</h2>
              <textarea
                className="w-full p-2 border rounded mt-2"
                rows={4}
                value={testamentContent}
                onChange={(e) => setTestamentContent(e.target.value)}
              ></textarea>
              <button className="bg-blue-500 text-white px-4 py-2 mt-2 rounded" onClick={handleSetTestament}>
                Enregistrer le Testament
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}