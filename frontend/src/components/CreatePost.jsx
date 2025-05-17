import useAuthUser from '../hooks/useAuthUser.js'
import { Image, Laugh, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {post} from '../lib/api.js';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const { authData } = useAuthUser();
  const [hasImage, setHasImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [postData, setPostData] = useState({
    userId: authData?.user?._id,
    message: '',
    img:''
  });
  const { mutate: createPost } = useMutation({
    mutationFn: post,

    onMutate: () => {
      toast.loading('Creating post...',{id: "create-post"});
    },
    onSuccess: () => {
      toast.success('Post created successfully!',{id: "create-post"});
      setPostData({
        userId: authData?.user?._id,
        message: '',
        img:''
      });
      setHasImage(false);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast.error(error.message, { id: 'create-post' });
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setPreviewUrl(reader.result);  
      setHasImage(true);
      setPostData(prev => ({ ...prev, img: reader.result }));
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    setHasImage(false);
  };

  const handleSubmit = (e) => {
    createPost(postData);
  }
  return (
      <div className={`w-full gap-2.5 h-[110px] flex flex-col`}>
        <div className={`flex gap-2.5 items-center ${!authData ? 'skeleton bg-base-200 rounded-full ' : ''}`}>
          <div className={`w-12 h-12 rounded-full `}>
            <img src={authData?.user?.profileImage} alt={authData?.user?.fullname} className={`w-12 h-12 rounded-full object-cover `} />
          </div>
          <div onClick={() => document.getElementById('Post_Modal').showModal()} className='w-[90%] cursor-pointer border h-full items-center flex p-2.5 rounded-full'>
            <p className='font-light text-sm'>What's on your mind {authData?.user?.fullname} ?</p>
          </div>
        </div>
        <div className='flex items-center gap-2.5 h-full'>
          <button onClick={() => document.getElementById('Post_Modal').showModal()} className="btn btn-soft bg-base-200 rounded-full w-30 flex items-center gap-2.5"> <Image /> Photo</button>
          <button onClick={() => document.getElementById('Post_Modal').showModal()} className="btn btn-soft bg-base-200 rounded-full w-30 flex items-center gap-2.5"> <Laugh /> Feeling</button>
        </div>

        <dialog id="Post_Modal" className="modal w-full">
          <div className="modal-box rounded-2xl w-full">
            <form method='dialog' className='w-full'>
              <div className='flex items-center w-full justify-between border-b border-b-primary pb-2.5'>
                <p className='font-semibold'>Create Post</p>
                <button className="btn btn-sm btn-circle btn-ghost"> <X /> </button>
              </div>
              <div className='mt-2.5 flex items-center gap-2.5'>
                <div className='w-10 h-10 rounded-full'>
                  <img src={authData?.user?.profileImage} alt={authData?.user?.fullname} className='w-10 h-10 rounded-full object-cover' />
                </div>
                <p>{authData?.user?.fullname}</p>
              </div>
              <div className='mt-2.5'>
                <textarea onChange={(e) => setPostData(prev => ({ ...prev, message: e.target.value }))} placeholder={`What's on your mind ${authData?.user?.fullname} ?`} className="textarea w-full resize-none" rows={4}></textarea>
              </div>

              {/* Photo Preview Section */}
              {hasImage && (
                <div className="relative mt-2.5 h-[500px] w-full">
                  <img src={previewUrl} className='w-full h-full object-cover rounded-lg' />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 btn btn-sm btn-error"
                  >
                    <Trash2 size={16} className="mr-1" /> Remove
                  </button>
                </div>
              )}

              <div className='flex flex-col gap-2.5 mt-2.5'>
                <label htmlFor="fileUpload" className="cursor-pointer btn btn-soft bg-base-200 rounded-full w-fit flex items-center gap-2.5">
                  <Image size={18} />
                  Upload Photo
                  <input
                    id="fileUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <button onClick={handleSubmit} className="btn btn-primary w-full mt-2.5">Post</button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
  )
}
