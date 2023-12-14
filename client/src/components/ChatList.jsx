// ChatList.jsx
import React from "react";

function ChatList({ usersList, onSelectChat }) {
  return (
    <div id="chat-container">
      <ul>
        {usersList.map((user) => (
          <li key={user} onClick={() => onSelectChat(user)}>
            <button>{user}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;