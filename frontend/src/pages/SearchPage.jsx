import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { findUser } from '../lib/api.js'
import {Link} from 'react-router'
import useAuthUser from '../hooks/useAuthUser.js'
export default function SearchPage() {
  const [inputvalue, setInputvalue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const queryClient = useQueryClient()
  const {authData} = useAuthUser();
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputvalue)
      queryClient.invalidateQueries(['findUsers', debouncedValue])
    }, 500)

    return () => clearTimeout(handler)
  }, [inputvalue])

  useEffect(() => {
    const friend = authData?.user?.friends || [];
    setFriends(friend);
  }, [authData])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['findUsers', debouncedValue],
    queryFn: () => findUser({ fullname: debouncedValue }),
    enabled: !!debouncedValue,
  })

  const users = data?.user || []
  const handleRequest =  (id) => {
    console.log("id", id);
  }
  return (
    <div className='max-w-[800px] mx-auto p-6 font-Poppins'>
      <h1 className='mb-4 text-2xl font-bold'>Find A User</h1>

      <input
        type='text'
        placeholder='Type a name...'
        value={inputvalue}
        onChange={(e) => setInputvalue(e.target.value)}
        className='w-full p-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
      />

      {isLoading && <p className='text-gray-500'>Searching...</p>}
      {isError && <p className='text-red-500'>Something went wrong</p>}
      <ul className="flex flex-col gap-4 max-w-[500px] mx-auto">
        {users.map((user) => (
          <li
            key={user._id}
            className="flex items-start gap-4 p-4 transition shadow-sm bg-base-200 rounded-xl hover:shadow-md"
          >
            <Link to={`/profile/${user._id}`}>
              <img
                src={user.profileImage || '/default-avatar.png'}
                alt={user.fullname}
                className="object-cover border border-gray-300 rounded-full w-14 h-14"
              />
            </Link>

            <div className="flex-1">
              <Link to={`/profile/${user._id}`}>
                <p className="text-lg font-semibold hover:underline">{user.fullname}</p>
              </Link>
              <p className="mt-1 text-sm">
                {user.bio || <span className="italic text-gray-500">No bio provided.</span>}
              </p>
            </div>

            <div className={`flex justify-end ${friends.includes(user._id) ? 'hidden' : ''}`}>
              <button
                className="btn"
                onClick={(e) => {
                  e.stopPropagation() 
                  handleRequest(user._id)
                }}
              >
                Send Request
              </button>
            </div>
          </li>
        ))}
      </ul>

    </div>
  )
}
