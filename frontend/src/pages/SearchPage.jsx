import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { findUser, getAllIncomingFriendRequests, getOutgoingFriendRequests, addFriend, acceptFriendRequest } from '../lib/api.js'
import {Link} from 'react-router'
import useAuthUser from '../hooks/useAuthUser.js'
import toast from 'react-hot-toast';
import {io} from 'socket.io-client';
export default function SearchPage() {
  const [inputvalue, setInputvalue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const queryClient = useQueryClient()
  const {authData} = useAuthUser();
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [friends, setFriends] = useState([]);
  const [outgoingFriendRequests, setOutgoingFriendRequests] = useState([]);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState([]);

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

  const {data: incomingFriend=[], refetch: incomingFriendRequestsRefetch} = useQuery({
    queryKey: ['getAllIncomingFriendRequests'],
    queryFn: getAllIncomingFriendRequests
  });

  const {data: outgoingFriend=[], refetch: outGoingFriendRequestsRefetch} = useQuery({
    queryKey: ['outgoingFriendRequests'],
    queryFn: getOutgoingFriendRequests
  });

  useEffect(() => {
    const outgoing = outgoingFriend?.outgoingFriendRequests?.map((friend) => friend.reciptient?._id) || [];
    setOutgoingFriendRequests(outgoing);

  },[outgoingFriend]);
  
  useEffect(() => {
    const incoming = incomingFriend?.incomingFriendRequests?.map((friend) => friend?.sender?._id) || [];
    setIncomingFriendRequests(incoming);
  },[incomingFriend])

  useEffect(() => {
    socket.current = io(backendUrl);
    socket.current.on(`outgoingFriendRequests${authData.user._id}`, (data) => {
      queryClient.invalidateQueries('getAllIncomingFriendRequests');
    });
    socket.current.on(`incomingFriendRequests${authData.user._id}`, (data) => {
      queryClient.invalidateQueries('getAllIncomingFriendRequests');
      queryClient.invalidateQueries('findUsers');
    });
    socket.current.on(`acceptedFriendRequest${authData.user._id}`, (data) => {
      queryClient.invalidateQueries('findUsers');
    });

    return () => {
      socket.current.off(`outgoingFriendRequests${authData.user._id}`);
      socket.current.off(`incomingFriendRequests${authData.user._id}`);
      socket.current.disconnect();

    };

  }, [authData.user._id]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['findUsers', debouncedValue],
    queryFn: () => findUser({ fullname: debouncedValue }),
    enabled: !!debouncedValue,
  })


  const {mutate: handleAddFriendMutation} = useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      toast.success('Friend request sent successfully!');
      queryClient.invalidateQueries('outgoingFriendRequests');
    },
    onError: (error) => {
      toast.error(error)
    },
  });
  const{mutate: acceptFriendRequestMutation} = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      toast.success('Friend request accepted successfully!');
      queryClient.invalidateQueries(["incomingFriendRequests/page"]);
    },
    onError: (error) => {
      toast.error(error)
    },
  });


  const users = data?.user?.filter((user) => user._id !== authData.user._id) || []
  const handleAddFriend =  (id) => {
    handleAddFriendMutation(id);
  };

  const handleAcceptFriendRequest =  (id) => {
    acceptFriendRequestMutation(id);
  };

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

            <div className={`flex justify-end `}>

              {friends.includes(user._id)  ? (
                <button className="rounded-lg btn bg-base-300 btn-disabled">
                  Friend
                </button>
              ) : (
                !outgoingFriendRequests.includes(user._id) && !incomingFriendRequests.includes(user._id) &&
                <button
                  className="rounded-lg btn bg-base-300 "
                  onClick={(e) => {
                    handleAddFriend(user._id)
                  }}
                >
                  Add Friend
                </button>
              )}
          
              {outgoingFriendRequests.includes(user._id) && 
                <button
                  className="rounded-lg btn bg-base-300 btn-disabled"
                >
                  Request Sent
                </button>
              }
              
              {incomingFriendRequests.includes(user._id) && 
                <button
                  className="rounded-lg btn bg-base-300 "
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptFriendRequest(user._id);
                  }}
                >
                  Accept Request
                </button>
              }

            </div>
          </li>
        ))}
      </ul>

    </div>
  )
}
