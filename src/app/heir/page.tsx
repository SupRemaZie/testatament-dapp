'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/Context/Web3Context';
import { UploadFile } from '@/components/UploadFile';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function HeirPage() {
  const { contract, account, role } = useWeb3();
  const [testamentInfo, setTestamentInfo] = useState({
    owner: '',
    isDeceased: false,
    unlockTime: 0,
    currentTime: Date.now(),
    documentHash: '',
  });
  const [loading, setLoading] = useState(true);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!account || role !== 'heir') {
      router.push('/');
      return;
    }

    if (contract) {
      fetchTestamentInfo();
      const interval = setInterval(() => {
        setTestamentInfo(prev => ({
          ...prev,
          currentTime: Date.now()
        }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [contract, account, role]);

  const fetchTestamentInfo = async () => {
    try {
      setLoading(true);
      
      const owner = await contract.owner();
      const isDeceased = await contract.isDeceased();
      const unlockTime = await contract.unlockTime();
      
      setTestamentInfo({
        owner,
        isDeceased,
        unlockTime: Number(unlockTime) * 1000, // Conversion en millisecondes
        currentTime: Date.now(),
        documentHash: '',
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      toast.error("Échec de la récupération des informations du testament");
    } finally {
      setLoading(false);
    }
  };

  const unlockTestament = async () => {
    try {
      setUnlockLoading(true);
      
      // Vérification des conditions
      if (!testamentInfo.isDeceased) {
        toast.error("Le testateur est encore en vie selon le contrat.");
        return;
      }
      
      if (testamentInfo.currentTime < testamentInfo.unlockTime) {
        toast.error("La période d'attente n'est pas encore écoulée.");
        return;
      }
      
      // Appel au contrat pour déverrouiller le testament
      const documentHash = await contract.unlockTestament();
      
      toast.success("Testament déverrouillé avec succès");
      setTestamentInfo(prev => ({
        ...prev,
        documentHash
      }));
      
      // Récupération du document depuis IPFS
      try {
        const { url } = await getFromIPFS(documentHash);
        setDocumentUrl(url);
      } catch (ipfsError) {
        console.error("Erreur lors de la récupération du document IPFS:", ipfsError);
        toast.error("Le testament a été déverrouillé, mais le document n'a pas pu être récupéré depuis IPFS.");
      }
    } catch (error) {
      console.error("Erreur lors du déverrouillage du testament:", error);
      toast.error("Échec du déverrouillage du testament");
    } finally {
      setUnlockLoading(false);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatTimeRemaining = () => {
    if (!testamentInfo.isDeceased) {
      return "En attente de confirmation du décès";
    }
    
    const remainingTime = testamentInfo.unlockTime - testamentInfo.currentTime;
    
    if (remainingTime <= 0) {
      return "La période d'attente est écoulée";
    }
    
    // Calcul du temps restant
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    
    return `${days}j ${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Espace Héritier</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Détails du Testament</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded p-4">
            <p className="text-gray-600 mb-1">Testateur</p>
            <p className="font-medium">{formatAddress(testamentInfo.owner)}</p>
          </div>
          
          <div className="border rounded p-4">
            <p className="text-gray-600 mb-1">Statut du testateur</p>
            <p className={`font-medium ${testamentInfo.isDeceased ? 'text-red-600' : 'text-green-600'}`}>
              {testamentInfo.isDeceased ? 'Décédé (confirmé)' : 'En vie'}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Statut du déverrouillage</h3>
          <div className="bg-gray-100 p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <span>Temps restant:</span>
              <span className="font-medium">{formatTimeRemaining()}</span>
            </div>
            
            {testamentInfo.isDeceased && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, ((testamentInfo.currentTime - (testamentInfo.unlockTime - (30 * 24 * 60 * 60 * 1000))) / (30 * 24 * 60 * 60 * 10)) * 100))}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={unlockTestament}
            disabled={unlockLoading || !testamentInfo.isDeceased || testamentInfo.currentTime < testamentInfo.unlockTime}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {unlockLoading ? 'Déverrouillage...' : 'Déverrouiller le Testament'}
          </button>
          
          {!testamentInfo.isDeceased && (
            <p className="text-sm text-gray-600 mt-2">
              Le notaire doit d'abord confirmer le décès du testateur.
            </p>
          )}
          
          {testamentInfo.isDeceased && testamentInfo.currentTime < testamentInfo.unlockTime && (
            <p className="text-sm text-gray-600 mt-2">
              La période d'attente n'est pas encore écoulée.
            </p>
          )}
        </div>
      </div>
      
      {documentUrl && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Document Testament</h2>
          <div className="flex flex-col items-center">
            <p className="mb-4 text-gray-700">
              Le document du testament a été déverrouillé avec succès.
            </p>
            <a 
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Télécharger le document
            </a>
          </div>
        </div>
      )}
    </div>
  );
}