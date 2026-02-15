'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';


export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [dropDownExtend, setDropdownExtend] = useState(false)

  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchBookmarks()

    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut({ scope: 'global' })
    router.replace('/')
  }


  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      router.replace('/')
    }
  }

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  const isValidUrl = (url) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // optional http or https
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // optional port & path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // optional query string
      '(\\#[-a-z\\d_]*)?$', // optional fragment
      'i'
    );

    return pattern.test(url);
  };


  const addBookmark = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!title || !url) {
      return (
        alert("please enter Title and URL.")
      )
    }

    if (!isValidUrl(url)) {
      alert("Enter a valid URL");
      return;
    }

    await supabase.from('bookmarks').insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ])

    setTitle('')
    setUrl('')
  }

  const deleteBookmark = async (id) => {
    await supabase.from('bookmarks').delete().eq('id', id);
  }

  const deleteAccount = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    await fetch('/apis/deleteUsers/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })


    await supabase.auth.signOut()
    alert("Your account deleted succesfully.")
    router.replace('/')
  }


  return (
    <div className="flex flex-col gap-2  items-center justify-center  w-screen relative font-serif">

      <div className="flex flex-col justify-between items-center mb-4 ">
        <h1 className="text-5xl font-bold pt-20 ">My Bookmarks</h1>
        <div onClick={() => setDropdownExtend(prev => !prev)} className="absolute top-4 right-4 border-solid border-1 text-white rounded-full w-12 h-12 flex items-center justify-center absoulte">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a8.38 8.38 0 0113 0" />
          </svg>


          {dropDownExtend && (
            <div className="absolute top-12 right-2 bg-white text-black rounded shadow-lg w-48">
              <ul>
                <li
                  onClick={logout}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  Logout
                </li>
                <li onClick={deleteAccount} className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  Delete my account
                </li>
              </ul>
            </div>
          )}

        </div>


      </div>


      <div className="flex gap-2 mb-4 w-1/2">
        <input
          placeholder="Title"
          className="border p-2 flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="URL"
          className="border p-2 flex-1"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={addBookmark}
          className="bg-black text-white px-4"
        >
          Add
        </button>
      </div>

      {bookmarks.map((b) => (
        <div
          key={b.id}
          className="flex justify-between border p-2 mb-2 w-1/2"
        >
          <a href={b.url} target="_blank">
            {b.title}
          </a>
          <button
            onClick={() => deleteBookmark(b.id)} className="text-red-500 cursor-pointer"> Delete </button>
        </div>
      ))}
    </div>
  )
}