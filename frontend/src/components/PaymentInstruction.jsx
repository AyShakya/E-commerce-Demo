const paymentGuidelines = [
  "Keep this tab open until confirmation.",
  "Do not refresh during payment.",
  "You'll receive an order confirmation after successful payment.",
];

export default function PaymentInstruction() {
  return (
    <section className="bg-white/[0.025] border border-white/10 p-7 md:p-8 relative overflow-hidden group/payment-guide hover:border-white/20 transition-all duration-500">
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent opacity-60" />

      <div className="flex items-start gap-5">
        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-sm text-white shadow-[0_0_24px_rgba(255,255,255,0.08)]">
          ✓
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[10px] tracking-[0.45em] uppercase text-white/45 font-bold mb-2">
              Payment Instruction
            </p>
            <h3 className="text-[12px] tracking-[0.35em] uppercase text-white font-black">
              Secure Payment
            </h3>
          </div>

          <ul className="space-y-3">
            {paymentGuidelines.map((guideline) => (
              <li
                key={guideline}
                className="flex gap-3 text-[12px] leading-relaxed text-white/65 font-light"
              >
                <span className="mt-[0.6em] h-1 w-1 flex-shrink-0 rounded-full bg-white/50" />
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
