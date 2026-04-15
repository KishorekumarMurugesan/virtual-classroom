import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

function LiveSection({ joinRoom }) {
  const [rooms, setRooms] = useState([]);

 useEffect(() => {
  const roomsRef = ref(db, "rooms");

  const unsubscribe = onValue(roomsRef, (snapshot) => {
    const data = snapshot.val();

    const list = data
      ? Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
          participants: val.participants || {},
        }))
      : [];

    setRooms(list);
  });

  return () => unsubscribe();
}, []);

  return (
    <div className="p-4 bg-gray-800 text-white rounded space-y-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-2">🎥 Live Classes</h2>

      {rooms.length === 0 && <p>No live classes</p>}

      {rooms.map((room) => (
        <div
          key={room.id}
          className="p-3 bg-gray-700 rounded flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold">{room.name}</h3>
            <p className="text-xs text-gray-300">Room ID: {room.id}</p>
            <p className="text-sm">Teacher: {room.teacher}</p>
            <p className="text-xs">
              Participants: {Object.keys(room.participants).length}
            </p>
          </div>

          <button
            onClick={() => joinRoom(room.id)}
            className="bg-green-500 px-3 py-1 rounded"
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
}

export default LiveSection;