"use cleint";
import { updateNote } from "@/app/_lib/data-services";
import styles from "./AddNotes.module.css";
import { updateViewNotes } from "@/app/_lib/actions";
import { useEffect, useMemo, useState } from "react";
import Input from "../Input/Input";

function AddNotes({ setFormVisible, setNewNote, addNote, newNote, patientId }) {
  const noteColors = useMemo(() => {
    return ["#fef3c7", "#dbeafe", "#d1fae5", "#ede9fe", "#fce7f3"];
  }, []);
  const [selectedColor, setSelectedColor] = useState("");
  const [character, setCharacter] = useState({
    note: "",
  });
  const disabled = character.note.length > 300 || character.note.length < 10;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    function getRandomNoteColor(array) {
      const length = array.length || 6;
      return array[Math.floor(Math.random() * length)];
    }
    setSelectedColor(getRandomNoteColor(noteColors));
  }, [noteColors]);

  const notes = updateViewNotes.bind(null, patientId);
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>Add New Note</h3>
        <form
          action={async (formData) => {
            // debounce(async (formData) => {
            console.log("debounce log");
            const data = await notes(formData);
            // }, 500);

            setNewNote(data);
            setFormVisible(false);
          }}
        >
          {/* <textarea
            value={newNote}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your note here..."
            className={styles.noteTextarea}
            name="note"
          /> */}
          <Input
            inputType="addnote"
            name="note"
            id="note"
            placeholder="Enter your note here..."
            onHandleChange={handleChange}
          />
          <div className={styles.characterCount}>
            {character.note.length}/300 characters
          </div>
          <input type="hidden" name="color" value={selectedColor} />
          <div className={styles.modalActions}>
            <button
              onClick={() => setFormVisible(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button disabled={disabled} className={styles.saveBtn}>
              {/* <button onClick={addNote} className={styles.saveBtn}> */}
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNotes;
