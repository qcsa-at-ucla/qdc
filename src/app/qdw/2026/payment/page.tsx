"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type RegistrationType =
  | "student_in_person"
  | "student_online"
  | "professional_in_person"
  | "professional_online";

declare global {
  interface Window {
    Stripe?: any;
  }
}

function QDW2026PaymentContent() {
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const expressCheckoutRef = useRef<HTMLDivElement>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const registrationType = sp.get("type") as RegistrationType | null;
    const email = sp.get("email") || undefined;

    if (!registrationType) {
      setError("Missing registration type. Please go back and try again.");
      setIsLoading(false);
      return;
    }

    // Read full registration data from sessionStorage
    const stored = sessionStorage.getItem("qdw_registration");
    if (!stored) {
      setError(
        "Registration data not found. Please go back and fill out the form again."
      );
      setIsLoading(false);
      return;
    }

    let registrationData: Record<string, any>;
    try {
      registrationData = JSON.parse(stored);
    } catch {
      setError("Invalid registration data. Please go back and try again.");
      setIsLoading(false);
      return;
    }

    // Initialize Stripe Express Checkout Element
    const initExpressCheckout = async () => {
      try {
        // Wait for Stripe.js to load
        if (!window.Stripe) {
          await new Promise<void>((resolve) => {
            const checkStripe = setInterval(() => {
              if (window.Stripe) {
                clearInterval(checkStripe);
                resolve();
              }
            }, 100);
          });
        }

        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        
        if (!publishableKey) {
          throw new Error("Stripe publishable key is not configured.");
        }

        const stripe = window.Stripe(publishableKey);

        // Create PaymentIntent
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationType, email, registrationData }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create payment intent");

        const { clientSecret } = data;

        // Create Elements instance
        const elements = stripe.elements({
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#8b5cf6',
            },
          },
        });

        // Create and mount Express Checkout Element
        const expressCheckout = elements.create('expressCheckout', {
          buttonTheme: {
            applePay: 'black',
            googlePay: 'black',
          },
        });

        // Listen for ready event
        expressCheckout.on('ready', (event: any) => {
          console.log('Express Checkout Element ready:', event);
          setIsLoading(false);
        });

        // Listen for click event (when user clicks express button)
        expressCheckout.on('click', (event: any) => {
          console.log('Express Checkout clicked:', event);
        });

        // Mount the element
        if (expressCheckoutRef.current) {
          expressCheckout.mount(expressCheckoutRef.current);
        }

        // Handle express checkout confirmation
        expressCheckout.on('confirm', async (event: any) => {
          setProcessingPayment(true);
          
          const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/qdw/2026/payment/success`,
            },
          });

          if (confirmError) {
            setError(confirmError.message || "Payment failed");
            setProcessingPayment(false);
          } else {
            setPaymentSuccess(true);
          }
        });

        // Fallback: Stop loading and show checkout button if ready event doesn't fire
        setTimeout(() => {
          setIsLoading(false);
          setShowFallback(true);
        }, 2000);
      } catch (e: any) {
        console.error('Error initializing express checkout:', e);
        setError(e?.message || "Failed to initialize payment.");
        setIsLoading(false);
        setShowFallback(true);
      }
    };

    initExpressCheckout();
  }, [sp]);

  const handleHostedCheckout = async () => {
    const registrationType = sp.get("type") as RegistrationType | null;
    const email = sp.get("email") || undefined;
    const stored = sessionStorage.getItem("qdw_registration");
    
    if (!stored || !registrationType) return;

    try {
      const registrationData = JSON.parse(stored);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationType, email, registrationData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start checkout");

      window.location.assign(data.url);
    } catch (e: any) {
      setError(e?.message || "Failed to start payment.");
    }
  };

  return (
    <main className="min-h-screen bg-white pt-32 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-gray-600 mb-8">Choose your preferred payment method below.</p>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
            {error}
            <div className="mt-3">
              <Link
                href="/qdw/2026/registration"
                className="text-purple-600 hover:text-purple-700 underline font-medium"
              >
                ← Back to Registration
              </Link>
            </div>
          </div>
        ) : paymentSuccess ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 mb-6">
            Payment successful! Redirecting...
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading payment options...</span>
              </div>
            )}

            {!isLoading && !processingPayment && (
              <>
                {/* Express Checkout Element (Apple Pay, Google Pay, etc.) */}
                <div className="mb-8">
                  <div
                    ref={expressCheckoutRef}
                    className="min-h-[60px]"
                  />
                </div>

                {/* Divider */}
                {showFallback && (
                  <>
                    <div className="relative mb-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or pay with card</span>
                      </div>
                    </div>

                    {/* Fallback to hosted checkout */}
                    <button
                      onClick={handleHostedCheckout}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-4 transition-all duration-200 hover:scale-105"
                    >
                      Continue to Checkout
                    </button>
                  </>
                )}
              </>
            )}

            {processingPayment && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Processing payment...</span>
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your registration will only be saved after successful payment.</p>
          <Link
            href="/qdw/2026/registration"
            className="mt-2 inline-block text-purple-600 hover:text-purple-700 underline"
          >
            ← Back to Registration
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function QDW2026PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-32 px-4"><div className="max-w-xl mx-auto">Loading...</div></div>}>
      <QDW2026PaymentContent />
    </Suspense>
  );
}