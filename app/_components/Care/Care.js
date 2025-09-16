"use client";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState, useTransition, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStoredUsers } from "../../store/getStoredUsersSlice";
import { getTherapistPatients } from "@/app/store/getTherapistPatientsSlice";
import { supabase } from "../../_lib/supabase";
import Header from "../Header/Header";
import Nav from "../Nav/Nav";
import styles from "./Care.module.css";
import { useRealTime } from "../../hooks/useRealTime";
import { formatTime } from "@/app/utils";

export default function Care() {
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const dispatch = useDispatch();

  const patientRecieverId = useSelector(
    (state) => state.getPatientRecvId.patientRecieverId
  );
  const users = useSelector((state) => state.getStoredUsers.users);
  const userId = users[0]?.user_id;
  // useEffect(() => {
  //   dispatch(getStoredUsers(userInfo));
  // }, [userInfo, dispatch]);

  const recieverId = users[0]?.therapist
    ? users[0]?.therapist?.therapist_id
    : patientRecieverId?.patientId;

  const messages = useRealTime(userId, recieverId);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // const formatTime = (timestamp) => {
  //   if (!timestamp) return "";
  //   const date = new Date(timestamp);
  //   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  // };

  const isToday = (timestamp) => {
    if (!timestamp) return false;
    const today = new Date();
    const messageDate = new Date(timestamp);
    return (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    );
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages?.forEach((msg) => {
      const date = msg.created_at
        ? new Date(msg.created_at).toLocaleDateString()
        : "Unknown Date";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className={styles.careContainer}>
      <div className={styles.chatWrapper}>
        <div className={styles.chatContent} ref={chatContainerRef}>
          {Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className={styles.dateGroup}>
              <div className={styles.dateHeader}>
                <span className={styles.dateLabel}>
                  {isToday(msgs[0]?.created_at) ? "Today" : date}
                </span>
              </div>

              {msgs.map((msg) => {
                const isSender = msg.sender_id === userId;

                return (
                  <div
                    key={msg.id}
                    className={`${styles.messageRow} ${
                      isSender ? styles.senderRow : styles.receiverRow
                    }`}
                  >
                    <div
                      className={`${styles.messageBubble} ${
                        isSender ? styles.senderBubble : styles.receiverBubble
                      }`}
                    >
                      <div className={styles.messageText}>{msg.message}</div>
                      <div
                        className={`${styles.messageTime} ${
                          isSender ? styles.senderTime : styles.receiverTime
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}
