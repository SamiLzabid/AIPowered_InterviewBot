# AI Interview Assistant: Enterprise Simulation Protocol

An enterprise-grade, asynchronous AI Interview Assistant that acts as a strict HR evaluator. The application features a clean decoupled architecture utilizing **FastAPI** for low-latency backend orchestration and token streaming, coupled with a highly responsive **React + Tailwind CSS** frontend dashboard. 

The core simulation relies on the high-throughput inference infrastructure of **Groq**, utilizing the specialized open-weight `openai/gpt-oss-20b` model architecture optimized for structured conversational agent logic.

---

## System Architecture

This project is built using a modern decoupled Client-Server architecture to ensure scale, stability, and clean boundary separation.

```text
       +----------------------------------------------------+
       |                  React Frontend                    |
       |  (State Routing: Setup -> Chat View -> Feedback)   |
       +-------------------------+--------------------------+
                                 |
                     HTTP POST   |   Server-Sent Events
                   (JSON Body)   |   (SSE Token Stream)
                                 v
       +----------------------------------------------------+
       |                 FastAPI Backend                    |
       |      (Async ASGI Concurrency & Pydantic V2)        |
       +-------------------------+--------------------------+
                                 |
                                 |   Async HTTP Request / Stream
                                 v      
       +----------------------------------------------------+
       |                  Groq API Core                     |
       |           (Model: openai/gpt-oss-20b)              |
       +----------------------------------------------------+
```
## Core Features
1. Dynamic Onboarding Protocol (Wizard Form)
•	Tailored Personas: Captures explicit candidate metadata, including full names, operational experience profiles, technical skill registers, seniority levels, and specific corporate cultures (e.g., Meta, NVIDIA, Amazon).
•	Adaptive Simulation Matrix: The backend automatically maps these parameters to dynamically recalibrate system prompts, ensuring the interview's structural difficulty matches the candidate's experience tier.
2. High-Performance Token Streaming Interface
•	Real-time Streaming Over HTTP POST: Utilizes the web standard Server-Sent Events (SSE) via FastAPI's StreamingResponse alongside the frontend's browser Streams API (getReader()).
•	Zero-Blocking Concurrency: Built on an asynchronous execution layer (AsyncGroq), enabling dozens of simultaneous interviews to stream words word-by-word without choking server threads.
•	Turn-Count Guardrails: Strict counter tracking blocks user inputs and terminates token requests automatically upon completing exactly 5 responses, establishing an algorithmic boundary for the evaluation phase.
3. Agentic Tool Execution Safety
•	Zero-Hallucination Guardrails: Employs advanced engineering rules designed around the GPT-OSS architectural specifications. By excluding noisy system instructions and injecting strict textual boundaries, the application eliminates tool selection failures and crashing bugs.
4. Automated Post-Interview Diagnostic Board
•	Consolidated Data Analysis: Compiles complete contextual interview arrays automatically into an independent diagnostic prompt loop upon session completion.
•	Normalized Assessment Metrics: Delivers actionable formatting output breaking down communication clarity, technical depth, and specific contextual recommendations alongside an explicit scoring quotient ($X/10$).
## Tech Stack
Backend
•	FastAPI: High-performance, asynchronous Python web framework (ASGI) handling communication lines.
•	Pydantic V2: Enterprise-grade data validation enforcing rigid type checks and structural contract rules via regex patterns.
•	Uvicorn: Production-ready ASGI web server implementation.
•	Groq SDK: Asynchronous client bindings supporting modern hyper-speed LLM processing.
Frontend
•	React (Vite): A high-speed UI framework managing modular application state routing.
•	Tailwind CSS: Modern utility-first CSS layout.
•	Lucide React: Modern crisp icon components.

## Prerequisites
•	Python 3.10+ installed
•	Node.js 18+ installed
•	A valid Groq API Key



