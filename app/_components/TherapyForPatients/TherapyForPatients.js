"use client";
import React, { useEffect } from "react";
import Care from "../Care/Care";
import MessageInput from "../MessageInput/MessageInput";
import styles from "./TherapyForPatients.module.css";
import AppNav from "../AppNav/AppNav";
import FooterMenu from "../FooterMenu/FooterMenu";
import { getStoredUsers } from "@/app/store/getStoredUsersSlice";
import { useDispatch } from "react-redux";

function TherapyForPatients({ userInfo }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getStoredUsers(userInfo));
  }, [userInfo, dispatch]);
  return (
    <section style={{ width: "auto" }} className={styles.appLayout}>
      <AppNav userInfo={userInfo} />
      <Care />
      <div className={styles.rare}>
        <MessageInput />
      </div>
    </section>
  );
}

export default TherapyForPatients;
