import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../store/userStore";
import {
  Send,
  Sparkles,
  Settings,
  FileText,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
interface Message {
  role: "user" | "model";
  content: string;
}
const FoodAssistant: React.FC = () => {
  const {
    coachInstructions,
    setCoachInstructions,
    coachEquivalencies,
    setCoachEquivalencies,
  } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Dime qué vas a comer (pesos en cocido) y te diré los macros totales.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: { temperature: 0, maxOutputTokens: 100 },
      });
      const prompt = ` ACT AS A CALCULATOR. YOU ARE NOT A CHATBOT. INPUT: Text describing food items. TASK: Calculate the SUM of macronutrients (Protein, Carbs, Fats). - ALL weights are COOKED/PREPARED weights unless explicitly raw. - USE STANDARD USDA DATA or the user's "Equivalencies" below if matching. USER EQUIVALENCIES (Priority): "${coachEquivalencies || "None"}" USER INSTRUCTIONS (Constraints): "${coachInstructions || "None"}" USER INPUT: "${userMsg}" OUTPUT FORMAT REQUIRED (Strict String): TOTAL: [Protein]g P, [Carbs]g C, [Fats]g F EXAMPLES: In: "100g pollo, 200g arroz" Out: TOTAL: 31g P, 56g C, 4g F In: "3 huevos, 1 pan" Out: TOTAL: 22g P, 15g C, 16g F YOUR OUTPUT: `;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      setMessages((prev) => [...prev, { role: "model", content: text }]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Error. Intenta de nuevo." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <>
      {" "}
      <div
        className={`flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${isExpanded ? "fixed inset-4 z-50 md:inset-10" : "relative"}`}
      >
        {" "}
        {/* Header */}{" "}
        <div className="flex items-center justify-between p-4 -b bg-card">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <div className="p-1.5 bg-background/50 rounded-lg">
              {" "}
              <Sparkles size={16} className="text-primary" />{" "}
            </div>{" "}
            <h3 className="font-bold text-white text-sm">AI Coach</h3>{" "}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {" "}
              <Settings size={16} />{" "}
            </button>{" "}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {" "}
              {isExpanded ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Messages */}{" "}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
          {" "}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {" "}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-black rounded-br-none font-medium" : "bg-card text-gray-200 rounded-bl-none"}`}
              >
                {" "}
                {msg.content}{" "}
              </div>{" "}
            </div>
          ))}{" "}
          {isLoading && (
            <div className="flex justify-start">
              {" "}
              <div className="bg-card px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                {" "}
                <span
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />{" "}
                <span
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />{" "}
                <span
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />{" "}
              </div>{" "}
            </div>
          )}{" "}
          <div ref={messagesEndRef} />{" "}
        </div>{" "}
        {/* Input */}{" "}
        <div className="p-4 bg-card -t">
          {" "}
          <div className="relative">
            {" "}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="w-full bg-background rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:-primary transition-colors"
            />{" "}
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:brightness-110 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {" "}
              <Send size={16} />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Settings Modal */}{" "}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {" "}
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {" "}
            <div className="flex items-center justify-between p-6 -b">
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <div className="p-2 bg-background/50 rounded-lg">
                  {" "}
                  <Settings className="text-primary" size={20} />{" "}
                </div>{" "}
                <h2 className="text-xl font-bold text-white">
                  Configuración del Coach
                </h2>{" "}
              </div>{" "}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {" "}
                <X size={20} />{" "}
              </button>{" "}
            </div>{" "}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {" "}
              {/* Column 1: Instructions */}{" "}
              <div className="space-y-3">
                {" "}
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  {" "}
                  <FileText size={16} className="text-blue-400" /> Instrucciones
                  Personalizadas{" "}
                </label>{" "}
                <p className="text-xs text-gray-500">
                  {" "}
                  Define cómo quieres que el coach te hable o qué reglas debe
                  seguir.{" "}
                </p>{" "}
                <textarea
                  value={coachInstructions}
                  onChange={(e) => setCoachInstructions(e.target.value)}
                  placeholder="Ej: Solo recomiéndame alimentos sin gluten. Sé sarcástico."
                  className="w-full h-64 bg-background rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:-primary resize-none"
                />{" "}
              </div>{" "}
              {/* Column 2: Equivalencies/Data */}{" "}
              <div className="space-y-3">
                {" "}
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  {" "}
                  <FileText size={16} className="text-emerald-400" /> Tabla de
                  Equivalencias{" "}
                </label>{" "}
                <p className="text-xs text-gray-500">
                  {" "}
                  Pega aquí tus propias equivalencias o datos de
                  referencia.{" "}
                </p>{" "}
                <textarea
                  value={coachEquivalencies}
                  onChange={(e) => setCoachEquivalencies(e.target.value)}
                  placeholder="Ej: 100g de Arroz cocido = 28g Carbs..."
                  className="w-full h-64 bg-background rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:-primary resize-none font-mono"
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="p-6 -t bg-background/50 flex justify-end">
              {" "}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                {" "}
                Guardar y Cerrar{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </>
  );
};
export default FoodAssistant;
