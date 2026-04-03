from groq import Groq 
import streamlit as st
from streamlit_js_eval import streamlit_js_eval

st.set_page_config(page_title="AI Interview Assistant", page_icon="🤖")
st.title("AI Interview Assistant")

# SESSION STATE
if "setup_complete" not in st.session_state:
    st.session_state.setup_complete = False   
if "user_message_count" not in st.session_state:
    st.session_state.user_message_count = 0 
if "feedback_shown" not in st.session_state:
    st.session_state.feedback_shown = False
if "messages" not in st.session_state:
    st.session_state.messages = []
if "chat_complete" not in st.session_state:
    st.session_state.chat_complete = False    

# FUNCTIONS 
def complete_setup():
    st.session_state.setup_complete = True

def show_feedback():
    st.session_state.feedback_shown = True

# SETUP UI
if not st.session_state.setup_complete:
    st.subheader('Personal Information', divider='rainbow')

    st.session_state["name"] = st.text_input("Name", max_chars=40)
    st.session_state["experience"] = st.text_area("Experience", max_chars=200)
    st.session_state["skills"] = st.text_area("Skills", max_chars=200)

    st.subheader('Company and Position', divider='rainbow')

    col1, col2 = st.columns(2)

    with col1:
        st.session_state["level"] = st.radio(
            "Choose Level",
            options=["Junior", "Mid-level", "Senior"],
        )

    with col2:
        st.session_state["position"] = st.selectbox(
            "Choose Position",
            ("Data Scientist", "Data Engineer", "ML Engineer", "BI Analyst")
        )

    st.session_state["company"] = st.selectbox(
        "Choose Company",
        ("Amazon", "Meta", "Udemy", "365 Company", "Nestle", "Spotify", "Nvidia")
    )

    if st.button("Start Interview"):
        complete_setup()
        st.rerun()

# CHATBOT 
if st.session_state.setup_complete and not st.session_state.feedback_shown and not st.session_state.chat_complete:

    st.info("Start by introducing yourself.", icon="👋")

    client = Groq(api_key=st.secrets["GROQ_API_KEY"])

    # Initialize messages
    if not st.session_state.messages:
        st.session_state.messages = [{
            "role": "system",
            "content": (
                f"You are a strict HR interviewer.\n"
                f"Candidate: {st.session_state['name']}\n"
                f"Experience: {st.session_state['experience']}\n"
                f"Skills: {st.session_state['skills']}\n"
                f"Role: {st.session_state['level']} {st.session_state['position']} at {st.session_state['company']}.\n\n"

                "Rules:\n"
                "- Ask ONLY ONE question at a time\n"
                "- Be direct and professional\n"
                "- Do NOT explain answers\n"
                "- Do NOT repeat candidate info\n"
                "- Ask follow-up questions based on previous answers\n"
                "- Focus only on interview questions\n"
            )
        }]

    # Show chat history
    for message in st.session_state.messages:
        if message["role"] != "system":
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

    # Chat input
    if st.session_state.user_message_count < 5:
        if prompt := st.chat_input("Your Answer.", max_chars=300):

            st.session_state.messages.append({"role": "user", "content": prompt})

            with st.chat_message("user"):
                st.markdown(prompt)

            if st.session_state.user_message_count < 4:
                with st.chat_message("assistant"):

                    completion = client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=st.session_state.messages,
                        temperature=0.5,
                        max_tokens=100,
                        stream=True,
                    )

                    response = ""
                    placeholder = st.empty()

                    for chunk in completion:
                        content = chunk.choices[0].delta.content or ""
                        response += content
                        placeholder.markdown(response)

                st.session_state.messages.append({"role": "assistant", "content": response})

            st.session_state.user_message_count += 1

    if st.session_state.user_message_count >= 5:
        st.success("✅ Interview complete! Click below to get feedback.")
        st.session_state.chat_complete = True


# FEEDBACK 
if st.session_state.chat_complete and not st.session_state.feedback_shown:
    if st.button("Get Feedback"):
        show_feedback()

if st.session_state.feedback_shown:
    st.subheader("📊 Interview Feedback")

    # Clean conversation
    conversation_history = "\n".join([
        f"{msg['role']}: {msg['content']}"
        for msg in st.session_state.messages
        if msg["role"] != "system"
    ])

    feedback_client = Groq(api_key=st.secrets["GROQ_API_KEY"])

    feedback_completion = feedback_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an AI interview evaluator.\n\n"
                    "Evaluate based on:\n"
                    "- Communication clarity\n"
                    "- Technical depth\n"
                    "- Relevance\n"
                    
                    "Output format:\n"
                    "Overall Score: X/10\n\n"
                    "Suggestions:\n- ...\n- ...\n\n"

                    "Be concise. Do NOT ask questions."
                )
            },
            {
                "role": "user",
                "content": f"Evaluate this interview:\n\n{conversation_history}"
            }
        ],
        temperature=0.5,
        max_tokens=200
    )

    st.write(feedback_completion.choices[0].message.content)

    if st.button("Restart Interview", type="primary"):
        streamlit_js_eval(js_expressions="parent.window.location.reload()")
