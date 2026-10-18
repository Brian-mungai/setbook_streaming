'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Lock, Smartphone, Loader2, CheckCircle2, X } from 'lucide-react';

interface PlayViewActionsProps {
  play: {
    id: string;
    title: string;
    price: number;
    description?: string;
  };
  isUnlocked: boolean;
  isLoggedIn: boolean;
}

export default function PlayViewActions({
  play,
  isUnlocked,
  isLoggedIn,
}: PlayViewActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'FORM' | 'WAITING' | 'SUCCESS'>('FORM');
  const [errorMessage, setErrorMessage] = useState('');

  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(play.price > 1000 ? play.price / 100 : play.price);

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (isUnlocked) {
      // Direct access to stream if unlocked
      router.push(`/stream/${play.id}`);
    } else {
      // Pop up payment modal if locked
      setStep('FORM');
      setPhone('');
      setErrorMessage('');
      setIsModalOpen(true);
    }
  };

  const handleStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playId: play.id,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      setStep('WAITING');

      if (data.checkoutRequestId) {
        pollStatus(data.checkoutRequestId);
      } else {
        setTimeout(() => handleSuccess(), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const pollStatus = async (checkoutRequestId: string) => {
    let attempts = 0;
    const maxAttempts = 15;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payments/status?checkoutRequestId=${checkoutRequestId}`);
        const data = await res.json();

        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          handleSuccess();
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          clearInterval(interval);
          setErrorMessage(`Payment ${data.status.toLowerCase()}. Please try again.`);
          setStep('FORM');
          setLoading(false);
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setLoading(false);
          setErrorMessage('Payment confirmation timed out. Check your library.');
          setStep('FORM');
        }
      } catch (e) {
        // Retry polling
      }
    }, 2000);
  };

  const handleSuccess = () => {
    setStep('SUCCESS');
    setLoading(false);

    setTimeout(() => {
      setIsModalOpen(false);
      router.push(`/stream/${play.id}`);
      router.refresh();
    }, 1200);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-xl ${
          isUnlocked
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
            : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-950/20'
        }`}
      >
        {isUnlocked ? (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>Watch Stream</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>View Play ({formattedPrice})</span>
          </>
        )}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Unlock Production</h3>
              <p className="text-xs text-amber-400 font-medium">{play.title}</p>
            </div>

            {step === 'FORM' && (
              <form onSubmit={handleStkPush} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    M-Pesa Phone Number
                  </label>
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
                    Price: <span className="text-white font-bold">{formattedPrice}</span>. An STK push prompt will be sent to your phone.
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
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Pay with M-Pesa</span>
                  )}
                </button>
              </form>
            )}

            {step === 'WAITING' && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Check Your Phone</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    An M-Pesa prompt has been sent to <span className="text-white font-semibold">{phone}</span>. Enter your PIN to finalize payment.
                  </p>
                </div>
              </div>
            )}

            {step === 'SUCCESS' && (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Payment Confirmed!</h4>
                  <p className="text-xs text-zinc-400">Redirecting to video stream...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}