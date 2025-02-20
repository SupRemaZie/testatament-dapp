"use client";
import { useState } from "react";
import { SidebarProvider, Sidebar, SidebarItem } from "@/components/Sidebar";

export default function Home() {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-2xl font-semibold text-blue-400 mb-6">Testament DApp</h2>
                <Sidebar>
                    <SidebarItem href="/" className="text-lg hover:bg-gray-700 py-2 px-4 rounded-md">Accueil</SidebarItem>
                    <SidebarItem href="/testament" className="text-lg hover:bg-gray-700 py-2 px-4 rounded-md">Créer un Testament</SidebarItem>
                    <SidebarItem href="/settings" className="text-lg hover:bg-gray-700 py-2 px-4 rounded-md">Paramètres</SidebarItem>
                </Sidebar>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    {/* En-tête */}
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-semibold text-blue-600">Bienvenue dans votre Testament Numérique</h1>
                        <p className="text-xl text-gray-600 mt-2">
                            Protégez et gérez votre héritage numérique de manière sécurisée et transparente avec la blockchain.
                        </p>
                    </header>

                    {/* Section "À propos" */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Pourquoi utiliser notre dApp Testament ?</h2>
                        <p className="text-lg text-gray-700 mb-4">
                            Dans le monde numérique d'aujourd'hui, la gestion de votre héritage est plus importante que jamais. Notre dApp Testament vous permet de créer et gérer un testament sécurisé sur la blockchain, garantissant que vos volontés seront respectées.
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li><strong>Contrôle total :</strong> Vous pouvez nommer un héritier et un notaire, et modifier ces informations à tout moment.</li>
                            <li><strong>Sécurité et transparence :</strong> Votre testament est stocké de manière décentralisée, assurant que vos données ne peuvent pas être altérées.</li>
                            <li><strong>Testament numérique vérifié :</strong> En cas de décès, votre testament sera validé de manière transparente via la blockchain.</li>
                        </ul>
                    </section>

                    {/* Section Fonctionnalités */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Fonctionnalités principales</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-blue-500"
