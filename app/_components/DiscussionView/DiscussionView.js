import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./DiscussionView.module.css";
import {
  Heart,
  Clock,
  ShareNetwork,
  BookmarkSimple,
  ThumbsUp,
  ArrowLeft,
  PaperPlaneRight,
  DotsThreeVertical,
  ChatTeardropText,
} from "@phosphor-icons/react/dist/ssr";
import { useSearchParams } from "next/navigation";
import { postReply } from "@/app/_lib/actions";
import Comments from "../Comments/Comments";
import { avatar } from "@/app/utils";
import { getComments } from "@/app/_lib/data-services";
import { formatCommunityTimeAgo } from "@/app/utils";
import Likes from "../Likes/Likes";

const DiscussionView = ({
  discussion,
  setOpen,
  getCategoryColor,
  getCategoryIcon,
  views,
  setCommentCount,
  handleLikes,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const searchParams = useSearchParams();
  const author = searchParams.get("author") || "";
  const userId = searchParams.get("userID") || "";
  const [loaded, setLoaded] = useState(false);
  const formRef = useRef(null);
  const [isPressSend, setIsPressSend] = useState(0);
  const nameAvatar = avatar(author);
  const newReply = {
    author,
    userId,
    articleId: discussion?.id,
  };
  const reply = postReply.bind(null, newReply);

  const Icon = getCategoryIcon(discussion?.categories_article?.category_name);
  const categoryColor = getCategoryColor(
    discussion?.categories_article?.category_name
  );
  const likes = 24;
  const replies = 12;
  const timeAgo = "3 hours ago";

  const memoFetchComments = useCallback(async () => {
    const { data } = await getComments(discussion?.id);
    setComments(data || []);
    setCommentCount(data?.length);
    setLoaded(true);
  }, [discussion?.id, setComments, setCommentCount]);

  useEffect(() => {
    if (!loaded) memoFetchComments();
  }, [memoFetchComments, isPressSend, loaded]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => setOpen(true)} className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          <span>Back to discussions</span>
        </button>

        {/* Discussion Meta */}
        <div className={styles.discussionMeta}>
          <div
            className={`${styles.categoryIcon} ${
              styles[
                `categoryIcon${
                  categoryColor.charAt(0).toUpperCase() + categoryColor.slice(1)
                }`
              ]
            }`}
          >
            <Icon className={styles.categoryIconSvg} />
          </div>
          <span className={styles.categoryText}>
            {discussion?.categories_article?.category_name?.replace("-", " ")}
          </span>
          {discussion?.isHot && <span className={styles.hotBadge}>Hot</span>}
        </div>

        {/* Title */}
        <h1 className={styles.title}>{discussion?.title}</h1>

        {/* Author and Meta */}
        <div className={styles.authorMeta}>
          <div className={styles.authorInfo}>
            <span>
              by <strong>{discussion?.author}</strong>
            </span>
            <div className={styles.timeInfo}>
              <Clock className={styles.timeIcon} />
              <span>{formatCommunityTimeAgo(discussion?.created_at)}</span>
            </div>
          </div>

          {/* later for share and save post */}
          {/* <div className={styles.actionButtons}>
            <button className={styles.actionButton}>
              <ShareNetwork className={styles.actionIcon} />
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={styles.actionButton}
            >
              <BookmarkSimple
                className={`${styles.actionIcon} ${
                  isBookmarked ? styles.bookmarked : ""
                }`}
              />
            </button>
            <button className={styles.actionButton}>
              <DotsThreeVertical className={styles.actionIcon} />
            </button>
          </div> */}
        </div>
      </div>

      {/* Discussion Content */}
      <div className={styles.content}>
        <div className={styles.prose}>
          {discussion?.content.split("\n").map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Stats and Actions */}
        <div className={styles.statsSection}>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <ChatTeardropText className={styles.statIcon} />
              <span>
                {comments?.length} {comments.length > 1 ? "replies" : "reply"}
              </span>
            </div>
            <div
              className={styles.statItem}
              onClick={() => handleLikes(discussion?.author_id, discussion?.id)}
            >
              {/* <Heart className={styles.statIcon} />
              <span>{likes} likes</span> */}
              <Likes
                userId={discussion?.author_id}
                discussionId={discussion?.id}
              />
            </div>
            <div className={styles.statItem}>
              <span>{views?.views} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>Comments ({comments.length})</h2>

        {/* Add Comment Form */}
        <div className={styles.addCommentForm}>
          <div className={styles.commentForm}>
            <div className={styles.userAvatar}>{nameAvatar}</div>

            <form
              ref={formRef}
              action={async (formData) => {
                const { data, error } = await reply(formData);
                formRef.current.reset();
                if (!error) {
                  setNewComment("");
                  setIsPressSend((prev) => prev + 1);
                }
              }}
              className={styles.commentInputWrapper}
            >
              <textarea
                id="reply"
                name="reply"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className={styles.commentInput}
                rows="3"
              />
              <div className={styles.commentActions}>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className={styles.submitButton}
                >
                  <PaperPlaneRight className={styles.submitIcon} />
                  Comment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Comments List */}
        <Comments
          setCommentCount={setCommentCount}
          setComments={setComments}
          comments={comments}
          isPressSend={isPressSend}
          discussionId={discussion?.id}
          handleLikes={handleLikes}
        />
      </div>
    </div>
  );
};

export default DiscussionView;
