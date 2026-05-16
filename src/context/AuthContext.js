// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const ADMIN_USERNAME = 'osias'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(uid) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
    if (data) setUserProfile(data)
    return data
  }

  async function signup({ firstName, middleName, lastName, username, phone, email, password }) {
    const cleanUsername = username.toLowerCase().trim()
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          display_name: firstName + ' ' + lastName,
          username: cleanUsername,
        }
      }
    })
    if (error) throw error

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: cleanUsername,
      first_name: firstName.trim(),
      middle_name: middleName.trim(),
      last_name: lastName.trim(),
      display_name: firstName.trim() + ' ' + lastName.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      bio: '',
      photo_url: '',
      cover_url: '',
      is_admin: cleanUsername === ADMIN_USERNAME,
      followers: [],
      following: [],
    })
    if (profileError) throw profileError
    return data
  }

  async function login(identifier, password) {
    // identifier = username or phone number
    let email = null

    // Check if it looks like a phone number
    const isPhone = /^[0-9+\-\s()]{7,}$/.test(identifier.trim())

    if (isPhone) {
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', identifier.trim())
        .single()
      if (!data) throw new Error('Phone number not found.')
      email = data.email
    } else {
      // username login
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier.toLowerCase().trim())
        .single()
      if (!data) throw new Error('Username not found.')
      email = data.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setUserProfile(null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user)
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setCurrentUser(null)
        setUserProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = userProfile?.is_admin || false

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, isAdmin, signup, login, logout, fetchProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
