import dayjs from "dayjs";
import { animate } from 'framer-motion';
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {getAllUserPosts, logout} from '../lib/api.js';
import {io} from 'socket.io-client';
import AllPost from "./AllPost.jsx";

export default function Profile({authData}) {
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [allLikesUser, setAllLikes] = useState(0);
  const queryClient = useQueryClient();
  const [value, setValue] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalFriends:0
  });

  const{data:posts=[], refetch:postsRefetch} = useQuery({
    queryKey: ["getAllUserPosts"],
    queryFn: getAllUserPosts
  });

  const{mutate: logoutUser} = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries(["authUser"]);
    }
  })
  useEffect(() => {
    if (!posts?.Allposts || !authData?.user?._id) return;

    const allLike = posts?.Allposts?.reduce((acc, post) => acc + post?.likes?.length, 0);

    setAllLikes(allLike); 
  }, [posts, authData?.user?._id]);
  
  useEffect(() => {
    socket.current = io(backendUrl);
    socket.current.on(`newPost${authData?.user?._id}`, () => {
      postsRefetch();
    });

    const postsControl  = animate(0, posts?.Allposts?.length, {
      duration: 2,
      onUpdate(value) {
        setValue((prev) => ({ ...prev, totalPosts: value.toFixed(0) }));
      },
    });

    const likesControl = animate(0, allLikesUser, {
      duration: 2,
      onUpdate(value) {
        setValue((prev) => ({ ...prev, totalLikes: value.toFixed(0) }));
      },
    });

    const friendsControl = animate(0, authData?.user?.friends.length, {
      duration: 2,
      onUpdate(value) {
        setValue((prev) => ({ ...prev, totalFriends: value.toFixed(0) }));
      },
    });

    return () => {
      socket.current.off(`newPost${authData?.user?._id}`);
      socket.current.disconnect();
      postsControl.stop();
      likesControl.stop();
      friendsControl.stop();
    }
  }, [posts, allLikesUser, authData?.user?.friends?.length]);
  const handleLogout = () => {
    logoutUser();
  }
  return (
    <>
    <div className="flex justify-end lg:hidden">
      <button className="btn" onClick={handleLogout}> Logout</button>
    </div>
      <div className="flex flex-col lg:flex-row gap-10 items-center justify-center border-b border-base-300 pb-2.5 px-4 ">
        {/* Profile Section */}

        <div className="flex flex-col items-center text-center ">
          <div className="w-28 h-28">
            <img
              src={authData?.user?.profileImage}
              className="object-cover object-center rounded-full w-28 h-28"
              alt="User"
            />

          </div>
          <div>
            <p className="mt-2 text-xl font-semibold">{authData?.user?.fullname}</p>
            <p className="text-light">{authData?.user?.bio}</p>

          </div>
        </div>

        {/* Stats Section */}
        <div className="flex-col hidden w-full gap-5 md:flex ">
          <div className="items-start w-full shadow stats">
            <div className="text-center stat place-items-center">
              <div className="stat-title">Total Posts</div>
              <div className="stat-value">
                {value.totalPosts >= 1000 ? `${Math.floor(value.totalPosts / 1000)}K` : value.totalPosts}
              </div>
              <div className="hidden stat-desc lg:flex">
                From {dayjs(authData?.user?.createdAt).format("MMM-DD-YYYY")} to {dayjs().format("MMM-DD-YYYY")}
              </div>
            </div>

            <div className="text-center stat place-items-center">
              <div className="stat-title">Total Likes</div>
              <div className="stat-value text-secondary">
                {value.totalLikes >= 1000 ? `${Math.floor(value.totalLikes / 1000)}K` : value.totalLikes}
              </div>
            </div>

            <div className="text-center stat place-items-center">
              <div className="stat-title">Total Friends</div>
              <div className="stat-value">
                {value.totalFriends >= 1000 ? `${Math.floor(value.totalFriends / 1000)}K` : value.totalFriends}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AllPost posts={posts} authData={authData.user} />
    </>
  );

}
