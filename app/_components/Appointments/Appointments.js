"use client";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./Appointments.module.css";
import { CalendarDots } from "@phosphor-icons/react/dist/ssr";
import { appointments } from "@/app/_lib/data-services";
import { appointment } from "@/app/_lib/actions";
import { useSearchParams } from "next/navigation";

const Appointments = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userID");
  const therapistId = searchParams.get("therapistId");
  const [color, setColor] = useState();
  const [loaded, setLoaded] = useState(0);
  const options = {
    userId,
    therapistId,
    color,
  };

  const schedule = appointment.bind(null, options);
  const [events, setEvents] = useState([]);
  // useState([
  //   {
  //     id: "1",
  //     title: "Project Meeting",
  //     start: "2025-05-17T10:00:00",
  //     backgroundColor: "#3b82f6",
  //     borderColor: "#3b82f6",
  //   },
  //   {
  //     id: "2",
  //     title: "Client Call",
  //     start: "2025-05-18T14:00:00",
  //     backgroundColor: "#10b981",
  //     borderColor: "#10b981",
  //   },
  //   {
  //     id: "3",
  //     title: "Team Review",
  //     start: "2025-05-19T13:00:00",
  //     backgroundColor: "#f59e0b",
  //     borderColor: "#f59e0b",
  //   },
  // ]);

  useEffect(() => {
    async function loadAppointments() {
      const { data, error } = await appointments(userId, therapistId);
      setEvents(data || []);
    }
    loadAppointments();
  }, [loaded, userId, therapistId]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  });

  const handleDateClick = (info) => {
    setNewEvent({
      title: "",
      start: info.dateStr,
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
    });

    setShowModal(true);
  };

  const handleColorChange = (color) => {
    setColor(color);
    setNewEvent({
      ...newEvent,
      backgroundColor: color,
      borderColor: color,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newEvent.title.trim()) {
      setEvents([
        ...events,
        {
          id: String(events.length + 1),
          ...newEvent,
        },
      ]);

      setShowModal(false);
      setNewEvent({
        title: "",
        start: "",
        backgroundColor: "#3b82f6",
        borderColor: "#3b82f6",
      });
    }
  };
  console.log(events, newEvent);
  // Format date for input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <CalendarIcon className="mr-2 text-blue-500" size={24} /> */}
        {/* <CalendarDots className={styles.icon} size={24} /> */}
        <h2 className={styles.title}>Schedule</h2>
      </div>
      <div className={styles.calendarContainer}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          selectable={true}
          dateClick={handleDateClick}
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          nowIndicator={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: "short",
          }}
        />
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <span className={styles.iconWrapper}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.5C18.7626 2.23735 19.1088 2.07719 19.4714 2.05066C19.834 2.02414 20.1979 2.13321 20.4883 2.35523C20.7787 2.57725 20.9781 2.89933 21.0464 3.25806C21.1148 3.6168 21.0477 3.98908 20.858 4.297L13.5 13L10 14L11 10.5L18.5 2.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                New Event
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <form
              action={async (formData) => {
                const { data, error } = await schedule(formData);
                setLoaded((prev) => prev + 1);
                setShowModal(false);
              }}
              className={styles.modalBody}
            >
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  className={styles.input}
                  autoFocus
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="datetime" className={styles.label}>
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="start"
                  id="datetime"
                  value={formatDateForInput(newEvent.start)}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Event Color</label>
                <div className={styles.colorPicker}>
                  {[
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`${styles.colorOption} ${
                        newEvent.backgroundColor === color
                          ? styles.colorOptionSelected
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.buttonCancel}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.buttonSave}>
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
