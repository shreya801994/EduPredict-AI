# Machine Learning Research & Empirical Findings

## Executive Summary
This document logs the experimental verification phase of the student predictive analytics core. Through rigorous testing across multiple feature configurations and model types, we have determined a clear boundary limit for early demographic prediction models, justifying the necessity of interactive assessment tracking.

## 📊 Experimental Results Matrix

| Core ID | Feature Configuration Layer | Chosen Algorithm | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | R² Accuracy Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Experiment A** | **Full Feature Spectrum (Includes $G_1$, $G_2$)** | **XGBRegressor (Champion)** | **0.912** | **1.607** | **0.833** |
| Experiment B | Full Demographic Set (Excludes Exams) | RandomForestRegressor | 2.510 | 3.520 | 0.230 |
| Experiment C | Initial App Feature Layout (No Intake) | RandomForestRegressor | 2.940 | 3.820 | 0.076 |
| **Experiment D** | **Expanded App Intake Survey Layout** | **Ridge Regression** | **2.737** | **3.769** | **0.081** |

---

## 🛠️ Explainable AI (XAI) Analysis Summary
Using an optimized `shap.TreeExplainer` applied directly to the high-signal Champion Model (`best_academic_model.pkl`), we isolated global feature impact metrics across 1,044 consolidated student entries.

### Top 5 Absolute Predictive Predictors
1. **$G_2$ (Second Period Exam Grade):** 2.4823 Mean Grade Point Impact
2. **Absences (Student Absenteeism Rate):** 0.3965 Mean Grade Point Impact
3. **$G_1$ (First Period Exam Grade):** 0.2422 Mean Grade Point Impact
4. **Subject Type (Math vs. Language Categorization):** 0.1628 Mean Grade Point Impact
5. **Age:** 0.0682 Mean Grade Point Impact

### Key Research Conclusions
* **The Static Intake Bottleneck:** Expanding static demographic forms (Experiment D) only yielded an $R^2$ of `0.081`. Static behavioral indicators do not offer enough mathematical signal to predict final academic metrics reliably.
* **Empirical Strategic Pivot:** The profound dominance of current grade features ($G_1, G_2$) indicates that to build an effective predictive platform, the system must generate its own continuous streams of real-time academic interaction data. This justifies shifting development focus toward the **Adaptive Quiz Tracking Architecture**.