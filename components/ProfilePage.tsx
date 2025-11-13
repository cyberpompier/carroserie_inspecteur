import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types'
import { Avatar } from './Avatar'

interface ProfilePageProps {
  session: Session
  profile: Profile
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ session, profile }) => {
  const [loading, setLoading] = useState(true)
  const [prenom, setPrenom] = useState<string | null>(null)
  const [nom, setNom] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [caserne, setCaserne] = useState<string | null>(null)
  const [rank, setRank] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isNewProfile, setIsNewProfile] = useState(false);
  const { user } = session

  useEffect(() => {
    if (profile) {
      setPrenom(profile.prenom)
      setNom(profile.nom)
      setPhone(profile.phone)
      setCaserne(profile.caserne)
      setRank(profile.rank)
      setAvatarUrl(profile.avatarUrl)
      // Un nouveau profil est celui qui a été créé par défaut dans App.tsx
      // Il n'aura pas de nom ou d'autres détails tant que l'utilisateur ne les aura pas remplis.
      if (!profile.prenom && !profile.nom && !profile.caserne) {
        setIsNewProfile(true);
      } else {
        setIsNewProfile(false);
      }
      setLoading(false);
    }
  }, [profile]);


  async function updateProfile(event: React.FormEvent<HTMLFormElement>, newAvatarUrl: string | null) {
    event.preventDefault()

    setLoading(true)

    const updates = {
      id: user.id,
      prenom,
      nom,
      phone,
      caserne,
      rank,
      avatarUrl: newAvatarUrl,
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    } else {
        setAvatarUrl(newAvatarUrl);
        setIsNewProfile(false); // Le profil est maintenant créé/mis à jour, on cache le message.
        alert('Profil mis à jour avec succès !');
    }
    setLoading(false)
  }
  
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        {isNewProfile && !loading && (
             <div className="bg-blue-900 border-l-4 border-blue-500 text-blue-100 p-4 mb-6 rounded-r-lg" role="alert">
                <p className="font-bold">Bienvenue !</p>
                <p>Il semble que ce soit votre première visite. Veuillez compléter votre profil pour continuer.</p>
            </div>
        )}
        <form onSubmit={(e) => updateProfile(e, avatarUrl)} className="space-y-6">
          <Avatar
            url={avatarUrl}
            size={150}
            onUpload={(url) => {
              setAvatarUrl(url)
              // La mise à jour se fait via le bouton principal pour garder les choses simples.
            }}
          />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input id="email" type="text" value={session.user.email} disabled className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-400 cursor-not-allowed" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-300">Nom</label>
              <input
                id="nom"
                type="text"
                value={nom || ''}
                onChange={(e) => setNom(e.target.value)}
                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-300">Prénom</label>
              <input
                id="prenom"
                type="text"
                value={prenom || ''}
                onChange={(e) => setPrenom(e.target.value)}
                 className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Téléphone</label>
            <input
              id="phone"
              type="text"
              value={phone || ''}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="caserne" className="block text-sm font-medium text-gray-300">Caserne</label>
              <input
                id="caserne"
                type="text"
                value={caserne || ''}
                onChange={(e) => setCaserne(e.target.value)}
                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label htmlFor="rank" className="block text-sm font-medium text-gray-300">Grade</label>
              <input
                id="rank"
                type="text"
                value={rank || ''}
                onChange={(e) => setRank(e.target.value)}
                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <button
              className="w-full px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Chargement ...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}