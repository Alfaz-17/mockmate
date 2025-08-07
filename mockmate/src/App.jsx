import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Mic,
  MicOff,
  Clock,
  User,
  Target,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
const INTERVIEW_QUESTIONS = [
  "Tell me about yourself.",
  "Why are you interested in this position?",
  "What are your greatest strengths?",
  "Describe a challenging situation you faced and how you handled it.",
  "Where do you see yourself in 5 years?",
  "Why should we hire you?",
  "Tell me about a time you failed and what you learned from it.",
  "How do you handle stress and pressure?",
  "Describe your ideal work environment.",
  "What motivates you in your work?",
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [inputMethod, setInputMethod] = useState("text"); // 'text' or 'voice'
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSubmitAnswer();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

const transcribeAudio = async (blob) => {
  const formData = new FormData();
  formData.append("file", blob, "audio.wav");
  formData.append("model", "whisper-1");
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
  Authorization: `Bearer ${apiKey}`,      },
      body: formData,
    });

    const data = await response.json();
    return data.text; // transcribed text
  } catch (err) {
    console.error("Transcription error:", err);
    return "";
  }
};




  // Voice recording setup
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });
            setAudioBlob(audioBlob);
            audioChunksRef.current = [];
          };
        })
        .catch((err) => console.log("Error accessing microphone:", err));
    }
  }, []);

  const startTimer = () => {
    setIsActive(true);
    if (inputMethod === "voice" && !isRecording) {
      startRecording();
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (inputMethod === "voice" && isRecording) {
      stopRecording();
    }
  };

  const resetTimer = () => {
    setTimeLeft(90);
    setIsActive(false);
    setTextAnswer("");
    setAudioBlob(null);
    setIsSubmitted(false);
    if (isRecording) {
      stopRecording();
    }
  };

  const startRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "inactive"
    ) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Mock AI Analysis (in real app, this would call an AI service)
  const analyzeAnswer = (answer) => {
    const hasGoodStructure = answer.length > 50;
    const hasConfidentTone = answer.includes("I") && answer.length > 100;
    const isClear = answer.split(".").length > 2;
    const isProfessional =
      !answer.toLowerCase().includes("um") &&
      !answer.toLowerCase().includes("uh");

    const scores = {
      clarity: Math.floor(Math.random() * 3) + (isClear ? 7 : 5),
      confidence: Math.floor(Math.random() * 3) + (hasConfidentTone ? 7 : 5),
      structure: Math.floor(Math.random() * 3) + (hasGoodStructure ? 7 : 5),
      tone: Math.floor(Math.random() * 3) + (isProfessional ? 7 : 5),
    };

    const overall = Math.round(
      (scores.clarity + scores.confidence + scores.structure + scores.tone) / 4
    );

    const tips = [];
    if (scores.clarity < 7)
      tips.push(
        "Try to organize your thoughts with clear examples and avoid rambling."
      );
    if (scores.confidence < 7)
      tips.push(
        "Use more definitive language and speak about your achievements with pride."
      );
    if (scores.structure < 7)
      tips.push(
        "Consider using the STAR method (Situation, Task, Action, Result) for better structure."
      );
    if (scores.tone < 7)
      tips.push(
        "Maintain a professional yet warm tone, and avoid filler words like 'um' and 'uh'."
      );

    if (tips.length === 0) {
      tips.push("Great job! Your answer was well-structured and confident.");
      tips.push(
        "Consider adding more specific examples to make your response even stronger."
      );
    }

    return {
      scores,
      overall,
      tips: tips.slice(0, 3),
      question: INTERVIEW_QUESTIONS[currentQuestion],
      answer: answer,
      inputMethod: inputMethod,
    };
  };

  const handleSubmitAnswer = () => {
    if (isSubmitted) return; // Prevent duplicate submissions

    const answer =
      inputMethod === "text" ? textAnswer : "Voice recording submitted";
    if (!answer.trim() && !audioBlob) return;

    const analysis = analyzeAnswer(answer);
    setCurrentAnalysis(analysis);
    setShowAnalysis(true);
    setSessionResults((prev) => [...prev, analysis]);
    setIsSubmitted(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      resetTimer();
      setShowAnalysis(false);
      setCurrentAnalysis(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const generatePDF = async () => {
    // Mock PDF generation - in real app, you'd use a library like jsPDF
    const content = `
MockMate Interview Session Report
Job Role: ${jobRole}
Date: ${new Date().toLocaleDateString()}

${sessionResults
  .map(
    (result, index) => `
Question ${index + 1}: ${result.question}
Answer Method: ${result.inputMethod}
Overall Score: ${result.overall}/10

Scores:
- Clarity: ${result.scores.clarity}/10
- Confidence: ${result.scores.confidence}/10
- Structure: ${result.scores.structure}/10
- Tone: ${result.scores.tone}/10

Improvement Tips:
${result.tips.map((tip) => `• ${tip}`).join("\n")}

---
`
  )
  .join("")}
    `;

    // Create a downloadable text file (in real app, generate actual PDF)
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mockmate-interview-session.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MockMate
                </h1>
                <p className="text-sm text-gray-600">AI Interview Coach</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Job Role</p>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none outline-none text-gray-800 text-right"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interview Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Interview Progress
                </h2>
                <span className="text-sm text-gray-600">
                  {currentQuestion + 1} of {INTERVIEW_QUESTIONS.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      ((currentQuestion + 1) / INTERVIEW_QUESTIONS.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Interview Question
                </h3>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <p className="text-xl text-gray-800 font-medium leading-relaxed">
                  {INTERVIEW_QUESTIONS[currentQuestion]}
                </p>
              </div>

              {/* Timer */}
              {!showAnalysis && (
                <>
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-2xl font-bold ${
                    timeLeft <= 30
                      ? "bg-red-100 text-red-600"
                      : timeLeft <= 60
                      ? "bg-amber-100 text-amber-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  <Clock className="w-6 h-6" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
 <div className="flex items-center justify-center space-x-3 mb-6">
                <button
                  onClick={startTimer}
                  disabled={isActive || timeLeft === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>

                {/* Pause button only shown for voice input */}
                {inputMethod === "voice" && (
                  <button
                    onClick={pauseTimer}
                    disabled={!isActive}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={resetTimer}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
</>
                )}
              {/* Timer Controls */}
             

              {/* Input Method Toggle */}
              <div className="flex items-center justify-center space-x-1 mb-6">
                <button
                  onClick={() => setInputMethod("text")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    inputMethod === "text"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Text Input
                </button>
                {!textAnswer &&(
                <button
                  onClick={() => setInputMethod("voice")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    inputMethod === "voice"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Voice Input
                </button>
                ) }
              </div>

              {/* Input Area */}
              {inputMethod === "text" ? (
                <div className="space-y-4">
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-40 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={!isActive && timeLeft === 90}
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!textAnswer.trim() || isSubmitted}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isSubmitted ? "Answer Submitted" : "Submit Answer"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div
                      className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        isRecording ? "bg-red-500 animate-pulse" : "bg-blue-500"
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-10 h-10 text-white" />
                      ) : (
                        <Mic className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {isRecording
                        ? "Recording in progress..."
                        : "Click Start to begin recording"}
                    </p>
                    {audioBlob && (
                      <div className="mt-4">
                        <p className="text-sm text-green-600 mb-2">
                          ✓ Recording saved
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!audioBlob || isSubmitted}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isSubmitted ? "Answer Submitted" : "Submit Voice Answer"}
                  </button>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {showAnalysis && currentAnalysis && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Analysis Results
                  </h3>
                </div>

                {/* Overall Score */}
                <div className="text-center mb-8">
                  <div
                    className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl font-bold ${
                      currentAnalysis.overall >= 8
                        ? "bg-green-100 text-green-600"
                        : currentAnalysis.overall >= 6
                        ? "bg-amber-100 text-amber-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {currentAnalysis.overall}/10
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">
                    Overall Score
                  </h4>
                </div>

                {/* Individual Scores */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {Object.entries(currentAnalysis.scores).map(
                    ([category, score]) => (
                      <div
                        key={category}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700 capitalize">
                            {category}
                          </span>
                          <span
                            className={`font-bold ${
                              score >= 8
                                ? "text-green-600"
                                : score >= 6
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {score}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 8
                                ? "bg-green-500"
                                : score >= 6
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${score * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Improvement Tips */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Improvement Tips
                  </h4>
                  <div className="space-y-3">
                    {currentAnalysis.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Question Button */}
                {currentQuestion < INTERVIEW_QUESTIONS.length - 1 && (
                  <button
                    onClick={nextQuestion}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Next Question
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Session Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions Completed</span>
                  <span className="font-semibold">{sessionResults.length}</span>
                </div>
                {sessionResults.length > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Score</span>
                      <span className="font-semibold">
                        {Math.round(
                          sessionResults.reduce(
                            (acc, result) => acc + result.overall,
                            0
                          ) / sessionResults.length
                        )}
                        /10
                      </span>
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={generatePDF}
                        className="w-full flex items-center justify-center space-x-2 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Report</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Previous Results */}
            {sessionResults.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Previous Results
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessionResults.map((result, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Q{index + 1}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            result.overall >= 8
                              ? "text-green-600"
                              : result.overall >= 6
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.overall}/10
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {result.question}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
