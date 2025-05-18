import { X } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {addComment, getSpecificPosts} from '../lib/api.js'
import { useState, useEffect, useRef } from "react";
import {io} from 'socket.io-client';
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser.js";
export default function CommentModal({ post, onClose }) {
  const {authData} = useAuthUser();
  const [commentData, setCommentData] = useState({
    userId: "" ,
    postId: "",
    comment: "",
  });

  const {data: fetchData, refetch: refetchComments, isLoading: commentsLoading} = useQuery({
    queryKey: ["comments"],
    queryFn: () => getSpecificPosts(post._id),
  });

  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const queryClient = useQueryClient();

  const { mutate: addCommentMutate } = useMutation({
  mutationFn: (data) => addComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      toast.success("Comment added successfully!");
      setCommentData(prev => ({
        ...prev,
        comment: ""
      }));   
    },
  });

  useEffect(() => {
    if(!post) return;
    if(!authData) return;
    setCommentData(prev => ({
      ...prev,
      userId: authData.user._id,
      postId: post._id
    }));


    socket.current = io(backendUrl);
    socket.current.on("newComment", () => {
      refetchComments();
    });

    return () => {
      socket.current.off("newComment");
      socket.current.disconnect();
    }

  }, [post]);
  const handleSubmit = () => {
    addCommentMutate(commentData);

  };
  const Comments = fetchData?.Allposts?.comments;
  return (
    <>
    <X className="fixed top-5 right-10 z-50 cursor-pointer" onClick={onClose}/>
    <div className="modal-box relative max-h-[95%] max-w-[80%] flex p-0">
      <div className="w-[70%] max-h-full  border-r-gray-600">
        <img src={post?.img} className="w-full h-full  object-cover" />
      </div>
      <div className="flex flex-col w-[30%]  ">
        <div className="flex items-center  p-2.5 ">
          <div className="flex items-center gap-2.5">
            <img src={post?.userId?.profileImage} className="w-12 h-12 rounded-full object-cover " />
            <p className="text-sm font-semibold">{post?.userId?.fullname}</p>
          </div>
        </div>
        {/* Comment Section  */}
        <div className="flex flex-col gap-2.5 p-2.5 overflow-y-auto border h-full border-gray-600 ">
          {commentsLoading ? (
            <p>Loading Comments...</p>
          ):(
            Comments?.slice()?.reverse()?.map((comment) => (
              <div className="flex items-center gap-2.5 " key={comment._id}>
                <img src={comment?.userId?.profileImage} className="w-12 h-12 rounded-full object-cover " />
                <div className="flex flex-col w-[90%]">
                  <p className="text-sm font-semibold">{comment?.userId?.fullname}</p>
                  <p className="text-sm ">{comment?.message}</p>
                </div>
              </div>
            ))
          )}
          
        </div>
        <div className="flex w-full">
          <div className="w-full flex items-center gap-2.5">
            <textarea className="textarea resize-none w-full text-sm " onChange={(e) => setCommentData({ ...commentData, comment: e.target.value })} value={commentData.comment} placeholder="Add a comment..." rows={1} ></textarea>
            <button className="btn bg-transparent" onClick={handleSubmit}>Post</button>
          </div>
        </div>

      </div>
     </div>
    </>
   
  );
}
