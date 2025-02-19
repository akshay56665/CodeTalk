import { useCallback, useEffect } from "react";
import { useContextProvider } from "../SocketContext";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

function SideBar() {
  const navigate = useNavigate();
  const { roomid } = useParams();
  const {
    localUserName,
    localStream,
    remoteStream,
    UserConnected,
    iceCandidates,
    socket,
    Offer,
    Answer,
    getAnswer,
    getCandidate,
    remoteTrack,
    setUserConnected,
    closeCall,
    setRemoteUserName,
  } = useContextProvider();

  // video call configurations
  const handleUserJoined = useCallback(async (name) => {
    const offer = await Offer();
    socket.emit("offer", { offer, name: localUserName });
    await iceCandidates();
    setRemoteUserName(name);
    toast(`${name} joined the meeting`, {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  }, []);

  const handleGetOffer = useCallback(async ({ offer, name }) => {
    setRemoteUserName(name);
    const answer = await Answer(offer);
    socket.emit("answer", answer);
    await iceCandidates();
  }, []);

  const handleGetAnswer = useCallback(async (answer) => {
    await getAnswer(answer);
  }, []);

  const handleGetCandidates = async (candidates) => {
    await getCandidate(candidates);
  };

  useEffect(() => {
    remoteTrack();

    socket.on("user-joined", handleUserJoined);
    socket.on("getoffer", handleGetOffer);
    socket.on("getanswer", handleGetAnswer);
    socket.on("getcandidates", handleGetCandidates);
    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("getoffer", handleGetOffer);
      socket.off("getanswer", handleGetAnswer);
      socket.off("getcandidates", handleGetCandidates);
    };
  }, [socket]);

  const onCopyRoomID = async () => {
    await navigator.clipboard.writeText(roomid);
    toast(`RoomID copied`, {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  const handleUserLeave = useCallback(() => {
    setUserConnected(false);
    closeCall();
    navigate("/");
  }, []);

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div className="m-3 flex flex-col justify-center items-center gap-2">
        <ReactPlayer
          url={localStream}
          playing
          className="bg-black "
          height={"20%"}
          width={"90%"}
        />

        {UserConnected && (
          <ReactPlayer
            url={remoteStream}
            playing
            className="bg-black "
            height={"20%"}
            width={"90%"}
          />
        )}
      </div>

      <div className="m-3 flex flex-col gap-3 text-center">
        <button
          className="inline-block rounded border border-white py-3 text-md font-semibold text-white hover:bg-gray-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
          onClick={onCopyRoomID}
        >
          Copy RoomId
        </button>
        <button
          className="inline-block rounded border border-white py-3 text-md font-semibold text-white hover:bg-red-400 hover:text-white focus:outline-none focus:ring active:bg-red-500"
          onClick={handleUserLeave}
        >
          Leave
        </button>
      </div>
    </div>
  );
}

export default SideBar;
