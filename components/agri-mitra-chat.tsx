"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  resolveAgriMitraConfirmation,
  sendAgriMitraMessage,
  type AgriMitraState,
} from "@/app/actions/agri-mitra";
import {
  Field,
  Notice,
  PrimaryButton,
  SecondaryButton,
  TextArea,
} from "@/components/ui";
import type { Locale } from "@/lib/locale";

type Message = {
  id: number;
  role: string;
  content: string;
  tool_name?: string | null;
  tool_payload?: {
    confirmation_id?: number | null;
    intent?: string;
    result_path?: string;
  } | null;
  created_at: string;
};

type Confirmation = {
  id: number;
  action_type: string;
  status: string;
  payload: Record<string, unknown>;
  result_path?: string | null;
  error_message?: string;
};

const initialState: AgriMitraState = {};

export function AgriMitraChat({
  sessionId,
  locale,
  messages,
  pendingConfirmations,
}: {
  sessionId: number | null;
  locale: Locale;
  messages: Message[];
  pendingConfirmations: Confirmation[];
}) {
  const [state, action, pending] = useActionState(sendAgriMitraMessage, initialState);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<{
    start: () => void;
    stop: () => void;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pendingConfirmations.length]);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (
            window as unknown as {
              SpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
              webkitSpeechRecognition?: new () => NonNullable<
                typeof recognitionRef.current
              >;
            }
          ).SpeechRecognition ||
          (
            window as unknown as {
              webkitSpeechRecognition?: new () => NonNullable<
                typeof recognitionRef.current
              >;
            }
          ).webkitSpeechRecognition
        : undefined;
    if (!SpeechRecognition) return;
    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = locale === "te" ? "te-IN" : "en-IN";
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) setText((current) => (current ? `${current} ${transcript}` : transcript));
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const utter = new SpeechSynthesisUtterance(last.content.slice(0, 280));
    utter.lang = locale === "te" ? "te-IN" : "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [messages, locale]);

  function toggleListen() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }
    recognition.lang = locale === "te" ? "te-IN" : "en-IN";
    recognition.start();
    setListening(true);
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border border-border bg-white p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">
            {locale === "te"
              ? "ఉదాహరణ: ట్రాక్టర్ కావాలి · పత్తికి పది మంది కూలీలు · 20 క్వింటాల్ వరి అమ్మాలి · నా సందేశాలు"
              : "Try: find tractor · need 10 workers for cotton · sell 20 quintals paddy · read my messages"}
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "ml-8 bg-accent text-white"
                  : "mr-8 border border-border bg-accent-soft/40"
              }`}
            >
              {message.content}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {pendingConfirmations.map((confirmation) => (
        <div
          key={confirmation.id}
          className="rounded-2xl border border-amber-300 bg-amber-50 p-4"
        >
          <p className="text-sm font-medium text-amber-950">
            {locale === "te"
              ? "నిర్ధారణ అవసరం — ప్రచురణకు ముందు నిర్ధారించండి"
              : "Confirmation required — nothing publishes until you confirm"}
          </p>
          <p className="mt-2 text-sm text-amber-950">
            {confirmation.action_type === "publish_farm_job"
              ? String(confirmation.payload.title ?? "Farm job")
              : String(confirmation.payload.title ?? "Crop listing")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={resolveAgriMitraConfirmation}>
              <input type="hidden" name="confirmation_id" value={confirmation.id} />
              <input type="hidden" name="session_id" value={sessionId ?? ""} />
              <input type="hidden" name="decision" value="confirm" />
              <PrimaryButton type="submit">
                {locale === "te" ? "నిర్ధారించి ప్రచురించు" : "Confirm & publish"}
              </PrimaryButton>
            </form>
            <form action={resolveAgriMitraConfirmation}>
              <input type="hidden" name="confirmation_id" value={confirmation.id} />
              <input type="hidden" name="session_id" value={sessionId ?? ""} />
              <input type="hidden" name="decision" value="cancel" />
              <SecondaryButton type="submit">
                {locale === "te" ? "రద్దు" : "Cancel"}
              </SecondaryButton>
            </form>
          </div>
        </div>
      ))}

      <form action={action} className="space-y-3 rounded-2xl border border-border bg-white p-4">
        {sessionId ? <input type="hidden" name="session_id" value={sessionId} /> : null}
        <input type="hidden" name="locale" value={locale} />
        {state.error ? <Notice tone="error">{state.error}</Notice> : null}
        <Field
          label={locale === "te" ? "మీ అభ్యర్థన" : "Your request"}
          hint={
            speechSupported
              ? locale === "te"
                ? "టైప్ చేయండి లేదా మైక్ వాడండి (బ్రౌజర్ స్పీచ్)."
                : "Type or use the mic (browser speech)."
              : locale === "te"
                ? "టైప్ చేయండి."
                : "Type your request."
          }
        >
          <TextArea
            name="message"
            rows={3}
            required
            minLength={2}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              locale === "te"
                ? "రేపు పత్తి తీయడానికి పది మంది కూలీలు కావాలి"
                : "I need a tractor near my village"
            }
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton type="submit" disabled={pending}>
            {pending
              ? locale === "te"
                ? "పంపుతున్నాం…"
                : "Sending…"
              : locale === "te"
                ? "పంపు"
                : "Send"}
          </PrimaryButton>
          {speechSupported ? (
            <SecondaryButton type="button" onClick={toggleListen}>
              {listening
                ? locale === "te"
                  ? "వినడం ఆపు"
                  : "Stop listening"
                : locale === "te"
                  ? "మైక్"
                  : "Voice"}
            </SecondaryButton>
          ) : null}
        </div>
        <p className="text-xs text-muted">
          {locale === "te"
            ? "ముఖ్యమైన చర్యలు (ఉద్యోగం/పంట ప్రచురణ) మీ నిర్ధారణ లేకుండా జరగవు. వాయిస్ రికార్డింగ్‌లు సర్వర్‌లో సేవ్ కావు."
            : "Consequential actions (job/crop publish) never run without your confirmation. Voice audio is not stored on the server."}
        </p>
      </form>
    </div>
  );
}
