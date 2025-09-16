"use client";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import styles from "./Comments.module.css";
import React, { useCallback, useEffect, useState } from "react";
import { getComments } from "@/app/_lib/data-services";
import { avatar } from "@/app/utils";
import Likes from "../Likes/Likes";
import { formatCommunityTimeAgo } from "@/app/utils";

function Comments({
  handleLikeComment,
  discussionId,
  isPressSend,
  comments,
  setComments,
  setCommentCount,
  handleLikes,
}) {
  // const memoFetchComments = useCallback(async () => {
  //   const { data } = await getComments(discussionId);
  //   setComments(data || []);
  //   setCommentCount(data?.length);
  // }, [discussionId, setComments, setCommentCount]);

  // useEffect(() => {
  //   memoFetchComments();
  // }, [memoFetchComments, isPressSend]);
  return (
    <div>
      <div className={styles.commentsList}>
        {/* {comments.map((comment) => ( */}
        {comments?.map((comment) => (
          <div key={comment?.id} className={styles.commentItem}>
            <div className={styles.comment}>
              <div className={styles.commentAvatar}>
                {avatar(comment?.author)}
              </div>
              <div className={styles.commentContent}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>
                    {comment?.author}
                  </span>
                  <span className={styles.commentTime}>
                    {formatCommunityTimeAgo(comment?.created_at)}
                  </span>
                  {/* <span className={styles.commentTime}>{reply.timeAgo}</span> */}
                </div>
                <p className={styles.commentText}>{comment?.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comments;
