"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./Community.module.css";
import {
  ChatTeardropText,
  Clock,
  TrendUp,
  House,
  Star,
  MagnifyingGlass,
  Briefcase,
  Users,
  Heart,
  Funnel,
} from "@phosphor-icons/react/dist/ssr";
import CreatePost from "../CreatePost/CreatePost";
import Discussions from "../Discussions/Discussions";
import DiscussionView from "../DiscussionView/DiscussionView";
import { postLikes } from "@/app/_lib/actions";

const Community = ({ initialDiscussions, count }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [commentCount, setCommentCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [discussion, setDiscussion] = useState({});
  const [open, setOpen] = useState(true);
  const [views, setViews] = useState(0);
  const scrollref = useRef(null);
  const [likes, setLikes] = useState([]);

  const categories = [
    { id: "all", name: "All Topics", icon: Users, color: "blue" },
    { id: "anxiety", name: "Anxiety", icon: Heart, color: "purple" },
    {
      id: "depression",
      name: "Depression",
      icon: ChatTeardropText,
      color: "indigo",
    },
    { id: "relationships", name: "Relationships", icon: Heart, color: "pink" },
    { id: "career", name: "Career & Work", icon: Briefcase, color: "green" },
    { id: "family", name: "Family", icon: House, color: "orange" },
    { id: "self-care", name: "Self-Care", icon: Star, color: "yellow" },
    { id: "growth", name: "Personal Growth", icon: TrendUp, color: "teal" },
  ];

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.icon : ChatTeardropText;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.color : "gray";
  };

  const handleLikes = async (userId, discussionId) => {
    await postLikes(userId, discussionId);
  };

  return (
    <>
      {/* Header */}
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerInner}>
              <h1 className={styles.title}>Community</h1>
              <div className={styles.headerActions}>
                <button
                  onClick={() => setIsOpen(true)}
                  className={styles.createPostBtn}
                >
                  Post
                </button>
                <button className={styles.filterBtn}>
                  <Funnel className={styles.icon} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.layout}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
              <div className={styles.card}>
                <h2 className={styles.sidebarTitle}>Categories</h2>
                <div className={styles.categoryList}>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`${styles.categoryBtn} ${
                          activeCategory === category.id
                            ? styles.categoryBtnActive
                            : ""
                        }`}
                      >
                        <div
                          className={`${styles.categoryIcon} ${
                            styles[
                              `categoryIcon${
                                category.color.charAt(0).toUpperCase() +
                                category.color.slice(1)
                              }`
                            ]
                          }`}
                        >
                          <Icon className={styles.categoryIconSvg} />
                        </div>
                        <span className={styles.categoryName}>
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Community Stats */}
              <div className={styles.card}>
                <h3 className={styles.statsTitle}>Community Stats</h3>
                <div className={styles.statsList}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Active Members</span>
                    <span className={styles.statValue}>12,547</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Posts</span>
                    <span className={styles.statValue}>{count}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Online Now</span>
                    <span className={styles.statValueOnline}>1,234</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={styles.content} ref={scrollref}>
              {/* Search Bar */}
              {open && (
                <>
                  <div className={styles.searchCard}>
                    <div className={styles.searchWrapper}>
                      <MagnifyingGlass className={styles.searchIcon} />
                      <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                      />
                    </div>
                  </div>

                  {/* Featured Section */}
                  <div className={styles.featuredSection}>
                    <h2 className={styles.featuredTitle}>
                      Welcome to our support community
                    </h2>
                    <p className={styles.featuredText}>
                      Connect with others, share experiences, and find support
                      on your mental health journey.
                    </p>
                    <button className={styles.guidelinesBtn}>
                      Community Guidelines
                    </button>
                  </div>
                </>
              )}

              {/* Discussions section */}
              {open ? (
                <Discussions
                  setDiscussion={setDiscussion}
                  getCategoryColor={getCategoryColor}
                  getCategoryIcon={getCategoryIcon}
                  setOpen={setOpen}
                  activeCategory={activeCategory}
                  searchTerm={searchTerm}
                  initialDiscussions={initialDiscussions}
                  setViews={setViews}
                  setCommentCount={setCommentCount}
                  commentCount={commentCount}
                  handleLikes={handleLikes}
                />
              ) : (
                <DiscussionView
                  discussion={discussion}
                  setOpen={setOpen}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                  setCommentCount={setCommentCount}
                  commentCount={commentCount}
                  views={views}
                  handleLikes={handleLikes}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* post modal */}
      {isOpen && <CreatePost isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
};

export default Community;
