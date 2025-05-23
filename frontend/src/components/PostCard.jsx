import useAuthUser from "../hooks/useAuthUser.js";
import { useEffect, useRef, useState } from "react";
import { getPosts, addLike } from "../lib/api.js";
import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Heart, MessageCircle, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import InfiniteScroll from "react-infinite-scroll-component";
import { motion, AnimatePresence } from "framer-motion";
import CommentModal from "./CommentModal.jsx";
dayjs.extend(relativeTime);

export default function PostCard() {
  const { authData } = useAuthUser();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const socket = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const dialogRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    data: postsData = [],
    fetchNextPage,
    hasNextPage,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleLike = (postId) => {
    likePost(postId);
  };

  const openModal = (post) => {
    setSelectedPost(post);
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
    setSelectedPost(null);
  };

  useEffect(() => {
    
    if (!authData || !postsData) {
      return <div className="w-full min-h-screen bg-base-200 skeleton" />;
    }
    socket.current = io(backendUrl);

    const invalidatePosts = () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      console.log("Posts invalidated");
    };

    socket.current.on("newPost", invalidatePosts);
    socket.current.on("likePost", invalidatePosts);
    socket.current.on("newComment", invalidatePosts);
    // socket.current.on("user-connected", invalidatePosts);
    // socket.current.on("user-disconnected", invalidatePosts);

    return () => {
      socket.current.off("newPost", invalidatePosts);
      socket.current.off("likePost", invalidatePosts);
      socket.current.off("newComment", invalidatePosts);
      // socket.current.off("user-connected", invalidatePosts);
      // socket.current.off("user-disconnected", invalidatePosts);
      socket.current.disconnect();
    };
  }, [queryClient]);


  const posts = postsData?.pages?.flatMap((page) => page.posts) || [];

  return (
    <InfiniteScroll
      dataLength={posts.length}
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
                  <span className="status status-success rounded-full" />
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
              isLiked={post.likes.includes(authData.user._id)}
            />
          )}

          <div className="flex items-center gap-10 mt-2.5">
            <Heart
              size={24}
              className="cursor-pointer transition-transform duration-200 active:scale-125"
              fill={post.likes.includes(authData.user._id) ? "red" : "none"}
              onClick={() => handleLike(post._id)}
            />
            <MessageCircle size={24} onClick={() => openModal(post)} className="cursor-pointer" />
          </div>

          <div className="flex gap-5">
            <p className="text-gray-500 font-semibold">
              {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
            </p>
            <p className="text-gray-500 font-semibold">
              {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
            </p>
          </div>
        </div>
      ))}

      <dialog
        className="modal"
        ref={dialogRef}
        onCancel={closeModal}
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeModal();
          }
        }}
      >
        <CommentModal post={selectedPost} onClose={closeModal} />
      </dialog>
    </InfiniteScroll>
  );
}

function LikeImageWithEffect({ src, postId, isLiked, onLike }) {
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = () => {
    if (isLiked) return;

    setShowHeart(true);
    onLike(postId);
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
        className="w-full h-full rounded-lg select-none cursor-pointer object-contain"
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
