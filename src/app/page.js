'use client'

import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export default function Home() {

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = '/dashboard'
      }
    })
  }, [])

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account'
        }
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-evenly h-screen ">
      <div className="flex flex-col items-center justify-evenly h-2/5">
        <h1 className="font-serif text-7xl md:underline decoration-4 "> Welcome to Markly</h1>
        <p className="font-serif text-4xl">“Save. Organize. Remember.”</p>
      </div>

      <button
        onClick={login}
        className="font-serif h-15 w-50 bg-black text-white rounded cursor-pointer motion-safe:hover:scale-110"
      >
        Login to add Bookmarks
      </button>
    </div>
  )
}