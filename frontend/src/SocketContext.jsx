import { createContext, useState, useContext } from "react";
import { io } from "socket.io-client";

const server = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun.l.google.com:5349"],
    },
  ],
};

const SocketContext = createContext(null);
const socket = io(import.meta.env.VITE_BACKEND_URL);

export const useContextProvider = () => {
  return useContext(SocketContext);
};

// step 1: create new RTCpeerconnection
var peerconnection = new RTCPeerConnection(server);

export const ContextProvider = ({ children }) => {
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [UserConnected, setUserConnected] = useState(false);
  const [remoteUserName, setRemoteUserName] = useState("");
  const [localUserName, setLocalUserName] = useState("");

  // to initialize media
  const initialize = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    setTracks(stream);
  };

  // At sender side
  let Offer = async () => {
    // creating an offer for receiver
    let offer = await peerconnection.createOffer();
    await peerconnection.setLocalDescription(offer);
    return offer;
  };

  // At reciever side
  const Answer = async (offer) => {
    // set offer in remote description
    await peerconnection.setRemoteDescription(offer);

    // create answer and set local description
    const answer = await peerconnection.createAnswer();
    await peerconnection.setLocalDescription(answer);

    return answer;
  };

  const getAnswer = async (answer) => {
    await peerconnection.setRemoteDescription(answer);
  };

  const iceCandidates = () => {
    peerconnection.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("candidates", e.candidate);
      }
    };
  };

  const getCandidate = async (candidate) => {
    await peerconnection.addIceCandidate(candidate);
  };

  const remoteTrack = () => {
    peerconnection.ontrack = (e) => {
      setUserConnected(true);
      setRemoteStream(e.streams[0]);
    };
  };

  const setTracks = (stream) => {
    stream.getTracks().forEach((track) => {
      peerconnection.addTrack(track, stream);
    });
  };

  const closeCall = () => {
    peerconnection.close();
    peerconnection = null;
    peerconnection = new RTCPeerConnection(server);
  };

  return (
    <SocketContext.Provider
      value={{
        closeCall,
        localUserName,
        setLocalUserName,
        remoteUserName,
        setRemoteUserName,
        setUserConnected,
        setLocalStream,
        UserConnected,
        initialize,
        socket,
        localStream,
        Offer,
        Answer,
        getAnswer,
        iceCandidates,
        getCandidate,
        remoteTrack,
        remoteStream,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
