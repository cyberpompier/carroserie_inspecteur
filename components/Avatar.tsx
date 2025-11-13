import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { UserIcon } from './Icons.js'

export const Avatar = ({ url, size, onUpload }) => {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return React.createElement('div', { className: "flex flex-col items-center space-y-4" },
    avatarUrl ? (
      React.createElement('img', {
        src: avatarUrl,
        alt: "Avatar",
        className: "rounded-full object-cover",
        style: { height: size, width: size }
      })
    ) : (
      React.createElement('div', { className: "bg-gray-700 rounded-full flex items-center justify-center text-gray-400", style: { height: size, width: size } },
        React.createElement(UserIcon, { style: { width: size / 2, height: size / 2 } })
      )
    ),
    React.createElement('div', null,
      React.createElement('label', { className: "cursor-pointer px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500", htmlFor: "single" },
        uploading ? 'Chargement ...' : 'Téléverser'
      ),
      React.createElement('input', {
        style: {
          visibility: 'hidden',
          position: 'absolute',
        },
        type: "file",
        id: "single",
        accept: "image/*",
        onChange: uploadAvatar,
        disabled: uploading
      })
    )
  )
}
