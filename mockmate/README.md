# MockMate — AI Interview Coach


# Team Name: Team Falcon

# Project Name: Mockmate - ai interview coach for students

# Problem Statment: to make mock interview digitalized

# How it works: interview, practice, feedback

# team members: Darshan Vejani, Vaibhav Vora, Alfaz Bilakhiya, Arpit Savaliya

**MockMate** is an AI-powered interview preparation tool designed to help users practice and improve their interview skills through realistic simulations. It supports both text and voice inputs, analyzes responses, provides actionable feedback, and allows session export.

##  Features

- **Dynamic interview simulation**: Presents a series of commonly asked job interview questions.
- **Dual input modes**:
  - **Voice**: Record responses and automatically transcribe using OpenAI’s Whisper API.
  - **Text**: Type answers directly.
- **AI-powered analysis**:
  - Evaluates responses on clarity, confidence, structure, and tone.
  - Generates a composite score (0–10).
  - Offers 2–3 personalized improvement tips.
- **Session tracking**:
  - View previous responses and performance history.
  - Export session report as a downloadable file (e.g., PDF or text).

##  Tech Stack

- **Frontend**:  React + Tailwind CSS
- **UI Icons**: lucide-react (e.g., Play, Mic, Clock)
- **Voice Handling**: Navigator API + MediaRecorder
- **AI & APIs**:
  - OpenAI Whisper (speech-to-text)
  - OpenAI GPT-3.5/Turbo or GPT-4 (response evaluation)
- **Exporting Reports**: Client-side generation of text/PDF downloads

##  Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- OpenAI API key (with access to Whisper and GPT models)

### Installation
```bash
git clone https://github.com/Alfaz-17/mockmate.git
cd mockmate
npm install
