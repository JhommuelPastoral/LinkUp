import React, { useEffect } from "react";
import { X } from "lucide-react";
export default function CommentModal({ post, onClose }) {
  console.log(post);
  return (
    <>
    <X className="fixed top-5 right-10 z-50 cursor-pointer" onClick={onClose}/>
    <div className="modal-box relative max-h-[95%] max-w-[80%] flex p-0">
      <div className="w-[70%] max-h-full  border-r-gray-600">
        <img src={post?.img} className="w-full h-full  object-cover object-center" />
      </div>
      <div className="flex flex-col w-[30%]  ">
        <div className="flex items-center  p-2.5 ">
          <div className="flex items-center gap-2.5">
            <img src={post?.userId?.profileImage} className="w-12 h-12 rounded-full object-cover " />
            <p>{post?.userId?.fullname}</p>
          </div>
        </div>
        {/* Comment Section  */}
        <div className="flex flex-col gap-2.5 p-2.5 overflow-y-auto border h-full border-gray-600 ">
          
          
        </div>
        <div className="flex w-full">
          <div className="w-full flex items-center gap-2.5">
            <textarea className="textarea resize-none w-full text-sm " placeholder="Add a comment..." rows={1} ></textarea>
            <button className="btn bg-transparent">Post</button>
          </div>
        </div>

      </div>
     </div>
    </>
   
  );
}
