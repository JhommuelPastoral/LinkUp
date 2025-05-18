import useAuthUser from "../hooks/useAuthUser.js";
import { useEffect, useRef, useState } from "react";
import { getPosts, addLike } from "../lib/api.js";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Heart, MessageCircle, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import InfiniteScroll from "react-infinite-scroll-component";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(relativeTime);

export default function PostCard() {
  const { authData } = useAuthUser();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const socket = useRef(null);

  if (!authData) return <div className="w-full min-h-screen bg-base-200 skeleton" />;

  const {
    data: postsData = [],
    fetchNextPage,
    hasNextPage,
    refetch: postsRefetch,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => getPosts({ pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages?.length + 1 : undefined;
    },
    enabled: !!authData?.user?._id,
  });

  const { mutate: likePost } = useMutation({
    mutationFn: addLike,
    onSuccess: (data) => {
      toast.success(data.message);
      postsRefetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLike = (postId) => {
    likePost(postId);
  };

  useEffect(() => {
    socket.current = io(backendUrl);
    socket.current.on("newPost", postsRefetch);
    socket.current.on("likePost", postsRefetch);
    socket.current.on("userConnected", postsRefetch);
    socket.current.on("user-disconnected", postsRefetch);

    return () => {
      socket.current.off("newPost");
      socket.current.off("likePost");
      socket.current.off("userConnected");
      socket.current.off("userDisconnected");
      socket.current.disconnect();
    };
  }, [postsData]);

  if (!authData?.user?._id) {
    return <div className="w-full min-h-screen bg-base-200 skeleton" />;
  }

  const posts = postsData?.pages?.flatMap((page) => page.posts) || [];

  return (
    <InfiniteScroll
      dataLength={posts?.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading...</h4>}
      endMessage={<p className="text-center">No more posts</p>}
    >
      {posts.map((post) => (
        <div
          key={post._id}
          className="flex flex-col font-Poppins mb-4 lg:p-5 gap-2.5 border-b border-b-base-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-full">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={post.userId.profileImage}
                alt={post.userId.fullname}
              />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold flex gap-2.5 items-center">
                {post.userId.fullname}
                {post.userId.isOnline && (
                  <span
                    aria-label="success"
                    className="status status-success rounded-full"
                  ></span>
                )}
              </p>
              <p className="text-gray-500 text-sm flex items-center gap-2.5">
                <Clock size={16} /> {dayjs(post.createdAt).fromNow()}
              </p>
            </div>
          </div>

          <p>{post.message}</p>

          {post.img && (
            <LikeImageWithEffect
              src={post.img}
              postId={post._id}
              onLike={handleLike}
              isLiked={post.likes.includes(authData?.user?._id)}
            />
          )}

          <div className="flex items-center gap-10 mt-2.5">
            <Heart
              size={24}
              className="cursor-pointer transition-transform duration-200 active:scale-125"
              fill={post.likes.includes(authData?.user?._id) ? "red" : "none"}
              onClick={() => handleLike(post._id.toString())}
            />
            <MessageCircle size={24} />
          </div>

          <p className="text-gray-500 font-semibold">
            {post.likes?.length} {post.likes?.length <= 1 ? "like" : "likes"}
          </p>
        </div>
      ))}
    </InfiniteScroll>
  );
}

function LikeImageWithEffect({ src, postId, isLiked, onLike }) {
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = () => {
    if (isLiked) return; 

    setShowHeart(true);
    onLike(postId.toString());
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div
      className="relative mt-2 rounded-lg overflow-hidden"
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={src}
        alt="Post"
        className="w-full h-full rounded-lg select-none cursor-pointer"
      />
      <AnimatePresence>
        {showHeart && (
          <motion.div
            key="like"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Heart size={80} color="white" fill="red" className="drop-shadow-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
