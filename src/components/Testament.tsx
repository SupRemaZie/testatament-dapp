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
 unlockTestament
} from "../utils/ethers";
export default function Testament() {
 const [account, setAccount] = useState<string | null>(null);
 const [role, setRole] = useState<string | null>(null);
 const [isDeceasedStatus, setIsDeceasedStatus] = useState<boolean>(false);
 const [unlockTime, setUnlockTime] = useState<string | null>(null);
 const [heirAddress, setHeirAddress] = useState<string | null>(null);
 const [notaryAddress, setNotaryAddress] = useState<string | null>(null);
 const [testatorAddress, setTestatorAddress] = useState<string | null>(null);
 const [documentHash, setDocumentHash] = useState<string | null>(null);
 useEffect(() => {
 console.log("🔄 [USE EFFECT] Vérification de la connexion Metamask...");
 checkWalletConnection();
 }, []);
 const checkWalletConnection = async () => {
 try {
 console.log("🔄 [CHECK WALLET] Tentative de connexion à Metamask...");
 const wallet = await connectWallet();
 if (!wallet) {
 console.warn("🔄 [CHECK WALLET] Metamask non connecté.");
 return;
 }
 setAccount(wallet);
 console.log("[CHECK WALLET] Compte connecté :", wallet);
 await fetchContractData(wallet);
 } catch (error) {
 console.error("[CHECK WALLET] Erreur connexion Metamask :", error);
 }
 };
 const fetchContractData = async (userAccount: string) => {
 try {
 console.log("[FETCH CONTRACT] Récupération des rôles et informations du contrat...");
 const heir = await getHeir();
 const notary = await getNotary();
 const testator = await getTestator();
 setHeirAddress(heir || "Non défini !");
 setNotaryAddress(notary || "Non défini !");
 setTestatorAddress(testator || "Non défini !");

 console.log("[FETCH CONTRACT] Héritier :", heir);
 console.log("[FETCH CONTRACT] Notaire :", notary);
 console.log("[FETCH CONTRACT] Testateur :", testator);
 const deceased = await isDeceased();
 setIsDeceasedStatus(deceased);
 console.log("[FETCH CONTRACT] Statut du testateur :", deceased ? "Décédé" : "En vie");
 const unlockTimestamp = await getUnlockTime();
 const formattedTime = new Date(unlockTimestamp * 1000).toLocaleString();
 setUnlockTime(formattedTime);
 console.log("[FETCH CONTRACT] Déverrouillage prévu :", formattedTime);
 // Définition du rôle de l'utilisateur connecté
 if (userAccount.toLowerCase() === heir?.toLowerCase()) {
 setRole("Héritier");
 } else if (userAccount.toLowerCase() === notary?.toLowerCase()) {
 setRole("Notaire");
 } else if (userAccount.toLowerCase() === testator?.toLowerCase()) {
 setRole("Testateur");
 } else {
 setRole("Inconnu");
 }
 console.log("[FETCH CONTRACT] Rôle détecté :", role);
 } catch (error) {
 console.error("[FETCH CONTRACT] Erreur récupération contrat :", error);
 }
 };
 const handleUnlockTestament = async () => {
 try {
 console.log("[ACTION] Tentative de déverrouillage du testament...");
 const docHash = await unlockTestament();
 setDocumentHash(docHash);
 console.log("[ACTION] Testament déverrouillé :", docHash);
 } catch (error) {
 console.error("[ACTION] Erreur lors du déverrouillage :", error);
 }
 };
 return (
 <div className="container mx-auto p-6 text-center">
 <h1 className="text-3xl font-bold mb-4">Testament DApp</h1>
 {!account ? (
 <button className="bg-blue-500 text-white px-4 py-2 rounded"
onClick={checkWalletConnection}>
 Connecter Metamask
 </button>
 ) : (
 <p className="text-green-600">Compte connecté : {account}</p>
 )}
 {account && (
 <>
{/*<p className="mt-4">🔄 Rôle : <strong>{role || "Inconnu"}</strong></p>*/}
 <p>🔄 Déverrouillage prévu : <strong>{unlockTime || "..."}</strong></p>
 <p>🔄 Le testateur est-il décédé ? <strong>{isDeceasedStatus ? "Oui" : "Non"}</strong></p>
 <p>🔄 Héritier enregistré : <strong>{heirAddress || "Non défini !"}</strong></p>
 <p>🔄 Notaire enregistré : <strong>{notaryAddress || "Non défini !"}</strong></p>
{/*<p>🔄 Testateur enregistré : <strong>{testatorAddress || "Non défini !"}</strong></p>*/}
 {/* Bouton pour le notaire pour confirmer le décès */}
 {role === "Notaire" && !isDeceasedStatus && (
 <button
 className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
 onClick={async () => await confirmDeath()}>
 Confirmer le décès
 </button>
 )}
 {/* Bouton pour l'héritier pour débloquer le testament si le décès est confirmé */}
 {role === "Héritier" && isDeceasedStatus && (
 <button
 className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
 onClick={handleUnlockTestament}>
 Déverrouiller le testament
 </button>
 )}
 {/* Affichage du testament s'il est déverrouillé */}
 {documentHash && (
 <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded">
 <h2 className="text-xl font-bold">🔄 Testament déverrouillé :</h2>
 <p className="text-lg break-all">{documentHash}</p>
 </div>
 )}
 </>
 )}
 </div>
 );
}