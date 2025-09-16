import { ChatTeardropText, Clock, Heart } from "@phosphor-icons/react/dist/ssr";
import styles from "./Discussions.module.css";
import { useState } from "react";
import { getPosts, incrementAndGetViews } from "@/app/_lib/data-services";
import UnitReplyCount from "../UnitReplyCount/UnitReplyCount";
import Likes from "../Likes/Likes";
import { formatCommunityTimeAgo } from "@/app/utils";

function Discussions({
  setDiscussion,
  getCategoryColor,
  getCategoryIcon,
  setOpen,
  activeCategory,
  searchTerm,
  initialDiscussions = [],
  setViews,
  comments,
  handleLikes,
}) {
  const [page, setPage] = useState(1);
  const [countReply, setCountReply] = useState(0);
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 3;

  const replies = 22;
  const likes = 51;
  const timeAgo = "3 days ago";

  const loadMore = async () => {
    const nextPage = page + 1;
    const { data } = await getPosts(nextPage, pageSize);

    if (!data || data.length === 0) {
      setHasMore(false);
      return;
    }

    setDiscussions((prev) => [...prev, ...data]);
    setPage(nextPage);

    if (data.length < pageSize) {
      setHasMore(false);
    }
  };

  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesCategory =
      activeCategory === "all" ||
      discussion?.categories_article?.category_name === activeCategory;
    const matchesSearch =
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDiscussion = async ({ discussion }) => {
    const { data } = await incrementAndGetViews(discussion?.id);
    setViews(data);
    setDiscussion(discussion);
    setOpen(false);
  };

  return (
    <>
      {/* Discussions List */}
      <div className={styles.discussionsList}>
        {filteredDiscussions?.map((discussion, idx) => {
          const Icon = getCategoryIcon(
            discussion?.categories_article?.category_name || "ChatTeardropText"
          );
          const categoryColor = getCategoryColor(
            discussion?.categories_article?.category_name
          );
          return (
            <div
              key={`${discussion?.id}-${idx}`}
              className={styles.discussionCard}
              onClick={() => handleDiscussion({ discussion })}
            >
              <div className={styles.discussionContent}>
                <div className={styles.discussionMeta}>
                  <div
                    className={`${styles.discussionCategoryIcon} ${
                      styles[
                        `categoryIcon${
                          categoryColor.charAt(0).toUpperCase() +
                          categoryColor.slice(1)
                        }`
                      ]
                    }`}
                  >
                    <Icon className={styles.discussionCategoryIconSvg} />
                  </div>
                  <span className={styles.discussionCategory}>
                    {discussion?.categories_article?.category_name.replace(
                      "-",
                      " "
                    )}
                  </span>
                  {discussion.is_hot && (
                    <span className={styles.hotBadge}>Hot</span>
                  )}
                </div>
                <h3 className={styles.discussionTitle}>{discussion.title}</h3>
                <p className={styles.discussionSnippet}>{discussion.content}</p>
                <span className={styles.discussionAuthor}>
                  by {discussion.author}
                </span>
                <div className={styles.discussionStats}>
                  <span className={styles.discussionStat}>
                    <ChatTeardropText className={styles.statIcon} />
                    <UnitReplyCount discussionId={discussion?.id} />
                    {/* <span>{discussion.replies} replies</span> */}
                  </span>
                  <span
                    className={styles.discussionStat}
                    onClick={() =>
                      handleLikes(discussion?.author_id, discussion?.id)
                    }
                  >
                    <Likes
                      userId={discussion?.author_id}
                      discussionId={discussion?.id}
                    />
                  </span>
                  <span className={styles.discussionStat}>
                    <Clock className={styles.statIcon} />
                    <span>
                      {formatCommunityTimeAgo(discussion?.created_at)}
                    </span>
                    {/* <span>{discussion.timeAgo}</span> */}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Load More */}
      <div className={styles.loadMoreWrapper}>
        <button
          disabled={hasMore}
          onClick={loadMore}
          className={styles.loadMoreBtn}
        >
          Load More Discussions
        </button>
      </div>
    </>
  );
}

export default Discussions;
