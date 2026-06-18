import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  useEffect(() => {
    document.title = "Terms & Conditions — Utaran";
  }, []);

  return (
    <div className="bg-[#080808] text-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        {/* Back link */}
        <Link
          to="/"
          className="inline-block text-[10px] tracking-[0.4em] uppercase text-gray-500 hover:text-white transition-colors duration-300 mb-16"
        >
          ← Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-serif italic mb-4">
          Terms and Conditions
        </h1>
        <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-16">
          Last updated: [Date]
        </p>

        {/* Intro */}
        <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-16">
          Welcome to [Your Brand Name]. By accessing or using this website, you
          agree to the following terms.
        </p>

        {/* Sections */}
        <div className="space-y-14">
          {/* Section 1 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              01
            </p>
            <h2 className="text-white font-medium text-lg mb-4">About Us</h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              [Your Brand Name] is a small, student-run online store selling
              thrifted/second-hand clothing. We are an individual seller, not a
              registered company.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              02
            </p>
            <h2 className="text-white font-medium text-lg mb-4">Products</h2>
            <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                All items listed are thrifted/second-hand unless stated
                otherwise.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Product photos are real, but minor differences in color or
                texture may occur due to lighting or screen settings.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Each product description will mention visible wear, if any.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              03
            </p>
            <h2 className="text-white font-medium text-lg mb-4">
              Orders and Payment
            </h2>
            <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Orders are confirmed only after successful payment.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Payments are processed securely through Razorpay. We do not
                store your card, UPI, or banking details on our servers.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Prices listed are final and inclusive of applicable charges
                unless stated otherwise at checkout.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              04
            </p>
            <h2 className="text-white font-medium text-lg mb-4">Shipping</h2>
            <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Orders are shipped within [X] business days of confirmation.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Delivery timelines depend on courier service and location and
                are estimates, not guarantees.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                We currently ship only within India.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              05
            </p>
            <h2 className="text-white font-medium text-lg mb-4">
              Cancellations
            </h2>
            <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Orders can be cancelled only before they are shipped. Contact us
                immediately at [email] to request a cancellation.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 block w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                Once an order is shipped, it cannot be cancelled.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              06
            </p>
            <h2 className="text-white font-medium text-lg mb-4">
              Limitation of Liability
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              We are not liable for delays caused by courier/logistics partners,
              incorrect address details provided by the customer, or events
              beyond our reasonable control.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              07
            </p>
            <h2 className="text-white font-medium text-lg mb-4">
              Changes to These Terms
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              We may update these terms from time to time. Continued use of the
              site after changes means you accept the updated terms.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              08
            </p>
            <h2 className="text-white font-medium text-lg mb-4">Contact Us</h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              For any questions about these terms, contact us at [email] or
              [phone number].
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
