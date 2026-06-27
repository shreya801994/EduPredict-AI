# backend/train_model.py
"""
Offline model training script.

This script trains and evaluates multiple regression models
on the UCI Student Performance dataset and exports the
production inference pipelines used by EduPredict AI.
"""
import os
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MAT_PATH = os.path.join(BASE_DIR, "data", "student-mat.csv")
POR_PATH = os.path.join(BASE_DIR, "data", "student-por.csv")
MODEL_OUT_DIR = os.path.join(BASE_DIR, "models")

def load_and_merge_datasets():
    print("🔄 Ingesting raw UCI data source files from disk...")
    if not os.path.exists(MAT_PATH) or not os.path.exists(POR_PATH):
        raise FileNotFoundError("❌ Source datasets missing. Drop student-mat.csv and student-por.csv into backend/data/")
    
    df_mat = pd.read_csv(MAT_PATH, sep=";")
    df_por = pd.read_csv(POR_PATH, sep=";")
    
    # Inject subject classification tokens
    df_mat['subject_type'] = 1  # Mathematics
    df_por['subject_type'] = 0  # Portuguese Language
    
    combined_df = pd.concat([df_mat, df_por], ignore_index=True)
    print(f"✅ Consolidation complete. Total records pooled: {combined_df.shape[0]} rows.")
    return combined_df

def build_preprocessing_pipeline(categorical_cols, numeric_cols):
    return ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_cols),
            ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), categorical_cols)
        ]
    )

def run_experiment(name, df, feature_list, target_col='G3'):
    print(f"🚀 Processing Matrix Layer: {name}...")
    X = df[feature_list].copy()
    y = df[target_col].copy()
    
    numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_cols = X.select_dtypes(include=['object', 'str']).columns.tolist()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        "Ridge Regression": Ridge(alpha=1.0),
        "RandomForestRegressor": RandomForestRegressor(n_estimators=100, random_state=42),
        "XGBRegressor": XGBRegressor(n_estimators=100, learning_rate=0.05, random_state=42)
    }
    
    results = {}
    best_r2 = -float('inf')
    best_pipeline = None
    
    for model_name, model in models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', build_preprocessing_pipeline(categorical_cols, numeric_cols)),
            ('regressor', model)
        ])
        
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        
        results[model_name] = {"MAE": mae, "RMSE": rmse, "R2": r2}
        
        if r2 > best_r2:
            best_r2 = r2
            best_pipeline = pipeline
            
    return results, best_pipeline

def main():
    df = load_and_merge_datasets()
    
    # Standard base maps for translation alignment
    df['app_gender'] = df['sex'].map({'F': 'Female', 'M': 'Male'})
    df['app_family_support'] = df['famsup'].map({'yes': 'High', 'no': 'Low'})
    df['app_internet'] = df['internet'].map({'yes': 'Yes', 'no': 'No'})
    df['app_higher'] = df['higher'].map({'yes': 'Yes', 'no': 'No'})

    # --- EXPERIMENT FEATURE MAPS ---
    # Experiment A: Benchmark Academic Model (Includes G1/G2 Exams)
    features_A = ['school', 'sex', 'address', 'famsize', 'Pstatus', 'Mjob', 'Fjob', 'reason', 'guardian', 
                  'schoolsup', 'famsup', 'paid', 'activities', 'nursery', 'higher', 'internet', 'romantic',
                  'age', 'Medu', 'Fedu', 'traveltime', 'studytime', 'failures', 'famrel', 'freetime', 
                  'goout', 'Dalc', 'Walc', 'health', 'absences', 'subject_type', 'G1', 'G2']
    
    # 🚀 EXPERIMENT D: The Expanded App-Aligned Production Candidate
    # Mirrors your exact database columns: age, gender, study_hours, family_support, internet_access,
    # past_failures, higher_education_goal, go_out_frequency, travel_time, free_time, mother_education, father_education
    features_D = [
        'age',                  # profile.age
        'app_gender',           # profile.gender
        'studytime',            # profile.study_hours (binned)
        'app_family_support',   # profile.family_support
        'app_internet',         # profile.internet_access
        'failures',             # profile.past_failures
        'app_higher',           # profile.higher_education_goal
        'goout',                # profile.go_out_frequency
        'traveltime',           # profile.travel_time
        'freetime',             # profile.free_time
        'Medu',                 # profile.mother_education
        'Fedu'                  # profile.father_education
    ]
    
    # Run evaluations
    results_A, pipeline_A = run_experiment("Experiment A (Benchmark with Exams)", df, features_A)
    results_D, pipeline_D = run_experiment("Experiment D (The New App-Aligned Production Model)", df, features_D)
    
    print("\n" + "="*75)
    print(" 📊 UPDATED PRODUCTION SYSTEM SCORECARD ")
    print("="*75)
    
    for exp_name, exp_results in [("Experiment A (With G1/G2 Benchmark)", results_A), 
                                  ("Experiment D (New App-Aligned Production Model)", results_D)]:
        print(f"\n🔹 {exp_name}:")
        print(f"{'Algorithm':<25} | {'MAE':<8} | {'RMSE':<8} | {'R² Score':<8}")
        print("-" * 55)
        for alg, metrics in exp_results.items():
            print(f"{alg:<25} | {metrics['MAE']:.3f}   | {metrics['RMSE']:.3f}   | {metrics['R2']:.3f}")
            
    # Save the updated binaries cleanly
    os.makedirs(MODEL_OUT_DIR, exist_ok=True)
    with open(os.path.join(MODEL_OUT_DIR, "best_academic_model.pkl"), "wb") as f:
        pickle.dump(pipeline_A, f)
    with open(os.path.join(MODEL_OUT_DIR, "best_early_intervention_model.pkl"), "wb") as f:
        pickle.dump(pipeline_D, f)
        
    print(f"\n💾 Binary registry successfully updated with Experiment D!")

if __name__ == "__main__":
    main()