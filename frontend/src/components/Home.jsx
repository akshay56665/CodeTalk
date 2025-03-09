import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import { useContextProvider } from "../SocketContext";

function Home() {
  const { socket, initialize, setLocalUserName } = useContextProvider();
  const [roomid, setRoomid] = useState();
  const [name, setName] = useState();
  const navigate = useNavigate();

  const GenerateRandomRoomId = () => {
    const id = uuidV4();
    setRoomid(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomid || !name) {
      toast.error("All fields are mandatory");
      return;
    }

    socket.emit("join", { name, roomid });
    setLocalUserName(name);
    navigate(`/editor/${roomid}`, {
      state: {
        roomid: roomid,
      },
    });
  };

  useEffect(() => {
    initialize();
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className=" p-5">
          <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
            Let's Join together
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-2xl sm:p-6 lg:p-8"
          >
            <div className="relative">
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-md"
                placeholder="John doe"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>

            <div className="relative">
              <input
                type="text"
                id="roomid"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-md"
                placeholder="Enter RoomID"
                onChange={(e) => setRoomid(e.target.value)}
                value={roomid}
              />
            </div>

            <button
              type="submit"
              className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
            >
              Join
            </button>

            <p className="text-center text-sm text-gray-500">
              If don't have any invite then create{" "}
              <Link className="underline" onClick={GenerateRandomRoomId}>
                new room
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
