import { likes } from "@/app/_lib/data-services";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./Likes.module.css";

function Likes({ userId, discussionId }) {
  const [like, setLike] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const memoLikes = useCallback(async () => {
    const { data, error } = await likes(userId, discussionId);
    setLike(data || []);
    setLoaded(true);
  }, [userId, discussionId]);

  useEffect(() => {
    memoLikes();
  }, [memoLikes]);
  const userLiked = like.some((lke) => lke.user_id === userId);

  return (
    <>
      <Heart
        className={styles.statIcon}
        weight={userLiked ? "fill" : "regular"}
        color={userLiked ? "red" : "#6b7280"}
      />
      <span>{like?.length} likes</span>
    </>
  );
}

export default Likes;
