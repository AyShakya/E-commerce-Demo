const paymentSteps = [
  { key: "creating", label: "Creating Order..." },
  { key: "redirecting", label: "Redirecting to Secure Payment..." },
  { key: "waiting", label: "Waiting for Payment..." },
  { key: "verifying", label: "Verifying Payment..." },
  { key: "confirming", label: "Confirming Order..." },
  { key: "confirmed", label: "Order Confirmed" },
];

export default function PaymentStatusTimeline({ activeStage }) {
  if (!activeStage) return null;

  const activeIndex = paymentSteps.findIndex((step) => step.key === activeStage);

  return (
    <section className="border border-white/15 bg-white/[0.025] p-7 md:p-8 shadow-2xl shadow-black/30">
      <div className="mb-7 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.45em] text-white/45">
            Payment Status
          </p>
          <h3 className="text-[12px] font-black uppercase tracking-[0.35em] text-white">
            {paymentSteps[activeIndex]?.label || "Preparing Payment..."}
          </h3>
        </div>
        <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.65)] animate-pulse" />
      </div>

      <ol className="space-y-4">
        {paymentSteps.map((step, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <li key={step.key} className="flex items-center gap-4">
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[10px] transition-all duration-500 ${
                  isComplete
                    ? "border-white bg-white text-black"
                    : isActive
                      ? "border-white/80 bg-white/[0.08] text-white shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "border-white/10 bg-black/20 text-white/25"
                }`}
              >
                {isComplete ? "✓" : index + 1}
              </span>

              <span
                className={`text-[11px] uppercase tracking-[0.28em] transition-all duration-500 ${
                  isComplete || isActive
                    ? "text-white"
                    : "text-white/30"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
