export const AI_PROMPT = `
Generate a mental health progress report for a patient using the following details:

Therapist Notes: {therapistNotes}
Patient Questionnaires (PHQ-9, GAD-7, QoL): {questionnaireData}
Secure Chat History: {chatHistory} or skip

Include:
- Overview:
  - Primary diagnosis with ICD-10 code and severity (initial and current)
  - Secondary diagnosis with ICD-10 code and severity (initial and current)
  - Current treatment approach
  - Recommendations
  - Treatment goals with current progress percentage

- Progress Metrics over {totalMonths} months, the (date) if there are no ranges from the dates date it back five months from that time:
  - Monthly breakdown of:
    - Wellness score
    - Anxiety score
    - Depression score
    - Session attendance (%)
    - Session participation level
    - Homework completion (%)
  - PHQ-9 trend: initial score, current score, % change, severity change
  - GAD-7 trend: initial score, current score, % change, severity change
  - Quality of life trend: initial score, current score, % change, qualitative improvement

- Insights:
  - Pattern recognition
  - Treatment response summary
  - Barriers to progress
  - 3 AI-generated treatment considerations

Return the report in JSON format.
`;
