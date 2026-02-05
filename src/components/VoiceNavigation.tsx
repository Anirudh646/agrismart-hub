import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const voiceCommands: Record<string, string> = {
  // English commands
  'home': '/',
  'go home': '/',
  'schemes': '/schemes',
  'show schemes': '/schemes',
  'market': '/market-prices',
  'market prices': '/market-prices',
  'weather': '/weather',
  'show weather': '/weather',
  'advisory': '/ai-advisory',
  'ai advisory': '/ai-advisory',
  'disease': '/disease-detection',
  'disease detection': '/disease-detection',
  'dashboard': '/dashboard',
  'my dashboard': '/dashboard',
  'login': '/login',
  'register': '/register',
  // Hindi commands
  'होम': '/',
  'घर': '/',
  'योजनाएं': '/schemes',
  'योजना': '/schemes',
  'बाज़ार': '/market-prices',
  'मंडी': '/market-prices',
  'मौसम': '/weather',
  'सलाह': '/ai-advisory',
  'रोग': '/disease-detection',
  'डैशबोर्ड': '/dashboard',
};

export function VoiceNavigation() {
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Voice not supported',
        description: 'Your browser does not support voice recognition',
        variant: 'destructive',
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: t('voice.listening'),
        description: t('voice.speak'),
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Voice command:', transcript);

      // Find matching command
      const route = voiceCommands[transcript];
      if (route) {
        navigate(route);
        toast({
          title: 'Navigating',
          description: `Going to ${transcript}`,
        });
      } else {
        toast({
          title: 'Command not recognized',
          description: `You said: "${transcript}"`,
          variant: 'destructive',
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [navigate, t, i18n.language, toast]);

  return (
    <Button
      variant={isListening ? 'default' : 'ghost'}
      size="sm"
      onClick={startListening}
      className={isListening ? 'animate-pulse bg-primary' : ''}
    >
      {isListening ? (
        <Mic className="w-4 h-4" />
      ) : (
        <MicOff className="w-4 h-4" />
      )}
    </Button>
  );
}
