import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function About() {
  useEffect(() => {
    document.title = "About Us — Demo";
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">

        {/* Back link */}
        <Link
          to="/"
          className="inline-block text-[10px] tracking-[0.4em] uppercase text-gray-500 hover:text-white transition-colors duration-300 mb-16"
        >
          ← Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-serif italic mb-12">
          About Us
        </h1>

        {/* Intro */}
        <div className="space-y-6 text-sm md:text-base text-gray-300 leading-relaxed">
          <p>
            [Your Brand Name] is a small, independently-run thrift store
            offering carefully selected second-hand clothing at affordable
            prices. We started this as students, and every item is handpicked
            and checked before listing.
          </p>

          {/* Section subtitle */}
          <h2 className="font-medium text-white text-base md:text-lg pt-4">
            A note on our products
          </h2>

          <p>Since we sell thrifted/second-hand clothing:</p>

          <ul className="list-disc list-outside pl-5 space-y-3">
            <li>
              Items may show minor signs of previous wear (small fading, light
              pilling, etc.) unless described as "new" or "unused."
            </li>
            <li>
              Any significant flaws will be mentioned in the product description
              and shown in photos.
            </li>
            <li>
              Sizes may vary slightly from standard sizing since items come from
              different brands and eras — please check measurements in the
              product description if available.
            </li>
          </ul>

          <p>
            We're a two-person team, so response times may occasionally be a
            little slower than a large store, but we personally read and respond
            to every message.
          </p>

          <p>
            Questions? Reach us at [email] or [phone number].
          </p>
        </div>

      </div>
    </div>
  );
}
