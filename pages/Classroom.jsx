import VideoPanel from "../components/VideoPanel";
import ChatBox from "../components/ChatBox";
import ParticipantList from "../components/ParticipantList";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, set, remove, onValue } from "firebase/database";

function Classroom() {
  const location = useLocation();

  const username = location.state?.name || "Guest";
  const roomId = location.state?.roomId || "room1";

  const [showChat, setShowChat] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  // 🔥 Add user + detect teacher
  useEffect(() => {
    const userRef = ref(db, `rooms/${roomId}/participants/${username}`);

    set(userRef, {
      name: username,
      mic: true,
      cam: true,
      speaking: false,
    });

    // 👑 Check teacher
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snap) => {
      const data = snap.val();
      if (data?.teacher === username) {
        setIsTeacher(true);
      }
    });

    return () => remove(userRef);
  }, [username, roomId]);

  return (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">

      {/* VIDEO */}
      <div className="flex-1 relative">
        <VideoPanel
          username={username}
          roomId={roomId}
          toggleChat={() => setShowChat(!showChat)}
          toggleUsers={() => setShowUsers(!showUsers)}
        />
      </div>

      {/* PARTICIPANTS */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-black/90 transform ${
          showUsers ? "translate-x-0" : "translate-x-full"
        } transition`}
      >
        <div className="flex justify-between p-3 border-b">
          <h3>👥 Participants</h3>
          <button onClick={() => setShowUsers(false)}>❌</button>
        </div>

        <ParticipantList
          username={username}
          roomId={roomId}
          isTeacher={isTeacher}
        />
      </div>

      {/* CHAT */}
      <div
        className={`fixed bottom-20 right-6 w-[300px] h-[400px] bg-black/90 rounded-xl transform ${
          showChat ? "scale-100" : "scale-0"
        } transition`}
      >
       <ChatBox username={username} roomId={roomId} />
      </div>
    </div>
  );
}

export default Classroom;