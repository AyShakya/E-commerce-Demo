const verificationStages = new Set(["verifying", "confirming", "confirmed"]);

export default function PaymentVerificationNotice({ activeStage }) {
  if (!verificationStages.has(activeStage)) return null;

  const isConfirmed = activeStage === "confirmed";

  return (
    <section className="relative overflow-hidden border border-white/15 bg-[#080808] p-8 md:p-10 shadow-2xl shadow-black/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative flex flex-col gap-7 sm:flex-row sm:items-start">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] shadow-[0_0_36px_rgba(255,255,255,0.12)]">
          <span className="text-xl text-white">✓</span>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.5em] text-white/45">
              Payment Successful
            </p>
            <h3 className="text-2xl font-serif italic tracking-tight text-white md:text-3xl">
              {isConfirmed ? "Order Confirmed" : "We're confirming your order."}
            </h3>
          </div>

          <p className="max-w-md text-[13px] leading-loose text-white/60">
            {isConfirmed
              ? "Your order is confirmed. Redirecting you to your dashboard now."
              : "Please keep this page open while we securely verify your payment and prepare your order confirmation."}
          </p>

          {!isConfirmed && (
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Finalizing Secure Checkout
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
