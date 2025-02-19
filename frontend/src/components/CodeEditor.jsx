import { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { useContextProvider } from "../SocketContext";
import { dracula } from "@uiw/codemirror-theme-dracula";
import toast from "react-hot-toast";

function CodeEditor({ roomid }) {
  const [value, setValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const { socket, UserConnected, remoteUserName, localUserName } =
    useContextProvider();

  const languages = [
    { id: 1, name: "JavaScript", value: "Javascript", extension: javascript },
    { id: 2, name: "Python", value: "Python", extension: python },
    { id: 3, name: "Java", value: "Java", extension: java },
    { id: 4, name: "Cpp", value: "Cpp", extension: cpp },
  ];

  const handleLanguageChange = useCallback((lang) => {
    setSelectedLanguage(lang.value);
    setIsDropdownOpen(false);
    socket.emit("language-change", {
      language: lang.value,
      roomid,
    });
  }, []);

  const getLanguageExtension = useCallback(() => {
    const language = languages.find((lang) => lang.value === selectedLanguage);
    return language ? [language.extension()] : [javascript()];
  }, [selectedLanguage]);

  const handleCodeChange = useCallback((value) => {
    setValue(value);
    socket.emit("code-change", {
      roomid,
      code: value,
    });
  }, []);

  const handleUserName = (name) => {
    toast(`User: ${name} `, {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  const recieveCodeChange = (code) => {
    setValue(code);
  };

  const recieveLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const onUserJoin = () => {
    socket.emit("sync-code", {
      roomid,
      code: value,
      language: selectedLanguage,
    });
  };

  const getSyncCode = useCallback(
    ({ code, language }) => {
      setValue(code);
      setSelectedLanguage(language);
    },
    [value, selectedLanguage]
  );

  useEffect(() => {
    socket.on("code-change", recieveCodeChange);
    socket.on("language-change", recieveLanguageChange);
    socket.on("user-joined", onUserJoin);
    socket.on("sync-code", getSyncCode);

    return () => {
      socket.off("code-change", recieveCodeChange);
      socket.off("language-change", recieveLanguageChange);
      socket.off("user-joined-", onUserJoin);
      socket.off("sync-code", getSyncCode);
    };
  }, [value]);

  return (
    <div className="relative flex-col ">
      <nav className="absolute top-4 right-4 z-50 ">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="button"
        >
          {selectedLanguage}
          <svg
            className="w-2.5 h-2.5 ms-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              {languages.map((lang) => (
                <li key={lang.id}>
                  <button
                    onClick={() => handleLanguageChange(lang)}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left"
                  >
                    {lang.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex gap-1">
          <div
            onClick={() => handleUserName(localUserName)}
            className="flex justify-center items-center bg-gray-700 text-neutral-content h-12 w-12 rounded-full"
          >
            <span>
              <b>{localUserName.toUpperCase()[0]}</b>
            </span>
          </div>
          {UserConnected && (
            <div
              onClick={() => handleUserName(remoteUserName)}
              className="flex justify-center items-center bg-gray-700 text-neutral-content h-12 w-12 rounded-full"
            >
              <span>
                <b>{remoteUserName.toUpperCase()[0]}</b>
              </span>
            </div>
          )}
        </div>
      </nav>

      <CodeMirror
        value={value}
        height="100vh"
        theme={dracula}
        extensions={getLanguageExtension()}
        onChange={handleCodeChange}
      />
    </div>
  );
}

export default CodeEditor;
