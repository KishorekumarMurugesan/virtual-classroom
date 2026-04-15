import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { ref, set, onValue, remove } from "firebase/database";

function ParticipantList({ username, roomId, isTeacher }) {
  const [users, setUsers] = useState([]);
  const prev = useRef([]);

  useEffect(() => {
    if (!roomId || !username) return;

    const usersRef = ref(db, `rooms/${roomId}/participants`);

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.values(data) : [];

      if (prev.current.length < list.length) {
        const newUser = list[list.length - 1];
        if (newUser.name !== username) {
          alert(`${newUser.name} joined`);
        }
      }

      prev.current = list;
      setUsers(list);
    });
  }, [username, roomId]);

  return (
    <div className="bg-black/40 p-2 rounded">
      <h4>👥 Participants</h4>

      {users.map((u, i) => (
        <div key={i} className="flex justify-between items-center p-1">

          <p className={u.name === username ? "text-green-400" : ""}>
            {u.name} {u.name === username && "(You)"}
          </p>

          {/* 👑 Teacher Controls */}
          {isTeacher && u.name !== username && (
            <div className="flex gap-2">

              {/* MUTE */}
              <button
                onClick={() =>
                  set(
                    ref(db, `rooms/${roomId}/participants/${u.name}/mic`),
                    false
                  )
                }
                className="text-xs bg-red-500 px-2 rounded"
              >
                Mute
              </button>

              {/* CAM OFF */}
              <button
                onClick={() =>
                  set(
                    ref(db, `rooms/${roomId}/participants/${u.name}/cam`),
                    false
                  )
                }
                className="text-xs bg-yellow-500 px-2 rounded"
              >
                Cam Off
              </button>

              {/* KICK */}
              <button
                onClick={() =>
                  remove(ref(db, `rooms/${roomId}/participants/${u.name}`))
                }
                className="text-xs bg-gray-600 px-2 rounded"
              >
                Kick
              </button>

            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ParticipantList;