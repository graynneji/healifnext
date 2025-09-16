import TherapyForPatients from "@/app/_components/TherapyForPatients/TherapyForPatients";
import Care from "../../_components/Care/Care-v1";
import { getUsers } from "../../_lib/data-services";

export default async function Page() {
  const userInfo = await getUsers();
  if (userInfo) {
    return <TherapyForPatients userInfo={userInfo} />;
  }
}
