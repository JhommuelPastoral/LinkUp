import dayjs from "dayjs";
import { animate } from 'framer-motion';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {getAllUserPosts} from '../lib/api.js';
import {io} from 'socket.io-client';
import AllPost from "./AllPost.jsx";
export default function Profile({authData}) {
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [allLikesUser, setAllLikes] = useState([]);

  const [value, setValue] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalFriends:0
  });

  const{data:posts=[], refetch:postsRefetch} = useQuery({
    queryKey: ["getAllUserPosts"],
    queryFn: getAllUserPosts
  });

  useEffect(() => {
    if (!posts?.Allposts || !authData?.user?._id) return;

    const allLike = posts.Allposts.filter((post) =>
      post?.likes?.includes(authData.user._id)
    );

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

    const likesControl = animate(0, allLikesUser?.length, {
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
  }, [posts]);

  return (
    <>
      <div className="flex gap-10 items-center justify-center border-b border-base-300 pb-2.5">
      <div>
        <img src={authData?.user?.profileImage} className="w-30 h-30 rounded-full object-cover object-center" />
        <p className="font-semibold text-xl text-center">{authData?.user?.fullname}</p>
        <p className="text-center text-light ">{authData?.user?.bio}</p>
      </div>
      <div className="flex flex-col gap-5 items-center">
        <div className="stats shadow">
          <div className="stat place-items-center">
            <div className="stat-title">Total Posts</div>
            <div className="stat-value">{value.totalPosts >= 1000 ? `${Math.floor(value.totalPosts / 1000)}K` : value.totalPosts}</div>
            <div className="stat-desc">From {dayjs(authData?.user?.createdAt).format("MMM-DD-YYYY")} to {dayjs().format("MMM-DD-YYYY")}</div>
          </div>

          <div className="stat place-items-center">
            <div className="stat-title">Total Likes</div>
            <div className="stat-value text-secondary">{value.totalLikes >= 1000 ? `${Math.floor(value.totalLikes / 1000)}K` : value.totalLikes}</div>
          </div>

          <div className="stat place-items-center">
            <div className="stat-title">Total Friends</div>
            <div className="stat-value">{value.totalFriends >= 1000 ? `${Math.floor(value.totalFriends / 1000)}K` : value.totalFriends}</div>
          </div>
        </div>
      </div>
      </div>  
      <AllPost posts={posts} authData={authData.user} />
    </>
    )
}
