# backend/inspect_pipeline.py
import os
import pickle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "best_academic_model.pkl")

def main():
    print("\n" + "="*60)
    print(" 🛡️ PIPELINE STRUCTURAL ARCHITECTURE INSPECTOR ")
    print("="*60)
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Target artifact missing at: {MODEL_PATH}")
        print("Please ensure train_model.py has run successfully first.")
        print("="*60 + "\n")
        return

    print(f"🔄 Reading file: models/best_academic_model.pkl...")
    with open(MODEL_PATH, "rb") as f:
        pipeline = pickle.load(f)
        
    # 1. Print the top-level object type
    print(f"\n🔹 1. Top-Level Object Type:\n   {type(pipeline)}")
    
    # 2. Print named steps keys if available
    print("\n🔹 2. Internal Step Keys:")
    if hasattr(pipeline, "named_steps"):
        steps_keys = list(pipeline.named_steps.keys())
        print(f"   {steps_keys}")
        
        # 3. Print the class name of each underlying step component
        print("\n🔹 3. Component Class Map:")
        for step_name, step_object in pipeline.named_steps.items():
            print(f"   👉 Step Layer: '{step_name}' -> Class: {type(step_object).__name__}")
    else:
        print("   ⚠️ Warning: This saved object does not expose a 'named_steps' attribute.")
        
    print("="*60 + "\n")

if __name__ == "__main__":
    main()