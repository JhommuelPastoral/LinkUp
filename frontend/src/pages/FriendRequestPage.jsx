import useAuthUser  from '../hooks/useAuthUser.js';
import {io} from 'socket.io-client';
import { getIncomingFriendRequests , acceptFriendRequest} from '../lib/api.js';
import {useMutation, useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
export default function FriendRequestPage() {
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { authData } = useAuthUser();
  const queryClient = useQueryClient();
  const{
    data: getIncomingFriend=[],
    refetch: incomingFriendRequestsRefetch,
    hasNextPage,
    fetchNextPage
    }= useInfiniteQuery({
    queryKey: ['incomingFriendRequests/page'],
    queryFn:({pageParam=1})=>getIncomingFriendRequests({pageParam}),
    getNextPageParam:(lastPage,allPages)=> lastPage?.hasMore ? allPages?.length+1 : undefined
  })

  const allRequests = getIncomingFriend?.pages?.flatMap((page) => page.incomingFriendRequests || []
  );
  const{mutate: acceptFriendRequestMutation} = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      toast.success('Friend request accepted successfully!');
      // incomingFriendRequestsRefetch();
      queryClient.invalidateQueries(["incomingFriendRequests/page"]);
    },
    onError: (error) => {
      toast.error(error)
    },
  });


  useEffect(() => {
    if(!authData?.user?._id) return;
    socket.current = io(backendUrl);
    socket.current.on(`incomingFriendRequests${authData?.user?._id}`, () => {
      // incomingFriendRequestsRefetch();
      queryClient.invalidateQueries(["incomingFriendRequests/page"]);
    });
    socket.current.on(`acceptedFriendRequest${authData?.user?._id}`, () => {
      // incomingFriendRequestsRefetch();
      queryClient.invalidateQueries(["incomingFriendRequests/page"]);
    });

    return () => {
      socket.current.off(`incomingFriendRequests${authData?.user?._id}`);
      socket.current.off(`acceptedFriendRequest${authData?.user?._id}`);
      socket.current.disconnect();
    };

  }, [getIncomingFriend]);

  const handleAccceptFriend = (id) => {
    acceptFriendRequestMutation(id);
  }


  return (
    <div className="flex flex-col p-5  max-w-[600px] mx-auto font-Poppins gap-5" >
        <p className="text-sm ">Friend Requests</p>
        {allRequests?.length === 0 && <p className="text-sm font-semibold text-center">No Friend Requests</p>}

        {allRequests?.map((acc,index) => (
          <Link to={`/profile/${acc?.sender?._id}`} key={index}>
            <div className="flex items-center justify-between" >
              <div className="flex gap-2.5 items-center ">
                <div className="w-12 h-12 rounded-full">
                  <img
                    src={acc?.sender?.profileImage}
                    alt={acc?.sender?.fullname}
                    className="object-cover object-center w-12 h-12 rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{acc?.sender?.fullname}</p>
                  <p className="text-xs">{acc?.sender?.bio}</p>
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => handleAccceptFriend(acc?.sender?._id)}> Accept Request</button>
            </div>
          
          </Link>
          
        ))}
        {hasNextPage && (
        <button
          className="self-center mt-4 btn btn-primary"
          onClick={() => fetchNextPage()}
        >
          View More
        </button>)
      }    
    </div>
  )
}
