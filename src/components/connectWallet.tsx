'use client';

import { useWeb3 } from '@/Context/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConnectWallet() {
  const { account, connectWallet, loading, role } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (account && role) {
      redirectBasedOnRole();
    }
  }, [account, role]);

  const redirectBasedOnRole = () => {
    switch (role) {
      case 'owner':
        router.push('/dashboard');
        break;
      case 'heir':
        router.push('/heir');
        break;
      case 'notary':
        router.push('/notary');
        break;
      default:
        router.push('/create');
    }
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Connexion à votre portefeuille</h2>
      
      {!account ? (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Connexion...' : 'Connecter avec MetaMask'}
        </button>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-green-600 font-medium">
            Connecté: {formatAddress(account)}
          </p>
          <button
            onClick={redirectBasedOnRole}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Accéder à mon espace
          </button>
        </div>
      )}
      
      {!window.ethereum && (
        <p className="mt-4 text-red-500">
          MetaMask n'est pas installé. Veuillez installer l'extension MetaMask pour continuer.
        </p>
      )}
    </div>
  );
}