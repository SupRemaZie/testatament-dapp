"use client"
import { useState, useEffect, Suspense, lazy } from "react";
import { Helmet } from "react-helmet";

const Testament = lazy(() => import("../components/Testament"));

export default function App() {
  return (
    <div className="App">
      <Helmet>
        <title>Testament DApp</title>
        <meta name="description" content="Gérez votre testament sécurisé avec la blockchain" />
      </Helmet>
      <NavBar />
      <Suspense fallback={<p>Chargement...</p>}>
        <Testament />
      </Suspense>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between">
      <h1 className="text-xl font-bold">Testament DApp</h1>
      <ul className="flex gap-4">
        <li><a href="#" className="hover:underline">Accueil</a></li>
        <li><a href="#" className="hover:underline">À propos</a></li>
        <li><a href="#" className="hover:underline">Contact</a></li>
      </ul>
    </nav>
  );
}

function ToggleDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <button 
      className="mt-4 bg-gray-600 text-white p-2 rounded" 
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode ? "☀️ Mode Clair" : "🌙 Mode Sombre"}
    </button>
  );
}