"use client";
import { useEffect, useState, useTransition } from "react";
import {
  Calendar,
  Clock,
  Plus,
  X,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
import styles from "./PatientFullProfile.module.css";
import QuestionaireModal from "../QuestionaireModal/QuestionaireModal";
import { useSearchParams } from "next/navigation";
import AddNotes from "../AddNotes/AddNotes";
import { getNote, getQuestionaire } from "@/app/_lib/data-services";
import { formatNoteDate } from "@/app/utils";

export default function PatientFullProfile() {
  // Sample patient data

  const [patient, setPatient] = useState({
    name: "Sarah Johnson",
    age: 32,
    appointment: {
      date: "May 5, 2025",
      time: "10:30 AM",
      type: "Regular Session",
    },

    intakeResponses: [
      {
        question: "What brings you to therapy at this time?",
        answer:
          "I've been experiencing increasing anxiety about work and having trouble sleeping. I feel overwhelmed by deadlines and expectations.",
      },
      {
        question: "Have you been in therapy before?",
        answer: "Yes, briefly about 3 years ago for 6 months.",
      },
      {
        question: "How would you rate your current stress level (1-10)?",
        answer: "8",
      },
      {
        question: "What are your goals for therapy?",
        answer:
          "I want to develop better coping mechanisms for stress and improve my work-life balance.",
      },
      {
        question: "Do you have any concerns about starting therapy?",
        answer:
          "I'm worried about opening up and being vulnerable with someone new.",
      },
    ],
  });

  // State for new note
  const [newNote, setNewNote] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [questionnaireVisible, setQuestionnaireVisible] = useState(false);
  const [questionnaire, setQuestionnaire] = useState([]);
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const patientName = searchParams.get("name") || "";
  const filteredName = patientName.replace(/[^a-zA-Z0-9]/g, " ");
  const [notes, setNotes] = useState([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchNotes() {
      const data = await getNote(patientId);
      console.log(data);
      if (data?.notes) {
        setNotes(data?.notes || []);
      }
    }
    fetchNotes();
  }, [newNote, patientId]);

  // Delete note
  // const deleteNote = (id) => {
  //   setPatient({
  //     ...patient,
  //     notes: patient.notes.filter((note) => note.id !== id),
  //   });
  // };

  const handleQuestionaire = async (id) => {
    startTransition(async () => {
      const data = await getQuestionaire(id);

      setQuestionnaire(JSON.parse(data[0]?.selected));
      setQuestionnaireVisible(true);
    });
  };

  return (
    <div className={styles.container}>
      {/* Main Container */}
      <div className={styles.mainWrapper}>
        {/* Header with brand styling */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Patient history</h1>
          <button
            onClick={() => handleQuestionaire(patientId)}
            // onClick={() => setQuestionnaireVisible(true)}
            className={styles.viewIntakeBtn}
          >
            <FileText size={18} className={styles.icon} />
            {isPending ? "loading... " : "Questionaire"}
          </button>
        </div>

        {/* Profile Content */}
        <div className={styles.profileContent}>
          {/* Patient Basic Info */}
          <div className={styles.basicInfo}>
            <h2 className={styles.patientName}>{filteredName}</h2>
            <p className={styles.subscribed}>Subscribed</p>
          </div>

          {/* Upcoming Appointment */}
          <div className={styles.appointmentSection}>
            <h3 className={styles.sectionTitle}>Upcoming Appointment</h3>
            <div className={styles.appointmentCard}>
              <div className={styles.appointmentIcon}>
                <Calendar size={20} />
              </div>
              <div className={styles.appointmentDetails}>
                <div className={styles.appointmentType}>
                  {patient.appointment.type}
                </div>
                <div className={styles.appointmentDate}>
                  {patient.appointment.date}
                </div>
              </div>
              <div className={styles.appointmentTime}>
                <Clock size={16} className={styles.timeIcon} />
                <span>{patient.appointment.time}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className={styles.notesSection}>
            <div className={styles.notesHeader}>
              <h3 className={styles.sectionTitle}>Patient Notes</h3>
              <button
                onClick={() => setFormVisible(true)}
                className={styles.addNoteBtn}
              >
                <Plus size={18} className={styles.icon} />
                Add Note
              </button>
            </div>

            {/* Notes Grid */}
            <div className={styles.notesGrid}>
              {/* {patient.notes.map((note) => ( */}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`${styles.noteCard} ${note.color}`}
                  style={{
                    backgroundColor: `${note?.color ? note?.color : "#dbeafe"}`,
                  }}
                >
                  {/* <button
                    onClick={() => deleteNote(note.id)}
                    className={styles.deleteNoteBtn}
                  >
                    <X size={16} />
                  </button> */}
                  <p className={styles.noteText}>{note?.text}</p>
                  <p className={styles.noteDate}>
                    {/* 12/04/2035 4:00pm */}
                    {note?.timestamp
                      ? formatNoteDate(note?.timestamp)
                      : "No timestamp"}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Note Form */}
            {formVisible && (
              <AddNotes
                setFormVisible={setFormVisible}
                setNewNote={setNewNote}
                newNote={newNote}
                patientId={patientId}
              />
            )}
          </div>

          {/* Questionaire Modal */}
          <QuestionaireModal
            setQuestionnaireVisible={setQuestionnaireVisible}
            questionnaireVisible={questionnaireVisible}
            patient={patient}
            questionnaire={questionnaire}
          />
        </div>
      </div>
    </div>
  );
}
