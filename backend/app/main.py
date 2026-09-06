import os
import json
import tempfile

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

from pypdf import PdfReader
from docx import Document


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing in backend/.env")


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(api_key=GROQ_API_KEY)

# Fast production model supported by Groq
MODEL_NAME = "openai/gpt-oss-20b"


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="LOMI AI Career Copilot API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODELS
# =========================================================

class ChatRequest(BaseModel):
    message: str


class GoogleLoginRequest(BaseModel):
    email: str | None = None
    name: str | None = None


# =========================================================
# LOMI SYSTEM INSTRUCTION
# =========================================================

LOMI_INSTRUCTION = """
You are LOMI, an AI Career Copilot for students.

You should feel natural and conversational like ChatGPT, but your PRIMARY
purpose is education, learning and career development.

MAIN AREAS:

- Academics
- Learning
- Study plans
- Programming
- Coding
- Data Science
- Artificial Intelligence
- Aptitude
- Reasoning
- Placements
- Jobs
- Resume
- ATS
- Interviews
- Mock interviews
- Career planning
- Skills
- Projects
- Internships
- Competitive exams
- Communication skills
- Time management
- Student productivity

IMPORTANT BEHAVIOR:

1. EDUCATION / CAREER QUESTIONS

If the user asks about education, coding, aptitude, placements, resume,
jobs, interviews, skills, projects or career:

Give a useful and detailed answer.

2. GENERAL / NON-EDUCATION QUESTIONS

If the user asks about something unrelated such as cricket, movies,
cooking, politics, entertainment, celebrities, etc.:

DO NOT completely refuse.

Give a short basic answer, normally 1-3 sentences.

Then naturally redirect the user toward education/career.

Do NOT turn unrelated questions into long discussions.

3. CONVERSATION

Maintain context from the conversation whenever possible.

4. STUDENT INFORMATION

NEVER invent personal student information.

Do not assume the student's:

- marks
- CGPA
- skills
- projects
- certifications
- experience
- achievements
- job history
- college
- branch

unless the user has explicitly provided that information.

5. APTITUDE

For aptitude questions:

- Explain the concept simply.
- Show calculations step by step.
- Give shortcuts when useful.
- Focus on placement/MCQ methods.

6. CODING

For coding questions:

- Explain simply.
- Provide correct code.
- Mention important mistakes when useful.

7. PLACEMENTS

Give practical and actionable placement preparation advice.

8. RESUMES

Help improve resumes, ATS compatibility, projects, skills and job matching.

9. LANGUAGE

The user may use Telugu, English or Telugu-English mixed language.

Reply naturally in the language/style used by the user.

10. STYLE

Be friendly, encouraging and concise when possible.

Do not repeatedly say that you are an AI.

Do not unnecessarily repeat the user's question.
"""


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "LOMI backend is running!",
        "status": "success",
        "model": MODEL_NAME
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "groq": bool(GROQ_API_KEY),
        "model": MODEL_NAME
    }


# =========================================================
# CHAT
# =========================================================

@app.post("/chat")
def chat(request: ChatRequest):

    user_message = request.message.strip()

    if not user_message:
        return {
            "reply": "Please type something and I'll help you 😊"
        }

    try:

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": LOMI_INSTRUCTION
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.7,
            max_tokens=2048
        )

        reply = completion.choices[0].message.content

        if not reply:
            reply = "I couldn't generate a response right now. Please try again."

        return {
            "reply": reply.strip()
        }

    except Exception as e:

        print("\n========== LOMI CHAT ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("=====================================\n")

        return {
            "reply": (
                "⚠️ LOMI couldn't generate a response right now. "
                "Please try again."
            )
        }


# =========================================================
# PDF TEXT EXTRACTION
# =========================================================

def extract_pdf_text(file_path: str) -> str:

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


# =========================================================
# DOCX TEXT EXTRACTION
# =========================================================

def extract_docx_text(file_path: str) -> str:

    document = Document(file_path)

    text = []

    for paragraph in document.paragraphs:

        if paragraph.text.strip():
            text.append(paragraph.text)

    return "\n".join(text)


# =========================================================
# RESUME SCANNER
# =========================================================

@app.post("/resume/scan")
async def scan_resume(file: UploadFile = File(...)):

    temp_path = None

    try:

        filename = file.filename or ""

        extension = filename.lower().split(".")[-1]

        if extension not in ["pdf", "docx"]:

            return {
                "error": "Only PDF and DOCX resumes are supported."
            }

        # Create temporary file
        suffix = "." + extension

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_path = temp_file.name

            file_bytes = await file.read()

            temp_file.write(file_bytes)

        # Extract resume text
        if extension == "pdf":

            resume_text = extract_pdf_text(temp_path)

        else:

            resume_text = extract_docx_text(temp_path)

        if not resume_text.strip():

            return {
                "error": "Could not extract text from this resume."
            }

        # Prevent extremely large prompts
        resume_text = resume_text[:30000]

        # =================================================
        # RESUME ANALYSIS PROMPT
        # =================================================

        resume_prompt = f"""
You are an expert ATS resume analyzer and student placement coach.

Analyze the following student resume.

Return ONLY valid JSON.

Required JSON structure:

{{
  "ats_score": 0,
  "overall_score": 0,
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [],
  "keyword_gaps": [],
  "recommendations": [],
  "section_feedback": {{
      "summary": "",
      "skills": "",
      "education": "",
      "projects": "",
      "experience": "",
      "certifications": ""
  }},
  "modified_resume": ""
}}

Rules:

- ats_score must be between 0 and 100.
- overall_score must be between 0 and 100.
- Do not invent information that is not present.
- Do not create fake projects.
- Do not create fake companies.
- Do not create fake experience.
- Do not create fake achievements.
- Identify useful missing skills for student placements.
- Give practical recommendations.
- Keep modified_resume truthful.
- Use concise feedback.

RESUME:

{resume_text}
"""

        # =================================================
        # GROQ RESUME ANALYSIS
        # =================================================

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert ATS resume analyzer. "
                        "Always return valid JSON when requested."
                    )
                },
                {
                    "role": "user",
                    "content": resume_prompt
                }
            ],
            temperature=0.2,
            max_tokens=5000
        )

        result_text = completion.choices[0].message.content

        if not result_text:

            return {
                "error": "AI could not analyze the resume."
            }

        result_text = result_text.strip()

        # Remove markdown code fences
        if result_text.startswith("```json"):
            result_text = result_text[7:]

        elif result_text.startswith("```"):
            result_text = result_text[3:]

        if result_text.endswith("```"):
            result_text = result_text[:-3]

        result_text = result_text.strip()

        # Parse JSON
        try:

            result = json.loads(result_text)

        except json.JSONDecodeError:

            print("\n========== RESUME JSON ERROR ==========")
            print(result_text)
            print("=======================================\n")

            return {
                "error": "Resume analysis returned an invalid format."
            }

        return result

    except Exception as e:

        print("\n========== RESUME ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("==================================\n")

        return {
            "error": "Unable to scan the resume right now."
        }

    finally:

        # Delete temporary resume file
        if temp_path and os.path.exists(temp_path):

            try:
                os.remove(temp_path)

            except Exception:
                pass


# =========================================================
# GOOGLE AUTH PLACEHOLDER
# =========================================================

@app.post("/auth/google")
def google_login(data: GoogleLoginRequest):

    return {
        "message": "Google authentication endpoint is ready.",
        "email": data.email,
        "name": data.name
    }