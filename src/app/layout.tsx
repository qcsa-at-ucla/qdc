import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"


export const metadata: Metadata = {
  title: "Quantum Device Consortium",
  description: "The Quantum Device Community aims to be an open association for pioneers of the quantum device design and simulation community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
            <Navbar />
            {children}
            <Footer />
      </body>
    </html>
  );
}
