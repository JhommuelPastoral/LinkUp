import { Clock, Heart, MessageCircle } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addLike, getAllUserPosts } from '../lib/api.js'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useEffect, useRef } from 'react'
dayjs.extend(relativeTime)

export default function AllPost({posts, authData }) {
  const queryClient = useQueryClient();
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // const{data:posts=[], refetch:postsRefetch} = useQuery({
  //   queryKey: ["getAllUserPosts"],
  //   queryFn: getAllUserPosts
  // });

  const { mutate: likePost } = useMutation({
    mutationFn: addLike,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["getAllUserPosts"]);
      // postsRefetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if(!authData) return;
    socket.current = io(backendUrl);

    socket.current.on("likePost", () => {
      queryClient.invalidateQueries(["getAllUserPosts"]);
    });

    return () => {
      socket.current.off("likePost");
    };


  }, []);

  const handleLike = (id) => {
    likePost(id);
  };

  return (
    <div className=" mt-5 max-w-[700px] mx-auto ">
      {posts?.Allposts?.length === 0 ? (
        <p className="text-center">No Post Available</p>
      ): (
        posts?.Allposts?.map((post) => (
        <div
          key={post._id}
          className="flex flex-col font-Poppins mb-4 lg:p-5 gap-2.5 border-b border-b-base-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-full">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={authData.profileImage}
                alt={authData.fullname}
              />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold flex gap-2.5 items-center">
                {authData.fullname}
                {authData.isOnline && (
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
            <img
              src={post.img}
              alt="Post image"
              className="mt-2 rounded-lg max-w-full"
            />
          )}
          <div className="flex items-center gap-10 mt-2.5">
            <Heart
              size={24}
              className="cursor-pointer"
              fill={post.likes.includes(authData?._id) ? "red" : "none"}
              onClick={() => handleLike(post._id.toString())}
            />
            <MessageCircle size={24} />
          </div>
          <p className="text-gray-500 font-semibold">
            {post.likes?.length} {post.likes?.length <= 1 ? "like" : "likes"}
          </p>
        </div>
        ))
      )}

    </div>
  )
}
