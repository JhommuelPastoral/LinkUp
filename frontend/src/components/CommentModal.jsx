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
      <X className="fixed top-5 right-10 z-50 cursor-pointer" onClick={handleClose} />
      <div className="modal-box relative max-h-[95%] max-w-[80%] flex p-0">
        <div className="w-[70%] max-h-full border-r border-gray-600">
          <img
            src={post?.img}
            className="w-full h-full object-cover"
            alt="Post"
          />
        </div>

        <div className="flex flex-col w-[30%]">
          {/* User Info */}
          <div className="flex items-center p-2.5">
            <div className="flex items-center gap-2.5">
              <img
                src={post?.userId?.profileImage}
                className="w-12 h-12 rounded-full object-cover"
                alt="User"
              />
              <p className="text-sm font-semibold">{post?.userId?.fullname}</p>
            </div>
          </div>

          {/* Comments */}
          <div className="flex flex-col gap-2.5 p-2.5 overflow-y-auto border border-gray-600 h-full">
            {commentsLoading ? (
              <p>Loading Comments...</p>
            ) : (
              Comments?.slice()?.reverse()?.map((comment) => (
                <div className="flex items-center gap-2.5" key={comment._id}>
                  <img
                    src={comment?.userId?.profileImage}
                    className="w-12 h-12 rounded-full object-cover"
                    alt="Commenter"
                  />
                  <div className="flex flex-col w-[90%]">
                    <p className="text-sm font-semibold">{comment?.userId?.fullname}</p>
                    <p className="text-sm">{comment?.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="flex w-full p-2.5 border-t border-gray-600">
            <div className="w-full flex items-center gap-2.5">
              <textarea
                className="textarea resize-none w-full text-sm"
                onChange={(e) =>
                  setCommentData({ ...commentData, comment: e.target.value })
                }
                value={commentData.comment}
                placeholder="Add a comment..."
                rows={1}
              ></textarea>
              <button className="btn bg-transparent" onClick={handleSubmit}>
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
