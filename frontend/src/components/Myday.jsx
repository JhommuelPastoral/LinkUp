import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createMyday, getMyday } from '../lib/api.js';
import { Plus } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser.js';
import { io } from 'socket.io-client';

export default function Myday() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const { authData } = useAuthUser();
  const queryClient = useQueryClient();
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { mutate: createMydayData } = useMutation({
    mutationFn: createMyday,
    onMutate: () => {
      toast.loading('Creating myday...', { id: 'create-myday' });
    },
    onSuccess: (data) => {
      toast.success(data.message, { id: 'create-myday' });
      setPreviewUrl(null);
      document.getElementById('my_modal_3')?.close();
      queryClient.invalidateQueries(['myday']);
    },
    onError: (error) => {
      toast.error(error.message, { id: 'create-myday' });
    },
  });

  const { data: mydayData } = useQuery({
    queryKey: ['myday'],
    queryFn: getMyday,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleCreateMyday = () => {
    if (!previewUrl) {
      toast.error('Please upload an image first.');
      return;
    }
    createMydayData({ image: previewUrl });
  };

  useEffect(() => {
    socket.current = io(backendUrl);
    socket.current.on('updateMyday', () => {
      queryClient.invalidateQueries(['myday']);
    });
    return () => {
      socket.current.off('updateMyday');
    };
  }, [authData]);

  const mydayMine = mydayData?.mydays?.filter((d) => {
    return d.userId?._id === authData?.user?._id
  }) || [];

  return (
    <>
      <div className=' mx-auto max-w-full  '>
        <div className='flex gap-4 font-Poppins items-start overflow-auto max-w-[calc(100vw-50px)] '>
          {/* CREATE STORY CARD */}
          <div className='text-center'>
            <div
              className='flex flex-col items-center cursor-pointer'
              onClick={() => document.getElementById('my_modal_3').showModal()}
            >
              <div className='w-28 h-40 rounded-2xl overflow-hidden border'>
                <img
                  src={mydayMine?.length === 0 ? authData?.user?.profileImage : mydayMine[0]?.image}
                  alt="Create story"
                  className="w-full h-full object-contain"
                />
              </div>
              <Plus className='h-8 w-8 rounded-full -mt-4 bg-blue-500 text-white border' />
            </div>
            <p>{mydayMine?.length === 1 ? 'Update Story' : 'Create Story'}</p>
          </div>

          {/* HIDDEN FILE INPUT */}
          <input
            type="file"
            id="myday"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* OTHER STORIES */}
          {mydayData?.mydays
            ?.filter((item) => item.userId?._id !== authData?.user?._id)
            .map((item) => (
              <div className='flex flex-col' key={item._id}>
                <div className='w-28 h-40 rounded-lg overflow-hidden border border-base-200'>
                  <img
                    src={item.image}
                    alt={item?.userId?.fullname}
                    className="w-full h-full object-contain object-center"
                  />
                </div>
                <p className='text-center font-semibold'>{item?.userId?.fullname}</p>
              </div>
            ))}
        </div>
      </div>


      {/* MODAL */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box rounded-2xl" onClick={(e) => e.stopPropagation()}>
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setPreviewUrl(null)}
            >
              ✕
            </button>
          </form>
          <div className='space-y-4'>
            <h3 className="font-bold text-lg">Story Preview</h3>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-80 mx-auto rounded-md" />
            ) : (
              <p className="text-gray-500 text-sm">No image selected.</p>
            )}
            <div className='flex justify-center gap-4'>
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById('myday').click()}
              >
                Upload Image
              </button>
              {previewUrl && (
                <button className="btn btn-primary" onClick={handleCreateMyday}>
                  {mydayMine ? 'Update Story' : 'Post Story'}
                </button>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
