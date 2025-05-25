// import {useMutation, useQuery} from '@tanstack/react-query'
// import { useState, useRef, useEffect } from 'react'
// import { postVideo,getVideo } from '../lib/api.js'
// import { CirclePlus } from 'lucide-react';
// import toast from 'react-hot-toast';
// export default function ExplorePage() {
//   const [videofile, setVideofile] = useState(null);
//   const dialogRef = useRef(null);
//   const [VideosData, setVideosData] = useState([]);
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setVideofile(file);
//   };
//   const {mutate: uploadVideoMutation} = useMutation({
//     onMutate: () => {
//       toast.loading('Uploading video...', {id: "upload-video"});
//     },
//     mutationFn: postVideo,
//     onSuccess: () => {
//       toast.success('Video uploaded successfully', {id: "upload-video"});
//       setVideofile(null);
//     },
//     onError: (error) => {
//       toast.error(error.response.data.message, {id: "upload-video"});
//     },
//   });

//   const {data: videos=[]} = useQuery({
//     queryKey: ['videos'],
//     queryFn: getVideo
//   });

//   useEffect(() => {

//     console.log(videos);
//   }, [videos]);

//   const handleSubmit = () => {
//     const formData = new FormData();
//     formData.append('video', videofile);
//     uploadVideoMutation(formData);
//   };
//   const handleOpenModal = () => {
//     dialogRef.current.showModal();
//   };
//   const handleCloseModal = () => {
//     setVideofile(null);
//     dialogRef.current.close();
//   };

//   return (
//     <>
//       <div className="relative max-w-[700px] mx-auto h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hidden pb-20">
//         {videos.map((video, index) => (
//           <div
//             key={index}
//             className="flex items-center justify-center w-full h-[calc(100vh-80px)] lg:h-screen bg-black snap-start"
//           >
//             <video
//               src={video.videoUrl}
//               controls
//               className="object-contain w-full h-full"
//             />
//           </div>
//         ))}

//         {/* Floating Upload Button */}
//         <div
//           className="fixed p-3 transition transform -translate-x-1/2 bg-white rounded-full shadow-lg cursor-pointer bottom-20 left-1/2 hover:scale-105"
//           onClick={handleOpenModal}
//         >
//           <CirclePlus size={30} className="text-black" />
//         </div>
//       </div>


//       {/* Modal */}
//       <dialog id="my_modal_3" className="modal" ref={dialogRef}>
//         <div className="max-w-2xl p-6 shadow-xl modal-box rounded-3xl">
//           <form method="dialog" onSubmit={()=>{setVideofile(null);}}>
//             <button className="absolute text-gray-400 transition top-4 right-4 hover:text-gray-700" >
//               ✕
//             </button>
//           </form>

//           <h3 className="mb-4 text-2xl font-semibold ">Post a Video</h3>

//           <div className="flex items-center justify-center w-full h-64 mb-5 overflow-hidden bg-gray-100 border border-dashed rounded-xl">
//             {videofile ? (
//               <video
//                 src={URL.createObjectURL(videofile)}
//                 controls
//                 className="object-cover w-full h-full rounded-lg"
//               />
//             ) : (
//               <span className="text-gray-400">No video selected</span>
//             )}
//           </div>

//           <div className="flex justify-end gap-3">
//             <input
//               type="file"
//               className="hidden"
//               id="file"
//               accept="video/*"
//               onChange={(e) => handleFileChange(e)}
//             />

//             <button
//               className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
//               onClick={() => document.getElementById('file').click()}
//             >
//               Upload Video
//             </button>

//             <button className="px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700" onClick={handleSubmit}>
//               Post Video
//             </button>
//           </div>
//         </div>
//       </dialog>

//     </>
//   )
// }


import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { postVideo, getVideo } from '../lib/api.js';
import { CirclePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';

export default function ExplorePage() {
  const [videofile, setVideofile] = useState(null);
  const dialogRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setVideofile(file);
  };

  const { mutate: uploadVideoMutation } = useMutation({
    onMutate: () => {
      toast.loading('Uploading video...', { id: 'upload-video' });
    },
    mutationFn: postVideo,
    onSuccess: () => {
      toast.success('Video uploaded successfully', { id: 'upload-video' });
      setVideofile(null);
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response.data.message, { id: 'upload-video' });
    },
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['videos'],
    queryFn: getVideo,
  });

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('video', videofile);
    uploadVideoMutation(formData);
  };

  const handleOpenModal = () => {
    dialogRef.current.showModal();
  };

  const handleCloseModal = () => {
    dialogRef.current.close();
  };

  return (
    <>
      <div className="relative max-w-[700px] mx-auto h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hidden">
        {videos.map((video, index) => (
          <AutoPlayVideo key={index} src={video.videoUrl} />
        ))}

        <div
          className="fixed p-3 transition transform -translate-x-1/2 bg-white rounded-full shadow-lg cursor-pointer bottom-20 left-1/2 hover:scale-105"
          onClick={handleOpenModal}
        >
          <CirclePlus size={30} className="text-black" />
        </div>
      </div>

      <dialog id="my_modal_3" className="modal" ref={dialogRef}>
        <div className="max-w-2xl p-6 shadow-xl modal-box rounded-3xl">
          <form method="dialog">
            <button
              type="submit"
              className="absolute text-gray-400 transition top-4 right-4 hover:text-gray-700"
            >
              ✕
            </button>
          </form>

          <h3 className="mb-4 text-2xl font-semibold">Post a Video</h3>

          <div className="flex items-center justify-center w-full h-64 mb-5 overflow-hidden bg-gray-100 border border-dashed rounded-xl">
            {videofile ? (
              <video
                src={URL.createObjectURL(videofile)}
                controls
                className="object-cover w-full h-full rounded-lg"
              />
            ) : (
              <span className="text-gray-400">No video selected</span>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <input
              type="file"
              className="hidden"
              id="file"
              accept="video/*"
              onChange={handleFileChange}
            />

            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => document.getElementById('file').click()}
            >
              Select File
            </button>

            <button
              className="px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Post Video
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function AutoPlayVideo({ src }) {
  const { ref, inView } = useInView({
    threshold: 0.6,
  });
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center w-full h-screen bg-black snap-start"
    >
      <video
        ref={videoRef}
        src={src}
        className="object-contain w-full h-full"
        
        playsInline
        loop
        controls
      />
    </div>
  );
}
