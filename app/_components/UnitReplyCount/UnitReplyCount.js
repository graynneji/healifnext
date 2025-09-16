import { getComments } from "@/app/_lib/data-services";
import styles from "./UnitReplyCount.module.css";
import React, { useCallback, useEffect, useState } from "react";

function UnitReplyCount({ discussionId }) {
  const [commentCount, setCommentCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const memoFetchComments = useCallback(async () => {
    const { data } = await getComments(discussionId);
    setCommentCount(data.length);
    setLoaded(true);
  }, [discussionId]);

  useEffect(() => {
    if (!loaded) memoFetchComments();
  }, [memoFetchComments, loaded]);
  return <span className={styles.likes}>{commentCount} replies</span>;
}

export default UnitReplyCount;
