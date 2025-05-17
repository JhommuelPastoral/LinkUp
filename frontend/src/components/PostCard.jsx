import useAuthUser from "../hooks/useAuthUser.js";
import { useEffect, useRef, useState } from "react";
import { getPosts,addLike } from "../lib/api.js";
import { useQuery,useMutation } from "@tanstack/react-query";
import {io} from 'socket.io-client';
import { Heart,MessageCircle,Clock } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);


export default function PostCard() {
  
  const { authData } = useAuthUser();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const socket = useRef(null);
  
  const{data: postsData, refetch: postsRefetch} = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    retry: false
  })
  const{mutate: likePost} = useMutation({
    mutationFn: addLike,
    onSuccess: () => {
      postsRefetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  })

  const handleLike = (postId) => {
    likePost(postId);
  };


  useEffect(() => {
    socket.current = io(backendUrl);
    socket.current.on('newPost', () => {
      postsRefetch();
    });
    socket.current.on('userConnected', () => {
      postsRefetch();
    });
    socket.current.on('user-disconnected', () => {
      postsRefetch();
    });

    return () => {
      socket.current.off('newPost');
      socket.current.off('userConnected');
      socket.current.off('userDisconnected');
      socket.current.disconnect();
    };

  }, [postsData]);

  if(!authData?.user?._id){
    return (
      <div className="w-full min-h-screen bg-base-200 skeleton"/>
    )
  }
return (
  <div>
    {postsData?.posts?.map((post) => (
      <div key={post._id} className="flex flex-col font-Poppins mb-4 p-5 gap-2.5 border-b border-b-base-200 ">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-full">
            <img className="w-12 h-12 rounded-full object-cover" src={post.userId.profileImage} alt={post.userId.fullname} />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold flex gap-2.5 items-center">{post.userId.fullname} 
               {post.userId.isOnline && (
                 <span aria-label="success" className="status status-success rounded-full"></span>  
               )}
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-2.5"> <Clock size={16} /> {dayjs(post.createdAt).fromNow()}</p>
          </div>
        </div>
        <p>{post.message}</p>
        {post.img && (
          <img src={post.img} alt="Post image" className="mt-2 rounded-lg max-w-full" />
        )}
        <div className="flex items-center gap-10 mt-2.5">
          <Heart size={24} className="cursor-pointer" fill={post.likes.includes(authData?.user?._id) ? 'red' : 'none'} onClick={() => handleLike(post._id.toString())}/>
          <MessageCircle size={24} />
        </div>
        <p className="text-gray-500 font-semibold">{post.likes.length} { post.likes.length <=1 ? 'like' : 'likes'}</p>
      </div>
    ))}
  </div>
);

}
