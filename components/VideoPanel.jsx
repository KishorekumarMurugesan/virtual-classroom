import { useEffect, useRef, useState, useContext } from "react";
import Peer from "peerjs";
import { onValue, ref } from "firebase/database";
import { db } from "../firebase";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { MdScreenShare, MdCallEnd } from "react-icons/md";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

function VideoPanel({ username, roomId, toggleChat, toggleUsers }) {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const videoGrid = useRef(null);
  const peers = useRef({});
  const videoElements = useRef({});
  const myStream = useRef(null);

  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  useEffect(() => {
    const peer = new Peer();

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myStream.current = stream;

        addVideo(stream, username, "me", true);

        peer.on("call", (call) => {
          if (videoElements.current[call.peer]) return;

          call.answer(stream);

          call.on("stream", (userStream) => {
            addVideo(userStream, "User", call.peer);
          });

          peers.current[call.peer] = call;
        });

        socket.on("user-connected", ({ userId, name }) => {
          if (peers.current[userId]) return;

          const call = peer.call(userId, stream);

          call.on("stream", (userStream) => {
            addVideo(userStream, name, userId);
          });

          peers.current[userId] = call;
        });

        socket.on("user-disconnected", (userId) => {
          if (videoElements.current[userId]) {
            videoElements.current[userId].remove();
            delete videoElements.current[userId];
          }

          if (peers.current[userId]) {
            peers.current[userId].close();
            delete peers.current[userId];
          }
        });
      })
      .catch(() => alert("Camera/Mic permission denied"));

    peer.on("open", (id) => {
      socket.emit("join-room", { roomId, userId: id, name: username });
    });

    function addVideo(stream, name, userId, isMe = false) {
      if (!videoGrid.current) return;
      if (videoElements.current[userId]) return;

      const video = document.createElement("video");
      const container = document.createElement("div");

      container.className =
        "relative rounded-2xl overflow-hidden bg-black shadow-lg";

      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = isMe;
      video.className = "w-full h-full object-cover";

      const label = document.createElement("div");
      label.innerText = isMe ? `${name} (You)` : name;
      label.className =
        "absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded";

      container.appendChild(video);
      container.appendChild(label);

      videoGrid.current.appendChild(container);
      videoElements.current[userId] = container;
    }

    return () => {
      socket.off("user-connected");
      socket.off("user-disconnected");
      peer.destroy();
    };
  }, [roomId, username]);

  // 🔥 Firebase control fix
  useEffect(() => {
    const userRef = ref(db, `rooms/${roomId}/participants/${username}`);

    const unsub = onValue(userRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      const video = videoElements.current["me"]?.querySelector("video");
      if (!video || !video.srcObject) return;

      const audioTrack = video.srcObject.getAudioTracks()[0];
      const videoTrack = video.srcObject.getVideoTracks()[0];

      if (audioTrack && audioTrack.enabled !== data.mic) {
        audioTrack.enabled = data.mic;
        setMic(data.mic);
      }

      if (videoTrack && videoTrack.enabled !== data.cam) {
        videoTrack.enabled = data.cam;
        setCam(data.cam);
      }
    });

    return () => unsub();
  }, [roomId, username]);

  // 🎤 MIC
  const toggleMic = () => {
    const stream = myStream.current;
    if (!stream) return;

    const track = stream.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMic(track.enabled);
  };

  // 🎥 CAMERA (FINAL FIX)
  const toggleCam = () => {
    const stream = myStream.current;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setCam(track.enabled);

    const container = videoElements.current["me"];
    if (!container) return;

    const video = container.querySelector("video");

    if (!track.enabled) {
      video.style.display = "none";

      let overlay = container.querySelector(".cam-off");

      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className =
          "cam-off absolute inset-0 flex flex-col items-center justify-center bg-black text-white";

        overlay.innerHTML = `
          <div style="
            width:60px;
            height:60px;
            border-radius:50%;
            background:#16a34a;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:24px;
            font-weight:bold;
          ">
            ${username.charAt(0).toUpperCase()}
          </div>
          <p style="margin-top:10px;">${username}</p>
          <span style="font-size:12px; opacity:0.7;">Camera Off</span>
        `;

        container.appendChild(overlay);
      }
    } else {
      video.style.display = "block";

      const overlay = container.querySelector(".cam-off");
      if (overlay) overlay.remove();
    }
  };

  // 🖥 SCREEN SHARE
  const shareScreen = async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    const videoTrack = screen.getVideoTracks()[0];

    Object.values(peers.current).forEach((peer) => {
      const sender = peer.peerConnection
        .getSenders()
        .find((s) => s.track.kind === "video");

      if (sender) sender.replaceTrack(videoTrack);
    });
  };

  // 🔴 END CALL
  const handleEndCall = () => {
    myStream.current?.getTracks().forEach((t) => t.stop());
    Object.values(peers.current).forEach((c) => c.close());

    navigate("/");

    setTimeout(() => {
      socket.disconnect();
    }, 300);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between relative">

      <div
        ref={videoGrid}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 relative z-0"
      ></div>

      <div className="flex justify-between items-center px-6 py-3 bg-black/80 relative z-50">

        <div className="flex gap-4">
          <button onClick={toggleMic}>
            {mic ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>

          <button onClick={toggleCam}>
            {cam ? <FaVideo /> : <FaVideoSlash />}
          </button>

          <button onClick={shareScreen}>
            <MdScreenShare />
          </button>
        </div>

        <button onClick={handleEndCall} className="bg-red-600 p-3 rounded-full">
          <MdCallEnd />
        </button>

        <div className="flex gap-4">
          <button onClick={toggleUsers}>👥</button>
          <button onClick={toggleChat}>💬</button>
        </div>

      </div>
    </div>
  );
}

export default VideoPanel;