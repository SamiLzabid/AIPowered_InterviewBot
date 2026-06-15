import { useState, useRef, useEffect } from "react";

const API_BASE_URL = "http://localhost:8000";

const S = {
  app: { minHeight: "100vh", background: "#0c0e1a", color: "#e2e8f0", fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column" },
  header: { background: "#080a14", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  logoWrap: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: { background: "#6366f1", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 },
  logoTitle: { fontSize: "18px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" },
  logoSub: { fontSize: "11px", color: "#475569", marginTop: "2px" },
  targetBadge: { background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: "9px", padding: "7px 16px", fontSize: "12px", color: "#94a3b8" },
  main: { flex: 1, maxWidth: "900px", width: "100%", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column" },

  // Setup
  card: { background: "#131625", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", padding: "36px" },
  cardTitle: { fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" },
  cardSub: { fontSize: "13px", color: "#475569", marginTop: "6px", marginBottom: "30px" },
  twoCol: { display: "flex", gap: "36px", alignItems: "flex-start" },
  col: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" },
  colHeader: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#6366f1", paddingBottom: "12px", borderBottom: "1px solid rgba(99,102,241,0.15)", marginBottom: "0" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  fieldLabel: { fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#475569" },
  input: { width: "100%", background: "#080a14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", color: "#e2e8f0", outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#080a14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", color: "#e2e8f0", outline: "none", fontFamily: "inherit", boxSizing: "border-box", cursor: "pointer" },
  tierGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", background: "#080a14", padding: "5px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" },
  tierBtn: (active) => ({ padding: "9px", fontSize: "12px", fontWeight: 500, borderRadius: "7px", border: "none", cursor: "pointer", background: active ? "#6366f1" : "transparent", color: active ? "#fff" : "#64748b", transition: "all 0.15s" }),
  startBtn: { width: "100%", background: "#6366f1", color: "white", border: "none", borderRadius: "10px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "auto" },

  // Chat
  chatCard: { background: "#131625", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", display: "flex", flexDirection: "column", height: "620px", overflow: "hidden" },
  chatStatus: { background: "#0c0e1a", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  statusLeft: { display: "flex", alignItems: "center", gap: "8px" },
  statusDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 },
  statusText: { fontSize: "12px", color: "#94a3b8", fontWeight: 500 },
  counter: { fontSize: "12px", background: "#0c0e1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "7px", padding: "5px 12px", color: "#64748b" },
  messages: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "10px" },
  emptyIcon: { fontSize: "26px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "50%", width: "54px", height: "54px", display: "flex", alignItems: "center", justifyContent: "center" },
  bubbleWrap: (role) => ({ display: "flex", justifyContent: role === "user" ? "flex-end" : "flex-start" }),
  bubble: (role) => ({ maxWidth: "80%", padding: "12px 16px", borderRadius: "14px", fontSize: "13px", lineHeight: 1.65, whiteSpace: "pre-line", ...(role === "user" ? { background: "#6366f1", color: "#fff", borderBottomRightRadius: "4px" } : { background: "#1e2132", border: "1px solid rgba(255,255,255,0.06)", color: "#cbd5e1", borderBottomLeftRadius: "4px" }) }),
  chatInputArea: { padding: "16px 20px", background: "#0c0e1a", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 },
  chatRow: { display: "flex", gap: "10px", alignItems: "center" },
  chatInput: { flex: 1, background: "#131625", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#e2e8f0", outline: "none", fontFamily: "inherit" },
  sendBtn: (disabled) => ({ background: disabled ? "#1e2132" : "#6366f1", color: disabled ? "#475569" : "white", border: "none", borderRadius: "10px", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer", flexShrink: 0, fontSize: "18px" }),
  finishBlock: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  finishLabel: { fontSize: "12px", color: "#22c55e", fontWeight: 500 },
  finishBtn: { background: "#15803d", color: "white", border: "none", borderRadius: "10px", padding: "11px 24px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },

  // Feedback
  feedbackHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "24px" },
  feedbackTitle: { fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" },
  feedbackSub: { fontSize: "12px", color: "#475569", marginTop: "4px" },
  resetBtn: { background: "#1e2132", border: "1px solid rgba(255,255,255,0.07)", color: "#94a3b8", borderRadius: "9px", padding: "8px 16px", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0 },
  loadingBlock: { padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" },
  feedbackBody: { background: "#080a14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px", fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace", fontSize: "13px", lineHeight: 1.7, color: "#cbd5e1", whiteSpace: "pre-wrap", marginBottom: "16px" },
  runAgainBtn: { width: "100%", background: "#1e2132", border: "1px solid rgba(255,255,255,0.07)", color: "#e2e8f0", borderRadius: "10px", padding: "13px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
};

function Spinner() {
  return (
    <div style={{ width: "36px", height: "36px", border: "3px solid rgba(99,102,241,0.15)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  );
}

export default function App() {
  const [step, setStep] = useState("setup");
  const [profile, setProfile] = useState({ name: "", experience: "", skills: "", level: "Mid-level", position: "Data Scientist", company: "Amazon" });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const startInterview = () => {
    if (!profile.name || !profile.experience || !profile.skills) {
      alert("Please fill in all profile fields before starting.");
      return;
    }
    setStep("chat");
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isStreaming || userMessageCount >= 5) return;

    const userTurn = { role: "user", content: inputMessage.trim() };
    const updated = [...messages, userTurn];

    setMessages(updated);
    setInputMessage("");
    setUserMessageCount((n) => n + 1);
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, messages: updated, user_message_count: userMessageCount }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Stream connection failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const clean = line.trim();
          if (!clean.startsWith("data: ")) continue;
          const raw = clean.replace("data: ", "");
          if (raw === "[DONE]") break;

          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) throw new Error(parsed.error);
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + parsed.content };
              return next;
            });
          } catch (e) {
            console.error("SSE parse error:", e);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Backend Error: ${err.message}` }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const fetchFeedback = async () => {
    setStep("feedback");
    setIsLoadingFeedback(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/interview/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Feedback failed.");
      setFeedback(data.feedback);
    } catch (err) {
      setFeedback(`Error generating feedback: ${err.message}`);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const restartApp = () => {
    setStep("setup");
    setMessages([]);
    setUserMessageCount(0);
    setFeedback("");
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        input:focus, textarea:focus, select:focus { border-color: rgba(99,102,241,0.5) !important; }
        input::placeholder, textarea::placeholder { color: #2d3a4f; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #252a40; border-radius: 4px; }
      `}</style>

      <div style={S.app}>
        {/* ── Header ── */}
        <header style={S.header}>
          <div style={S.logoWrap}>
            <div style={S.logoIcon}>🏅</div>
            <div>
              <div style={S.logoTitle}>InterviewerAI</div>
              <div style={S.logoSub}>Enterprise Simulation Protocol</div>
            </div>
          </div>
          {step !== "setup" && (
            <div style={S.targetBadge}>
              Target:{" "}
              <span style={{ color: "#818cf8", fontWeight: 600 }}>{profile.level} {profile.position}</span>
              {" "}at{" "}
              <span style={{ color: "#fff" }}>{profile.company}</span>
            </div>
          )}
        </header>

        {/* ── Main ── */}
        <main style={S.main}>

          {/* VIEW 1 — SETUP */}
          {step === "setup" && (
            <div style={S.card}>
              <h2 style={S.cardTitle}>Configure Interview Parameters</h2>
              <p style={S.cardSub}>Fill in your profile and choose your target role. The AI adapts question depth to your level.</p>

              <div style={S.twoCol}>

                {/* Left — Candidate Profile */}
                <div style={S.col}>
                  <div style={S.colHeader}>Candidate Profile</div>

                  <div style={S.field}>
                    <label style={S.fieldLabel}>Full Name</label>
                    <input style={S.input} type="text" name="name" maxLength={40} value={profile.name} onChange={handleProfileChange} placeholder="e.g. Alex Chen" />
                  </div>

                  <div style={S.field}>
                    <label style={S.fieldLabel}>Experience Summary</label>
                    <textarea style={S.input} name="experience" maxLength={300} rows={4} value={profile.experience} onChange={handleProfileChange} placeholder="Describe your work history and key projects..." />
                  </div>

                  <div style={S.field}>
                    <label style={S.fieldLabel}>Core Skills</label>
                    <textarea style={S.input} name="skills" maxLength={200} rows={3} value={profile.skills} onChange={handleProfileChange} placeholder="Python, PyTorch, SQL, Kubernetes..." />
                  </div>
                </div>

                {/* Right — Target Assessment */}
                <div style={S.col}>
                  <div style={S.colHeader}>Target Assessment Scale</div>

                  <div style={S.field}>
                    <label style={S.fieldLabel}>Seniority Tier</label>
                    <div style={S.tierGrid}>
                      {["Junior", "Mid-level", "Senior"].map((lvl) => (
                        <button key={lvl} style={S.tierBtn(profile.level === lvl)} onClick={() => setProfile((p) => ({ ...p, level: lvl }))}>
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={S.field}>
                    <label style={S.fieldLabel}>Role / Title</label>
                    <select style={S.select} name="position" value={profile.position} onChange={handleProfileChange}>
                      {["Data Scientist", "Data Engineer", "ML Engineer", "BI Analyst"].map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div style={S.field}>
                    <label style={S.fieldLabel}>Target Company</label>
                    <select style={S.select} name="company" value={profile.company} onChange={handleProfileChange}>
                      {["Amazon", "Meta", "Udemy", "365 Company", "Nestle", "Spotify", "Nvidia"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <button style={{ ...S.startBtn, marginTop: "24px" }} onClick={startInterview}>
                    Start Interview →
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 2 — CHAT */}
          {step === "chat" && (
            <div style={S.chatCard}>

              {/* Status bar */}
              <div style={S.chatStatus}>
                <div style={S.statusLeft}>
                  <div style={{ ...S.statusDot, animation: "pulse 2s infinite" }} />
                  <span style={S.statusText}>Live Session</span>
                </div>
                <div style={S.counter}>
                  Questions answered: <span style={{ color: "#818cf8", fontWeight: 700 }}>{userMessageCount} / 5</span>
                </div>
              </div>

              {/* Messages */}
              <div style={S.messages}>
                {messages.length === 0 && (
                  <div style={S.emptyState}>
                    <div style={S.emptyIcon}>👋</div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>Session Ready</p>
                    <p style={{ fontSize: "12px", color: "#475569", maxWidth: "240px" }}>
                      Introduce yourself to get started. The AI will ask you 5 interview questions.
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} style={S.bubbleWrap(msg.role)}>
                    <div style={S.bubble(msg.role)}>
                      {msg.content}
                      {isStreaming && i === messages.length - 1 && msg.role === "assistant" && (
                        <span style={{ display: "inline-block", width: "2px", height: "14px", background: "#818cf8", marginLeft: "3px", verticalAlign: "middle", animation: "blink 1s infinite" }} />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div style={S.chatInputArea}>
                {userMessageCount >= 5 && !isStreaming ? (
                  <div style={S.finishBlock}>
                    <p style={S.finishLabel}>✅ All 5 questions answered</p>
                    <button style={S.finishBtn} onClick={fetchFeedback}>
                      View Performance Report →
                    </button>
                  </div>
                ) : (
                  <div style={S.chatRow}>
                    <input
                      style={S.chatInput}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      disabled={isStreaming}
                      maxLength={400}
                      placeholder={isStreaming ? "Waiting for response..." : "Type your answer..."}
                    />
                    <button
                      style={S.sendBtn(isStreaming || !inputMessage.trim())}
                      onClick={sendMessage}
                      disabled={isStreaming || !inputMessage.trim()}
                    >
                      {isStreaming ? (
                        <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#94a3b8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      ) : "→"}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW 3 — FEEDBACK */}
          {step === "feedback" && (
            <div style={S.card}>
              <div style={S.feedbackHeader}>
                <div>
                  <h2 style={S.feedbackTitle}>Performance Report</h2>
                  <p style={S.feedbackSub}>AI-generated evaluation based on your interview responses.</p>
                </div>
                {!isLoadingFeedback && (
                  <button style={S.resetBtn} onClick={restartApp}>
                    ↺ Reset
                  </button>
                )}
              </div>

              {isLoadingFeedback ? (
                <div style={S.loadingBlock}>
                  <Spinner />
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>Evaluating your responses...</p>
                  <p style={{ fontSize: "12px", color: "#475569" }}>Analysing communication, technical depth, and structure.</p>
                </div>
              ) : (
                <>
                  <div style={S.feedbackBody}>{feedback || "No feedback received."}</div>
                  <button style={S.runAgainBtn} onClick={restartApp}>↺ Run Another Simulation</button>
                </>
              )}
            </div>
          )}

        </main>
      </div>
    </>
  );
}