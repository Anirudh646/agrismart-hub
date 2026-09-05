import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, MicOff, Send, Volume2, Sparkles, History } from "lucide-react";

interface ChatTurn {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface SavedChat {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

export const VoiceAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<SavedChat[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, isSending]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("assistant_chats")
      .select("id, question, answer, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data);
  };

  const startListening = () => {
    if (!speechSupported) {
      toast({
        title: "Voice not supported",
        description: "Your browser does not support voice input. Please type your question.",
        variant: "destructive",
      });
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = i18n.language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      setInput(transcript);
      setIsListening(false);
      void sendMessage(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast({ title: "Could not hear you", description: "Please try again or type instead.", variant: "destructive" });
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`_>-]/g, ""));
    utterance.lang = i18n.language === "hi" ? "hi-IN" : "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (raw?: string) => {
    const question = (raw ?? input).trim();
    if (!question || !user || isSending) return;

    setInput("");
    const nextTurns: ChatTurn[] = [...turns, { role: "user", content: question }];
    setTurns(nextTurns);
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("voice-assistant", {
        body: { question, language: i18n.language, history: turns },
      });
      if (error) throw error;
      const answer: string = data?.answer ?? "Sorry, I could not answer that.";
      setTurns([...nextTurns, { role: "assistant", content: answer }]);
      speak(answer);

      const { error: saveError } = await supabase.from("assistant_chats").insert({
        user_id: user.id,
        question,
        answer,
        language: i18n.language,
      });
      if (saveError) {
        console.error("Failed to save chat", saveError);
        toast({ title: "Answer not saved", description: saveError.message, variant: "destructive" });
      } else {
        void loadHistory();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Assistant unavailable",
        description: (err as Error).message ?? "Please try again.",
        variant: "destructive",
      });
      setTurns(nextTurns);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Voice Assistant
            </CardTitle>
            <CardDescription>Ask any farming question by speaking or typing</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowHistory((s) => !s)}>
            <History className="w-4 h-4" />
            {showHistory ? "Hide" : "History"}
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div ref={scrollRef} className="h-80 overflow-y-auto rounded-lg border bg-muted/30 p-4 space-y-3">
            {turns.length === 0 && !isSending && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                <Mic className="w-10 h-10 text-primary/60" />
                <p className="text-sm max-w-xs">
                  Tap the microphone and ask something like "How much urea for one acre of wheat?"
                </p>
              </div>
            )}
            {turns.map((turn, idx) => (
              <div key={idx} className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    turn.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border text-foreground"
                  }`}
                >
                  {turn.content}
                  {turn.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => speak(turn.content)}
                      aria-label="Listen to answer"
                      className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Listen
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="flex items-end gap-2">
            <Button
              type="button"
              size="icon"
              variant={isListening ? "destructive" : "default"}
              className="h-12 w-12 shrink-0 rounded-full"
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              onClick={isListening ? stopListening : startListening}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder={isListening ? "Listening..." : "Type your question..."}
              rows={2}
              className="resize-none"
            />
            <Button
              type="button"
              size="icon"
              className="h-12 w-12 shrink-0"
              aria-label="Send question"
              disabled={isSending || !input.trim()}
              onClick={() => void sendMessage()}
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          {!speechSupported && (
            <p className="text-xs text-muted-foreground">
              Voice input is not available in this browser — typing works everywhere.
            </p>
          )}
        </CardContent>
      </Card>

      {showHistory && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Saved Conversations</CardTitle>
            <CardDescription>Your last {history.length} questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[30rem] overflow-y-auto">
            {history.length === 0 && <p className="text-sm text-muted-foreground">No conversations yet.</p>}
            {history.map((chat) => (
              <div key={chat.id} className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium line-clamp-2">{chat.question}</p>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{chat.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceAssistant;
