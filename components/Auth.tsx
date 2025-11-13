import React, { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } 
    setLoading(false);
  };
  
  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Inscription réussie ! Veuillez vérifier votre e-mail pour activer votre compte.');
    }
    setLoading(false);
  }

  return React.createElement('div', { className: "flex items-center justify-center min-h-screen bg-gray-900" },
    React.createElement('div', { className: "w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg" },
      React.createElement('h1', { className: "text-3xl font-bold text-center text-red-500" }, "Carrosserie Inspecteur"),
      React.createElement('p', { className: "text-center text-gray-400" }, "Veuillez vous connecter pour continuer"),
      React.createElement('form', { className: "space-y-6", onSubmit: handleLogin },
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "email", className: "block text-sm font-medium text-gray-300" }, "Email"),
          React.createElement('input', {
            id: "email",
            className: "w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-red-500",
            type: "email",
            placeholder: "votre@email.com",
            value: email,
            required: true,
            onChange: (e) => setEmail(e.target.value)
          })
        ),
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "password" }, "Mot de passe"),
          React.createElement('input', {
            id: "password",
            className: "w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-red-500",
            type: "password",
            placeholder: "••••••••",
            value: password,
            required: true,
            onChange: (e) => setPassword(e.target.value)
          })
        ),
        message && React.createElement('p', { className: "text-sm text-green-400" }, message),
        error && React.createElement('p', { className: "text-sm text-red-400" }, error),
        React.createElement('div', null,
          React.createElement('button', {
            type: "submit",
            className: "w-full px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50",
            disabled: loading
          }, loading ? 'Connexion...' : 'Se connecter')
        ),
        React.createElement('div', { className: "text-center text-gray-400" }, "ou"),
        React.createElement('div', null,
          React.createElement('button', {
            type: "button",
            onClick: handleSignUp,
            className: "w-full px-4 py-2 font-bold text-red-500 bg-transparent border border-red-500 rounded-md hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50",
            disabled: loading
          }, loading ? 'Création...' : "S'inscrire")
        )
      )
    )
  );
};
