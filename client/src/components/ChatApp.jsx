import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import UserInput from "./UserInput";

// const socket = io("http://localhost:5000");
const socket = io("https://chat-socket-server-vw3k.onrender.com");

function ChatApp() {
  const [username, setUsername] = useState("");
  const [chatsList, setChatsList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log("Received Messages:", messages); //////////////////////////////////////////////
    // Listen for private messages
    socket.on("get private message", ({ senderName: senderName, message }) => {
      const newMessage = { senderName: senderName, message };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      if (!chatsList.includes(senderName)) {
        setChatsList([...chatsList, senderName]);
      }
    });

    // Listen for the list of chats
    socket.on("list chats", (list) => {
      setChatsList(list);
    });

    // Cleanup socket listeners on component unmount
    return () => {
      socket.off("get private message");
      socket.off("list chats");
    };
  }, [messages]);

  const handleUsernameSubmit = (userName) => {
    setUsername(userName);
    socket.emit("join", userName);
    console.log(`update new user ${userName}`); ///////////////////////
  };

  const sendMessage = (message) => {
    socket.emit("send private message", {
      recipientName: selectedChat,
      message,
    });

    if (!chatsList.includes(selectedChat)) {
      setChatsList([...chatsList, selectedChat]);
    }

    const newMessage = { senderName: username, message };
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Updated Messages:", updatedMessages);
      return updatedMessages;
    });
  };

  return (
    <div className="container">
      <div id="left-sidebar">
        {username === "" && (
          <UserInput
            label="Register to the system"
            placeholder="Type your name..."
            onSubmit={handleUsernameSubmit}
          />
        )}
        {username !== "" && (
          <UserInput
            label="Open a new chat"
            placeholder="Send to..."
            onSubmit={(name) => setSelectedChat(name)}
          />
        )}
        <h3>Chats</h3>
        <div id="chat-container">
          <ul>
            {chatsList.map((chat) => (
              <li key={chat} onClick={() => setSelectedChat(chat)}>
                <button>{chat}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="right-content">
        <div id="messages-container">
          <h2>Chatting as {username}</h2>
          {selectedChat ? <h3>Selected Chat: {selectedChat} </h3> : ""}
          <div id="chat-messages">
            <ul>
              {messages.map((msg, index) => (
                <li
                  key={index}
                  className={msg.senderName === username ? "me" : "others"}
                >
                  {msg.senderName !== username && (
                    <strong>{msg.senderName}: </strong>
                  )}
                  {msg.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {selectedChat !== null && (
          <UserInput
            placeholder="Type your message..."
            onSubmit={sendMessage}
          />
        )}
      </div>
    </div>
  );
}

export default ChatApp;
