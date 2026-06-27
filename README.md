# 🎓 EduPredict AI

An AI-powered student performance prediction and personalized learning platform built using **React**, **FastAPI**, **Supabase**, and **Machine Learning**.

EduPredict AI helps students analyze their academic performance, predict future SGPA, identify weak topics through quiz analytics, and receive personalized study recommendations.

---

## 🚀 Features

### 📈 Academic Performance Prediction
- Predicts future SGPA using Machine Learning
- Risk classification (Low / Medium / High)
- Personalized academic recommendations
- Prediction history tracking

### 🧠 AI Quiz Generator
- Generates quizzes automatically from uploaded study material
- Multiple choice and descriptive questions
- Automatic evaluation of quiz responses
- Topic-wise performance analysis

### 📚 AI Study Roadmap
- Calculates mastery percentage for every topic
- Identifies weakest topics
- Generates personalized learning roadmap
- Displays strongest subject and learning status

### 📊 Analytics Dashboard
- Current SGPA calculation
- Predicted SGPA visualization
- Historical prediction tracking
- Feature impact analysis
- Academic intervention recommendations

### 👤 Student Profile
- Stores demographic information
- Attendance tracking
- Study habits
- Lifestyle metrics
- Subject grades and credits

### 🤖 AI Tutor
- Interactive learning assistant
- Answers academic questions
- Provides concept explanations
- Assists with quiz preparation

---

# 🏗️ Tech Stack

## Frontend
- React.js
- Tailwind CSS
- React Router
- Lucide React
- Axios

## Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Uvicorn

## Database
- Supabase PostgreSQL

## Machine Learning
- Scikit-learn
- XGBoost
- Random Forest
- Ridge Regression
- SHAP Explainability
- Pandas
- NumPy

---

# 🧠 Machine Learning Pipeline

The prediction engine was trained using the **UCI Student Performance Dataset**.

### Models Evaluated

- Ridge Regression
- Random Forest Regressor
- XGBoost Regressor

The best-performing model is automatically selected and exported for production inference.

---

# 📂 Project Structure

```
student-ai-tutor/

│
├── backend/
│   ├── app/
│   ├── models/
│   ├── data/
│   ├── train_model.py
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/EduPredict-AI.git

cd EduPredict-AI
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate
```

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn app.main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Environment Variables

## Backend

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=your_supabase_database_url

JWT_SECRET=your_secret_key

GOOGLE_API_KEY=your_google_api_key
```

---

## Frontend

Create a `.env` file inside the frontend folder.

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

# 📊 Dataset

This project uses the

**UCI Student Performance Dataset**

https://archive.ics.uci.edu/ml/datasets/student+performance

---

# 📷 Screenshots

Add screenshots here after deployment.

- Home Dashboard
- Analytics Dashboard
- Quiz Generator
- Study Roadmap
- AI Tutor

---

# 🔮 Future Improvements

- PDF-based quiz generation
- Adaptive learning plans
- LLM-powered tutoring
- Student performance comparison
- Faculty analytics dashboard
- Mobile application

---

# 👩‍💻 Author

**Shreya Dubey**

Computer Science Undergraduate

GitHub: https://github.com/shreya801994

---

# 📄 License

This project is intended for educational and research purposes.
