import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Zap, ZapOff, Star, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsProps {
  settings: { sound: boolean; vibration: boolean };
  setSettings: React.Dispatch<React.SetStateAction<{ sound: boolean; vibration: boolean }>>;
  onBack: () => void;
}

export function Settings({ settings, setSettings, onBack }: SettingsProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: feedback })
      });
      if (res.ok) {
        setSubmitted(true);
        setFeedback('');
        setRating(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Settings</h2>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Preferences</h3>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                {settings.sound ? <Volume2 className="text-emerald-400" /> : <VolumeX className="text-white/30" />}
                <span className="font-bold uppercase tracking-widest text-sm">Background Music</span>
              </div>
              <button 
                onClick={() => setSettings(s => ({ ...s, sound: !s.sound }))}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.sound ? 'bg-emerald-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.sound ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                {settings.vibration ? <Zap className="text-pink-400" /> : <ZapOff className="text-white/30" />}
                <span className="font-bold uppercase tracking-widest text-sm">Vibration</span>
              </div>
              <button 
                onClick={() => setSettings(s => ({ ...s, vibration: !s.vibration }))}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.vibration ? 'bg-pink-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.vibration ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Feedback</h3>
            
            {submitted ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Thank you for your feedback!</p>
                <button onClick={() => setSubmitted(false)} className="mt-2 text-xs text-white/50 underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-1 transition-all ${rating >= s ? 'text-yellow-400 scale-110' : 'text-white/10 hover:text-white/30'}`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 h-24 focus:outline-none focus:border-white/30 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-400 transition-all"
                >
                  {isSubmitting ? "Sending..." : <><Send className="w-4 h-4" /> Send Feedback</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
