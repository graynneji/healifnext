"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import styles from "./CareFlowAI.module.css";
import {
  DotOutline,
  CheckCircle,
  Clock,
  Warning,
  ChartPie,
  ArrowRight,
  Calendar,
  ClipboardText,
  Brain,
  //   Pulse,
  //   Heartbeat,
  Heartbeat,
  Pulse,
} from "@phosphor-icons/react/dist/ssr";
import { main } from "@/app/_llm/model";
import { AI_PROMPT } from "@/app/constants";

// Mock data for demonstration
const mockProgress = [
  { month: "Jan", depression: 8, anxiety: 7, wellbeing: 3 },
  { month: "Feb", depression: 7, anxiety: 6, wellbeing: 4 },
  { month: "Mar", depression: 6, anxiety: 6, wellbeing: 5 },
  { month: "Apr", depression: 5, anxiety: 5, wellbeing: 6 },
  { month: "May", depression: 4, anxiety: 4, wellbeing: 7 },
];

const engagementData = [
  { month: "Jan", attendance: 90, participation: 70, homework: 60 },
  { month: "Feb", attendance: 100, participation: 75, homework: 65 },
  { month: "Mar", attendance: 90, participation: 80, homework: 75 },
  { month: "Apr", attendance: 100, participation: 85, homework: 80 },
  { month: "May", attendance: 100, participation: 90, homework: 85 },
];

export default function CareFlowAI({ notes }) {
  console.log("note", notes);
  const [activeTab, setActiveTab] = useState("overview");
  const [report, setReport] = useState();
  // console.log("heyyaty", report);

  const processedNotes = notes
    .map((note, index) => {
      const noteText = note.text;
      const createdAt = note.timestamp
        ? new Date(note.timestamp).toLocaleDateString()
        : "";
      return `Note ${index + 1}
       ${noteText}`;
      // return `Note ${index + 1} (${createdAt}): ${noteText}`;
    })
    .join("\n\n");
  const processedTime = notes
    .map((note, index) => {
      const createdAt = note.timestamp
        ? new Date(note.timestamp).toLocaleDateString()
        : "";
      return `Time ${index + 1} (${createdAt})`;
    })
    .join("\n\n");
  console.log(processedNotes, "created");

  useEffect(() => {
    const generateReport = async () => {
      try {
        // setLoading(true);
        const FINAL_PROMPT = AI_PROMPT.replace(
          "{therapistNotes}",
          processedNotes
        ).replace("{totalMonths}", processedTime);
        // .replace("{questionnaireData}", processedNotes)
        // .replace("{chatHistory}", patientData.chatHistory)
        console.log("Prompt Sent to AI:", FINAL_PROMPT);
        const result = await main(AI_PROMPT);
        setReport(result);
        console.log("hey");
      } catch (error) {
        console.log("Error", error);
      }
      // finally {
      // setLoading(false);
      // router.push("/Mytrip");
      // }
    };
    generateReport();
  }, []);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            {/* <div className={styles.logoIcon}><Brain size={20} /></div> */}
            <h1 className={styles.logoText}>Care Flow AI</h1>
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.dateText}>
              <Calendar className={styles.inlineIcon} size={20} />{" "}
              <span>May 20, 2025</span>
            </span>
            <span className={styles.statusBadge}>
              <DotOutline className={styles.inlineIcon} size={20} /> Report
              Generated
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          {/* Title Section */}
          <div className={styles.titleSection}>
            <div className={styles.titleContainer}>
              <h2 className={styles.title}>Patient Progress Report</h2>
              <div className={styles.titleActions}>
                <span className={styles.patientId}>ID: PAT-21905</span>
                <button className={styles.exportButton}>
                  <ClipboardText className={styles.buttonIcon} size={16} />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNav}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "overview" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "progress" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("progress")}
            >
              Progress Metrics
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "insights" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("insights")}
            >
              Insights
            </button>
          </div>

          {/* Main Content Area */}
          <div className={styles.contentArea}>
            {activeTab === "overview" && (
              <div className={styles.contentSection}>
                {/* Diagnosis Section */}
                <div className={styles.twoColumnGrid}>
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                      <ChartPie className={styles.cardTitleIcon} size={18} />
                      Primary Diagnosis
                    </h3>
                    <div className={styles.diagnosisBox}>
                      <div className={styles.diagnosisContent}>
                        <div className={styles.flexGrow}>
                          <h4 className={styles.diagnosisName}>
                            Major Depressive Disorder (F33.1)
                          </h4>
                          <p className={styles.diagnosisDetail}>
                            Recurrent episode, moderate severity
                          </p>
                        </div>
                        <div className={styles.severityBadge}>Moderate</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                      <ChartPie className={styles.cardTitleIcon} size={18} />
                      Secondary Diagnosis
                    </h3>
                    <div className={styles.diagnosisBox}>
                      <div className={styles.diagnosisContent}>
                        <div className={styles.flexGrow}>
                          <h4 className={styles.diagnosisName}>
                            Generalized Anxiety Disorder (F41.1)
                          </h4>
                          <p className={styles.diagnosisDetail}>
                            Persistent worry and tension
                          </p>
                        </div>
                        <div
                          className={`${styles.severityBadge} ${styles.severityBadgeBlue}`}
                        >
                          Mild
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approach and Recommendations */}
                <div className={styles.twoColumnGrid}>
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                      <Pulse className={styles.cardTitleIcon} size={18} />
                      Current Approach
                    </h3>
                    <ul className={styles.bulletList}>
                      <li className={styles.bulletItem}>
                        <CheckCircle
                          className={`${styles.bulletIcon} ${styles.iconGreen}`}
                          size={16}
                        />
                        <span className={styles.bulletText}>
                          Cognitive Behavioral Therapy (CBT) - weekly sessions
                          focused on thought restructuring
                        </span>
                      </li>
                      <li className={styles.bulletItem}>
                        <CheckCircle
                          className={`${styles.bulletIcon} ${styles.iconGreen}`}
                          size={16}
                        />
                        <span className={styles.bulletText}>
                          Behavioral activation - scheduled pleasant activities
                          and exercise routine
                        </span>
                      </li>
                      <li className={styles.bulletItem}>
                        <CheckCircle
                          className={`${styles.bulletIcon} ${styles.iconGreen}`}
                          size={16}
                        />
                        <span className={styles.bulletText}>
                          Medication management - coordination with psychiatrist
                        </span>
                      </li>
                      <li className={styles.bulletItem}>
                        <Clock
                          className={`${styles.bulletIcon} ${styles.iconAmber}`}
                          size={16}
                        />
                        <span className={styles.bulletText}>
                          Mindfulness practice - introduction phase
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                      <ArrowRight className={styles.cardTitleIcon} size={18} />
                      Recommendations
                    </h3>
                    <ul className={styles.bulletList}>
                      <li className={styles.bulletItem}>
                        <Warning
                          className={`${styles.bulletIcon} ${styles.iconAmber}`}
                          size={16}
                        />
                        <span className={styles.bulletText}>
                          Consider increasing session frequency to twice weekly
                          for the next month
                        </span>
                      </li>
                      <li className={styles.bulletItem}>
                        <Warning
                          className={`${styles.bulletIcon} ${styles.iconAmber}`}
                          size={16}
                        />
                        <span className={styles.bulletText}>
                          Introduce structured sleep hygiene protocol to address
                          insomnia
                        </span>
                      </li>
                      <li className={styles.bulletItem}>
                        <Warning
                          className={`${styles.bulletIcon} ${styles.iconAmber}`}
                          size={16}
                        />
                        <span className={styles.bulletText}>
                          Explore group therapy options for additional social
                          support
                        </span>
                      </li>
                      <li className={styles.bulletItem}>
                        <Warning
                          className={`${styles.bulletIcon} ${styles.iconAmber}`}
                          size={16}
                        />
                        <span className={styles.bulletText}>
                          Refine stress management techniques focusing on
                          workplace stressors
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Treatment Goals */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    <Heartbeat className={styles.cardTitleIcon} size={18} />
                    Treatment Goal Progress
                  </h3>
                  <div className={styles.progressContainer}>
                    <div className={styles.goalProgress}>
                      <div className={styles.goalHeader}>
                        <span className={styles.goalTitle}>
                          Reduce depressive symptoms by 50%
                        </span>
                        <span className={styles.goalCompletionGreen}>
                          70% Complete
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressBarGreen}
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                    </div>
                    <div className={styles.goalProgress}>
                      <div className={styles.goalHeader}>
                        <span className={styles.goalTitle}>
                          Develop 3 effective anxiety management strategies
                        </span>
                        <span className={styles.goalCompletionIndigo}>
                          66% Complete
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressBarIndigo}
                          style={{ width: "66%" }}
                        ></div>
                      </div>
                    </div>
                    <div className={styles.goalProgress}>
                      <div className={styles.goalHeader}>
                        <span className={styles.goalTitle}>
                          Return to full work schedule
                        </span>
                        <span className={styles.goalCompletionAmber}>
                          40% Complete
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressBarAmber}
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </div>
                    <div className={styles.goalProgress}>
                      <div className={styles.goalHeader}>
                        <span className={styles.goalTitle}>
                          Improve sleep quality and duration
                        </span>
                        <span className={styles.goalCompletionAmber}>
                          35% Complete
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressBarAmber}
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <div className={styles.contentSection}>
                <div
                  className={styles.contentGraph}
                  //   style={{
                  //     display: "flex",
                  //     flex: "1",
                  //     justifyContent: "space-between",
                  //     gap: "10px",
                  //   }}
                >
                  {/* <h3 className={styles.sectionTitle}>
                    Symptom Severity Tracking
                  </h3> */}
                  <div className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={mockProgress}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "0.5rem",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="depression"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Depression Score"
                        />
                        <Line
                          type="monotone"
                          dataKey="anxiety"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Anxiety Score"
                        />
                        <Line
                          type="monotone"
                          dataKey="wellbeing"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Wellbeing Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className={styles.chartNote}>
                      Depression & Anxiety: Lower scores indicate improvement.
                      Wellbeing: Higher scores indicate improvement.
                    </div>
                  </div>

                  {/* <h3 className={styles.sectionTitle}>
                    Treatment Engagement Metrics
                  </h3> */}
                  <div className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={engagementData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "0.5rem",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="attendance"
                          fill="#8b5cf6"
                          name="Session Attendance %"
                        />
                        <Bar
                          dataKey="participation"
                          fill="#0ea5e9"
                          name="Session Participation %"
                        />
                        <Bar
                          dataKey="homework"
                          fill="#22c55e"
                          name="Homework Completion %"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <h4 className={styles.statTitle}>PHQ-9 Score Trend</h4>
                    <div className={styles.statValue}>
                      <span className={styles.statNumber}>9 → 5</span>
                      <span className={styles.statChange}>-44%</span>
                    </div>
                    <p className={styles.statNote}>
                      Moderate to Mild Depression
                    </p>
                  </div>

                  <div className={`${styles.statCard} ${styles.statCardBlue}`}>
                    <h4 className={styles.statTitle}>GAD-7 Score Trend</h4>
                    <div className={styles.statValue}>
                      <span className={styles.statNumber}>12 → 8</span>
                      <span className={styles.statChange}>-33%</span>
                    </div>
                    <p className={styles.statNote}>Moderate to Mild Anxiety</p>
                  </div>

                  <div className={`${styles.statCard} ${styles.statCardGreen}`}>
                    <h4 className={styles.statTitle}>Quality of Life</h4>
                    <div className={styles.statValue}>
                      <span className={styles.statNumber}>42 → 68</span>
                      <span className={styles.statChange}>+62%</span>
                    </div>
                    <p className={styles.statNote}>Poor to Moderate QoL</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "insights" && (
              <div className={styles.contentSection}>
                <h3 className={styles.sectionTitle}>
                  Therapeutic Insights & Observations
                </h3>

                <div className={styles.insightsContainer}>
                  <div className={styles.insightCard}>
                    <h4 className={styles.insightTitle}>Pattern Recognition</h4>
                    <p className={styles.insightText}>
                      Analysis of session notes reveals a strong correlation
                      between workplace stressors and depressive symptom spikes.
                      Social interaction patterns show increased isolation
                      preceding anxiety episodes. Sleep disturbance appears to
                      be both a trigger and consequence of mood deterioration.
                    </p>
                  </div>

                  <div className={styles.insightCard}>
                    <h4 className={styles.insightTitle}>Treatment Response</h4>
                    <p className={styles.insightText}>
                      Most significant symptom improvement observed after
                      introduction of behavioral activation techniques. CBT
                      thought records show increasing ability to identify and
                      challenge negative thought patterns. Medication adherence
                      has been consistent, with reported side effects decreasing
                      over time.
                    </p>
                  </div>

                  <div className={styles.insightCard}>
                    <h4 className={styles.insightTitle}>
                      Barriers to Progress
                    </h4>
                    <p className={styles.insightText}>
                      Work schedule volatility continues to interfere with
                      consistent therapy homework completion. Family dynamics,
                      particularly conflict with sibling, represents unresolved
                      stressor. Perfectionism remains a cognitive barrier that
                      limits full engagement with CBT techniques.
                    </p>
                  </div>

                  <div className={styles.aiInsightCard}>
                    <h4 className={styles.aiInsightTitle}>
                      AI-Generated Treatment Considerations
                    </h4>
                    <div className={styles.aiSuggestions}>
                      <div className={styles.aiSuggestion}>
                        <div className={styles.aiIconContainer}>
                          <Brain size={14} className={styles.aiIcon} />
                        </div>
                        <p className={styles.aiSuggestionText}>
                          Consider exploring ACT (Acceptance and Commitment
                          Therapy) techniques to address perfectionism barriers.
                        </p>
                      </div>
                      <div className={styles.aiSuggestion}>
                        <div className={styles.aiIconContainer}>
                          <Brain size={14} className={styles.aiIcon} />
                        </div>
                        <p className={styles.aiSuggestionText}>
                          Homework completion patterns suggest need for simpler,
                          more accessible between-session activities.
                        </p>
                      </div>
                      <div className={styles.aiSuggestion}>
                        <div className={styles.aiIconContainer}>
                          <Brain size={14} className={styles.aiIcon} />
                        </div>
                        <p className={styles.aiSuggestionText}>
                          Response pattern indicates high potential benefit from
                          increased focus on sleep hygiene protocol.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.researchSection}>
                  <h3 className={styles.sectionTitle}>
                    Research-Based Recommendations
                  </h3>
                  <div className={styles.researchCard}>
                    <p className={styles.researchText}>
                      Based on recent research in treatment of comorbid
                      depression and anxiety, consider introducing elements of
                      Behavioral Activation with targeted exposure components.
                      Meta-analysis data suggests this combined approach
                      significantly outperforms standard CBT for this specific
                      diagnostic profile, particularly when workplace stressors
                      are prominent contributors.
                    </p>
                    <div className={styles.evidenceInfo}>
                      <span className={styles.evidenceBadge}>
                        Evidence Level: Moderate
                      </span>
                      <span className={styles.evidenceStats}>
                        Based on 8 RCTs, n=742
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerText}>
            CareFlowAI © 2025 | Report generated on May 20, 2025
          </div>
          <div className={styles.footerText}>
            This report is generated using AI assistance and should be reviewed
            by qualified healthcare professionals.
          </div>
        </div>
      </footer>
    </div>
  );
}
