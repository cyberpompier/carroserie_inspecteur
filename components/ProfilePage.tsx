import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { Avatar } from './Avatar.js'

export const ProfilePage = ({ session, profile }) => {
  const [loading, setLoading] = useState(true)
  const [prenom, setPrenom] = useState(null)
  const [nom, setNom] = useState(null)
  const [phone, setPhone] = useState(null)
  const [caserne, setCaserne] = useState(null)
  const [rank, setRank] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
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
      if (!profile.prenom && !profile.nom && !profile.caserne) {
        setIsNewProfile(true);
      } else {
        setIsNewProfile(false);
      }
      setLoading(false);
    }
  }, [profile]);

  async function updateProfile(event, newAvatarUrl) {
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
        setIsNewProfile(false);
        alert('Profil mis à jour avec succès !');
    }
    setLoading(false)
  }
  
  return React.createElement('div', { className: "flex-1 p-8 overflow-y-auto" },
    React.createElement('div', { className: "max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8" },
      isNewProfile && !loading && (
           React.createElement('div', { className: "bg-blue-900 border-l-4 border-blue-500 text-blue-100 p-4 mb-6 rounded-r-lg", role: "alert" },
              React.createElement('p', { className: "font-bold" }, "Bienvenue !"),
              React.createElement('p', null, "Il semble que ce soit votre première visite. Veuillez compléter votre profil pour continuer.")
          )
      ),
      // FIX: Add 'as any' to props to bypass TS error on intrinsic element attributes.
      React.createElement('form', { onSubmit: (e) => updateProfile(e, avatarUrl), className: "space-y-6" } as any,
        React.createElement(Avatar, {
          url: avatarUrl,
          size: 150,
          onUpload: (url) => {
            setAvatarUrl(url)
          }
        }),
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "email", className: "block text-sm font-medium text-gray-300" }, "Email"),
          React.createElement('input', { id: "email", type: "text", value: session.user.email, disabled: true, className: "mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-400 cursor-not-allowed" })
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
          React.createElement('div', null,
            React.createElement('label', { htmlFor: "nom", className: "block text-sm font-medium text-gray-300" }, "Nom"),
            React.createElement('input', {
              id: "nom",
              type: "text",
              value: nom || '',
              onChange: (e) => setNom(e.target.value),
              className: "mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { htmlFor: "prenom", className: "block text-sm font-medium text-gray-300" }, "Prénom"),
            React.createElement('input', {
              id: "prenom",
              type: "text",
              value: prenom || '',
              onChange: (e) => setPrenom(e.target.value),
               className: "mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
            })
          )
        ),
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "phone", className: "block text-sm font-medium text-gray-300" }, "Téléphone"),
          React.createElement('input', {
            id: "phone",
            type: "text",
            value: phone || '',
            onChange: (e) => setPhone(e.target.value),
            className: "mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
          })
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
          React.createElement('div', null,
            React.createElement('label', { htmlFor: "caserne", className: "block text-sm font-medium text-gray-300" }, "Caserne"),
            React.createElement('input', {
              id: "caserne",
              type: "text",
              value: caserne || '',
              onChange: (e) => setCaserne(e.target.value),
              className: "mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { htmlFor: "rank", className: "block text-sm font-medium text-gray-300" }, "Grade"),
            React.createElement('input', {
              id: "rank",
              type: "text",
              value: rank || '',
              onChange: (e) => setRank(e.target.value),
              className: "mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
            })
          )
        ),
        React.createElement('div', null,
          React.createElement('button', {
            className: "w-full px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50",
            disabled: loading,
            type: "submit"
          }, loading ? 'Chargement ...' : 'Mettre à jour')
        )
      )
    )
  )
}