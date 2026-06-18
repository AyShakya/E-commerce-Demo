import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy — Utaran";
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
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 mb-16">Last updated: [Date]</p>

        {/* Intro */}
        <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-16">
          [Your Brand Name] ("we", "us") respects your
          privacy. This page explains what information we collect when you use
          our website and how we use it.
        </p>

        {/* Sections */}
        <div className="space-y-14">
          {/* Section 1 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              01
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              Information We Collect
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
              When you browse our site or place an order, we may collect:
            </p>
            <ul className="space-y-2 pl-4">
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Your name, email address, and phone number
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Your shipping and billing address
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Order details (items purchased, order value, order history)
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Basic technical data (IP address, browser type, device type)
                collected automatically
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              02
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              Payment Information
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              We do not collect or store your card, UPI, or bank account
              details. All payments are processed securely by Razorpay, a
              PCI-DSS compliant payment gateway. We only receive confirmation
              that a payment was successful, along with a transaction reference
              ID.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              03
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              How We Use Your Information
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
              We use your information only to:
            </p>
            <ul className="space-y-2 pl-4 mb-6">
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Process and fulfil your orders
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Contact you about your order or delivery
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Respond to customer support queries
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Improve our website and product listings
              </li>
            </ul>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              We do not sell or rent your personal information to anyone.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              04
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              Sharing of Information
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
              We share your information only with:
            </p>
            <ul className="space-y-2 pl-4 mb-6">
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Razorpay, to process your payment
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Our courier/logistics partner, to deliver your order
              </li>
            </ul>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              We do not share your data with any other third party for marketing
              or advertising purposes.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              05
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              Data Storage and Security
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Your order and contact information is stored securely and is
              accessible only to us for the purpose of fulfilling your order. We
              take reasonable measures to protect your data, including using
              HTTPS encryption on our website.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              06
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              Your Rights
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
              You can contact us at [email] at any time to:
            </p>
            <ul className="space-y-2 pl-4">
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Ask what personal data we hold about you
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Request a correction to your information
              </li>
              <li className="text-sm md:text-base text-gray-300 leading-relaxed flex items-start">
                <span className="text-gray-500 mr-3 mt-1.5 block h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                Request deletion of your data (note: we may need to retain order
                records for a reasonable period for accounting purposes)
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              07
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              Cookies
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Our website may use basic cookies necessary for the site to
              function correctly (e.g., keeping items in your cart). We do not
              currently use tracking or advertising cookies.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              08
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              Changes to This Policy
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              We may update this privacy policy from time to time. Changes will
              be posted on this page with an updated "last updated"
              date.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3">
              09
            </p>
            <h2 className="text-white font-medium text-base md:text-lg mb-4">
              Contact Us
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              If you have any questions about this privacy policy or how your
              data is handled, contact us at [email].
            </p>
          </section>
        </div>

        {/* Footer divider */}
        <div className="mt-24 pt-8 border-t border-white/10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500">
            Utaran — Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
