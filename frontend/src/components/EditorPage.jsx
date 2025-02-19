import React from "react";
import SideBar from "./SideBar";
import { useLocation } from "react-router-dom";
import CodeEditor from "./CodeEditor";

function EditorPage() {
  const location = useLocation();
  return (
    <div className="bg-gray-900 min-h-screen flex md:flex-row flex-col">
      <div className="w-full h-1/2 md:w-3/4 text-white">
        <CodeEditor roomid={location.state.roomid} />
      </div>
      <div className="md:block hidden h-1/2 w-full md:w-1/4 text-white">
        <SideBar />
      </div>
    </div>
  );
}

export default EditorPage;
