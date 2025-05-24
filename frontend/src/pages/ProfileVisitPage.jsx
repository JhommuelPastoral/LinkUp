import  {useParams} from 'react-router';
import { useQuery, useMutation , useQueryClient} from '@tanstack/react-query';
import { getUserById , getUserPostById, addLike} from '../lib/api.js';
import { useEffect, useState, useRef } from 'react';
import { animate } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import { Clock, Heart, MessageCircle } from 'lucide-react'
import CommentModal from '../components/CommentModal.jsx';
import { motion, AnimatePresence } from "framer-motion";
import { io } from 'socket.io-client'
import useAuthUser from '../hooks/useAuthUser.js';

dayjs.extend(relativeTime)

export default function ProfileVisitPage() {
  const {id} = useParams();
  const socket = useRef(null);
  const queryClient = useQueryClient();
  const [allLikes, setAllLikes] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const {authData} = useAuthUser();
  const [allFriends, setAllFriends] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const dialogRef = useRef(null);

  const [value, setValue] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalFriends:0
  });

  const {data: userData, isLoading} = useQuery({
    queryKey: ['user'],
    queryFn: () => getUserById(id),
  });

  const {data: userPosts, isLoding: userPostsLoading} = useQuery({
    queryKey: ['userPosts'],
    queryFn: () => getUserPostById(id),
  })
  
  const { mutate: likePost } = useMutation({
    mutationFn: addLike,
    onSuccess: () => {
      queryClient.invalidateQueries(["userPosts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  useEffect(() => {
    socket.current = io(backendUrl);

    socket.current.on("likePost", () => {
      queryClient.invalidateQueries(["userPosts"]);
    });

    socket.current.on("newComment", () => {
      queryClient.invalidateQueries(["userPosts"]);
    });

    return () => {
      socket.current.off("likePost");
      socket.current.off("newComment");
      socket.current.disconnect();
    };


  }, []);
  useEffect(()=>{
    const allLike = userPosts?.allPosts?.reduce((acc, post) => acc + post?.likes?.length, 0);
    setAllLikes(allLike);
    
  },[userPosts]);
  useEffect(()=>{
    const allfriend = userData?.user?.friends?.length;
    setAllFriends(allfriend);
  },[userData])

  useEffect(()=>{

    const postsControl  = animate(0, userPosts?.allPosts?.length, {
      duration: 2,
      onUpdate(value) {
        setValue((prev) => ({ ...prev, totalPosts: value.toFixed(0) }));
      },
    });
    const likesControl  = animate(0, allLikes, {
      duration: 2,
      onUpdate(value) {
        setValue((prev) => ({ ...prev, totalLikes: value.toFixed(0) }));
      },
    });
    const friendsControl  = animate(0, allFriends, {
      duration: 2,
      onUpdate(value) {
        setValue((prev) => ({ ...prev, totalFriends: value.toFixed(0) }));
      },
    });

    return () => {
      postsControl.stop();
      likesControl.stop();
      friendsControl.stop();
    };

  },[allLikes, userPosts, allFriends?.length]);
  const openModal = (post) => {
    setSelectedPost(post);
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    setSelectedPost(null);
  };
  const handleLike = (id) => {
    likePost(id);
  };
  const posts = userPosts?.allPosts;
  return (
    <div className='max-w-[1000px] p-5 mx-auto  font-Poppins'>
      <div className="flex flex-col lg:flex-row gap-10 items-center justify-center border-b border-base-300 pb-2.5 px-4 ">
        {/* Profile Section */}

        <div className="flex flex-col items-center text-center ">
          <div className="w-28 h-28">
            <img
              src={userData?.user?.profileImage}
              className="object-cover object-center rounded-full w-28 h-28"
              alt="User"
            />

          </div>
          <div>
            <p className="mt-2 text-xl font-semibold">{userData?.user?.fullname}</p>
            <p className="text-light">{userData?.user?.bio}</p>

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
                From {dayjs(userData?.user?.createdAt).format("MMM-DD-YYYY")} to {dayjs().format("MMM-DD-YYYY")}
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
      
    <div className=" mt-5 max-w-[700px] mx-auto pb-15">
      {posts?.Allposts?.length === 0 ? (
        <p className="text-center">No Post Available</p>
      ): (
        posts?.map((post) => (
        <div
          key={post._id}
          className="flex flex-col font-Poppins mb-4 lg:p-5 gap-2.5 border-b border-b-base-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-full">
              <img
                className="object-cover w-12 h-12 rounded-full"
                src={userData?.user?.profileImage}
                alt={userData?.user?.fullname}
              />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold flex gap-2.5 items-center">
                {userData?.user?.fullname}
                {userData?.user?.isOnline && (
                  <span
                    aria-label="success"
                    className="rounded-full status status-success"
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
              className="cursor-pointer"
              fill={post.likes.includes(authData?.user?._id) ? "red" : "none"}
              onClick={() => handleLike(post._id.toString())}
            />
            <MessageCircle size={24} onClick={() => openModal(post)} className="cursor-pointer"/>
          </div>
          <div className='flex gap-5'>
            <p className="font-semibold text-gray-500">
              {post.likes?.length} {post.likes?.length <= 1 ? "like" : "likes"}
            </p>          
            <p className="font-semibold text-gray-500">
              {post?.comments?.length} {post?.comments?.length <= 1 ? "comment" : "comments"}
            </p>
          </div>

        </div>
        ))
      )}
      <dialog
        className="modal"
        ref={dialogRef}
        onCancel={closeModal}  
        onClick={(e) => {if (e.target === dialogRef.current) {closeModal();}}}
      >
        <CommentModal post={selectedPost} onClose={closeModal}  />
      </dialog>
    </div>


    </div>
  )
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
      className="relative mt-2 overflow-hidden rounded-lg"
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={src}
        alt="Post"
        className="w-full h-full rounded-lg cursor-pointer select-none"
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