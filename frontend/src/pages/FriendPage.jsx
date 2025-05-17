import { useQuery } from "@tanstack/react-query"
import { getFriends } from "../lib/api.js"
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser.js";
export default function FriendPage() {
  const {authData} = useAuthUser();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const socket = useRef(null);
  const {data: userFriends=[]} = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends
  });

  useEffect(() => {
    if(!authData?.user?._id) return;
    socket.current = io(backendUrl);
    socket.current.on(`acceptedFriendRequest${authData?.user?._id}`, () => {
      userFriendsRefetch();
    });


    return () => {
      socket.current.disconnect();
    };

  }, [userFriends]);



  return (
    <div className="flex flex-col p-5  max-w-[600px] mx-auto font-Poppins gap-5" >
        <p className="text-2xl font-semibold  ">Friends</p>
        {userFriends?.friends?.friends.map((acc,index) => (
          <div className="flex justify-between items-center " key={index}>
            <div className="flex gap-2.5 items-center ">
              <div className="w-15 h-15 rounded-2xl">
                <img
                  src={acc?.profileImage}
                  alt={acc?.fullname}
                  className="w-15 h-15 object-cover object-center rounded-2xl"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold">{acc?.fullname}</p>
                <p className="text-xs">asd</p>
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => handleAddFriend(acc?._id)}> Send Message</button>
          </div>
          
        ))}
    </div>
  )
}
