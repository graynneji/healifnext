"use client";
import styles from "./IncomingCallModal.module.css";
import { supabase } from "@/app/_lib/supabase";
import { call } from "@/app/store/callSlice";
import { Phone, PhoneDisconnect } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function IncomingCallModal() {
  const users = useSelector((state) => state.getStoredUsers.users);
  const userId = users[0]?.user_id;
  const [incoming, setIncoming] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const sub = supabase
      .channel("calls")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_requests",
          filter: `to_user=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.status === "pending") {
            setIncoming(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [userId]);

  const acceptCall = async () => {
    try {
      // First update the call status to "accepted"
      await supabase
        .from("call_requests")
        .update({ status: "accepted" })
        .eq("id", incoming.id);

      // Give the server a moment to process the status update
      // This helps ensure the WebRTC flow starts cleanly
      setTimeout(() => {
        // Then dispatch the call action to activate the CallUI component
        dispatch(
          call({
            inCall: true,
            channel: incoming.channel,
            type: incoming.type,
            caller: incoming.from_user,
          })
        );
        setIncoming(null);
      }, 300);
    } catch (error) {
      console.error("Error accepting call:", error);
      // Show error to user
    }
  };

  const rejectCall = async () => {
    await supabase
      .from("call_requests")
      .update({ status: "rejected" })
      .eq("id", incoming.id);
    setIncoming(null);
  };

  if (!incoming) return null;

  // Get first letter of caller's name for the avatar
  const getCallerInitial = () => {
    const callerName = "Gray Ukaegbu"; // In production, use: incoming.caller_name or similar
    return callerName.charAt(0);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.callModal}>
        <div className={styles.callerImage}>
          <span className={styles.callerInitial}>{getCallerInitial()}</span>
        </div>
        <h2>Gray Ukaegbu</h2>
        <p>Incoming call</p>
        <div className={styles.callButtons}>
          <button className={styles.reject} onClick={rejectCall}>
            <PhoneDisconnect size={18} weight="fill" />
            <span>Decline</span>
          </button>
          <button className={styles.accept} onClick={acceptCall}>
            <Phone size={18} weight="fill" />
            <span>Answer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;
