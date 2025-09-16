import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  typingStatus: {}, // { userId: true/false }
  unreadCount: {}, // { userId: number }
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages(state, action) {
      state.messages = action.payload;
    },
    addMessage(state, action) {
      const msg = action.payload;
      state.messages.push(msg);
      if (!msg.read) {
        state.unreadCount[msg.sender_id] =
          (state.unreadCount[msg.sender_id] || 0) + 1;
      }
    },
    markMessagesRead(state, action) {
      const senderId = action.payload;
      state.messages = state.messages.map((msg) =>
        msg.sender_id === senderId ? { ...msg, read: true } : msg
      );
      state.unreadCount[senderId] = 0;
    },
    setTyping(state, action) {
      const { userId, isTyping } = action.payload;
      state.typingStatus[userId] = isTyping;
    },
  },
});

export const { setMessages, addMessage, markMessagesRead, setTyping } =
  chatSlice.actions;
export default chatSlice.reducer;
