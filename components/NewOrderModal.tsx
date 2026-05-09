"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ShoppingBag,
  MapPin,
  Clock,
  X,
  CheckCircle,
  XCircle,
  ChefHat,
  Bike,
} from "lucide-react";

export interface IncomingOrder {
  orderId: string;
  totalAmount: number;
  itemsSummary: Array<{ name: string; quantity: number }>;
  userId?: string;
  restaurantId?: string;
  orderDate?: string;
}

interface NewOrderModalProps {
  order: IncomingOrder | null;
  onAccept: (orderType: "pickup" | "delivery") => void;
  onReject: () => void;
  onClose: () => void;
  /** Seconds the owner has to respond before auto-timeout (default 120) */
  timeoutSeconds?: number;
}

export function NewOrderModal({
  order,
  onAccept,
  onReject,
  onClose,
  timeoutSeconds = 120,
}: NewOrderModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds);
  const [deciding, setDeciding] = useState<"accept" | "reject" | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset timer whenever a new order arrives
  useEffect(() => {
    if (!order) return;
    setSecondsLeft(timeoutSeconds);
    setDeciding(null);

    // Persistent ringing: loop the notification sound
    const tryPlay = () => {
      const audio = new Audio("/notification.mp3");
      audio.loop = true;
      audio.volume = 0.85;
      audioRef.current = audio;
      audio.play().catch(() => {});
    };
    tryPlay();

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          onClose(); // auto-dismiss on timeout
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current!);
      audioRef.current?.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    clearInterval(intervalRef.current!);
  }, []);

  const handleAccept = async (orderType: "pickup" | "delivery") => {
    setDeciding("accept");
    stopAudio();
    await onAccept(orderType);
  };

  const handleReject = async () => {
    setDeciding("reject");
    stopAudio();
    await onReject();
  };

  if (!order) return null;

  const progress = (secondsLeft / timeoutSeconds) * 100;
  const isUrgent = secondsLeft <= 30;
  const orderRef = order.orderId?.slice(-6) || "------";

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-md"
        onClick={undefined} // prevent dismiss on backdrop click
      />

      {/* ── Modal ────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md relative"
          style={{ animation: "modalPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          {/* Pulsing outer ring */}
          <div
            className="absolute -inset-3 rounded-[2.5rem] opacity-40"
            style={{
              background: isUrgent
                ? "radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(152,227,47,0.4) 0%, transparent 70%)",
              animation: "pulseRing 1.2s ease-in-out infinite",
            }}
          />

          {/* Card */}
          <div className="relative bg-[#002833] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            {/* Countdown progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
              <div
                className="h-full transition-all duration-1000 ease-linear rounded-full"
                style={{
                  width: `${progress}%`,
                  background: isUrgent
                    ? "linear-gradient(90deg, #ef4444, #f97316)"
                    : "linear-gradient(90deg, #98E32F, #4ade80)",
                }}
              />
            </div>

            {/* Header */}
            <div className="pt-6 px-6 pb-4 flex items-start gap-4">
              {/* Ringing icon */}
              <div
                className="relative shrink-0 w-16 h-16 rounded-2xl bg-[#98E32F]/10 border border-[#98E32F]/20 flex items-center justify-center"
                style={{ animation: "ringShake 0.6s ease-in-out infinite" }}
              >
                <ShoppingBag className="text-[#98E32F]" size={28} />
                {/* Ping ripples */}
                <span className="absolute inset-0 rounded-2xl border-2 border-[#98E32F]/50 animate-ping" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                    style={{
                      background: isUrgent ? "rgba(239,68,68,0.15)" : "rgba(152,227,47,0.12)",
                      color: isUrgent ? "#f87171" : "#98E32F",
                      borderColor: isUrgent ? "rgba(239,68,68,0.3)" : "rgba(152,227,47,0.3)",
                    }}
                  >
                    🔔 New Order
                  </span>
                </div>
                <h2 className="text-white font-black text-xl leading-tight">
                  Order #{orderRef}
                </h2>
                <p className="text-white/50 text-xs mt-0.5">
                  Customer is waiting for your confirmation
                </p>
              </div>

              {/* Timer */}
              <div className="shrink-0 text-right">
                <div
                  className="text-3xl font-black tabular-nums leading-none"
                  style={{ color: isUrgent ? "#f87171" : "#98E32F" }}
                >
                  {secondsLeft}
                </div>
                <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                  sec left
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-white/5" />

            {/* Order details */}
            <div className="px-6 py-4 space-y-3">
              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Order Total</span>
                <span className="text-[#98E32F] text-xl font-black">
                  ₹{order.totalAmount?.toFixed(0) ?? "—"}
                </span>
              </div>

              {/* Items summary */}
              {order.itemsSummary && order.itemsSummary.length > 0 && (
                <div className="bg-white/5 rounded-xl p-3 space-y-1.5">
                  {order.itemsSummary.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[#98E32F] text-xs font-black w-5 text-center">
                        {item.quantity}×
                      </span>
                      <span className="text-white/80 text-sm truncate">{item.name}</span>
                    </div>
                  ))}
                  {order.itemsSummary.length > 4 && (
                    <p className="text-white/30 text-xs pl-7">
                      +{order.itemsSummary.length - 4} more items
                    </p>
                  )}
                </div>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  Delivery order
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-white/5" />

            {/* Action buttons */}
            <div className="px-6 py-5 space-y-3">
              {/* Accept row — two options */}
              <div className="flex gap-2">
                <button
                  disabled={deciding !== null}
                  onClick={() => handleAccept("pickup")}
                  className="flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-[#98E32F] text-[#013644] font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deciding === "accept" ? (
                    <span className="w-4 h-4 border-2 border-[#013644]/40 border-t-[#013644] rounded-full animate-spin" />
                  ) : (
                    <Bike size={18} />
                  )}
                  Accept · Pickup
                </button>
                <button
                  disabled={deciding !== null}
                  onClick={() => handleAccept("delivery")}
                  className="flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-[#98E32F]/15 text-[#98E32F] border border-[#98E32F]/30 font-black text-xs uppercase tracking-widest hover:bg-[#98E32F]/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deciding === "accept" ? (
                    <span className="w-4 h-4 border-2 border-[#98E32F]/40 border-t-[#98E32F] rounded-full animate-spin" />
                  ) : (
                    <ChefHat size={18} />
                  )}
                  Accept · Deliver
                </button>
              </div>

              {/* Reject button */}
              <button
                disabled={deciding !== null}
                onClick={handleReject}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={16} />
                Reject Order
              </button>

              {/* Success / failure feedback overlays */}
              {deciding === "accept" && (
                <div className="absolute inset-0 bg-[#002833]/90 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-3">
                  <CheckCircle className="text-[#98E32F]" size={52} />
                  <p className="text-white font-bold text-lg">Order Accepted!</p>
                  <p className="text-white/50 text-sm text-center px-8">
                    Customer is being notified. Start preparing the order.
                  </p>
                </div>
              )}
              {deciding === "reject" && (
                <div className="absolute inset-0 bg-[#002833]/90 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-3">
                  <XCircle className="text-red-400" size={52} />
                  <p className="text-white font-bold text-lg">Order Rejected</p>
                  <p className="text-white/50 text-sm text-center px-8">
                    Customer will be notified.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.85) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(1.06); opacity: 0.7; }
        }
        @keyframes ringShake {
          0%, 100% { transform: rotate(0deg); }
          15%       { transform: rotate(-12deg); }
          30%       { transform: rotate(12deg); }
          45%       { transform: rotate(-8deg); }
          60%       { transform: rotate(8deg); }
          75%       { transform: rotate(-4deg); }
          90%       { transform: rotate(4deg); }
        }
      `}</style>
    </>
  );
}
