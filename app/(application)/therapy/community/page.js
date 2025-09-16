import Community from "@/app/_components/Community/Community";
import { getComments, getPosts } from "@/app/_lib/data-services";
import React from "react";

async function Page() {
  const { data: initialDiscussions, error, count } = await getPosts();

  return <Community count={count} initialDiscussions={initialDiscussions} />;
}

export default Page;
