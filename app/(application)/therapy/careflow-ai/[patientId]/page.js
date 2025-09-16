import CareFlowAI from "@/app/_components/CareFlowAI/CareFlowAI";
import { getNote } from "@/app/_lib/data-services";
import { supabase } from "@/app/_lib/supabase";
export async function generateStaticParams() {
  const { data, error } = await supabase.from("patients").select("patient_id");

  return data.map((user) => ({
    patientId: user?.patient_id,
  }));
}

async function Page({ params }) {
  let id = params?.patientId;
  const { notes } = await getNote(params.patientId);
  console.log(id, params, notes, "lets have the notes");
  return <CareFlowAI notes={notes} />;
}

export default Page;
