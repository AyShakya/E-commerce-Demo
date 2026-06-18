import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function RefundPolicy() {
  useEffect(() => {
    document.title = "Refund & Cancellation Policy — Utaran";
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-gray-500 hover:text-white transition-colors duration-300 mb-16"
        >
          ← Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-serif italic mb-4">
          Refund and Cancellation Policy
        </h1>

        {/* Last updated */}
        <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-16">
          Last updated: [Date]
        </p>

        {/* Intro */}
        <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-16">
          We want you to be happy with your purchase. Please read our policy
          carefully before ordering, since these are thrifted/second-hand items.
        </p>

        {/* Sections */}
        <div className="space-y-14">
          {/* 1. Cancellations */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              01
            </p>
            <h2 className="text-white font-medium text-lg mb-4">
              Cancellations
            </h2>
            <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                You may cancel an order only before it has been shipped, by
                emailing us at [email] with your order details.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                Once shipped, orders cannot be cancelled.
              </li>
            </ul>
          </section>

          {/* 2. Returns */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              02
            </p>
            <h2 className="text-white font-medium text-lg mb-4">Returns</h2>
            <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                Since our products are thrifted/second-hand, all sales are final
                unless the item received is materially different from what was
                described or shown in photos (for example: wrong item sent, or
                undisclosed damage not mentioned in the listing).
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                Returns must be requested within [X] days of delivery by
                emailing [email] with photos of the issue.
              </li>
            </ul>
          </section>

          {/* 3. Refunds */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              03
            </p>
            <h2 className="text-white font-medium text-lg mb-4">Refunds</h2>
            <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                Approved refunds will be processed to the original payment
                method within [X] business days via Razorpay.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                Shipping charges (if any) are non-refundable unless the error
                was on our part.
              </li>
            </ul>
          </section>

          {/* 4. Damaged or incorrect items */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              04
            </p>
            <h2 className="text-white font-medium text-lg mb-4">
              Damaged or Incorrect Items
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              If you receive a damaged item or the wrong product, contact us
              within [X] days of delivery with clear photos. We will offer a
              replacement (if available) or a refund.
            </p>
          </section>

          {/* 5. How to request a refund */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              05
            </p>
            <h2 className="text-white font-medium text-lg mb-4">
              How to Request a Refund or Report an Issue
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
              Email [email] with:
            </p>
            <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed list-none mb-6">
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                Order number
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                Photos of the item received
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block h-1 w-1 rounded-full bg-gray-500 shrink-0" />
                Description of the issue
              </li>
            </ul>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              We aim to respond within [X] business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
