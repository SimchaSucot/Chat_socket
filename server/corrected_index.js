import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

import mongoose from "mongoose";
import { ConnectedUser, DbMessage, StorMessage } from "./models.js";

const uri =
  "mongodb+srv://simchasucot:eatKvML35vd5jLpV@cluster0.hq44p4s.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri);
const app = express();
const server = createServer(app);
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://simchasucot.github.io"],
    methods: ["GET", "POST"],
  },
});

const connectedUsers = ConnectedUser.find();
let dbMessages = DbMessage.find();
let storMessages = StorMessage.find();

function getMessage(sender, recipientName, message) {
  const recipientSocketId = connectedUsers.get(recipientName);
  io.to(recipientSocketId).emit("get private message", {
    senderName: sender,
    message: message,
  });
  console.log(`get private from ${sender} to ${recipientName}`);

  // Update recipient's messages
  if (!dbMessages.has(recipientName)) {
    dbMessages.set(recipientName, new Map());
  }

  const dbRecipient = dbMessages.get(recipientName);
  if (!dbRecipient.has(sender)) {
    dbRecipient.set(sender, []);
  }
  dbRecipient.get(sender).push({ other: message });
}

// Handle new socket connections
io.on("connection", (socket) => {
  // Handle user joining

  socket.on("join", async (username) => {
    try {
      console.log(`${socket.id} joined with username: ${username}`);
      // Example of using async/await with Mongoose model
      // This should be adapted to your specific logic
      let user = await ConnectedUser.findOne({ username: username });
      if (!user) {
        user = await ConnectedUser.create({ username: username });
      }
      // Add more logic here as per your application's requirements
    } catch (error) {
      console.error("Error in join event:", error);
    }
    connectedUsers.set(username, socket.id);

    if (dbMessages.has(username)) {
      const dbUser = await dbMessages.get(username);
      const listChats = Array.from(dbUser.keys());
      io.to(socket.id).emit("list chats", listChats);
      socket.join(username);
      dbUser.forEach((array, key) => {
        array.forEach((obj) => {
          Object.entries(obj).forEach(([sndr, msg]) => {
            let senderName = sndr === "me" ? "you" : key;
            io.to(socket.id).emit("get private message", {
              senderName: senderName,
              message: msg,
            });
          });
        });
      });
    } else {
      await dbMessages.set(username, new Map());
    }
    console.log(dbMessages, "test 1 db"); ////////////////////////////////////////////////////

    if (await storMessages.has(username)) {
      let stor = await storMessages.get(username);
      for (let msg of stor) {
        getMessage(msg.sender, username, msg.message);
      }
      await storMessages.delete(username);
    }
  });

  // Handle private message sending
  socket.on("send private message", async({ recipientName, message }) => {
    const sender = getKeyByValue(connectedUsers, socket.id);
    const recipientSocketId = connectedUsers.get(recipientName);

    console.log(`from ${sender} to ${recipientName}: ${message}`); ////////////////////////////

    // Update sender's messages
    if (!(await dbMessages.has(sender))) {
      await dbMessages.set(sender, new Map());
    }

    const dbSender = dbMessages.get(sender);
    if (!(await dbSender.has(recipientName))) {
      await dbSender.set(recipientName, []);
    }
    await dbSender.get(recipientName).push({ me: message });

    // Send the message to the recipient if online
    if (recipientSocketId) {
      getMessage(sender, recipientName, message);
    }
    // If recipient is offline, store the message to send later
    else {
      if (!(await storMessages.has(recipientName))) {
        await storMessages.set(recipientName, []);
      }
      await storMessages.get(recipientName).push({
        sender: sender,
        message: message,
      });
    }
    console.log(storMessages, "test 2 stor"); //////////////////////////////////////////////////
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const disconnectedUser = getKeyByValue(connectedUsers, socket.id);
    connectedUsers.delete(disconnectedUser);
    if (disconnectedUser) {
      console.log(
        `${socket.id} disconnected. Removed user: ${disconnectedUser}`
      );
      io.emit("user disconnected", disconnectedUser);
    }
  });
});

// Utility function to get a key from a Map by its value
function getKeyByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
}

server.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
