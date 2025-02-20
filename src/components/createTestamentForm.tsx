'use client';

import { useState } from 'react';
import { useWeb3 } from '@/Context/Web3Context';
//import { uploadToIPFS } from '../utils/ipfs';
import { ethers } from 'ethers';
//import { TESTAMENT_ABI } from '../constants';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function CreateTestamentForm() {
  const [heirAddress, setHeirAddress] = useState('');
  const [notaryAddress, setNotaryAddress] = useState('');
  const [unlockDays, setUnlockDays] = useState(30);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const { signer, account } = useWeb3();
  const router = useRouter();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const validateInputs = () => {
    if (!ethers.isAddress(heirAddress)) {
      toast.error("Adresse de l'héritier invalide");
      return false;
    }
    if (!ethers.isAddress(notaryAddress)) {
      toast.error("Adresse du notaire invalide");
      return false;
    }
    if (unlockDays <= 0) {
      toast.error("Le délai de déverrouillage doit être positif");
      return false;
    }
    if (!file) {
      toast.error("Veuillez télécharger un document de testament");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      // 1. Téléchargement du fichier vers IPFS
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const buffer = Buffer.from(reader.result);
        try {
          const { cid } = await uploadToIPFS(buffer);
          toast.info(`Document téléchargé sur IPFS avec CID: ${cid}`);
          
          // 2. Déploiement du contrat Testament
          await deployContract(cid);
        } catch (error) {
          console.error("Erreur lors du téléchargement:", error);
          toast.error("Échec du téléchargement du document");
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Erreur lors de la création du testament:", error);
      toast.error("Échec de la création du testament");
      setIsUploading(false);
    }
  };

  const deployContract = async (documentCid) => {
    try {
      setIsDeploying(true);
      
      // Conversion du délai en secondes
      const unlockDelay = unlockDays * 24 * 60 * 60;
      
      // Création d'une factory pour le contrat
      const factory = new ethers.ContractFactory(
        TESTAMENT_ABI,
        '0x608060405234801561001057600080fd5b5061091e806100206000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c8063853828b61161005b578063853828b6146101145780638da5cb5b1461011e578063f0953a9414610149578063f5b615461461017657610088565b806335aa2e44146100965780633fa4f245146100c75780634a10e163146100e2578063715018a6146100fa575b600080fd5b610099610195565b6040516100ae9190610581565b60405180910390f35b6100df6100d5366004610599565b6101b8565b005b6100df6100f0366004610599565b6101e3565b6100df61020c565b6100df6102b9565b610127610356565b6040516100ae91906105b8565b61015c610157366004610599565b6103ca565b6040516100ae9d9c9b9a99989796959493929190610657565b61017f610876565b6040516100ae9190610906565b600080546101a290610911565b6040805192835260208301919091520160405180910390f35b6000546001600160a01b0316336101d057600080fd5b6001600160a01b03166000557f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f856000604080519182529181602082015281518183015280820151606082015260808101516080820152a150565b336000908152602081905260409020546001146102455760405162461bcd60e51b815260206004820152601660248201527550656e64696e672072656465656d2063617368696e6760501b60448201526064015b60405180910390fd5b3360009081526020819052604090208054600019019055565b6000546001600160a01b031633146102705760405162461bcd60e51b815260206004820152601660248201527f4f6e6c79206f776e657220697320616c6c6f7765642e000000000000000000006044820152606401610262565b600160405161027e9061058c565b60405180910390f35b6000546001600160a01b031633146102d557600080fd5b6000547f6e28e378c25193493707e10eefc77da01d3e074abaf7a6e9692275204b8a5d931680604051610307919061058c565b60405180910390a1565b6001600160a01b03811660009081526020819052604081205460011461034d5760405162461bcd60e51b815260206004820152601660248201527550656e64696e672072656465656d2063617368696e6760501b6044820152606401610262565b6001449081019190915550565b6002546003546040805163a9059cbb60e01b81526001600160a01b0392831660048201526024810185905290519290931692631633fb1d92604480830192606092919082900301818387803b15801561047857600080fd5b505af1158015610261573d6000803e3d600051141582820582811115613a3c57613a3c613a64565b9190151581548183558183556040519081527ff4eca1ade1e6c67f19940aa0c72595a9d6b97a22a95c2e9e8b3119d6ca0e7dbc9060200160405180910390a1600554600090815260066020526040902092915050565b33600090815260208190526040902054604051821515815260209190910175746f6b656e206f722073656e646572206973206e6f7420612076616c696420636c61696d657260401b9101610262565b600092915050565b905090565b60006020828403121561056d57600080fd5b81356001600160a01b038116811461058457600080fd5b9392505050565b9052565b6020810161058c8284610d9a565b919050565b60006020828403121561058d57600080fd5b3581801515811461058457600080fd5b9081526020016105a8565b6001600160a01b0391909116815260200190565b600081519050919050565b60208101610584828461129d565b606081016105848284612a48565b60808083526006825462e8105560b260020a607a60f01b601482015260288183015260808201526060016105a8565b6000818303610a2080121561058d57600080fd5b6125a0810190610a2082820312156105a857600080fd5b9081529291906000602082019050919050565b6000608083016125a08452600083820360c085820312156105a857600080fd5b610a2081126105a857600080fd5b60006105a88284610599565b9050919050565b82151581526020016105a8565b60006020828403121561010057600080fd5b73ffffffffffffffffffffffffffffffffffffffff811681146101de57600080fd5b610100811061064057600080fd5b50919050565b6000602082840312156101de57600080fd5b600060208083528351808285019150610a208082860152818701935080860160051b87010192505b8181101561010057888603820160c0828101905083870383870101528482019150610606565b60005260206000fd', // Bytecode ici
        signer
      );
      
      // Déploiement du contrat
      const testament = await factory.deploy(
        heirAddress,
        notaryAddress,
        documentCid,
        unlockDelay
      );
      
      await testament.waitForDeployment();
      const testamentAddress = await testament.getAddress();
      
      toast.success(`Testament déployé avec succès à l'adresse: ${testamentAddress}`);
      
      // Redirection vers le dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error("Erreur lors du déploiement du contrat:", error);
      toast.error("Échec du déploiement du contrat");
    } finally {
      setIsUploading(false);
      setIsDeploying(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Créer un nouveau testament</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse de l'héritier (ETH)
          </label>
          <input
            type="text"
            value={heirAddress}
            onChange={(e) => setHeirAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse du notaire (ETH)
          </label>
          <input
            type="text"
            value={notaryAddress}
            onChange={(e) => setNotaryAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Délai de déverrouillage (jours)
          </label>
          <input
            type="number"
            value={unlockDays}
            onChange={(e) => setUnlockDays(parseInt(e.target.value))}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document de testament (PDF recommandé)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".pdf,.doc,.docx,.txt"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Ce document sera chiffré et stocké sur IPFS. Seul l'héritier pourra y accéder après confirmation du décès.
          </p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading || isDeploying}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isUploading 
              ? "Téléchargement du document..." 
              : isDeploying 
                ? "Déploiement du contrat..." 
                : "Créer mon testament"}
          </button>
        </div>
      </form>
    </div>
  );
}