"use client";

import Link from "next/link";
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

function payloadLines(payload: Record<string, unknown>, locale: Locale) {
  const rows: { label: string; value: string }[] = [];
  const add = (labelEn: string, labelTe: string, key: string) => {
    const raw = payload[key];
    if (raw == null || raw === "") return;
    rows.push({
      label: locale === "te" ? labelTe : labelEn,
      value: String(raw),
    });
  };
  add("Title", "శీర్షిక", "title");
  add("Description", "వివరణ", "description");
  add("Workers needed", "కావాల్సిన మంది", "workers_required");
  add("Quantity", "పరిమాణం", "quantity_available");
  add("Unit", "యూనిట్", "quantity_unit");
  add("Fulfillment", "డెలివరీ", "fulfillment");
  add("Village id", "గ్రామం", "village_id");
  add("Work date", "పని తేదీ", "work_date");
  add("Payment", "చెల్లింపు", "advertised_amount");
  return rows;
}

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
  const [state, action, pending] = useActionState(
    sendAgriMitraMessage,
    initialState,
  );
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceOutSupported, setVoiceOutSupported] = useState(false);
  // Default muted — farmers control when the device speaks.
  const [speakReplies, setSpeakReplies] = useState(false);
  const recognitionRef = useRef<{
    start: () => void;
    stop: () => void;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult:
      | ((event: {
          results: ArrayLike<{ 0: { transcript: string } }>;
        }) => void)
      | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastSpokenId = useRef<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pendingConfirmations.length]);

  useEffect(() => {
    setVoiceOutSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (
            window as unknown as {
              SpeechRecognition?: new () => NonNullable<
                typeof recognitionRef.current
              >;
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
      if (transcript) {
        setText((current) =>
          current ? `${current} ${transcript}` : transcript,
        );
      }
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [locale]);

  useEffect(() => {
    if (!speakReplies || !voiceOutSupported) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (lastSpokenId.current === last.id) return;
    lastSpokenId.current = last.id;
    const utter = new SpeechSynthesisUtterance(last.content);
    utter.lang = locale === "te" ? "te-IN" : "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [messages, locale, speakReplies, voiceOutSupported]);

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

  function speakText(content: string) {
    if (!voiceOutSupported) return;
    const utter = new SpeechSynthesisUtterance(content);
    utter.lang = locale === "te" ? "te-IN" : "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  const examples =
    locale === "te"
      ? [
          "ట్రాక్టర్ కావాలి",
          "పత్తికి పది మంది కూలీలు",
          "20 క్వింటాల్ వరి అమ్మాలి",
          "నా సందేశాలు",
        ]
      : [
          "Find a tractor",
          "Need 10 workers for cotton",
          "Sell 20 quintals paddy",
          "Read my messages",
        ];

  return (
    <div className="space-y-4">
      <div className="max-h-[min(28rem,55vh)] space-y-3 overflow-y-auto rounded-2xl border border-border bg-white p-3 sm:p-4">
        {messages.length === 0 ? (
          <div className="space-y-3 text-sm">
            <p className="font-medium">
              {locale === "te" ? "ఇలా అడగండి" : "Try asking"}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              {examples.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => setText(example)}
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-muted">
              {locale === "te"
                ? "చేయగలదు: సేవలు వెతకడం, ఉద్యోగం/పంట ప్రచురణకు డ్రాఫ్ట్ (నిర్ధారణ తర్వాత), సందేశాలు చూడటం. చేయలేదు: డబ్బు చెల్లింపులు లేదా ఆఫ్‌లైన్ కాల్స్."
                : "Can: find services, draft a job/crop post (after you confirm), read messages. Cannot: take payments or place phone calls for you."}
            </p>
            <Link
              href="/explore"
              className="inline-flex text-accent-strong underline-offset-2 hover:underline"
            >
              {locale === "te" ? "మార్కెట్ అన్వేషించండి" : "Explore marketplace"}
            </Link>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "ml-4 bg-accent text-white sm:ml-8"
                  : "mr-4 border border-border bg-accent-soft/40 sm:mr-8"
              }`}
            >
              {message.content}
              {message.role === "assistant" && voiceOutSupported ? (
                <div className="mt-2">
                  <button
                    type="button"
                    className="rounded-lg border border-border bg-white px-2 py-1 text-xs text-foreground hover:bg-accent-soft"
                    onClick={() => speakText(message.content)}
                  >
                    {locale === "te" ? "వినండి" : "Listen"}
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {pendingConfirmations.map((confirmation) => {
        const rows = payloadLines(confirmation.payload, locale);
        const kind =
          confirmation.action_type === "publish_farm_job"
            ? locale === "te"
              ? "ఫార్మ్ జాబ్ ప్రచురణ"
              : "Publish farm job"
            : locale === "te"
              ? "పంట జాబితా ప్రచురణ"
              : "Publish crop listing";

        return (
          <div
            key={confirmation.id}
            className="rounded-2xl border border-amber-300 bg-amber-50 p-4"
          >
            <p className="text-sm font-medium text-amber-950">
              {locale === "te"
                ? "నిర్ధారణ అవసరం — ప్రచురణకు ముందు చూడండి"
                : "Confirmation required — review before anything is published"}
            </p>
            <p className="mt-1 text-sm text-amber-950">{kind}</p>
            {rows.length > 0 ? (
              <dl className="mt-3 space-y-2 text-sm text-amber-950">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-amber-900/80">{row.label}</dt>
                    <dd className="font-medium whitespace-pre-wrap">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-amber-950">
                {String(
                  confirmation.payload.title ??
                    (locale === "te" ? "జాబితా" : "Listing"),
                )}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <form action={resolveAgriMitraConfirmation} className="sm:contents">
                <input
                  type="hidden"
                  name="confirmation_id"
                  value={confirmation.id}
                />
                <input type="hidden" name="session_id" value={sessionId ?? ""} />
                <input type="hidden" name="decision" value="confirm" />
                <PrimaryButton type="submit" className="min-h-11 w-full sm:w-auto">
                  {locale === "te" ? "నిర్ధారించి ప్రచురించు" : "Confirm & publish"}
                </PrimaryButton>
              </form>
              <form action={resolveAgriMitraConfirmation} className="sm:contents">
                <input
                  type="hidden"
                  name="confirmation_id"
                  value={confirmation.id}
                />
                <input type="hidden" name="session_id" value={sessionId ?? ""} />
                <input type="hidden" name="decision" value="cancel" />
                <SecondaryButton type="submit" className="min-h-11 w-full sm:w-auto">
                  {locale === "te" ? "రద్దు" : "Cancel"}
                </SecondaryButton>
              </form>
            </div>
          </div>
        );
      })}

      <form
        action={action}
        className="space-y-3 rounded-2xl border border-border bg-white p-3 sm:p-4"
      >
        {sessionId ? (
          <input type="hidden" name="session_id" value={sessionId} />
        ) : null}
        <input type="hidden" name="locale" value={locale} />
        {state.error ? <Notice tone="error">{state.error}</Notice> : null}
        <Field
          label={locale === "te" ? "మీ అభ్యర్థన" : "Your request"}
          hint={
            speechSupported
              ? locale === "te"
                ? "టైప్ ఎల్లప్పుడూ పని చేస్తుంది. మైక్ ఐచ్ఛికం (బ్రౌజర్ వాయిస్)."
                : "Typing always works. Mic is optional (browser voice)."
              : locale === "te"
                ? "ఈ బ్రౌజర్‌లో మైక్ లేదు — టైప్ చేయండి. Chrome/Safariలో వాయిస్ అందుబాటులో ఉండవచ్చు."
                : "No mic on this browser — type instead. Voice may work in Chrome or Safari."
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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <PrimaryButton
            type="submit"
            disabled={pending}
            className="min-h-11 w-full sm:w-auto"
          >
            {pending
              ? locale === "te"
                ? "పంపుతున్నాం…"
                : "Sending…"
              : locale === "te"
                ? "పంపు"
                : "Send"}
          </PrimaryButton>
          {speechSupported ? (
            <SecondaryButton
              type="button"
              onClick={toggleListen}
              className="min-h-11 w-full sm:w-auto"
              aria-pressed={listening}
            >
              {listening
                ? locale === "te"
                  ? "వినడం ఆపు"
                  : "Stop listening"
                : locale === "te"
                  ? "మైక్"
                  : "Voice"}
            </SecondaryButton>
          ) : null}
          {voiceOutSupported ? (
            <SecondaryButton
              type="button"
              onClick={() => {
                setSpeakReplies((value) => {
                  const next = !value;
                  if (!next && typeof window !== "undefined") {
                    window.speechSynthesis.cancel();
                  }
                  return next;
                });
              }}
              className="min-h-11 w-full sm:w-auto"
              aria-pressed={speakReplies}
            >
              {speakReplies
                ? locale === "te"
                  ? "ఆటో వాయిస్ ఆఫ్"
                  : "Mute auto-voice"
                : locale === "te"
                  ? "ఆటో వాయిస్ ఆన్"
                  : "Auto-voice on"}
            </SecondaryButton>
          ) : null}
        </div>
        <p className="text-xs text-muted">
          {locale === "te"
            ? "ఉద్యోగం లేదా పంట ప్రచురణ మీ నిర్ధారణ లేకుండా జరగదు. వాయిస్ ఆడియో సర్వర్‌లో సేవ్ కాదు."
            : "Job or crop publish never runs without your confirmation. Voice audio is not stored on the server."}
        </p>
      </form>
    </div>
  );
}
