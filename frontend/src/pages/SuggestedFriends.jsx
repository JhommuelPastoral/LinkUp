import { useInfiniteQuery, useQuery, useMutation, useQueryClient    } from "@tanstack/react-query"
import { getSingleRecommendeduser, getOutgoingFriendRequests ,getIncomingFriendRequests, addFriend } from "../lib/api.js"
import { useEffect, useRef, useState } from "react";
import {io} from 'socket.io-client';
import useAuthUser  from "../hooks/useAuthUser.js";
import toast from 'react-hot-toast';
import { Link } from "react-router";

export default function SuggestedFriends() {
  const { authData } = useAuthUser();
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [filterRecommendAcc, setFilterRecommendAcc] = useState([]);
  const queryClient = useQueryClient();
  const{
    data:recommended,
    hasNextPage,
    fetchNextPage,
    refetch:refetchRecommended,
    isFetchingNextPage
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
      // outGoingFriendRequestsRefetch();
      queryClient.invalidateQueries(["outgoingFriendRequests"]);
    });


    socket.current.on(`incomingFriendRequests${authData?.user?._id.toString()}`, () => {
      // incomingFriendRequestsRefetch();
      queryClient.invalidateQueries(["incomingFriendRequests"]);
    });

    const outgoingFriendRequests = getOutgoingFriend?.outgoingFriendRequests?.map((req) => req.reciptient?._id) || [];
    const incomingFriendRequests = getIncomingFriend?.incomingFriendRequests?.map((req) => req.sender?._id) || [];
    const flatRecommended = recommended?.pages?.flatMap((page) => page.recommendUser) || [];
    const filtered = flatRecommended?.filter((acc) => !outgoingFriendRequests?.includes(acc?._id) && !incomingFriendRequests?.includes(acc?._id)) || [];
    setFilterRecommendAcc(filtered);

    return ()=>{
      socket.current?.off(`outgoingFriendRequests${authData?.user?._id.toString()}`);
      socket.current?.off(`incomingFriendRequests${authData?.user?._id.toString()}`);
      socket.current.disconnect();
    }

    
  },[recommended, getOutgoingFriend, getIncomingFriend])

  const handleAddFriend = async (userId) => {
    handleAddFriendMutation(userId);
  }
  return (
    <div className="flex flex-col p-5  max-w-[600px] mx-auto font-Poppins gap-5" >
        <p className="text-sm ">Suggested Friends</p>
        {filterRecommendAcc?.length === 0 && <p className="text-sm ">No Friends</p>}
        {isFetchingNextPage ? ( <div className="flex items-center gap-2.5"><span className="loading loading-dots loading-md"></span> <p>Loading....</p>   </div> ): (

          filterRecommendAcc?.map((acc,index) => (
            <Link to={`/profile/${acc?._id}`}>
              <div className="flex items-center justify-between" key={index}>
                <div className="flex gap-2.5 items-center ">
                  <div className="w-12 h-12 rounded-full">
                    <img
                      src={acc?.profileImage}
                      alt={acc?.fullname}
                      className="object-cover object-center w-12 h-12 rounded-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold">{acc?.fullname}</p>
                    <p className="text-xs">{acc?.bio}</p>
                  </div>
                </div>
                <button className="btn btn-sm" onClick={() => handleAddFriend(acc?._id)}> Send Request</button>
              </div>
            
            </Link>
            
          ))
          
        )}
        {hasNextPage ? (
          <button onClick={() => fetchNextPage()} className="btn">
            Load More
          </button>
        ) : (
          isFetchingNextPage ?<p className="mt-4 text-center text-gray-500">You're all caught up ✨</p> : ''
        )}

    </div>
  )
}
