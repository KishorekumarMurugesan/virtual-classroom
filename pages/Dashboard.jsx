import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, set } from "firebase/database";
import LiveSection from "../components/LiveSection";

function Dashboard() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // 🔥 Generate Room ID
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  // 🔥 Create Room (Teacher)
  const createRoom = () => {
    if (!name.trim()) return alert("Enter your name");

    const roomId = generateRoomId();

    const roomRef = ref(db, `rooms/${roomId}`);

    set(roomRef, {
      name: "Live Class",
      teacher: name,
      participants: {},
    });

    navigate("/classroom", {
      state: { name, roomId },
    });
  };

  // 🔥 Join existing room
  const joinRoom = (roomId) => {
    if (!name.trim()) return alert("Enter your name");

    navigate("/classroom", {
      state: { name, roomId },
    });
  };

  return (
    <div className="h-screen flex gap-6 p-6 bg-gray-900 text-white">

      {/* LEFT: LIVE SECTION */}
      <div className="w-1/3">
        <LiveSection joinRoom={joinRoom} />
      </div>

      {/* RIGHT: CREATE ROOM */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-black/40 p-6 rounded text-center space-y-4 w-[300px]">
          <h1 className="text-3xl text-green-400">Virtual Classroom</h1>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="p-2 w-full bg-gray-700 rounded"
          />

          <button
            onClick={createRoom}
            className="bg-blue-500 px-4 py-2 rounded w-full"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;