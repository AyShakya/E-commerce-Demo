export default function PaymentOutcomePanel({
  type,
  detail,
  onRetry,
  onReturnToCart,
  onRefreshStatus,
  refreshing,
}) {
  const isFailure = type === "failure";
  const isPending = type === "pending";

  if (!isFailure && !isPending) return null;

  const title = isFailure ? detail?.title || "Payment Failed" : "Payment Received";
  const message = isFailure
    ? detail?.message || "No amount has been charged."
    : "We're still confirming your order.";
  const note = isFailure
    ? detail?.note || "You can retry payment safely or return to your cart."
    : "Please do not make another payment.";
  const canRetry = detail?.canRetry !== false;

  return (
    <section className="relative overflow-hidden border border-white/15 bg-[#080808] p-8 md:p-10 shadow-2xl shadow-black/40">
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
          isFailure ? "via-red-300/70" : "via-white/70"
        } to-transparent`}
      />
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div
            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border bg-white/[0.04] text-xl shadow-[0_0_36px_rgba(255,255,255,0.1)] ${
              isFailure
                ? "border-red-300/30 text-red-200"
                : "border-white/20 text-white"
            }`}
          >
            {isFailure ? "!" : "✓"}
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.5em] text-white/45">
                Checkout Status
              </p>
              <h3 className="text-3xl font-serif italic tracking-tight text-white">
                {title}
              </h3>
            </div>

            <div className="space-y-3">
              <p className="max-w-md text-[14px] leading-loose text-white/75">
                {message}
              </p>
              <p className="max-w-md text-[12px] leading-relaxed text-white/45">
                {note}
              </p>
              {detail?.where && (
                <p className="inline-flex border border-white/10 bg-white/[0.03] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-white/45">
                  Stage: {detail.where}
                </p>
              )}
            </div>
          </div>
        </div>

        {isFailure ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={canRetry ? onRetry : onRefreshStatus}
              className="bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-black transition-all hover:bg-white/90"
            >
              {canRetry ? "Retry Payment" : "Check Status"}
            </button>
            <button
              onClick={onReturnToCart}
              className="border border-white/20 px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white/65 transition-all hover:border-white/60 hover:text-white"
            >
              Return to Cart
            </button>
          </div>
        ) : (
          <button
            onClick={onRefreshStatus}
            disabled={refreshing}
            className="w-full border border-white/20 px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white/70 transition-all hover:border-white/60 hover:text-white disabled:opacity-40"
          >
            {refreshing ? "Checking Status..." : "Refresh Status"}
          </button>
        )}
      </div>
    </section>
  );
}
