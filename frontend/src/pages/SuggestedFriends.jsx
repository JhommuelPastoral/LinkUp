import { useInfiniteQuery, useQuery, useMutation  } from "@tanstack/react-query"
import { getSingleRecommendeduser, getOutgoingFriendRequests ,getIncomingFriendRequests, addFriend } from "../lib/api.js"
import { useEffect, useRef, useState } from "react";
import {io} from 'socket.io-client';
import useAuthUser  from "../hooks/useAuthUser.js";
import toast from 'react-hot-toast';

export default function SuggestedFriends() {
  const { authData } = useAuthUser();
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [filterRecommendAcc, setFilterRecommendAcc] = useState([]);

  const{
    data:recommended,
    hasNextPage,
    fetchNextPage,
    refetch:refetchRecommended
  }= useInfiniteQuery(
    {
      queryKey:["recommended"],
      queryFn:({pageParam=1})=>getSingleRecommendeduser({pageParam}),

      getNextPageParam:(lastPage,allPages)=>{
        return lastPage?.hasMore ? allPages.length+1 : undefined;
      }

    }
  );

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
      toast.error(error)
    },
  });


  useEffect(()=>{
    if(!authData?.user?._id) return;
    socket.current = io(backendUrl);
    socket.current.on(`outgoingFriendRequests${authData?.user?._id.toString()}`, () => {
      outGoingFriendRequestsRefetch();
    });

    socket.current.on(`incomingFriendRequests${authData?.user?._id.toString()}`, () => {
      incomingFriendRequestsRefetch();
    });
    const outgoingFriendRequests = getOutgoingFriend?.outgoingFriendRequests?.map((req) => req.reciptient?._id) || [];
    const incomingFriendRequests = getIncomingFriend?.incomingFriendRequests?.map((req) => req.sender?._id) || [];
    const flatRecommended = recommended?.pages?.flatMap((page) => page.recommendUser) || [];
    const filtered = flatRecommended?.filter((acc) => !outgoingFriendRequests?.includes(acc?._id) && !incomingFriendRequests?.includes(acc?._id)) || [];
    setFilterRecommendAcc(filtered);
    
  },[recommended, getOutgoingFriend, getIncomingFriend])

  const handleAddFriend = async (userId) => {
    handleAddFriendMutation(userId);
  }
  return (
    <div className="flex flex-col p-5  max-w-[600px] mx-auto font-Poppins gap-5" >
        <p className="text-sm  ">Suggested Friends</p>
        {filterRecommendAcc?.length === 0 && <p className="text-sm  ">No Friends</p>}
        {filterRecommendAcc?.map((acc,index) => (
          <div className="flex justify-between items-center" key={index}>
            <div className="flex gap-2.5 items-center ">
              <div className="w-12 h-12 rounded-full">
                <img
                  src={acc?.profileImage}
                  alt={acc?.fullname}
                  className="w-12 h-12 object-cover object-center rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold">{acc?.fullname}</p>
                <p className="text-xs">{acc?.bio}</p>
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => handleAddFriend(acc?._id)}> Send Request</button>
          </div>
          
        ))}
        {hasNextPage ? (
          <button onClick={() => fetchNextPage()} className="btn">
            Load More
          </button>
        ) : (
          <p className="text-center text-gray-500 mt-4">You're all caught up ✨</p>
        )}

    </div>
  )
}
