"use client";
import { useRef, useState, useEffect } from "react";
import { InputField } from "@/components/InputField";

export default function Join() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    if (sent) {
      const timer = setTimeout(() => {
        setSent(false);
        setIsSubmitting(false);
        submitted.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sent]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitted.current || isSubmitting) return;

    setIsSubmitting(true);
    submitted.current = true;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const joinData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      designation: formData.get("designation") as string,
      location: formData.get("location") as string,
    };

    try {
      const response = await fetch("/api/submit-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(joinData),
      });


      if (response.ok) {
        setTimeout(() => setSent(true), 300);
      } else {
        setIsSubmitting(false);
        submitted.current = false;
        alert("Sorry, there was an error submitting your form. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setIsSubmitting(false);
      submitted.current = false;
      alert("Sorry, there was an error submitting your form. Please try again.");
    }
  }

  return (
    <section className="bg-white py-16 md:py-24 text-black">
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black text-center mb-12 md:mb-20">
        Join Now
      </h2>

      <div className="w-[80%] max-w-6xl mx-auto">
        {!sent ? (
          <form className="text-main text-2xl font-bold" onSubmit={handleSubmit}>
            <label className="block text-main font-normal mb-8">
                <span className="font-bold">Name</span> (required)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
              <div className="mb-10 lg:mb-20">
                <InputField id="first-name" name="firstName" label="First Name" required />
              </div>

              <div className="mb-10 lg:mb-20">
                <InputField id="last-name" name="lastName" label="Last Name" required />
              </div>
            </div>

            <div className="mb-10 lg:mb-20">
                <label htmlFor="email" className="block font-normal mb-2">
                    <span className="font-bold">Email</span> (required)
                </label>
                <InputField id="email" name="email" type="email" label="" required />
            </div>

            <div className="mb-10 lg:mb-20">
                <label htmlFor="designation" className="block font-normal mb-2">
                    <span className="font-bold">Designation</span> student (undergrad/grad) , postdocs, professor, industry professional, other 
                </label>
              <select
                id="designation"
                name="designation"
                required
                defaultValue="" 
                className="w-full rounded-[20px] border-[2px] bg-[#F5F5F5] border-[#595B72] mt-4
                           px-3 py-5 outline-none font-normal transition
                           focus:border-[#6B6E8D] focus:shadow-[0_0_8px_rgba(107,110,141,0.5)]"
              >
                <option value="" disabled hidden/>
                <option value="Student">Student</option>
                <option value="Post Docs">Post Docs</option>
                <option value="Professor">Professor</option>
                <option value="Industry Professional">Industry Professional</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-20">
                <label htmlFor="location" className="block font-normal mb-2">
                    <span className="font-bold">Location</span>
                </label>
                <InputField
                    id="location"
                    name="location"
                    label=""
                />
            </div>

            <div className="mt-20 flex justify-center">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full px-16 py-4 text-white font-semibold
                            bg-[linear-gradient(90deg,#6979E7_0%,#915DD6_100%)]
                            hover:opacity-95 active:opacity-90
                            disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6979E7]"
                >
                    {isSubmitting ? "Submitting..." : "Join Us"}
                </button>
            </div>

          </form>
        ) : (
          <div className="text-center text-main">
            <h3 className="text-3xl font-bold mb-2">Thanks for joining!</h3>
            <p className="text-lg font-normal">We received your response.</p>
          </div>
        )}
      </div>
      <h2 className="text-2xl sm:text-2xl md:text-3xl xl:text-4xl font-normal text-black text-center md:my-[150px] ">
        If you have any inquiries, please contact us at quantum.ucla@gmail.com
      </h2>
    </section>
  );
}
