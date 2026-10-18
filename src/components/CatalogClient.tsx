'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PlayCard from '@/components/PlayCard';
import { X, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';

interface CatalogClientProps {
  initialPlays: any[];
  unlockedPlayIds: string[];
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export default function CatalogClient({
  initialPlays,
  unlockedPlayIds,
  isAdmin,
  isLoggedIn,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedPlay, setSelectedPlay] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'FORM' | 'WAITING' | 'SUCCESS'>('FORM');
  const [errorMessage, setErrorMessage] = useState('');

  // Automatically open payment modal if redirected from locked stream URL (?unlocked=false&play=slug)
  useEffect(() => {
    const unlockedParam = searchParams.get('unlocked');
    const playSlug = searchParams.get('play');

    if (unlockedParam === 'false' && playSlug && initialPlays.length > 0) {
      const targetPlay = initialPlays.find((p) => p.slug === playSlug);
      if (targetPlay) {
        if (!isLoggedIn) {
          router.push('/login');
          return;
        }
        setSelectedPlay(targetPlay);
        setStep('FORM');
        setPhone('');
        setErrorMessage('');
      }
    }
  }, [searchParams, initialPlays, isLoggedIn, router]);

  const handleUnlockClick = (play: any) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setSelectedPlay(play);
    setStep('FORM');
    setPhone('');
    setErrorMessage('');
  };

  const handleStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlay || !phone) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playId: selectedPlay.id,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      setStep('WAITING');

      if (data.checkoutRequestId) {
        pollPaymentStatus(data.checkoutRequestId);
      } else {
        setTimeout(() => handlePaymentSuccess(), 5000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    let attempts = 0;
    const maxAttempts = 18;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payments/status?checkoutRequestId=${checkoutRequestId}`);
        const data = await res.json();

        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          handlePaymentSuccess();
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          clearInterval(interval);
          setErrorMessage(`Payment ${data.status.toLowerCase()}. Please try again.`);
          setStep('FORM');
          setLoading(false);
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setLoading(false);
          setErrorMessage('Payment confirmation timed out. Check your library if M-Pesa debit was successful.');
          setStep('FORM');
        }
      } catch (e) {
        // network polling retry
      }
    }, 2000);
  };

  const handlePaymentSuccess = () => {
    setStep('SUCCESS');
    setLoading(false);

    // Automatically redirect to the stream page after confirmation
    setTimeout(() => {
      const playId = selectedPlay?.id;
      setSelectedPlay(null);
      if (playId) {
        router.push(`/stream/${playId}`);
        router.refresh();
      }
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Theatrical Streaming Catalog</h1>
        <p className="text-sm text-zinc-400">Unlock and stream exclusive live theatrical productions instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialPlays.map((play) => {
          const isUnlocked = isAdmin || unlockedPlayIds.includes(play.id);
          return (
            <PlayCard
              key={play.id}
              play={play}
              isUnlocked={isUnlocked}
              onUnlockClick={() => handleUnlockClick(play)}
            />
          );
        })}
      </div>

      {/* M-PESA PAYMENT POPUP MODAL */}
      {selectedPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setSelectedPlay(null);
                // Clear URL params so modal doesn't pop back up on close
                router.replace('/');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Unlock Production</h3>
              <p className="text-xs text-amber-400 font-medium">{selectedPlay.title}</p>
            </div>

            {step === 'FORM' && (
              <form onSubmit={handleStkPush} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">M-Pesa Phone Number</label>
                  <div className="relative flex items-center">
                    <Smartphone className="absolute left-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="0712345678 or 2547..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      autoFocus
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-10 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Amount: <span className="text-white font-bold">KES {selectedPlay.price}</span>. An M-Pesa STK push prompt will appear on your phone.
                  </p>
                </div>

                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-950/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Pay with M-Pesa</span>}
                </button>
              </form>
            )}

            {step === 'WAITING' && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Check Your Phone</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We sent an M-Pesa prompt to <span className="text-white font-semibold">{phone}</span>. Enter your PIN to finalize payment.
                  </p>
                </div>
              </div>
            )}

            {step === 'SUCCESS' && (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Payment Confirmed!</h4>
                  <p className="text-xs text-zinc-400">Redirecting to your stream...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}