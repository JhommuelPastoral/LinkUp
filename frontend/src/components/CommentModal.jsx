import { X } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addComment, getSpecificPosts } from "../lib/api.js";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser.js";

export default function CommentModal({ post, onClose }) {
  const { authData } = useAuthUser();
  const [commentData, setCommentData] = useState({
    userId: "",
    postId: "",
    comment: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const socket = useRef(null);
  const queryClient = useQueryClient();

  const {
    data: fetchData,
    refetch: refetchComments,
    isLoading: commentsLoading,
  } = useQuery({
    queryKey: ["comments", post?._id],
    queryFn: () => getSpecificPosts(post._id),
    enabled: !!post?._id,
  });

  const { mutate: addCommentMutate } = useMutation({
    mutationFn: (data) => addComment(data),
    onSuccess: () => {
      toast.success("Comment added successfully!");
      setCommentData((prev) => ({
        ...prev,
        comment: "",
      }));
    },
  });

  useEffect(() => {
    if (post && authData) {
      setCommentData({
        userId: authData?.user?._id || "",
        postId: post?._id || "",
        comment: "",
      });
    }
  }, [post, authData]);

  useEffect(() => {
    if (!post) return;

    socket.current = io(backendUrl);

    socket.current.on(`newComment${post._id}`, () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post._id] });
    });

    return () => {
      socket.current.off(`newComment${post._id}` );
      socket.current.disconnect();
    };
  }, [post, refetchComments]);

  const handleSubmit = () => {
    if (
      !commentData.comment.trim() ||
      !commentData.userId ||
      !commentData.postId
    ) {
      toast.error("Please enter a valid comment.");
      return;
    }

    addCommentMutate(commentData);
  };

  const handleClose = () => {
    setCommentData({ userId: "", postId: "", comment: "" });
    onClose();
  };

  const Comments = fetchData?.Allposts?.comments;

return (
  <>
    <X 
      className="fixed top-4 right-4 z-50 cursor-pointer md:top-5 md:right-10" 
      onClick={handleClose} 
    />
    <div className="modal-box relative w-full max-w-full md:max-w-[90%] lg:max-w-[80%] h-[90vh] flex flex-col md:flex-row p-0 overflow-hidden">
      {/* Image Container - Full width on mobile, 70% on desktop */}
      <div className="w-full md:w-[60%] lg:w-[70%] h-[40vh] md:h-full border-b md:border-b-0 md:border-r border-gray-600">
        <img
          src={post?.img}
          className="w-full h-full object-contain"
          alt="Post"
        />
      </div>

      {/* Comments and User Info Container - Full width on mobile, 30% on desktop */}
      <div className="flex flex-col w-full md:w-[40%] lg:w-[30%] h-[50vh] md:h-full">
        {/* User Info */}
        <div className="flex items-center p-2 md:p-2.5">
          <div className="flex items-center gap-2">
            <img
              src={post?.userId?.profileImage}
              className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
              alt="User"
            />
            <p className="text-xs md:text-sm font-semibold">{post?.userId?.fullname}</p>
          </div>
        </div>

        {/* Comments - scrollable area */}
        <div className="flex flex-col gap-2 md:gap-2.5 p-2 md:p-2.5 overflow-y-auto border-y md:border-y-0 md:border border-gray-600 flex-grow">
          {commentsLoading ? (
            <p className="text-center text-sm">Loading Comments...</p>
          ) : Comments?.length === 0 ? (
            <p className="text-center text-sm text-gray-400">No comments yet</p>
          ) : (
            Comments?.slice()?.reverse()?.map((comment) => (
              <div className="flex items-start gap-2 md:gap-2.5" key={comment._id}>
                <img
                  src={comment?.userId?.profileImage}
                  className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                  alt="Commenter"
                />
                <div className="flex flex-col w-[90%]">
                  <p className="text-xs md:text-sm font-semibold">{comment?.userId?.fullname}</p>
                  <p className="text-xs md:text-sm break-words">{comment?.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="flex w-full p-2 md:p-2.5 border-t border-gray-600 mt-auto">
          <div className="w-full flex items-center gap-2">
            <textarea
              className="textarea resize-none w-full text-xs md:text-sm p-2 rounded"
              onChange={(e) =>
                setCommentData({ ...commentData, comment: e.target.value })
              }
              value={commentData.comment}
              placeholder="Add a comment..."
              rows={1}
            ></textarea>
            <button 
              className="btn bg-transparent text-xs md:text-sm px-2 py-1"
              onClick={handleSubmit}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
