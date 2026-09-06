"use client";

import { useEffect, useMemo, useState } from "react";

type Message = {
  role: "user" | "lomi";
  text: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
};

type ResumeResult = {
  ats_score?: number;
  overall_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  missing_skills?: string[];
  keyword_gaps?: string[];
  recommendations?: string[];
  modified_resume?: string;
  section_feedback?: {
    summary?: string;
    skills?: string;
    education?: string;
    projects?: string;
    experience?: string;
    certifications?: string;
  };
  error?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Skill = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
};

type Course = {
  id: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  skills: string[];
  description: string;
  url: string;
};

const courses: Course[] = [
  {
    id: "java",
    title: "Java Programming Mastery",
    category: "Programming",
    level: "Beginner",
    duration: "6 weeks",
    skills: ["Java", "OOP", "Collections"],
    description:
      "Build strong Java fundamentals for placements and development.",
    url: "https://dev.java/learn/",
  },
  {
    id: "python",
    title: "Python for Beginners",
    category: "Programming",
    level: "Beginner",
    duration: "4 weeks",
    skills: ["Python", "Programming", "Problem Solving"],
    description:
      "Learn Python from basics with practical coding exercises.",
    url: "https://docs.python.org/3/tutorial/",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    category: "DSA",
    level: "Intermediate",
    duration: "8 weeks",
    skills: ["DSA", "Algorithms", "Problem Solving"],
    description:
      "Prepare for coding interviews with DSA concepts and practice.",
    url: "https://www.geeksforgeeks.org/data-structures/",
  },
  {
    id: "sql",
    title: "SQL & Database Fundamentals",
    category: "Database",
    level: "Beginner",
    duration: "3 weeks",
    skills: ["SQL", "DBMS", "Databases"],
    description:
      "Master SQL queries and database concepts used in placements.",
    url: "https://sqlbolt.com/",
  },
  {
    id: "datascience",
    title: "Data Science Roadmap",
    category: "Data Science",
    level: "Intermediate",
    duration: "10 weeks",
    skills: ["Python", "Pandas", "NumPy", "Statistics"],
    description:
      "Learn the core skills required to start a Data Science career.",
    url: "https://www.kaggle.com/learn",
  },
  {
    id: "ml",
    title: "Machine Learning Foundations",
    category: "AI/ML",
    level: "Intermediate",
    duration: "8 weeks",
    skills: ["Machine Learning", "Python", "Statistics"],
    description:
      "Understand machine learning algorithms and build practical models.",
    url: "https://www.kaggle.com/learn/intro-to-machine-learning",
  },
  {
    id: "web",
    title: "Modern Web Development",
    category: "Web Development",
    level: "Intermediate",
    duration: "8 weeks",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    description:
      "Build modern responsive web applications.",
    url: "https://www.freecodecamp.org/learn/",
  },
  {
    id: "aptitude",
    title: "Placement Aptitude Accelerator",
    category: "Aptitude",
    level: "Beginner",
    duration: "4 weeks",
    skills: ["Percentages", "Profit & Loss", "Ratios", "Time & Work"],
    description:
      "Practice the most important aptitude topics for placements.",
    url: "https://www.indiabix.com/aptitude/questions-and-answers/",
  },
  {
    id: "communication",
    title: "Professional Communication",
    category: "Soft Skills",
    level: "Beginner",
    duration: "3 weeks",
    skills: ["Communication", "Interview Skills", "Presentation"],
    description:
      "Improve workplace communication and interview confidence.",
    url: "https://learnenglish.britishcouncil.org/",
  },
  {
    id: "powerbi",
    title: "Power BI & Data Visualization",
    category: "Data Science",
    level: "Intermediate",
    duration: "4 weeks",
    skills: ["Power BI", "Data Visualization", "Analytics"],
    description:
      "Create dashboards and communicate data insights effectively.",
    url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/",
  },
];

const roleRequirements: Record<string, string[]> = {
  "Data Scientist": [
    "Python",
    "SQL",
    "Pandas",
    "NumPy",
    "Statistics",
    "Machine Learning",
    "Power BI",
  ],
  "Java Developer": [
    "Java",
    "OOP",
    "DSA",
    "SQL",
    "Git",
    "Problem Solving",
  ],
  "Web Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Git",
    "Problem Solving",
  ],
  "Data Analyst": [
    "SQL",
    "Excel",
    "Python",
    "Power BI",
    "Statistics",
    "Data Visualization",
  ],
  "AI/ML Engineer": [
    "Python",
    "Machine Learning",
    "Statistics",
    "NumPy",
    "Pandas",
    "Deep Learning",
  ],
};

const roadmap = [
  {
    title: "Programming Fundamentals",
    icon: "💻",
    description: "Build strong coding fundamentals.",
  },
  {
    title: "Core Technical Skills",
    icon: "🧠",
    description:
      "Learn the technologies required for your target role.",
  },
  {
    title: "Problem Solving",
    icon: "🧩",
    description:
      "Practice DSA, aptitude and logical reasoning.",
  },
  {
    title: "Projects",
    icon: "🚀",
    description:
      "Build real-world projects to prove your skills.",
  },
  {
    title: "Resume",
    icon: "📄",
    description:
      "Create an ATS-friendly resume.",
  },
  {
    title: "Interview Preparation",
    icon: "🎤",
    description:
      "Practice technical and HR interviews.",
  },
  {
    title: "Placement Ready",
    icon: "🏆",
    description:
      "Apply confidently for your target roles.",
  },
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] =
    useState<ResumeResult | null>(null);

  const [activeTab, setActiveTab] = useState<
    "chat" | "resume" | "career" | "skills" | "courses" | "roadmap"
  >("chat");

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [skillLevel, setSkillLevel] =
    useState<Skill["level"]>("Beginner");

  const [targetRole, setTargetRole] =
    useState("Data Scientist");

  const [completedCourses, setCompletedCourses] =
    useState<string[]>([]);

  const [courseSearch, setCourseSearch] = useState("");
  const [courseCategory, setCourseCategory] = useState("All");

  useEffect(() => {
    const savedChats =
      localStorage.getItem("lomi_chat_history");

    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setTimeout(() => setSessions(parsed), 0);
      } catch {
        console.log("Could not load chat history");
      }
    }

    const savedSkills =
      localStorage.getItem("lomi_skills");

    if (savedSkills) {
      try {
        setTimeout(
          () => setSkills(JSON.parse(savedSkills)),
          0
        );
      } catch {
        console.log("Could not load skills");
      }
    }

    const savedCourses =
      localStorage.getItem("lomi_completed_courses");

    if (savedCourses) {
      try {
        setTimeout(
          () =>
            setCompletedCourses(
              JSON.parse(savedCourses)
            ),
          0
        );
      } catch {
        console.log(
          "Could not load course progress"
        );
      }
    }

    const savedRole =
      localStorage.getItem("lomi_target_role");

    if (savedRole) {
      setTimeout(
        () => setTargetRole(savedRole),
        0
      );
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(
        "lomi_chat_history",
        JSON.stringify(sessions)
      );
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(
      "lomi_skills",
      JSON.stringify(skills)
    );
  }, [skills]);

  useEffect(() => {
    localStorage.setItem(
      "lomi_completed_courses",
      JSON.stringify(completedCourses)
    );
  }, [completedCourses]);

  useEffect(() => {
    localStorage.setItem(
      "lomi_target_role",
      targetRole
    );
  }, [targetRole]);

  const askLomi = async () => {
    if (!message.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      text: message.trim(),
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 120000);

    try {
      const response = await fetch(
        `${API_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage.text,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          "Backend request failed"
        );
      }

      const data = await response.json();

      const lomiMessage: Message = {
        role: "lomi",
        text:
          data.reply ||
          data.response ||
          data.message ||
          "Sorry, I couldn't generate a response.",
      };

      const finalMessages = [
        ...updatedMessages,
        lomiMessage,
      ];

      setMessages(finalMessages);
      saveCurrentChat(finalMessages);
    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        role: "lomi",
        text:
          error instanceof DOMException &&
          error.name === "AbortError"
            ? "⏳ Lomi is taking longer than expected. Please try again."
            : "❌ I couldn't connect to Lomi's backend.",
      };

      const finalMessages = [
        ...updatedMessages,
        errorMessage,
      ];

      setMessages(finalMessages);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const saveCurrentChat = (
    chatMessages: Message[]
  ) => {
    if (chatMessages.length === 0) return;

    const firstUserMessage =
      chatMessages.find(
        (m) => m.role === "user"
      )?.text ||
      "New conversation";

    const chat: ChatSession = {
      id: Date.now().toString(),
      title:
        firstUserMessage.length > 35
          ? firstUserMessage.substring(0, 35) +
            "..."
          : firstUserMessage,
      messages: chatMessages,
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) => {
      const existing = prev[0];

      if (
        existing &&
        existing.messages.length <
          chatMessages.length
      ) {
        return [
          {
            ...existing,
            messages: chatMessages,
          },
          ...prev.slice(1),
        ];
      }

      return [chat, ...prev];
    });
  };

  const openChat = (session: ChatSession) => {
    setMessages(session.messages);
    setActiveTab("chat");
  };

  const newChat = () => {
    setMessages([]);
    setMessage("");
    setActiveTab("chat");
  };

  const clearHistory = () => {
    localStorage.removeItem(
      "lomi_chat_history"
    );
    setSessions([]);
    setMessages([]);
  };

  const scanResume = async () => {
    if (!resumeFile) return;

    setResumeLoading(true);
    setResumeResult(null);

    try {
      const formData = new FormData();

      formData.append("file", resumeFile);

      const response = await fetch(
        `${API_URL}/resume/scan`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          "Resume scanning failed"
        );
      }

      const data = await response.json();

      setResumeResult(data);
    } catch (error) {
      console.error(error);

      setResumeResult({
        error:
          "Unable to scan resume. Please make sure the backend resume scanner is running.",
      });
    } finally {
      setResumeLoading(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;

    const exists = skills.some(
      (skill) =>
        skill.name.toLowerCase() ===
        newSkill.trim().toLowerCase()
    );

    if (exists) {
      setNewSkill("");
      return;
    }

    setSkills((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newSkill.trim(),
        level: skillLevel,
      },
    ]);

    setNewSkill("");
  };

  const deleteSkill = (id: string) => {
    setSkills((prev) =>
      prev.filter(
        (skill) => skill.id !== id
      )
    );
  };

  const generateSkillsCard = () => {
    const content = `
LOMI — SKILLS CARD

Target Role: ${targetRole}

Technical & Professional Skills

${
  skills.length > 0
    ? skills
        .map(
          (skill) =>
            `• ${skill.name} — ${skill.level}`
        )
        .join("\n")
    : "No skills added yet."
}

Generated by LOMI AI Career Copilot
`;

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "LOMI-Skills-Card.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  const toggleCourse = (
    courseId: string
  ) => {
    setCompletedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter(
            (id) => id !== courseId
          )
        : [...prev, courseId]
    );
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const searchMatch =
        course.title
          .toLowerCase()
          .includes(
            courseSearch.toLowerCase()
          ) ||
        course.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(
              courseSearch.toLowerCase()
            )
        );

      const categoryMatch =
        courseCategory === "All" ||
        course.category ===
          courseCategory;

      return (
        searchMatch &&
        categoryMatch
      );
    });
  }, [
    courseSearch,
    courseCategory,
  ]);

  const requiredSkills =
    roleRequirements[targetRole] ||
    [];

  const userSkillNames = skills.map(
    (skill) =>
      skill.name.toLowerCase()
  );

  const matchedSkills =
    requiredSkills.filter((skill) =>
      userSkillNames.includes(
        skill.toLowerCase()
      )
    );

  const missingSkills =
    requiredSkills.filter(
      (skill) =>
        !userSkillNames.includes(
          skill.toLowerCase()
        )
    );

  const skillGapPercentage =
    requiredSkills.length === 0
      ? 0
      : Math.round(
          (matchedSkills.length /
            requiredSkills.length) *
            100
        );

  const courseProgress =
    courses.length === 0
      ? 0
      : Math.round(
          (completedCourses.length /
            courses.length) *
            100
        );

  const skillProgress =
    skills.length === 0
      ? 0
      : Math.min(
          100,
          skills.length * 15
        );

  const careerScore =
    Math.round(
      skillGapPercentage * 0.4 +
        courseProgress * 0.3 +
        (resumeResult?.overall_score ??
          0) *
          0.3
    );

  const achievements = [
    {
      icon: "🌱",
      title: "First Skill",
      unlocked:
        skills.length >= 1,
      description:
        "Add your first skill",
    },
    {
      icon: "🧠",
      title: "Skill Builder",
      unlocked:
        skills.length >= 5,
      description:
        "Add 5 skills",
    },
    {
      icon: "📚",
      title: "First Course",
      unlocked:
        completedCourses.length >=
        1,
      description:
        "Complete your first course",
    },
    {
      icon: "🔥",
      title: "Learning Mode",
      unlocked:
        completedCourses.length >=
        3,
      description:
        "Complete 3 courses",
    },
    {
      icon: "🎯",
      title: "Career Focused",
      unlocked:
        skillGapPercentage >= 70,
      description:
        "Reach 70% skill match",
    },
    {
      icon: "🏆",
      title: "Placement Ready",
      unlocked:
        careerScore >= 80,
      description:
        "Reach 80+ career score",
    },
  ];

  const suggestions = [
    "What should I study today?",
    "Am I ready for placements?",
    "How can I improve my coding skills?",
    "Create a 30 day placement plan",
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-[-150px] top-[-150px] h-[450px] w-[450px] animate-pulse rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute right-[-150px] top-[20%] h-[450px] w-[450px] animate-pulse rounded-full bg-purple-600/20 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_45%)]" />

      </div>

      {/* NAVBAR */}

      <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xl transition hover:bg-white/10"
            >
              ☰
            </button>

            <div>

              <h1 className="text-2xl font-black tracking-wider text-blue-400">
                LOMI
              </h1>

              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                AI Career Copilot
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs text-green-400 md:block">
              <span className="mr-2 animate-pulse">
                ●
              </span>
              LOMI ONLINE
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
              👤
            </div>

          </div>

        </div>

      </header>

      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-[73px] z-30 h-[calc(100vh-73px)] w-72 border-r border-white/10 bg-[#050b18]/95 p-5 backdrop-blur-2xl transition-transform duration-500 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <button
          onClick={newChat}
          className="mb-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 font-semibold shadow-lg shadow-blue-500/20 transition hover:scale-[1.02]"
        >
          ＋ New Conversation
        </button>

        <div className="mb-3 flex items-center justify-between">

          <span className="text-xs uppercase tracking-widest text-slate-500">
            LOMI Features
          </span>

          {sessions.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          )}

        </div>

        <div className="space-y-2 overflow-y-auto">

          <SidebarButton
            icon="🤖"
            text="AI Copilot"
            onClick={() =>
              setActiveTab("chat")
            }
          />

          <SidebarButton
            icon="🪪"
            text="My Skills Card"
            onClick={() =>
              setActiveTab("skills")
            }
          />

          <SidebarButton
            icon="📚"
            text="Course Hub"
            onClick={() =>
              setActiveTab("courses")
            }
          />

          <SidebarButton
            icon="🎯"
            text="Skill Gap"
            onClick={() =>
              setActiveTab("roadmap")
            }
          />

          <SidebarButton
            icon="🗺️"
            text="Career Roadmap"
            onClick={() =>
              setActiveTab("roadmap")
            }
          />

          <SidebarButton
            icon="📄"
            text="Resume Scanner"
            onClick={() =>
              setActiveTab("resume")
            }
          />

          <SidebarButton
            icon="📊"
            text="Career Dashboard"
            onClick={() =>
              setActiveTab("career")
            }
          />

        </div>

        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

          <p className="text-xs text-slate-500">
            Your LOMI data is stored locally.
          </p>

          <p className="mt-1 text-xs text-blue-400">
            🔐 No login required
          </p>

        </div>

      </aside>

      {/* MAIN */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">

        {/* HERO */}

        <div className="mb-10 text-center">

          <div className="relative mx-auto mb-8 h-36 w-36">

            <div className="absolute inset-0 animate-spin rounded-full border border-blue-400/30 [animation-duration:8s]" />

            <div className="absolute inset-3 animate-spin rounded-full border border-purple-400/30 [animation-duration:5s] [animation-direction:reverse]" />

            <div className="absolute inset-8 animate-pulse rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 shadow-[0_0_80px_rgba(59,130,246,0.7)]" />

            <div className="absolute inset-[44px] flex items-center justify-center rounded-full bg-[#07101f] text-3xl shadow-inner">
              🤖
            </div>

          </div>

          <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-blue-400">
            Intelligent Career Intelligence
          </p>

          <h2 className="text-4xl font-black md:text-6xl">

            Your future.
            <br />

            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Powered by LOMI.
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Your personal AI companion for resumes,
            skills, courses, placements, coding,
            aptitude, interviews and career growth.
          </p>

        </div>

        {/* TABS */}

        <div className="mb-8 flex flex-wrap justify-center gap-2">

          <TabButton
            active={activeTab === "chat"}
            onClick={() =>
              setActiveTab("chat")
            }
            icon="🤖"
            text="AI Copilot"
          />

          <TabButton
            active={activeTab === "skills"}
            onClick={() =>
              setActiveTab("skills")
            }
            icon="🪪"
            text="Skills Card"
          />

          <TabButton
            active={activeTab === "courses"}
            onClick={() =>
              setActiveTab("courses")
            }
            icon="📚"
            text="Courses"
          />

          <TabButton
            active={activeTab === "roadmap"}
            onClick={() =>
              setActiveTab("roadmap")
            }
            icon="🎯"
            text="Skill Gap"
          />

          <TabButton
            active={activeTab === "resume"}
            onClick={() =>
              setActiveTab("resume")
            }
            icon="📄"
            text="Resume Scanner"
          />

          <TabButton
            active={activeTab === "career"}
            onClick={() =>
              setActiveTab("career")
            }
            icon="📊"
            text="Career Dashboard"
          />

        </div>

        {/* CHAT */}

        {activeTab === "chat" && (
          <div className="mx-auto max-w-4xl">

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl">

              <div className="max-h-[480px] space-y-5 overflow-y-auto p-3">

                {messages.length === 0 ? (
                  <div className="py-12 text-center">

                    <div className="mb-5 text-5xl">
                      ✨
                    </div>

                    <h3 className="text-xl font-bold">
                      What can I help you achieve?
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Ask LOMI about your career,
                      studies or placements.
                    </p>

                    <div className="mt-7 flex flex-wrap justify-center gap-3">

                      {suggestions.map(
                        (item) => (
                          <button
                            key={item}
                            onClick={() =>
                              setMessage(item)
                            }
                            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-blue-500/10"
                          >
                            {item}
                          </button>
                        )
                      )}

                    </div>

                  </div>
                ) : (
                  messages.map(
                    (msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                            msg.role ===
                            "user"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600"
                              : "border border-white/10 bg-white/[0.05]"
                          }`}
                        >

                          <div className="mb-2 text-xs opacity-60">
                            {msg.role ===
                            "user"
                              ? "You"
                              : "🤖 Lomi"}
                          </div>

                          <div className="whitespace-pre-wrap leading-7">
                            {msg.text}
                          </div>

                        </div>

                      </div>
                    )
                  )
                )}

                {loading && (
                  <div className="flex">

                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4">

                      <span className="animate-pulse text-blue-400">
                        Lomi is thinking... ✨
                      </span>

                    </div>

                  </div>
                )}

              </div>

              <div className="mt-5 flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                        "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      askLomi();
                    }
                  }}
                  placeholder="Ask Lomi anything..."
                  disabled={loading}
                  className="min-h-14 flex-1 resize-none bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <button
                  onClick={askLomi}
                  disabled={loading}
                  className="self-end rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-bold transition hover:scale-105 disabled:opacity-50"
                >
                  {loading
                    ? "..."
                    : "Send →"}
                </button>

              </div>

            </div>

          </div>
        )}

        {/* SKILLS */}

        {activeTab === "skills" && (
          <div className="mx-auto max-w-6xl">

            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

                <div className="mb-6 text-5xl">
                  🪪
                </div>

                <h3 className="text-2xl font-bold">
                  My Skills Card
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Build your personal skill profile and keep it
                  updated as you learn.
                </p>

                <label className="mt-7 block text-sm text-slate-400">
                  Target Career
                </label>

                <select
                  value={targetRole}
                  onChange={(e) =>
                    setTargetRole(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07101f] px-4 py-3 text-white outline-none"
                >
                  {Object.keys(
                    roleRequirements
                  ).map((role) => (
                    <option key={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <label className="mt-6 block text-sm text-slate-400">
                  Add Skill
                </label>

                <input
                  value={newSkill}
                  onChange={(e) =>
                    setNewSkill(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      addSkill();
                    }
                  }}
                  placeholder="Example: Python"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <select
                  value={skillLevel}
                  onChange={(e) =>
                    setSkillLevel(
                      e.target.value as Skill["level"]
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[#07101f] px-4 py-3 text-white outline-none"
                >
                  <option>
                    Beginner
                  </option>
                  <option>
                    Intermediate
                  </option>
                  <option>
                    Advanced
                  </option>
                </select>

                <button
                  onClick={addSkill}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 font-bold transition hover:scale-[1.02]"
                >
                  ＋ Add Skill
                </button>

                <button
                  onClick={
                    generateSkillsCard
                  }
                  className="mt-3 w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/20"
                >
                  ⬇ Generate Skills Card
                </button>

              </div>

              <div className="rounded-[28px] border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.08] p-8 backdrop-blur-xl">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
                      LOMI Skills Profile
                    </p>

                    <h3 className="mt-2 text-3xl font-black">
                      {targetRole}
                    </h3>

                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">

                    <div className="text-2xl font-black text-blue-400">
                      {skillProgress}%
                    </div>

                    <div className="text-[10px] text-slate-500">
                      SKILL PROFILE
                    </div>

                  </div>

                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-2">

                  {skills.length === 0 ? (
                    <div className="col-span-2 rounded-2xl border border-dashed border-white/10 p-10 text-center">

                      <div className="text-4xl">
                        🧠
                      </div>

                      <p className="mt-4 text-slate-400">
                        Add your skills to build your profile.
                      </p>

                    </div>
                  ) : (
                    skills.map(
                      (skill) => (
                        <div
                          key={
                            skill.id
                          }
                          className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-blue-500/30"
                        >

                          <div className="flex items-center justify-between">

                            <span className="font-semibold">
                              {skill.name}
                            </span>

                            <button
                              onClick={() =>
                                deleteSkill(
                                  skill.id
                                )
                              }
                              className="text-xs text-red-400 opacity-0 transition group-hover:opacity-100"
                            >
                              Delete
                            </button>

                          </div>

                          <div className="mt-3 flex items-center justify-between">

                            <span className="text-xs text-slate-500">
                              {skill.level}
                            </span>

                            <span className="text-xs text-blue-400">
                              {skill.level ===
                              "Beginner"
                                ? "40%"
                                : skill.level ===
                                  "Intermediate"
                                ? "70%"
                                : "100%"}
                            </span>

                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">

                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{
                                width:
                                  skill.level ===
                                  "Beginner"
                                    ? "40%"
                                    : skill.level ===
                                      "Intermediate"
                                    ? "70%"
                                    : "100%",
                              }}
                            />

                          </div>

                        </div>
                      )
                    )
                  )}

                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-400">
                      Target role skill match
                    </span>

                    <span className="font-bold text-blue-400">
                      {skillGapPercentage}%
                    </span>

                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                      style={{
                        width: `${skillGapPercentage}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* COURSES */}

        {activeTab === "courses" && (
          <div className="mx-auto max-w-6xl">

            <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>

                  <p className="text-sm uppercase tracking-[0.25em] text-blue-400">
                    Learn • Practice • Grow
                  </p>

                  <h3 className="mt-2 text-3xl font-black">
                    Course Hub 📚
                  </h3>

                  <p className="mt-2 text-slate-500">
                    Learn the skills needed for your career.
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">

                  <div className="text-3xl font-black text-blue-400">
                    {courseProgress}%
                  </div>

                  <div className="text-xs text-slate-500">
                    COURSE PROGRESS
                  </div>

                </div>

              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">

                <input
                  value={courseSearch}
                  onChange={(e) =>
                    setCourseSearch(
                      e.target.value
                    )
                  }
                  placeholder="🔎 Search courses or skills..."
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <select
                  value={courseCategory}
                  onChange={(e) =>
                    setCourseCategory(
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-white/10 bg-[#07101f] px-4 py-3 text-white outline-none"
                >
                  <option>
                    All
                  </option>
                  <option>
                    Programming
                  </option>
                  <option>
                    DSA
                  </option>
                  <option>
                    Database
                  </option>
                  <option>
                    Data Science
                  </option>
                  <option>
                    AI/ML
                  </option>
                  <option>
                    Web Development
                  </option>
                  <option>
                    Aptitude
                  </option>
                  <option>
                    Soft Skills
                  </option>
                </select>

              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {filteredCourses.map(
                (course) => {
                  const completed =
                    completedCourses.includes(
                      course.id
                    );

                  return (
                    <div
                      key={course.id}
                      className={`group rounded-[26px] border p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-2 ${
                        completed
                          ? "border-green-500/30 bg-green-500/[0.05]"
                          : "border-white/10 bg-white/[0.04] hover:border-blue-500/30"
                      }`}
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">

                          {course.category ===
                          "Programming"
                            ? "💻"
                            : course.category ===
                              "DSA"
                            ? "🧩"
                            : course.category ===
                              "Data Science"
                            ? "📊"
                            : course.category ===
                              "AI/ML"
                            ? "🤖"
                            : course.category ===
                              "Web Development"
                            ? "🌐"
                            : course.category ===
                              "Aptitude"
                            ? "🧮"
                            : "📚"}

                        </div>

                        {completed && (
                          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                            ✓ Completed
                          </span>
                        )}

                      </div>

                      <p className="mt-5 text-xs uppercase tracking-widest text-blue-400">
                        {course.category}
                      </p>

                      <h4 className="mt-2 text-xl font-bold">
                        {course.title}
                      </h4>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {course.description}
                      </p>

                      <div className="mt-5 flex gap-2">

                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                          {course.level}
                        </span>

                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                          ⏱ {course.duration}
                        </span>

                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">

                        {course.skills.map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-lg bg-white/[0.04] px-2 py-1 text-xs text-slate-400"
                            >
                              {skill}
                            </span>
                          )
                        )}

                      </div>

                      <div className="mt-6 flex gap-2">

                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-center font-semibold transition hover:scale-[1.02]"
                        >
                          🚀 Start Learning
                        </a>

                        <button
                          onClick={() =>
                            toggleCourse(
                              course.id
                            )
                          }
                          className={`rounded-xl px-4 py-3 font-semibold transition ${
                            completed
                              ? "border border-green-500/20 bg-green-500/10 text-green-400"
                              : "border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
                          }`}
                          title={
                            completed
                              ? "Mark as not completed"
                              : "Mark course as completed"
                          }
                        >
                          {completed
                            ? "✓"
                            : "○"}
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {filteredCourses.length ===
              0 && (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">

                <div className="text-5xl">
                  🔎
                </div>

                <h3 className="mt-4 text-xl font-bold">
                  No courses found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search or category.
                </p>

              </div>
            )}

          </div>
        )}

        {/* SKILL GAP / ROADMAP */}

        {activeTab === "roadmap" && (
          <div className="mx-auto max-w-6xl">

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>

                  <p className="text-sm uppercase tracking-[0.25em] text-blue-400">
                    Personalized Career Intelligence
                  </p>

                  <h3 className="mt-2 text-3xl font-black">
                    Skill Gap Analyzer 🎯
                  </h3>

                  <p className="mt-2 text-slate-500">
                    Find exactly which skills you need for your target role.
                  </p>

                </div>

                <select
                  value={targetRole}
                  onChange={(e) =>
                    setTargetRole(
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-white/10 bg-[#07101f] px-5 py-3 text-white outline-none"
                >
                  {Object.keys(
                    roleRequirements
                  ).map((role) => (
                    <option key={role}>
                      {role}
                    </option>
                  ))}
                </select>

              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-3">

                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">

                  <div className="text-4xl font-black text-blue-400">
                    {skillGapPercentage}%
                  </div>

                  <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">
                    Role Match
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">

                  <div className="text-4xl font-black text-green-400">
                    {matchedSkills.length}
                  </div>

                  <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">
                    Skills Matched
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">

                  <div className="text-4xl font-black text-purple-400">
                    {missingSkills.length}
                  </div>

                  <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">
                    Skills Missing
                  </p>

                </div>

              </div>

              <div className="mt-8">

                <h4 className="text-xl font-bold">
                  Your Skill Analysis
                </h4>

                <div className="mt-4 grid gap-3 md:grid-cols-2">

                  {requiredSkills.map(
                    (skill) => {
                      const matched =
                        userSkillNames.includes(
                          skill.toLowerCase()
                        );

                      return (
                        <div
                          key={skill}
                          className={`flex items-center justify-between rounded-2xl border p-4 ${
                            matched
                              ? "border-green-500/20 bg-green-500/[0.05]"
                              : "border-orange-500/20 bg-orange-500/[0.05]"
                          }`}
                        >

                          <span className="font-semibold">
                            {skill}
                          </span>

                          <span
                            className={
                              matched
                                ? "text-green-400"
                                : "text-orange-400"
                            }
                          >
                            {matched
                              ? "✓ Have it"
                              : "⚠ Need to learn"}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {missingSkills.length >
                0 && (
                <div className="mt-8 rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] p-6">

                  <h4 className="text-lg font-bold">
                    🚀 Recommended Next Skills
                  </h4>

                  <div className="mt-4 flex flex-wrap gap-3">

                    {missingSkills.map(
                      (skill) => (
                        <button
                          key={skill}
                          onClick={() => {
                            setCourseSearch(
                              skill
                            );
                            setActiveTab(
                              "courses"
                            );
                          }}
                          className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
                        >
                          Learn {skill} →
                        </button>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* ROADMAP */}

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

              <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
                Your journey
              </p>

              <h3 className="mt-2 text-3xl font-black">
                Career Roadmap 🗺️
              </h3>

              <div className="mt-8 space-y-4">

                {roadmap.map(
                  (step, index) => (
                    <div
                      key={step.title}
                      className="relative flex items-center gap-5"
                    >

                      {index !==
                        roadmap.length -
                          1 && (
                        <div className="absolute left-6 top-14 h-8 w-px bg-gradient-to-b from-blue-500/60 to-purple-500/10" />
                      )}

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-xl">
                        {step.icon}
                      </div>

                      <div className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-4">

                        <div className="flex items-center justify-between gap-3">

                          <h4 className="font-bold">
                            {step.title}
                          </h4>

                          <span className="text-xs text-slate-600">
                            STEP{" "}
                            {index + 1}
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {step.description}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>
        )}

        {/* RESUME */}

        {activeTab === "resume" && (
          <div className="mx-auto max-w-6xl">

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">

              {/* UPLOAD CARD */}

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

                <div className="mb-6 text-5xl">
                  📄
                </div>

                <h3 className="text-2xl font-bold">
                  AI Resume Scanner
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Upload your resume and LOMI will analyze it for
                  ATS compatibility, skills, keywords, weaknesses
                  and improvements.
                </p>

                <label className="mt-8 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-500/30 bg-blue-500/[0.04] p-6 text-center transition hover:bg-blue-500/[0.08]">

                  <div className="text-4xl">
                    ☁️
                  </div>

                  <p className="mt-4 max-w-full break-all font-semibold">
                    {resumeFile
                      ? resumeFile.name
                      : "Drop your resume here"}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    PDF or DOCX
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0] ||
                        null;

                      setResumeFile(file);
                      setResumeResult(null);
                    }}
                  />

                </label>

                <button
                  onClick={scanResume}
                  disabled={
                    !resumeFile ||
                    resumeLoading
                  }
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 font-bold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {resumeLoading
                    ? "🔍 Scanning Resume..."
                    : "✨ Scan My Resume"}
                </button>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    AI Analysis Includes
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-slate-500">
                    <p>✓ ATS compatibility</p>
                    <p>✓ Resume strengths & weaknesses</p>
                    <p>✓ Missing skills</p>
                    <p>✓ Keyword gaps</p>
                    <p>✓ Section-by-section feedback</p>
                    <p>✓ Recommended improvements</p>
                  </div>

                </div>

              </div>

              {/* RESULT CARD */}

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

                {!resumeResult ? (
                  <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">

                    <div className="mb-5 text-6xl">
                      🧠
                    </div>

                    <h3 className="text-xl font-bold">
                      Your AI analysis will appear here
                    </h3>

                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                      Upload your resume and scan it to get
                      ATS score, keyword gaps, missing skills,
                      detailed feedback and improvement suggestions.
                    </p>

                  </div>
                ) : resumeResult.error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
                    ❌{" "}
                    {resumeResult.error}
                  </div>
                ) : (
                  <div>

                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
                          AI Resume Intelligence
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                          Resume Analysis
                        </h3>
                      </div>

                      <div className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs text-green-400">
                        ✓ Analysis Complete
                      </div>

                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">

                      <ScoreCard
                        title="ATS Score"
                        score={
                          resumeResult.ats_score ??
                          0
                        }
                      />

                      <ScoreCard
                        title="Overall Score"
                        score={
                          resumeResult.overall_score ??
                          0
                        }
                      />

                    </div>

                    <ResultSection
                      title="💪 Strengths"
                      items={
                        resumeResult.strengths
                      }
                    />

                    <ResultSection
                      title="⚠️ Weaknesses"
                      items={
                        resumeResult.weaknesses
                      }
                    />

                    <ResultSection
                      title="🎯 Missing Skills"
                      items={
                        resumeResult.missing_skills
                      }
                    />

                    <ResultSection
                      title="🔑 Keyword Gaps"
                      items={
                        resumeResult.keyword_gaps
                      }
                    />

                    <ResultSection
                      title="✨ Recommended Modifications"
                      items={
                        resumeResult.recommendations
                      }
                    />

                    {resumeResult.section_feedback && (
                      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">

                        <h4 className="mb-4 font-semibold">
                          📋 Section-by-Section Feedback
                        </h4>

                        <div className="space-y-3">

                          {Object.entries(
                            resumeResult.section_feedback
                          ).map(
                            ([section, feedback]) =>
                              feedback ? (
                                <div
                                  key={section}
                                  className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
                                >

                                  <p className="mb-2 font-semibold capitalize text-purple-300">
                                    {section}
                                  </p>

                                  <p className="text-sm leading-6 text-slate-400">
                                    {feedback}
                                  </p>

                                </div>
                              ) : null
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>

            {/* IMPROVED RESUME */}

            {resumeResult?.modified_resume && (
              <div className="mt-6 rounded-[28px] border border-blue-500/20 bg-blue-500/[0.04] p-8">

                <div className="mb-5 flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <span className="text-3xl">
                      ✨
                    </span>

                    <div>

                      <h3 className="text-xl font-bold">
                        Improved Resume Content
                      </h3>

                      <p className="text-sm text-slate-500">
                        LOMI&apos;s suggested improved version
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() => {
                      const blob = new Blob(
                        [
                          resumeResult.modified_resume ||
                            "",
                        ],
                        {
                          type: "text/plain",
                        }
                      );

                      const url =
                        URL.createObjectURL(
                          blob
                        );

                      const a =
                        document.createElement(
                          "a"
                        );

                      a.href = url;
                      a.download =
                        "LOMI-Improved-Resume.txt";
                      a.click();

                      URL.revokeObjectURL(
                        url
                      );
                    }}
                    className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                  >
                    ⬇ Save
                  </button>

                </div>

                <div className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-6 leading-7 text-slate-300">
                  {
                    resumeResult.modified_resume
                  }
                </div>

              </div>
            )}

          </div>
        )}

        {/* CAREER DASHBOARD */}

        {activeTab === "career" && (
          <div className="mx-auto max-w-6xl">

            <div className="grid gap-5 md:grid-cols-4">

              <DashboardCard
                icon="🧠"
                title="Skills"
                value={`${skillProgress}%`}
              />

              <DashboardCard
                icon="📚"
                title="Courses"
                value={`${courseProgress}%`}
              />

              <DashboardCard
                icon="🎯"
                title="Role Match"
                value={`${skillGapPercentage}%`}
              />

              <DashboardCard
                icon="🏆"
                title="Career Score"
                value={`${careerScore}`}
              />

            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

                <h3 className="text-2xl font-bold">
                  Your Career Readiness
                </h3>

                <div className="mt-8 flex justify-center">

                  <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full border-8 border-blue-500/20 shadow-[0_0_60px_rgba(59,130,246,0.15)]">

                    <div className="text-center">

                      <div className="text-5xl font-black text-blue-400">
                        {careerScore}
                      </div>

                      <div className="text-xs uppercase tracking-widest text-slate-500">
                        READINESS
                      </div>

                    </div>

                  </div>

                </div>

                <p className="mt-8 text-center text-sm leading-6 text-slate-500">
                  Your readiness score combines your target-role
                  skills, learning progress and resume score.
                </p>

              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

                <h3 className="text-2xl font-bold">
                  🏆 Achievements
                </h3>

                <div className="mt-6 space-y-3">

                  {achievements.map(
                    (achievement) => (
                      <div
                        key={
                          achievement.title
                        }
                        className={`flex items-center gap-4 rounded-2xl border p-4 ${
                          achievement.unlocked
                            ? "border-blue-500/20 bg-blue-500/[0.05]"
                            : "border-white/5 bg-white/[0.02] opacity-50"
                        }`}
                      >

                        <div className="text-2xl">
                          {
                            achievement.icon
                          }
                        </div>

                        <div className="flex-1">

                          <div className="font-semibold">
                            {
                              achievement.title
                            }
                          </div>

                          <div className="text-xs text-slate-500">
                            {
                              achievement.description
                            }
                          </div>

                        </div>

                        <div>
                          {achievement.unlocked
                            ? "✓"
                            : "🔒"}
                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

              <h3 className="text-2xl font-bold">
                📈 Your Learning Overview
              </h3>

              <div className="mt-6 space-y-5">

                <ProgressRow
                  label="Skills Profile"
                  value={skillProgress}
                />

                <ProgressRow
                  label="Courses Completed"
                  value={courseProgress}
                />

                <ProgressRow
                  label={`${targetRole} Skill Match`}
                  value={
                    skillGapPercentage
                  }
                />

                <ProgressRow
                  label="Resume Score"
                  value={
                    resumeResult?.overall_score ??
                    0
                  }
                />

              </div>

            </div>

          </div>
        )}

        {/* FEATURE CARDS */}

        <div className="mt-20 grid gap-5 md:grid-cols-4">

          <FeatureCard
            icon="🪪"
            title="Skills Card"
            text="Build and maintain your professional skill profile."
          />

          <FeatureCard
            icon="📚"
            title="Course Hub"
            text="Discover courses and track your learning progress."
          />

          <FeatureCard
            icon="🎯"
            title="Skill Gap"
            text="Find the skills you need for your dream role."
          />

          <FeatureCard
            icon="🗺️"
            title="Career Roadmap"
            text="Follow a structured path from learning to placement."
          />

        </div>

      </section>

      {/* FOOTER */}

      <footer className="relative z-10 mt-20 border-t border-white/10 py-8 text-center">

        <p className="text-sm text-slate-500">
          © 2026 LOMI — Your AI Career Copilot 🚀
        </p>

        <p className="mt-2 text-xs text-slate-600">
          Developed by{" "}
          <span className="creator-name text-sm font-semibold">
            Ketha Lohitha
          </span>
        </p>

      </footer>

    </main>
  );
}

/* ========================================
   COMPONENTS
======================================== */

function TabButton({
  active,
  onClick,
  icon,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  text: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
        active
          ? "border-blue-500/40 bg-blue-500/15 text-blue-400 shadow-lg shadow-blue-500/10"
          : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07]"
      }`}
    >
      {icon} {text}
    </button>
  );
}

function SidebarButton({
  icon,
  text,
  onClick,
}: {
  icon: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/[0.03] p-3 text-left text-sm text-slate-300 transition hover:border-blue-500/20 hover:bg-blue-500/10"
    >
      <span>{icon}</span>
      <span>{text}</span>
    </button>
  );
}

function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  const safeScore = Math.min(
    100,
    Math.max(0, score)
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">

      <div className="text-4xl font-black text-blue-400">
        {safeScore}
      </div>

      <div className="mt-2 text-xs uppercase tracking-widest text-slate-500">
        {title}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
          style={{
            width: `${safeScore}%`,
          }}
        />

      </div>

    </div>
  );
}

function ResultSection({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0)
    return null;

  return (
    <div className="mt-6">

      <h4 className="mb-3 font-semibold">
        {title}
      </h4>

      <div className="space-y-2">

        {items.map(
          (item, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm leading-6 text-slate-400"
            >
              {item}
            </div>
          )
        )}

      </div>

    </div>
  );
}

function DashboardCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-blue-500/30">

      <div className="text-3xl">
        {icon}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black text-blue-400">
        {value}
      </p>

    </div>
  );
}

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue = Math.min(
    100,
    Math.max(0, value)
  );

  return (
    <div>

      <div className="mb-2 flex justify-between text-sm">

        <span className="text-slate-400">
          {label}
        </span>

        <span className="font-bold text-blue-400">
          {safeValue}%
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
          style={{
            width: `${safeValue}%`,
          }}
        />

      </div>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-3 hover:border-blue-500/30 hover:bg-blue-500/[0.05]">

      <div className="text-4xl transition duration-500 group-hover:scale-125">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}