import useAuthUser from '../hooks/useAuthUser.js';
import {getRecommendUser, addFriend, getOutgoingFriendRequests,getIncomingFriendRequests} from '../lib/api.js'
import { io } from "socket.io-client";
import { useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {useLocation,matchPath} from 'react-router'
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Link } from 'react-router';
export default function RightSidebar() {
  const location = useLocation();
  const currectLocation = location.pathname;
  const Socket = useRef(null);
  const { authData } = useAuthUser();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [outgoingRequest, setOutgoingRequest] = useState([]);
  const [ingoingRequest, setIngoingRequest] = useState([]);
  const [filterRecommendAcc, setFilterRecommendAcc] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const {data: recommendAcc=[], refetch: recommendUserRefetch} = useQuery({
    queryKey: ['recommendUser'],
    queryFn: getRecommendUser
  });
  const hiddenLocation = ['/explore/friends', '/profile', '/message', '/profile/:id'];
  const shouldHideSidebar = hiddenLocation.some((path) => matchPath({ path, end: false }, currectLocation));

  const queryClient = useQueryClient();

  const {data: getOutgoingFriend=[], refetch: outGoingFriendRequestsRefetch} = useQuery({
    queryKey: ['outgoingFriendRequests'],
    queryFn: getOutgoingFriendRequests
  });

  const {data: getIncomingFriend=[], refetch: incomingFriendRequestsRefetch} = useQuery({
    queryKey: ['incomingFriendRequests'],
    queryFn: getIncomingFriendRequests
  });

  const {mutate: handleAddFriendMutation} = useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      toast.success('Friend request sent successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  useEffect(() => {
    if (!authData?.user?._id) return;
    Socket.current = io(backendUrl);
    Socket.current.on('user-disconnected', ()=>{queryClient.invalidateQueries({queryKey: ['recommendUser']});});
    Socket.current.emit('user-connected',(authData?.user?._id));
    Socket.current.on('user-connected', () => {queryClient.invalidateQueries({queryKey: ['recommendUser']});});
    Socket.current.on('recommendUser', () => {queryClient.invalidateQueries({queryKey: ['recommendUser']});});
    
    Socket.current.on(`outgoingFriendRequests${authData?.user?._id.toString()}`, () => {
      outGoingFriendRequestsRefetch();
    });

    Socket.current.on(`incomingFriendRequests${authData?.user?._id.toString()}`, () => {
      incomingFriendRequestsRefetch();
    });

    Socket.current.on(`acceptedFriendRequest${authData?.user?._id.toString()}`, () => {
      queryClient.invalidateQueries({queryKey: ['recommendUser']});
      queryClient.invalidateQueries({queryKey: ['outgoingFriendRequests']});
      queryClient.invalidateQueries({queryKey: ['incomingFriendRequests']});
    });

    // Get all the ids in the outgoing friend request
    const outgoingIds = getOutgoingFriend?.outgoingFriendRequests?.map(friend => friend.reciptient._id.toString()) || [];
    const ingoingIds = getIncomingFriend?.incomingFriendRequests?.map(friend => friend.sender._id.toString()) || [];

    setOutgoingRequest(outgoingIds);
    setIngoingRequest(ingoingIds);

    const filterAcc = recommendAcc?.recommendUser?.filter((acc) =>
      !outgoingIds.includes(acc._id.toString()) &&
      !ingoingIds.includes(acc._id.toString())
    );
    const onlineIds = recommendAcc?.recommendUser?.filter((acc) => acc.isOnline) || [];
    setOnlineUsers(onlineIds);
    setFilterRecommendAcc(filterAcc);
    return () => {
      if (Socket.current) {
        Socket.current.off('user-connected');
        Socket.current.off('recommendUser');
        Socket.current.off(`outgoingFriendRequests${authData?.user?._id}`);
        Socket.current.off(`incomingFriendRequests${authData?.user?._id}`);
        Socket.current.disconnect();
      }
    };
  }, [getOutgoingFriend, getIncomingFriend, recommendAcc]);


  const handleAddFriend = (userId) => {
    handleAddFriendMutation(userId);
  }
  return (
    <div className={`p-5 flex flex-col font-Poppins gap-5 ${shouldHideSidebar ? 'hidden' : ''}`}>
      <div className='flex items-center'>
        <div className='rounded-full w-15 h-15 '>
          <img src={authData?.user?.profileImage} alt={authData?.user?.fullname} className='object-cover object-center rounded-full w-15 h-15' />
        </div>
        <div className='flex flex-col ml-3'>
          <p className='text-sm'>{authData?.user?.fullname}</p>
          <p className='text-sm' >@{authData?.user?.fullname}</p>
        </div>
      </div>
      <p className='text-sm text-current/80'>Suggested for you</p>
      {onlineUsers.length === 0 ?  <Link to="/explore/friends">  <p className='text-sm text-center text-current/80'> No one is online <span className='link'>See more </span> </p> </Link>  :
        (
          filterRecommendAcc?.map((user) => (
            user?.isOnline && (          
              <div className='flex flex-col items-center' key={user._id}>
                <div className='flex items-center w-full'>
                  <div className='relative rounded-full w-15 h-15 '>
                    <img src={user?.profileImage} alt={user?.fullname} className='object-cover object-center rounded-full w-15 h-15' />
                    <div aria-label="success" className="absolute right-0 w-4 h-4 rounded-full status status-success bottom-1"></div>
                  </div>
                  <div className='flex flex-col ml-3'>
                    <p className='text-sm'>{user?.fullname}</p>
                    <p className='text-sm'>@{user?.fullname}</p>
                  </div>
                  <button className="ml-auto btn btn-sm bg-primary" onClick={() => handleAddFriend(user._id)}>Add Friend</button>
                </div>
              </div>
            )
            
            
          ))

        )
      }

    </div>
  )
}
