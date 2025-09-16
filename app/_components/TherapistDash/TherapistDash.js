"use client";
import React, { useEffect } from "react";
import Care from "../Care/Care";
import MessageInput from "../MessageInput/MessageInput";
import AppNav from "../AppNav/AppNav";
import styles from "./TherapistDash.module.css";
import FooterMenu from "../FooterMenu/FooterMenu";
import { useSelector, useDispatch } from "react-redux";
import { getTherapistPatients } from "@/app/store/getTherapistPatientsSlice";
import Image from "next/image";
import Logo from "@/public/Company Logo.svg";
import Button from "../Button/Button";
import Welcome from "../Welcome/Welcome";
import { getStoredUsers } from "@/app/store/getStoredUsersSlice";
function TherapistDash({ userInfo, patientsTherapist }) {
  const dispatch = useDispatch();
  const patientRecieverId = useSelector(
    (state) => state.getPatientRecvId.patientRecieverId
  );
  useEffect(() => {
    dispatch(getTherapistPatients(patientsTherapist));
  }, [patientsTherapist, dispatch]);

  useEffect(() => {
    dispatch(getStoredUsers(userInfo));
  }, [userInfo, dispatch]);

  if (Object.keys(patientRecieverId).length === 0) {
    return (
      <>
        <Welcome />;
      </>
    );
  }
  return (
    <section style={{ width: "auto" }} className={styles.appLayout}>
      <AppNav userInfo={userInfo} />
      <Care />
      <div className={styles.rare}>
        <MessageInput patientsTherapist={patientsTherapist} />
      </div>
    </section>
  );
}

export default TherapistDash;
