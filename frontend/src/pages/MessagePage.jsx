import { useEffect, useState, useRef } from 'react';
import useAuthUser from '../hooks/useAuthUser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFriends, sendChat, getChat } from '../lib/api.js';
import { Send, X, ImagePlus } from 'lucide-react';
import dayjs from 'dayjs';
import { io } from 'socket.io-client';


export default function MessagePage() {
  const { authData } = useAuthUser();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const queryClient = useQueryClient();
  const { data: friendsData, isLoading } = useQuery({
    queryKey: ['friends', authData?.user?._id],
    queryFn: () => getFriends(authData?.user?._id),
    enabled: !!authData?.user?._id,
  });

  const {
    data: chatMessagesData = { messages: [] },
    refetch: refetchChatMessages,
    isFetching: isLoadingMessages,
  } = useQuery({
    queryKey: ['chat'],
    queryFn: () =>
      getChat({
        senderId: authData?.user?._id,
        receiverId: selectedFriend?._id,
      }),
    enabled: !!authData?.user?._id && !!selectedFriend?._id,
  });

  // Mutation to send messages
  const { mutate: sendMessage } = useMutation({
    mutationFn: sendChat,
    onSuccess: () => {
      // refetchChatMessages();
      queryClient.invalidateQueries(['chat']);
    },
  });

  useEffect(() => {
    if (!friendsData?.friends?.friends) return;
    setFriends(friendsData.friends.friends);
  }, [friendsData]);

  useEffect(() => {
    if (selectedFriend?._id) {
      // refetchChatMessages();
      queryClient.invalidateQueries(['chat']);
    }
  }, [selectedFriend]);

  // Initialize socket only once
  useEffect(() => {
    if (!authData?.user?._id || socket.current) return;

    socket.current = io(backendUrl);

    socket.current.on(`newMessage${authData.user._id}`, () => {
      // refetchChatMessages();
      queryClient.invalidateQueries(['chat']);
    });

    return () => {
      socket.current?.off(`newMessage${authData.user._id}`);
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [authData?.user?._id, backendUrl]);

  useEffect(() => {
    if (!isLoadingMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessagesData, isLoadingMessages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
  };

  const handleClickFriend = (friend) => {
    setSelectedFriend(friend);
  };

  const handleSendMessage = () => {
    if (!message && !imagePreview) return;
    if (!selectedFriend?._id || !authData?.user?._id) return;

    const newMessage = {
      senderId: authData.user._id,
      receiverId: selectedFriend._id,
      message,
      image: imagePreview,
      date: dayjs().format('YYYY-MM-DD, HH:mm:ss'),
    };

    sendMessage(newMessage);
    setMessage('');
    setImagePreview('');
  };

  if (!authData) {
    return (
      <div className="flex items-center justify-center max-w-lg min-h-screen gap-5 p-5 mx-auto font-Poppins skeleton bg-base-200">
        <span className="loading loading-dots loading-lg"></span>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden max-w-screen mx-auto lg:flex font-Poppins gap-2.5 p-5">
        <div className={`w-64 space-y-5 h-[calc(100vh-40px)] ${isLoading ? 'skeleton' : ''}`}>
          <p className="text-lg font-semibold">Messages</p>
          {friends.map((friend) => (
            <div
              onClick={() => handleClickFriend(friend)}
              key={friend._id}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg transition-colors duration-200 ${
                selectedFriend?._id === friend._id ? 'bg-base-200' : 'hover:bg-base-300'
              }`}
            >
              <img
                className="object-cover w-12 h-12 rounded-full"
                src={friend.profileImage}
                alt={friend.fullname}
              />
              <p>{friend.fullname}</p>
            </div>
          ))}
        </div>

        <div className="w-full h-[calc(100vh-40px)] space-y-2.5 bg-base-300 p-5 rounded-2xl">
          {!selectedFriend ? (
            <div className="flex items-center justify-center h-full">Select a friend</div>
          ) : (
            <>
              <div className="items-center flex gap-2.5">
                <img
                  src={selectedFriend?.profileImage}
                  alt={selectedFriend?.fullname}
                  className="object-cover w-12 h-12 rounded-full"
                />
                <p className="font-semibold">{selectedFriend?.fullname}</p>
              </div>

              {/* Messages */}
              <div
                className={`bg-base-100 rounded-2xl flex flex-col ${
                  imagePreview ? 'h-[calc(100vh-300px)]' : 'h-[calc(100vh-230px)]'
                } overflow-y-auto p-2.5`}
              >
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="loading loading-dots loading-md"></span>
                  </div>
                ) : chatMessagesData?.messages?.length > 0 ? (
                  <>
                    {chatMessagesData.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`chat ${
                          msg.id === authData.user._id ? 'chat-end' : 'chat-start'
                        }`}
                      >
                        <div className="chat-image avatar">
                          <div className="w-10 rounded-full">
                            <img
                              alt="User avatar"
                              src={
                                msg.id === authData.user._id
                                  ? authData.user.profileImage
                                  : selectedFriend.profileImage
                              }
                            />
                          </div>
                        </div>
                        <div className="chat-header">
                          {msg.senderId === authData.user._id ? 'You' : selectedFriend.fullname}
                          <time className="ml-2 text-xs opacity-50">
                            {dayjs(msg.date).format('HH:mm')}
                          </time>
                        </div>
                        <div className="chat-bubble">
                          {msg.image && <img src={msg.image} className="h-20 mb-2" />}
                          {msg.text}
                        </div>
                        <div className="opacity-50 chat-footer">Delivered</div>
                      </div>
                    ))}
                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No messages yet. Start a conversation!
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-20 h-20 mb-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-full h-full rounded-lg"
                  />
                  <button
                    onClick={removeImagePreview}
                    className="absolute p-1 text-white bg-gray-800 rounded-full top-1 right-1 hover:bg-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex h-20 items-center justify-between gap-2.5">
                  <textarea
                    className="w-full border-none resize-none textarea rounded-2xl"
                    placeholder="Send a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>

                  <div className="flex gap-2">
                    <label htmlFor="image-upload" className="btn btn-circle">
                      <ImagePlus size={20} />
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    <button
                      className="flex items-center gap-2 btn btn-soft"
                      onClick={handleSendMessage}
                    >
                      <Send />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Moblie View */}
      <div className='max-w-screen overflow-x-auto flex gap-2.5 mb-2.5 lg:hidden'>
        <div className={`flex ${isLoading ? 'skeleton' : ''}`}>
          {friends.map((friend) => (
            <div
              onClick={() => handleClickFriend(friend)}
              key={friend._id}
              className={`  flex flex-col w-20 items-center gap-3 px-4 py-2 cursor-pointer rounded-lg transition-colors duration-200 ${
                selectedFriend?._id === friend._id ? 'bg-base-200' : 'hover:bg-base-300'
              }`}
            >
              <img
                className="object-cover w-12 h-12 rounded-full"
                src={friend.profileImage}
                alt={friend.fullname}
              />
              <p  className="max-w-full text-sm text-center truncate">{friend.fullname} </p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full min-h-[100px] space-y-2.5 bg-base-300 p-4 rounded-2xl lg:hidden">
      {!selectedFriend ? (
        <div className="flex items-center justify-center h-full">Select a friend</div>
      ) : (
        <>
          <div className="flex items-center gap-2.5">
            <img
              src={selectedFriend?.profileImage}
              alt={selectedFriend?.fullname}
              className="object-cover w-10 h-10 rounded-full"
            />
            <p className="text-sm font-semibold">{selectedFriend?.fullname}</p>
          </div>

          {/* Chat Messages */}
          <div
            className={`bg-base-100 rounded-2xl flex flex-col flex-grow overflow-y-auto p-2.5 sm:h-[400px] ${imagePreview ? 'h-[250px]' : 'h-[300px]'}`}
          >
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <span className="loading loading-dots loading-md"></span>
              </div>
            ) : chatMessagesData?.messages?.length > 0 ? (
              <>
                {chatMessagesData.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat ${msg.id === authData.user._id ? 'chat-end' : 'chat-start'}`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-8 rounded-full">
                        <img
                          alt="User avatar"
                          src={
                            msg.id === authData.user._id
                              ? authData.user.profileImage
                              : selectedFriend.profileImage
                          }
                        />
                      </div>
                    </div>
                    <div className="text-xs chat-header">
                      {msg.senderId === authData.user._id ? 'You' : selectedFriend.fullname}
                      <time className="ml-1 text-xs opacity-50">
                        {dayjs(msg.date).format('HH:mm')}
                      </time>
                    </div>
                    <div className="text-sm chat-bubble">
                      {msg.image && <img src={msg.image} className="h-20 mb-2 rounded-md" />}
                      {msg.text}
                    </div>
                    <div className="chat-footer text-[10px] opacity-50">Delivered</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No messages yet. Start a conversation!
              </div>
            )}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-20 h-20 mb-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="object-cover w-full h-full rounded-lg"
              />
              <button
                onClick={removeImagePreview}
                className="absolute p-1 text-white bg-gray-800 rounded-full top-1 right-1 hover:bg-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Message Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <textarea
                className="w-full h-16 resize-none textarea textarea-bordered rounded-xl"
                placeholder="Send a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex gap-1">
                <label htmlFor="image-upload" className="btn btn-circle">
                  <ImagePlus size={20} />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSendMessage}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>

      
    </>
  );
}
