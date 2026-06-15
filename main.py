import os
import json
from typing import List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from groq import AsyncGroq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="AI Interview Assistant Backend", version="1.0.0")

# Configure Cross-Origin Resource Sharing (CORS) for your Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to your trusted domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Async Groq Client
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# ----------------- DATA VALIDATION SCHEMAS (PYDANTIC V2) -----------------

class CandidateProfile(BaseModel):
    name: str = Field(..., max_length=40, examples=["Jane Doe"])
    experience: str = Field(..., max_length=200, examples=["3 years managing data pipelines."])
    skills: str = Field(..., max_length=200, examples=["Python, SQL, PyTorch"])
    level: str = Field(..., description="Junior, Mid-level, or Senior")
    position: str = Field(..., description="Data Scientist, ML Engineer, etc.")
    company: str = Field(..., description="Target company profile")

class ChatMessage(BaseModel):
    # FIXED: Changed 'regex' to 'pattern' for Pydantic V2 compatibility
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., max_length=1000)

class ChatSessionRequest(BaseModel):
    profile: CandidateProfile
    messages: List[ChatMessage]
    user_message_count: int = Field(..., ge=0, le=5)


# ----------------- UTILITIES & STREAMS -----------------

async def interview_stream_generator(request: ChatSessionRequest):
    """
    Asynchronous generator pushing individual chunk tokens back to the client
    using Server-Sent Events (SSE) protocols.
    """
    api_messages = []
    
    # Prepend the system guidelines safely
    system_prompt = (
        f"You are a strict HR interviewer.\n"
        f"Candidate: {request.profile.name}\n"
        f"Experience: {request.profile.experience}\n"
        f"Skills: {request.profile.skills}\n"
        f"Role: {request.profile.level} {request.profile.position} at {request.profile.company}.\n\n"
        "Rules:\n"
        "- Ask ONLY ONE question at a time.\n"
        "- Be direct and professional.\n"
        "- Do NOT explain answers.\n"
        "- Do NOT repeat candidate info.\n"
        "- Ask follow-up questions based on previous answers.\n"
        "- Focus only on interview questions.\n"
        "- CRITICAL: Do NOT attempt to use or call any tools, code interpreters, or web search functions."
    )
    
    api_messages.append({"role": "system", "content": system_prompt})
    
    for msg in request.messages:
        api_messages.append({"role": msg.role, "content": msg.content})
        
    try:
        completion = await groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=api_messages,
            temperature=1,
            max_completion_tokens=150,
            reasoning_effort="medium",
            top_p=1,
            stream=True,
        )
        
        async for chunk in completion:
            token = chunk.choices[0].delta.content or ""
            if token:
                payload = {"content": token}
                yield f"data: {json.dumps(payload)}\n\n"
                
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        yield f"data: {json.dumps({'error': f'Stream handling exception: {str(e)}'})}\n\n"


# ----------------- ENDPOINTS -----------------

@app.post("/api/interview/chat")
async def chat_turn(request: ChatSessionRequest):
    """
    Handles streaming responses for the ongoing technical chat loop.
    """
    if request.user_message_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Maximum response allocations reached for this active loop."
        )
    
    return StreamingResponse(
        interview_stream_generator(request), 
        media_type="text/event-stream"
    )


@app.post("/api/interview/feedback")
async def process_feedback(messages: List[ChatMessage]):
    """
    Evaluates the total conversation history to provide clean, structured feedback metrics.
    """
    conversation_history = "\n".join([
        f"{msg.role.upper()}: {msg.content}" for msg in messages if msg.role != "system"
    ])
    
    eval_prompt = (
        "You are an AI interview evaluator.\n\n"
        "Evaluate based on:\n"
        "- Communication clarity\n"
        "- Technical depth\n"
        "- Relevance\n\n"
        "Output format strictly:\n"
        "Overall Score: X/10\n\n"
        "Suggestions:\n- ...\n- ...\n\n"
        "CRITICAL: Be concise. Do NOT ask questions. Do NOT attempt to use or call tools or web browsers."
    )
    
    try:
        response = await groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": eval_prompt},
                {"role": "user", "content": f"Evaluate this interview history:\n\n{conversation_history}"}
            ],
            temperature=1,
            max_completion_tokens=300,
            reasoning_effort="medium",
            top_p=1
        )
        return {"feedback": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Evaluation failed: {str(e)}"
        )
