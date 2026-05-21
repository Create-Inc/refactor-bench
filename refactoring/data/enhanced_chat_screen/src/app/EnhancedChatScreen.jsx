import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  Camera,
  Mic,
  Star,
  Reply,
  Forward,
  Trash2,
  Copy,
  Info,
  X,
  Play,
  Pause,
  Download,
  Image as ImageIcon,
  File,
  MapPin,
  Users,
  BarChart2,
  Check,
  CheckCheck,
  Volume2,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUpload from "@/utils/useUpload";

export function EnhancedChatScreen({
  user,
  chat,
  onBack,
  onCall,
  onViewProfile,
  onViewMedia,
}) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [upload, { loading: uploading }] = useUpload();
  const scrollRef = useRef();
  const fileInputRef = useRef();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", chat.id],
    queryFn: () =>
      fetch(`/api/messages?chatId=${chat.id}`).then((res) => res.json()),
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (data) =>
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: chat.id, senderId: user.id, ...data }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", chat.id]);
      setText("");
      setReplyTo(null);
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }) =>
      fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          action: "react",
          data: { userId: user.id, emoji },
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries(["messages", chat.id]),
  });

  const starMutation = useMutation({
    mutationFn: ({ messageId, isStarred }) =>
      fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          action: "star",
          data: { isStarred },
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries(["messages", chat.id]),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ messageId, deleteForEveryone }) =>
      fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          action: "delete",
          data: { deleteForEveryone },
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries(["messages", chat.id]),
  });

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate({ content: text, replyToId: replyTo?.id });
  };

  const handleFileUpload = async (file, type) => {
    const { url, error } = await upload({ file });
    if (error) {
      alert("Upload failed");
      return;
    }
    sendMutation.mutate({
      content: file.name,
      messageType: type,
      mediaUrl: url,
    });
    setShowAttachMenu(false);
  };

  const handleVoiceRecord = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      // Simulate recording - in real app, use MediaRecorder API
    } else {
      setIsRecording(false);
      // Simulate upload
      sendMutation.mutate({
        content: "Voice message",
        messageType: "audio",
        duration: recordingTime,
      });
    }
  };

  const emojis = ["❤️", "😂", "😮", "😢", "🙏", "👍", "🎉"];

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="bg-[#128C7E] text-white p-3 flex items-center gap-2 shadow-md shrink-0">
        <ArrowLeft onClick={onBack} size={24} className="cursor-pointer" />
        <div
          onClick={() => onViewProfile?.(chat)}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0 cursor-pointer"
        >
          {chat.other_user_emoji}
        </div>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onViewProfile?.(chat)}
        >
          <h2 className="font-bold text-sm truncate">{chat.other_user_name}</h2>
          <p className="text-[10px] opacity-80">
            {chat.is_online
              ? "online"
              : `last seen ${chat.last_seen ? format(new Date(chat.last_seen), "HH:mm") : "recently"}`}
          </p>
        </div>
        <div className="flex gap-4 items-center relative">
          <Video
            size={20}
            className="cursor-pointer"
            onClick={() => onCall?.("Video")}
          />
          <Phone
            size={18}
            className="cursor-pointer"
            onClick={() => onCall?.("Voice")}
          />
          <MoreVertical
            size={20}
            className="cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="absolute top-8 right-0 bg-white text-black shadow-lg rounded-lg py-2 z-50 w-48">
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                <Users size={16} /> Group info
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                <ImageIcon size={16} /> Media
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                <Star size={16} /> Starred
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                <BarChart2 size={16} /> Disappearing messages
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-[#E5DDD5] relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='%23E5DDD5'/%3E%3Cpath d='M30 25c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0-15c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z' fill='%23DDD6CE' opacity='0.15'/%3E%3C/svg%3E")`,
        }}
      >
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            isMine={m.sender_id === user.id}
            onReact={(emoji) =>
              reactMutation.mutate({ messageId: m.id, emoji })
            }
            onReply={() => setReplyTo(m)}
            onStar={() =>
              starMutation.mutate({ messageId: m.id, isStarred: !m.is_starred })
            }
            onDelete={(forEveryone) =>
              deleteMutation.mutate({
                messageId: m.id,
                deleteForEveryone: forEveryone,
              })
            }
            onViewMedia={() => onViewMedia?.(m)}
          />
        ))}
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="bg-gray-100 p-2 border-l-4 border-[#128C7E] flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-bold text-[#128C7E]">
              {replyTo.sender_name}
            </p>
            <p className="text-sm truncate">{replyTo.content}</p>
          </div>
          <X
            size={20}
            className="cursor-pointer"
            onClick={() => setReplyTo(null)}
          />
        </div>
      )}

      {/* Voice Recording */}
      {isRecording && (
        <div className="bg-white p-3 flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <span className="flex-1 font-mono">
            {Math.floor(recordingTime / 60)}:
            {(recordingTime % 60).toString().padStart(2, "0")}
          </span>
          <button
            onClick={handleVoiceRecord}
            className="px-4 py-2 bg-[#128C7E] text-white rounded-full"
          >
            Send
          </button>
          <button
            onClick={() => {
              setIsRecording(false);
              setRecordingTime(0);
            }}
            className="text-red-600"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      {!isRecording && (
        <div className="p-2 bg-[#F0F0F0] flex items-center gap-2 shrink-0 relative">
          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-1 gap-2 shadow-sm">
            <Smile
              size={24}
              className="text-gray-400 cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            <input
              type="text"
              placeholder="Message"
              className="flex-1 bg-transparent outline-none py-2 text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <div className="relative">
              <Paperclip
                size={20}
                className="text-gray-400 cursor-pointer -rotate-45"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
              />
              {showAttachMenu && (
                <div className="absolute bottom-12 right-0 bg-white shadow-2xl rounded-2xl p-4 z-50 w-64">
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-[#7F66FF] rounded-full flex items-center justify-center text-white">
                        <File size={24} />
                      </div>
                      <span className="text-xs">Document</span>
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.setAttribute("accept", "image/*");
                        fileInputRef.current?.click();
                      }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-[#F02475] rounded-full flex items-center justify-center text-white">
                        <ImageIcon size={24} />
                      </div>
                      <span className="text-xs">Photos</span>
                    </button>
                    <button
                      onClick={() =>
                        sendMutation.mutate({
                          content: "Location shared",
                          messageType: "location",
                          mediaUrl: "https://maps.google.com",
                        })
                      }
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-[#1DA457] rounded-full flex items-center justify-center text-white">
                        <MapPin size={24} />
                      </div>
                      <span className="text-xs">Location</span>
                    </button>
                    <button
                      onClick={() =>
                        sendMutation.mutate({
                          content: "Contact shared",
                          messageType: "contact",
                        })
                      }
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-[#0492C7] rounded-full flex items-center justify-center text-white">
                        <Users size={24} />
                      </div>
                      <span className="text-xs">Contact</span>
                    </button>
                    <button
                      onClick={() =>
                        sendMutation.mutate({
                          content:
                            "📊 What's your favorite color?\n🔵 Blue\n🔴 Red\n🟢 Green",
                          messageType: "poll",
                        })
                      }
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-[#FFA500] rounded-full flex items-center justify-center text-white">
                        <BarChart2 size={24} />
                      </div>
                      <span className="text-xs">Poll</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] &&
                handleFileUpload(e.target.files[0], "document")
              }
            />
          </div>
          <button
            onClick={text.trim() ? handleSend : handleVoiceRecord}
            className="w-12 h-12 bg-[#128C7E] rounded-full flex items-center justify-center text-white shadow-lg shrink-0"
          >
            {text.trim() ? <Send size={20} /> : <Mic size={20} />}
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 bg-white shadow-2xl rounded-2xl p-4 z-50">
              <div className="grid grid-cols-8 gap-2">
                {[
                  "😊",
                  "😂",
                  "😍",
                  "😭",
                  "😡",
                  "👍",
                  "👏",
                  "🙏",
                  "❤️",
                  "🎉",
                  "🔥",
                  "💯",
                  "😎",
                  "🤔",
                  "😴",
                  "🤗",
                  "😜",
                  "😇",
                  "🥳",
                  "😱",
                  "🤩",
                  "😋",
                  "🤪",
                  "😷",
                ].map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setText(text + e);
                      setShowEmojiPicker(false);
                    }}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(showMenu || showAttachMenu || showEmojiPicker) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowMenu(false);
            setShowAttachMenu(false);
            setShowEmojiPicker(false);
          }}
        />
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isMine,
  onReact,
  onReply,
  onStar,
  onDelete,
  onViewMedia,
}) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const emojis = ["❤️", "😂", "😮", "😢", "🙏", "👍", "🎉"];

  if (message.is_deleted) {
    return (
      <div className={`max-w-[80%] ${isMine ? "self-end" : "self-start"}`}>
        <div className="bg-white/50 p-2 rounded-lg text-xs italic text-gray-400 flex items-center gap-2">
          <Info size={12} /> This message was deleted
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (message.message_type === "image") {
      return (
        <img
          src={message.media_url}
          alt=""
          className="max-w-full rounded-lg cursor-pointer"
          onClick={() => onViewMedia?.(message)}
        />
      );
    }
    if (message.message_type === "video") {
      return (
        <video
          src={message.media_url}
          controls
          className="max-w-full rounded-lg"
        />
      );
    }
    if (message.message_type === "audio") {
      return (
        <AudioPlayer url={message.media_url} duration={message.duration} />
      );
    }
    if (message.message_type === "document") {
      return (
        <div className="flex items-center gap-3 p-2 bg-white/20 rounded">
          <File size={32} className="text-gray-600" />
          <div className="flex-1">
            <p className="font-semibold text-sm">{message.content}</p>
            <p className="text-xs text-gray-500">PDF Document</p>
          </div>
          <Download size={20} className="cursor-pointer" />
        </div>
      );
    }
    if (message.message_type === "location") {
      return (
        <div className="flex flex-col gap-2">
          <div className="w-full h-32 bg-gray-300 rounded-lg flex items-center justify-center">
            <MapPin size={32} className="text-gray-600" />
          </div>
          <p className="text-sm">Location shared</p>
        </div>
      );
    }
    if (message.message_type === "contact") {
      return (
        <div className="flex items-center gap-3 p-2 bg-white/20 rounded">
          <Users size={32} className="text-gray-600" />
          <div>
            <p className="font-semibold">Contact</p>
            <p className="text-xs text-gray-500">+234 123 456 7890</p>
          </div>
        </div>
      );
    }
    if (message.message_type === "poll") {
      const lines = message.content.split("\n");
      return (
        <div className="space-y-2">
          <p className="font-semibold">{lines[0]}</p>
          {lines.slice(1).map((opt, i) => (
            <button
              key={i}
              className="w-full p-2 bg-white/20 rounded text-left hover:bg-white/30"
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }
    return <p className="pr-12">{message.content}</p>;
  };

  return (
    <div
      className={`max-w-[80%] ${isMine ? "self-end" : "self-start"} relative group`}
    >
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setShowActions(true);
        }}
        className={`p-2 rounded-lg text-sm relative shadow-sm ${isMine ? "bg-[#DCF8C6] rounded-tr-none" : "bg-white rounded-tl-none"}`}
      >
        {message.reply_to_content && (
          <div className="mb-2 p-2 bg-black/10 rounded border-l-2 border-[#128C7E]">
            <p className="text-xs font-semibold text-[#128C7E]">
              {message.reply_to_sender_name}
            </p>
            <p className="text-xs truncate">{message.reply_to_content}</p>
          </div>
        )}
        {renderContent()}
        <div className="text-[9px] text-gray-400 absolute bottom-1 right-2 flex items-center gap-1">
          {message.is_starred && (
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
          )}
          {message.edited && <span className="text-[8px]">edited</span>}
          {format(new Date(message.created_at), "HH:mm")}
          {isMine &&
            (message.is_read ? (
              <CheckCheck size={12} className="text-[#53BDEB]" />
            ) : (
              <Check size={12} className="text-gray-400" />
            ))}
        </div>
      </div>

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="absolute -bottom-2 right-2 bg-white rounded-full shadow-md px-2 py-0.5 flex gap-1 text-sm">
          {message.reactions.slice(0, 3).map((r, i) => (
            <span key={i}>{r.emoji}</span>
          ))}
          {message.reactions.length > 3 && (
            <span className="text-xs text-gray-500">
              +{message.reactions.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Quick reaction on hover */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 bg-white rounded-full shadow-lg p-1 transition-opacity"
      >
        <Smile size={16} className="text-gray-600" />
      </button>
      {showReactions && (
        <div className="absolute -top-12 right-0 bg-white shadow-2xl rounded-full px-3 py-2 flex gap-2 z-50">
          {emojis.map((e) => (
            <button
              key={e}
              onClick={() => {
                onReact(e);
                setShowReactions(false);
              }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Action menu */}
      {showActions && (
        <div className="absolute top-0 right-0 bg-white shadow-2xl rounded-lg p-2 z-50 w-48">
          <button
            onClick={() => {
              onReply();
              setShowActions(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3"
          >
            <Reply size={16} /> Reply
          </button>
          <button
            onClick={() => {
              onStar();
              setShowActions(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3"
          >
            <Star size={16} /> {message.is_starred ? "Unstar" : "Star"}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(message.content)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3"
          >
            <Copy size={16} /> Copy
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3">
            <Forward size={16} /> Forward
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3">
            <Info size={16} /> Info
          </button>
          {isMine && (
            <button
              onClick={() => {
                onDelete(true);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3 text-red-600"
            >
              <Trash2 size={16} /> Delete for everyone
            </button>
          )}
          <button
            onClick={() => {
              onDelete(false);
              setShowActions(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3 text-red-600"
          >
            <Trash2 size={16} /> Delete for me
          </button>
        </div>
      )}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActions(false)}
        />
      )}
      {showReactions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowReactions(false)}
        />
      )}
    </div>
  );
}

function AudioPlayer({ url, duration }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <button
        onClick={() => setPlaying(!playing)}
        className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center"
      >
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="w-full h-1 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#128C7E]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs">{duration}s</span>
      </div>
      <Volume2 size={18} className="text-gray-600" />
    </div>
  );
}
