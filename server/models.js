import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
});

const messageSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  content: String,
});

const ConnectedUser = mongoose.model('ConnectedUser', userSchema);
const DbMessage = mongoose.model('DbMessage', messageSchema);
const StorMessage = mongoose.model('StorMessage', messageSchema);

export { ConnectedUser, DbMessage, StorMessage };
