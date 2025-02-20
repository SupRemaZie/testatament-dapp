'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/Context/Web3Context';
import { getFromIPFS } from '../utils/ipfs';
import { toast } from 'react-toastify';

export default function HeirDashboard() {
  const { contract } = useWeb3();
  const [testamentInfo, setTestamentInfo] = useState({
    owner: '',
    isDeceased: false,
    unlockTime: 0,
    currentTime: Date.now(),
  });
  const [documentHash, setDocumentHash] = useState('');
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockLoading, setUnlockLoading] = useState(false);

  useEffect(() => {
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
  }, [contract]);

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
      
      if (!testamentInfo.isDeceased) {
        toast.error("Le testateur est encore en vie selon le contrat.");
        return;
      }
      
      if (testamentInfo.currentTime < testamentInfo.unlockTime) {
        toast.error("La période d'attente n'est pas encore écoulée.");
        return;
      }
      
      // Appel au contrat pour déverrouiller le testament
      const hash = await contract.unlockTestament();
      setDocumentHash(hash);
      
      toast.success("Testament déverrouillé avec succès");
      
      // Récupération du document depuis IPFS
      try {
        const { url } = await getFromIPFS(hash);
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Consultation du Testament</h2>
      
      <div className="mb-6">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Testateur</p>
            <p className="font-medium">{formatAddress(testamentInfo.owner)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Statut</p>
            <p className={`font-medium ${testamentInfo.isDeceased ? 'text-red-600' : 'text-green-600'}`}>
              {testamentInfo.isDeceased ? 'Décédé (confirmé)' : 'En vie'}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Délai de déverrouillage</p>
          <div className="bg-gray-100 p-3 rounded">
            <p className="font-medium">{formatTimeRemaining()}</p>
            
            {testamentInfo.isDeceased && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, 100 - ((testamentInfo.unlockTime - testamentInfo.currentTime) / (30 * 24 * 60 * 60 * 10)))))}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={unlockTestament}
          disabled={unlockLoading || !testamentInfo.isDeceased || testamentInfo.currentTime < testamentInfo.unlockTime}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {unlockLoading 
            ? 'Déverrouillage en cours...' 
            : documentHash 
              ? 'Testament déverrouillé' 
              : 'Déverrouiller le Testament'}
        </button>
        
        {!testamentInfo.isDeceased && (
          <p className="text-sm text-gray-500 mt-2">
            Le notaire doit d'abord confirmer le décès du testateur.
          </p>
        )}
        
        {testamentInfo.isDeceased && testamentInfo.currentTime < testamentInfo.unlockTime && (
          <p className="text-sm text-gray-500 mt-2">
            Vous pourrez déverrouiller le testament après la période d'attente.
          </p>
        )}
      </div>
      
      {documentUrl && (
        <div className="mt-8 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Document du Testament</h3>
          <div className="flex flex-col items-center">
            <p className="mb-4 text-center text-gray-700">
              Le document du testament a été déverrouillé avec succès.
            </p>
            <a 
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Télécharger le Document
            </a>
          </div>
        </div>
      )}
    </div>
  );
}