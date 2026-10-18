'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Lock, Smartphone, Loader2, CheckCircle2, X } from 'lucide-react';

interface StreamClientViewProps {
  play: {
    id: string;
    title: string;
    price: number;
    description?: string;
    posterUrl?: string | null;
    imageUrl?: string | null;
    thumbnail?: string | null;
  };
  streamUrl: string | null;
  isUnlocked: boolean;
}

export default function StreamClientView({
  play,
  streamUrl,
  isUnlocked: initialUnlocked,
}: StreamClientViewProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'FORM' | 'WAITING' | 'SUCCESS'>('FORM');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!initialUnlocked) {
      setShowModal(true);
    }
  }, [initialUnlocked]);

  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(play.price > 1000 ? play.price / 100 : play.price);

  const handleStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playId: play.id,
          phone,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const htmlText = await res.text();
        console.error('API returned non-JSON (HTML):', htmlText);
        throw new Error(`Server error (Status ${res.status}). Check server terminal logs.`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Payment initiation failed.');
      }

      setStep('WAITING');

      if (data.checkoutRequestId) {
        pollPaymentStatus(data.checkoutRequestId);
      } else {
        setTimeout(() => handleSuccess(), 4000);
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
          setErrorMessage('Payment confirmation timed out. Check your account balance.');
          setStep('FORM');
        }
      } catch (e) {
        // Retry polling on transient network drops
      }
    }, 2000);
  };

  const handleSuccess = () => {
    setStep('SUCCESS');
    setLoading(false);

    // Unlock stream and close modal automatically after a brief moment
    setTimeout(() => {
      setUnlocked(true);
      setShowModal(false);
      router.refresh();
    }, 1200);
  };

  // Explicitly check posterUrl first since that matches your Prisma model column
  const thumbnailSrc = play.posterUrl || play.imageUrl || play.thumbnail;

  return (
    <div className="relative">
      {/* Video Container */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {unlocked && streamUrl ? (
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            <video
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="w-full h-full max-h-[75vh] object-contain focus:outline-none"
              src={streamUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="aspect-video w-full flex flex-col items-center justify-center text-zinc-500 space-y-3 p-12 bg-zinc-950/90 backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-white">Content Locked</p>
              <p className="text-xs text-zinc-400 max-w-sm">
                Unlock <span className="text-amber-400 font-semibold">{play.title}</span> ({formattedPrice}) to start streaming immediately.
              </p>
            </div>
            <button
              onClick={() => {
                setStep('FORM');
                setShowModal(true);
              }}
              className="mt-2 py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer z-10"
            >
              Unlock with M-Pesa
            </button>
          </div>
        )}
      </div>

      {/* M-PESA PAYMENT POPUP MODAL (TWO-COLUMN LAYOUT) */}
      {mounted && showModal && !unlocked && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative z-[10000] grid grid-cols-1 md:grid-cols-2">
            
            {/* Close Button */}
            <button
              onClick={() => router.push('/')}
              className="absolute top-4 right-4 z-20 text-zinc-400 hover:text-white bg-zinc-950/60 p-2 rounded-full transition-colors cursor-pointer"
              title="Cancel and return to catalog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* LEFT SIDE: Play Thumbnail / Poster & Info */}
            <div className="relative bg-zinc-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800 min-h-[220px] md:min-h-[380px]">
              {thumbnailSrc ? (
                <div className="absolute inset-0 z-0">
                  <img
                    src={thumbnailSrc}
                    alt={play.title}
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                </div>
              ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-amber-500/10 via-zinc-950 to-zinc-950 flex items-center justify-center">
                  <Film className="w-24 h-24 text-amber-500/10" />
                </div>
              )}

              <div className="relative z-10 space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-amber-500 text-black uppercase">
                  Theatrical Setbook
                </span>
                <h3 className="text-xl font-black text-white leading-snug">
                  {play.title}
                </h3>
                {play.description && (
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {play.description}
                  </p>
                )}
              </div>

              <div className="relative z-10 pt-4 flex items-center justify-between border-t border-zinc-800/80">
                <span className="text-xs text-zinc-400 font-medium">Access Fee</span>
                <span className="text-base font-black text-amber-400">{formattedPrice}</span>
              </div>
            </div>

            {/* RIGHT SIDE: M-Pesa Input Form / States */}
            <div className="p-6 md:p-8 flex flex-col justify-center space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white">Unlock Stream</h3>
                <p className="text-xs text-zinc-400">Complete payment via M-Pesa STK push</p>
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
                      Amount: <span className="text-white font-bold">{formattedPrice}</span>. You will receive an M-Pesa prompt.
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
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-950/20 disabled:opacity-50 cursor-pointer"
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
                <div className="text-center py-6 space-y-4">
                  <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Check Your Phone</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      An M-Pesa prompt has been sent to <span className="text-white font-semibold">{phone}</span>. Enter your PIN to unlock the stream.
                    </p>
                  </div>
                </div>
              )}

              {step === 'SUCCESS' && (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Payment Confirmed!</h4>
                    <p className="text-xs text-zinc-400">Unlocking video player...</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}