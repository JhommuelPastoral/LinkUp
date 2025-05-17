import useAuthUser  from '../hooks/useAuthUser.js';
import {io} from 'socket.io-client';
import { getIncomingFriendRequests , acceptFriendRequest} from '../lib/api.js';
import {useQuery, useMutation} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
export default function FriendRequestPage() {
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { authData } = useAuthUser();

  const{data: getIncomingFriend=[], refetch: incomingFriendRequestsRefetch} = useQuery({
    queryKey: ['incomingFriendRequests'],
    queryFn: getIncomingFriendRequests
  });

  const{mutate: acceptFriendRequestMutation} = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      toast.success('Friend request accepted successfully!');
      incomingFriendRequestsRefetch();
    },
    onError: (error) => {
      toast.error(error)
    },
  });


  useEffect(() => {
    if(!authData?.user?._id) return;
    socket.current = io(backendUrl);
    socket.current.on(`incomingFriendRequests${authData?.user?._id}`, () => {
      incomingFriendRequestsRefetch();
    });
    socket.current.on(`acceptedFriendRequest${authData?.user?._id}`, () => {
      incomingFriendRequestsRefetch();
    });

    return () => {
      socket.current.off(`incomingFriendRequests${authData?.user?._id}`);
      socket.current.disconnect();
    };

  }, [getIncomingFriend]);

  const handleAccceptFriend = (id) => {
    acceptFriendRequestMutation(id);
  }

  
  return (
    <div className="flex flex-col p-5  max-w-[600px] mx-auto font-Poppins gap-5" >
        <p className="text-sm  ">Suggested Friends</p>
        {getIncomingFriend?.incomingFriendRequests?.length === 0 && <p className="text-lg font-semibold">No Friend Requests</p>}

        {getIncomingFriend?.incomingFriendRequests?.map((acc,index) => (
          <div className="flex justify-between items-center" key={index}>
            <div className="flex gap-2.5 items-center ">
              <div className="w-12 h-12 rounded-full">
                <img
                  src={acc?.sender?.profileImage}
                  alt={acc?.sender?.fullname}
                  className="w-12 h-12 object-cover object-center rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold">{acc?.sender?.fullname}</p>
                <p className="text-xs">asd</p>
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => handleAccceptFriend(acc?.sender?._id)}> Accept Request</button>
          </div>
          
        ))}
    </div>
  )
}
