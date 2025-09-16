"use client";
import React from "react";
import styles from "./PatientsCard.module.css";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { getPatientRecvId } from "@/app/store/getPatientRecvIdSlice";
import { getRandomColor } from "@/app/utils";

const PatientsCard = ({ name = null, image = null, type = null }) => {
  const therapistPatients = useSelector(
    (state) => state.getTherapistPatients.therapistPatients
  );

  const dispatch = useDispatch();

  const handleSelectPatient = (patientId) => {
    dispatch(getPatientRecvId(patientId));
  };
  if (image) {
    return (
      <Image
        src={image}
        alt="Therapist picture"
        className={styles.profilePic}
      />
    );
  }

  if (name) {
    return (
      <div
        className={`${type ? styles.profileResponsive : styles.profileCard}`}
      >
        <div className={styles.profileAvatar}>
          {name.charAt(0).toUpperCase()}
        </div>
        <h2 className={styles.profileName}>{name.split(" ")[0]}</h2>
      </div>
    );
  }
  return (
    <>
      {therapistPatients?.map((item, index) => (
        <div
          key={index}
          className={styles.profileCard}
          onClick={() =>
            handleSelectPatient({
              patientId: item?.patient_id,
              patientName: item?.name,
            })
          }
        >
          <div
            className={styles.profileAvatar}
            style={{
              backgroundColor: `${getRandomColor()}`,
            }}
          >
            {item?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className={styles.profileName}>{item?.name}</h2>
        </div>
      ))}
    </>
  );
};

export default PatientsCard;
