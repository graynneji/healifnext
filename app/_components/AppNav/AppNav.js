"use client";
import React from "react";
import styles from "./AppNav.module.css";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { Phone, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import { useDispatch, useSelector } from "react-redux";
import { call } from "@/app/store/callSlice";
import { supabase } from "@/app/_lib/supabase";
import Profile from "@/public/applicationIcon/confident-b.png";
import { useListenTypingStatus } from "@/app/hooks/useListenTypingStatus";
import ProfilePicsThera from "@/public/t.jpg";
import { capitalizeFirstLetter } from "@/app/utils";

function AppNav({ userInfo }) {
  const dispatch = useDispatch();
  const name = userInfo[0]?.name;
  const patientRecieverId = useSelector(
    (state) => state.getPatientRecvId.patientRecieverId
  );

  const userId = userInfo[0]?.user_id;
  const toUserId =
    userInfo[0]?.therapist?.therapist_id || patientRecieverId?.patientId;

  const { isTyping } = useListenTypingStatus(userId, toUserId);

  const recieversName = userInfo[0]?.therapist
    ? userInfo[0]?.therapist?.name
    : patientRecieverId?.patientName;

  // Initiate audio or video call
  const callUser = async (type = "video") => {
    const channel = uuidv4();
    await supabase.from("call_requests").insert([
      {
        from_user: userId,
        to_user: toUserId,
        type,
        status: "pending",
        channel,
      },
    ]);
    dispatch(call({ inCall: true, channel, type, caller: userId }));
  };

  return (
    <nav className={styles.navContainer}>
      <div className={styles.profileSection}>
        {!userInfo[0]?.therapist ? (
          <div className={styles.patientAvatar}>
            <div className={styles.avatarInitial}>
              {recieversName.charAt(0).toUpperCase()}
            </div>
            <div
            // className={`${styles.statusDot} ${styles[patient.status]}`}
            ></div>
          </div>
        ) : (
          <div className={styles.profileImageContainer}>
            <Image
              src={ProfilePicsThera}
              alt="Profile"
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>
            {userInfo[0]?.therapist ? "Therapy with" : "Patient"}{" "}
            <span className={styles.highlightName}>
              {capitalizeFirstLetter(recieversName)}
            </span>
          </h2>
          <p className={styles.userRole}>
            {!isTyping ? (
              `Session ${userInfo[0]?.therapist ? "Provider" : "Client"}`
            ) : (
              <span
                style={{
                  color: "green",
                }}
              >
                <i>is typing</i>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          onClick={() => callUser("video")}
          className={`${styles.callButton} ${styles.videoCall}`}
          aria-label="Start video call"
        >
          <VideoCamera size={20} weight="fill" />
        </button>

        <button
          onClick={() => callUser("audio")}
          className={`${styles.callButton} ${styles.audioCall}`}
          aria-label="Start audio call"
        >
          <Phone size={20} weight="fill" />
        </button>
      </div>
    </nav>
  );
}

export default AppNav;
