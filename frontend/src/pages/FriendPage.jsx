import { useInfiniteQuery , useQueryClient} from "@tanstack/react-query"
import { getPaginatedFriends } from "../lib/api.js"
import {useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser.js";
import { Link } from "react-router";
 

export default function FriendPage() {
  const {authData} = useAuthUser();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const socket = useRef(null);
  const queryClient = useQueryClient();
  const {
    data: userFriends=[], 
    fetchNextPage,
    hasNextPage,
    refetch: userFriendsRefetch,
    isFetchingNextPage : isLoading
  } = useInfiniteQuery({
    queryKey: ["friends/page"],
    queryFn: ({ pageParam = 1 }) => getPaginatedFriends({ pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages.length + 1 : undefined;
    },
  })


  useEffect(() => {
    if(!authData?.user?._id) return;
    socket.current = io(backendUrl);
    socket.current.on(`acceptedFriendRequest${authData?.user?._id}`, () => {
      // userFriendsRefetch();
      queryClient.invalidateQueries(["friends/page"]);
    });


    return () => {
      socket.current.off(`acceptedFriendRequest${authData?.user?._id}`);
      socket.current.disconnect();
    };

  }, [userFriends]);
  const allFriends = userFriends?.pages?.flatMap((page) => page.friends || []);
  return (
    <div className="flex flex-col p-5  max-w-[600px] mx-auto font-Poppins gap-5" >
      <p className="text-2xl font-semibold ">Friends</p>
      {isLoading ? (<p>Loading friends...</p>) : allFriends?.length === 0 ? (<p>No friends yet 😢</p>) : 
        (
          allFriends?.map((acc,index) => (
            <div key={index} className="flex items-center justify-between">
              <Link to={`/profile/${acc?._id}`} className="flex gap-2.5 items-center">
                <div className="w-15 h-15 rounded-2xl">
                  <img
                    src={acc?.profileImage}
                    alt={acc?.fullname}
                    className="object-cover object-center w-15 h-15 rounded-2xl"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{acc?.fullname}</p>
                  <p className="text-xs">@{acc?.fullname}</p>
                </div>
              </Link>
              
              <Link to="/message">
                <button className="btn btn-sm">Send Message</button>
              </Link>
            </div>
          ))
        )
      }
      {hasNextPage ? (
        <button
          className="btn btn-sm"
          onClick={() => fetchNextPage()}
          disabled={isLoading}
        >
          {isLoading ? "Loading more..." : "Load More"}
        </button>
      ): <p className="text-sm text-center">No more friends</p> }

    </div>
  )
}
