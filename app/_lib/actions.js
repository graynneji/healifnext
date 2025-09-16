"use server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { contactFormSchema } from "../services/validationSchema";
import { createClient } from "../utils/supabase/server";
import pool from "./db";
import { supabase } from "./supabase";
import { redirect } from "next/navigation";
import { signUpschema, loginSchema } from "./validationSchema";
import { ErrorMessages } from "@/app/enums/error.enums";
import { updateNote } from "./data-services";

////////////////////////// Contect Us & Join Us ////////////////////////////////////////////////////

export async function submitForm(prevState, formData) {
  const response = await fetch(`http://www.geoplugin.net/json.gp`);
  const location = await response.json();
  const fullData = {
    name: formData.get("name"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
    ip: location.geoplugin_request,
    city: location.geoplugin_city,
    region: location.geoplugin_region,
    country: location.geoplugin_countryName,
  };

  const client = await pool.connect();

  const queryMes = `INSERT INTO contacts(name, company, phone, email,message, ip, city, region, country)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
  const values = [
    fullData.name,
    fullData.company,
    fullData.phone,
    fullData.email,
    fullData.message,
    fullData.ip,
    fullData.city,
    fullData.region,
    fullData.country,
  ];
  await client.query(queryMes, values);
  client.release();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////// Login //////////////////////////////////////////

export async function login(formData) {
  console.log("loggingIn", formData);
  const supabase = createClient();

  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    const message = "Invalid inputs, please check your inputs";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  console.log("data", error, data);
  const designation = data?.user?.user_metadata?.designation == "therapist";
  if (!error) {
    const redirectUrl = designation ? "/dashboard" : "/therapy";
    return redirectUrl;
  } else {
    const message = ErrorMessages[error?.code] || ErrorMessages.default;
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
}

//////////////////////////////////////////////////////////// Get started /////////////////////////////////////////////////////////////

export async function signup(selectedQuesAnswers, formData) {
  console.log(formData, selectedQuesAnswers);
  const supabase = createClient();
  const response = await fetch(`http://www.geoplugin.net/json.gp`);
  const location = await response.json();
  const options = typeof selectedQuesAnswers === "string";
  const type = options ? selectedQuesAnswers : "patient";
  console.log(formData, formData.get("email"));
  const validatedFields = signUpschema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return `Invalid inputs, please check your inputs ${validatedFields.error}`;
  }
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: formData.get("email"),
    password: formData.get("password"),
    options: {
      data: {
        full_name: formData.get("name"),
        designation: options ? selectedQuesAnswers : "patient",
      },
    },
  });

  if (error) {
    console.log(error);
    return `Error, signing up please try again ${error}`;
  }
  const therapistId = Math.random() < 0.5 ? 6 : 6;
  console.log(signUpData);
  const userData = {
    user_id: signUpData.user.id,
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    // role: options ? selectedQuesAnswers : undefined,
    // selected: !options ? JSON.stringify(selectedQuesAnswers) : undefined,
    therapist_id: !options ? therapistId : null,
    ip: location.geoplugin_request,
    city: location.geoplugin_city,
    region: location.geoplugin_region,
    country: location.geoplugin_countryName,
  };

  const { error: InsertError } = await supabase
    .from("user")
    .insert([userData])
    .select();

  if (InsertError) {
    return "An account is associated with the email";
  }

  if (options) {
    const therapistData = {
      therapist_id: signUpData.user.id,
      name: formData.get("name"),
      email: formData.get("email"),
      license: formData.get("license"),
      authority: formData.get("authority"),
      gender: formData.get("gender"),
      dob: formData.get("dob"),
      specialization: formData.get("specialization"),
    };

    await supabase.from("therapist").insert([therapistData]);
  } else {
    const patientsData = {
      patient_id: signUpData.user.id,
      therapist: therapistId,
      name: formData.get("name"),
      email: formData.get("email"),
      selected: JSON.stringify(selectedQuesAnswers),
    };
    await supabase.from("patients").insert([patientsData]);
  }

  revalidatePath("/", "layout");
  redirect(`/verify/${formData.get("email")}?type=${type}`);
}

/////////////////////////////////////////////////// Logout ///////////////////////////////////////////////////////

export async function signOut() {
  const supabase = createClient();
  try {
    await supabase.auth.signOut();
    // revalidatePath("/", "layout");
    redirect(`/login`);
  } catch (error) {
    return `Error signingout ${error}`;
  }
}

///////////////////////////////////////////// send message ////////////////////////////////////////////////////

export const sendMessage = async (users, formData) => {
  const newMessage = formData.get("message");
  if (!newMessage.trim()) return;

  const { error } = await supabase.from("messages").insert([
    {
      message: newMessage,
      sender_id: users?.senderId,
      reciever_id: users?.recieverId,
    },
  ]);

  if (error) `Error sending message: ${error}`;
};

export async function updateViewNotes(patientId, formData) {
  const note = formData.get("note");
  const color = formData.get("color");

  const { data: patientData, error } = await supabase
    .from("patients")
    .select("notes")
    .eq("patient_id", patientId)
    .single();

  if (error) {
    throw new Error("Could not add note");
  }

  const patientNotes = patientData?.notes ?? [];

  const newNote = {
    id: Date.now(),
    text: note,
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

// schedule an appointment
export async function appointment({ userId, therapistId, color }, formData) {
  const title = formData.get("title");
  const start = formData.get("start");
  const event = {
    title,
    start,
    backgroundColor: color,
    borderColor: color,
    patient_id: userId,
    therapist_id: therapistId,
  };
  const { data, error } = await supabase.from("appointment").insert([event]);
  return { data, error };
}

// create post in community
export async function createPost({ userID, author }, formData) {
  const title = formData.get("title");
  const content = formData.get("content");
  const category = formData.get("category").toLowerCase();
  const tags = formData.get("tags");
  const { data: categoryData, error: categoryError } = await supabase
    .from("categories_article")
    .select("*")
    .eq("category_name", category);
  console.log("category", categoryData);
  const post = {
    author_id: userID,
    title: title,
    content: content,
    category: categoryData[0]?.id,
    tags: tags,
    author: author,
  };

  const { data, error } = await supabase.from("article").insert([post]);

  return { data, error };
}

export async function postReply({ userId, articleId, author }, formData) {
  const reply = formData.get("reply");
  const replyData = {
    user_id: userId,
    article_id: articleId,
    content: reply,
    author,
  };
  const { data, error } = await supabase
    .from("article_comments")
    .insert([replyData]);
  return { data, error };
}

export async function postLikes(userId, discussionId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("article_likes")
    .select("id")
    .match({ user_id: userId, discussion_id: discussionId });
  if (data && data.length > 0) {
    // already liked, don't insert again
    return;
  }
  const post = {
    user_id: userId,
    discussion_id: discussionId,
  };
  await supabase.from("article_likes").insert([post]);
}
