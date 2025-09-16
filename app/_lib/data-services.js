"use server";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

export async function getUserId() {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/login");
  }
  const userId = userData?.user?.id;
  const desgn = userData?.user?.user_metadata?.designation;

  return { userId, desgn };
}

export async function getUsers() {
  const supabase = createClient();
  const { userId } = await getUserId();
  const { data, error } = await supabase
    .from("user")
    .select(
      "user_id, name, therapist_id, therapist(name, therapist_id, authority, license, specialization, summary), patients(*)"
    )
    .eq("user_id", userId);

  if (error) {
    redirect(`/login`);
  }

  return data;
}

export async function getTherpistInfo() {
  const supabase = createClient();
  const { userId, desgn } = await getUserId();
  const { data: therapistData, error: therapistError } = await supabase
    .from("therapist")
    .select("id, balance, pending, total_earning")
    .eq("therapist_id", userId);
  return { therapistData, desgn };
}

export async function getAllPatientsAttachedToTherapist() {
  const supabase = createClient();
  const { therapistData, desgn } = await getTherpistInfo();
  if (desgn === "patient") return;
  const { data: patientsTherapist, error } = await supabase
    .from("patients")
    .select(
      "id, name, therapist, patient_id, appointment, is_subscribed, subscription"
    )
    .eq("therapist", therapistData[0]?.id);
  return patientsTherapist;
}

export async function getNote(patientId) {
  const supabase = createClient();
  const { data: notes, error } = await supabase
    .from("patients")
    .select("notes")
    .eq("patient_id", patientId)
    .single();

  return notes;
}

export async function updateNote(patientId, notes, color) {
  const supabase = createClient();
  const { data: patientData, error } = await supabase
    .from("patients")
    .select("notes")
    .eq("patient_id", patientId)
    .single();

  if (error) {
    return null;
  }

  const patientNotes = patientData?.notes ?? [];

  const newNote = {
    id: Date.now(),
    text: notes,
    color: color,
    timestamp: new Date().toISOString(),
  };

  const newNotes = [...patientNotes, newNote];

  const { data, error: updateNotesError } = await supabase
    .from("patients")
    .update({ notes: newNotes })
    .eq("patient_id", patientId)
    .select();

  if (updateNotesError) {
    return null;
  }

  return data;
}

//get Questionaire
export async function getQuestionaire(patientId) {
  const supabase = createClient();
  const { data: questionaire, error } = await supabase
    .from("patients")
    .select("selected")
    .eq("patient_id", patientId);

  if (error) return;
  return questionaire;
}

//get Post in community
export async function getPosts(page = 1, pageSize = 3) {
  const supabase = createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("article")
    .select("*, categories_article(category_name)", {
      count: "exact",
    })
    .range(from, to)
    .order("created_at", { ascending: false });

  return { data, error, count };
}

export async function incrementAndGetViews(articleId) {
  const supabase = createClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "increment_views_bigint",
    {
      article_id: articleId,
    }
  );
  if (rpcError) {
    console.error("RPC Error:", rpcError);
    console.log(rpcError, "rpcerror");
  }
  console.log(rpcError);
  const { data, error } = await supabase
    .from("article")
    .select("views")
    .eq("id", articleId)
    .single();
  console.log("rcp", data, error);
  return { data, error };
}

export async function getComments(discussionId) {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from("article_comments")
    .select("*", { count: "exact" })
    .eq("article_id", discussionId)
    .order("created_at", { ascending: false });
  return { data, error, count };
}

export async function likes(userId, articleId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("article_likes")
    .select("user_id")
    .match({ user_id: userId, discussion_id: articleId });

  return { data, error };
}

export async function appointments(patientId, therapistId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("appointment")
    .select("id, title, start, backgroundColor, borderColor")
    .match({ patient_id: patientId, therapist_id: therapistId });

  return { data, error };
}
