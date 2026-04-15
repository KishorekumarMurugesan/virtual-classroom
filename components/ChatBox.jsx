import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { ref, push, onValue } from "firebase/database";

function ChatBox({ username, roomId }) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef();

  useEffect(() => {
    const chatRef = ref(db, "messages/" + roomId);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.values(data) : [];
      setMessages(list);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  const send = () => {
    if (!msg.trim()) return;

    push(ref(db, "messages/" + roomId), {
      user: username,
      text: msg,
      time: Date.now(),
    });

    setMsg("");
  };

  return (
    <div className="flex flex-col h-full p-2">

      <h4 className="text-center">💬 Chat</h4>

      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.user === username ? "bg-green-600 text-right" : "bg-gray-700"}`}>
            <p><b>{m.user}</b>: {m.text}</p>
            <span className="text-xs">
              {new Date(m.time).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="flex">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1 p-2 bg-gray-800"
        />
        <button onClick={send} className="bg-green-500 px-3">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;