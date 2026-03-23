import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sprout, ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      setIsSent(true);
      toast({ title: t("forgotPassword.toastTitle"), description: t("forgotPassword.toastDesc") });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("forgotPassword.backToLogin")}
        </Link>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Sprout className="w-7 h-7 text-primary-foreground" />
              </div>
            </Link>
            <CardTitle className="text-2xl font-bold">{t("forgotPassword.title")}</CardTitle>
            <CardDescription>{t("forgotPassword.subtitle")}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {isSent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <p className="text-foreground font-medium">{t("forgotPassword.successTitle")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("forgotPassword.successDesc")} <strong>{email}</strong> {t("forgotPassword.successDescSuffix")}
                </p>
                <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                  {t("forgotPassword.sendAgain")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("forgotPassword.emailLabel")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="email" type="email" placeholder={t("forgotPassword.emailPlaceholder")} className="pl-10 h-12" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("forgotPassword.sending")}</>) : t("forgotPassword.sendButton")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
