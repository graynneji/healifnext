import { GoogleGenAI } from "@google/genai";

export async function main(prompts) {
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API,
  });
  const config = {
    responseMimeType: "text/plain",
  };
  const model = "gemini-2.0-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Generate an AI report that takes all therapist note for a patient, patient questionairs, chat history: overview - {primary diagnosis e.g Major Depressive disorder (F33.1), severity e.g moderate}, {secondary diagnosis e.g Generalized anxiety disorder (F41.1) severity e.g mild}, current approach, recommendations, treatment goal e.g Reduced depressive symptoms: 70%, Develope 3 effective anxiety management strategiess: 66%, return to full work schedule: 40%, imporve sleep and duration: 35%. Progress Metrics - 5 months first month for wellness score, anxiety score, depression score. for same month session attendance, session participation, home completion in %, PHQ-9 score trend - e.g 9 - 5, 44%, moderate to mild depression, GAD-7 score trend e.g 12 - 8, 33% moderate to mild anxiety, Quality of life e.g 42 -68, 62% poor to moderate QoL. Insights - pattern recognition, treatment respose, barrier to progress, AI generated treatment considerations - 3 bullet points`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Okay, here's a sample AI-generated report based on your specifications. This report synthesizes hypothetical data from therapist notes, patient questionnaires, and chat history.

---

**AI-Powered Patient Progress & Insights Report**

**Patient ID:** [Insert Patient ID]
**Report Date:** October 26, 2023
**Data Sources Analyzed:** Therapist Session Notes (Last 5 months), Patient-Completed Questionnaires (PHQ-9, GAD-7, QoL Scale), Secure Chat History (Last 5 months).

---

**I. OVERVIEW**

*   **Primary Diagnosis:** Major Depressive Disorder, recurrent episode (F33.1)
    *   **Severity (Initial):** Moderate to Severe
    *   **Severity (Current):** Mild
*   **Secondary Diagnosis:** Generalized Anxiety Disorder (F41.1)
    *   **Severity (Initial):** Moderate
    *   **Severity (Current):** Mild
*   **Current Approach:**
    *   Cognitive Behavioral Therapy (CBT) focusing on identifying and challenging negative automatic thoughts and behavioral activation.
    *   Mindfulness-Based Stress Reduction (MBSR) techniques for anxiety management and present-moment awareness.
    *   Psychoeducation on the nature of depression and anxiety.
*   **Recommendations:**
    1.  Continue weekly CBT/MBSR sessions for skill consolidation.
    2.  Introduce graded exposure for specific anxiety-provoking situations related to work.
    3.  Explore assertive communication skills training to address interpersonal stressors identified in chat logs.
    4.  Maintain regular sleep hygiene practices.
*   **Treatment Goals & Current Progress:**
    *   Reduce depressive symptoms (PHQ-9 target <5): **70%** (Current PHQ-9 at 9 from 18, significant reduction)
    *   Develop 3 effective anxiety management strategies: **66%** (Patient consistently uses 2: deep breathing, 5-4-3-2-1 grounding; third strategy - thought challenging - is less consistently applied)
    *   Return to full work schedule (from 60% capacity): **40%** (Currently at 80% capacity, struggling with full return due to anticipatory anxiety)
    *   Improve sleep quality and duration (target 7-8 hours, subjective quality 'good'): **35%** (Sleep duration increased from ~5 to ~6 hours, quality`,
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: `Generate an AI report that takes all therapist note for a patient, patient questionairs, chat history: overview - {primary diagnosis e.g Major Depressive disorder (F33.1), severity e.g moderate}, {secondary diagnosis e.g Generalized anxiety disorder (F41.1) severity e.g mild}, current approach, recommendations, treatment goal e.g Reduced depressive symptoms: 70%, Develope 3 effective anxiety management strategiess: 66%, return to full work schedule: 40%, imporve sleep and duration: 35%. Progress Metrics - 5 months first month for wellness score, anxiety score, depression score. for same month session attendance, session participation, home completion in %, PHQ-9 score trend - e.g 9 - 5, 44%, moderate to mild depression, GAD-7 score trend e.g 12 - 8, 33% moderate to mild anxiety, Quality of life e.g 42 -68, 62% poor to moderate QoL. Insights - pattern recognition, treatment respose, barrier to progress, AI generated treatment considerations - 3 bullet points in JSON
`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `\`\`\`json
{
  "patientId": "PT789012",
  "reportDate": "2023-10-27",
  "dataSourcesAnalyzed": [
    "Therapist Session Notes (Last 5 months)",
    "Patient-Completed Questionnaires (PHQ-9, GAD-7, QoL Scale)",
    "Secure Chat History (Last 5 months)"
  ],
  "overview": {
    "primaryDiagnosis": {
      "condition": "Major Depressive Disorder, recurrent episode",
      "code": "F33.1",
      "initialSeverity": "Moderate",
      "currentSeverity": "Mild"
    },
    "secondaryDiagnosis": {
      "condition": "Generalized Anxiety Disorder",
      "code": "F41.1",
      "initialSeverity": "Moderate",
      "currentSeverity": "Mild"
    },
    "currentApproach": [
      "Cognitive Behavioral Therapy (CBT) focusing on cognitive restructuring and behavioral activation.",
      "Mindfulness and Relaxation Techniques for anxiety management.",
      "Psychoeducation regarding symptom management and relapse prevention."
    ],
    "recommendations": [
      "Continue weekly CBT sessions with emphasis on challenging negative core beliefs.",
      "Introduce graded exposure therapy for social anxiety triggers identified in chat history.",
      "Explore adjunctive group therapy for social support and skill practice.",
      "Reinforce sleep hygiene practices and monitor impact on mood."
    ],
    "treatmentGoals": [
      {
        "goalDescription": "Reduced depressive symptoms (Target PHQ-9 < 5)",
        "progressPercentage": 70
      },
      {
        "goalDescription": "Develop 3 effective anxiety management strategies (consistent use)",
        "progressPercentage": 66
      },
      {
        "goalDescription": "Return to full work schedule (from 50% current)",
        "progressPercentage": 40
      },
      {
        "goalDescription": "Improve sleep quality and duration (target 7 hours consistently)",
        "progressPercentage": 35
      }
    ]
  },
  "progressMetrics": {
    "timePeriodMonths": 5,
    "monthlyScores": [
      {
        "month": 1,
        "wellnessScore": 45,
        "anxietyScore": 15,
        "depressionScore": 18,
        "sessionAttendancePercentage": 100,
        "sessionParticipationLevel": "Moderate",
        "homeworkCompletionPercentage": 60
      },
      {
        "month": 2,
        "wellnessScore": 50,
        "anxietyScore": 13,
        "depressionScore": 15,
        "sessionAttendancePercentage": 100,
        "sessionParticipationLevel": "Good",
        "homeworkCompletionPercentage": 70
      },
      {
        "month": 3,
        "wellnessScore": 58,
        "anxietyScore": 11,
        "depressionScore": 12,
        "sessionAttendancePercentage": 75,
        "sessionParticipationLevel": "Good",
        "homeworkCompletionPercentage": 65
      },
      {
        "month": 4,
        "wellnessScore": 65,
        "anxietyScore": 10,
        "depressionScore": 10,
        "sessionAttendancePercentage": 100,
        "sessionParticipationLevel": "High",
        "homeworkCompletionPercentage": 75
      },
      {
        "month": 5,
        "wellnessScore": 70,
        "anxietyScore": 8,
        "depressionScore": 9,
        "sessionAttendancePercentage": 100,
        "sessionParticipationLevel": "High",
        "homeworkCompletionPercentage": 80
      }
    ],
    "phq9Trend": {
      "initialScore": 18,
      "currentScore": 9,
      "percentageChange": 50,
      "severityChange": "Moderate to Mild depression"
    },
    "gad7Trend": {
      "initialScore": 15,
      "currentScore": 8,
      "percentageChange": 46.67,
      "severityChange": "Moderate to Mild anxiety"
    },
    "qualityOfLifeTrend": {
      "initialScore": 42,
      "currentScore": 68,
      "percentageChange": 61.90,
      "qualitativeChange": "Poor to Moderate QoL"
    }
  },
  "insights": {
    "patternRecognition": [
      "Patient engagement (participation, homework) strongly correlates with symptom reduction.",
      "Anxiety scores show slight increase prior to work-related discussions or anticipated social events (noted in chat history).",
      "Missed session in Month 3 coincided with a temporary plateau in GAD-7 improvement."
    ],
    "treatmentResponse": "Patient demonstrates good overall response to CBT, particularly in reducing depressive cognitions. Mindfulness techniques are being utilized for generalized anxiety, but application for specific phobic triggers (social/work) is less consistent.",
    "barriersToProgress": [
      "Avoidance behaviors related to returning to a full work schedule, driven by anticipatory anxiety.",
      "Perfectionistic thinking sometimes hinders completion of behavioral activation tasks.",
      "Occasional inconsistency in applying anxiety management strategies outside of session."
    ],
    "aiGeneratedTreatmentConsiderations": [
      "Consider targeted interventions for anticipatory anxiety related to work, potentially using imaginal exposure or role-playing within CBT.",
      "Explore motivational interviewing techniques to address ambivalence around full work return and enhance commitment to exposure tasks.",
      "Integrate app-based reminders or tracking for mindfulness practices and homework to improve consistency between sessions."
    ]
  }
}
\`\`\``,
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: prompts,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  let result;
  for await (const chunk of response) {
    // return chunk.text
    result += chunk.text;
  }
  return result;
}

// main();
