'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function QDW2026Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide the global QDC footer when on QDW 2026 pages
    const globalFooter = document.getElementById('qdc-footer');
    if (globalFooter) {
      globalFooter.style.display = 'none';
    }

    return () => {
      // Restore the footer when leaving QDW 2026 pages
      const footer = document.getElementById('qdc-footer');
      if (footer) {
        footer.style.display = '';
      }
    };
  }, []);

  return (
    <>
      <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />
      {children}
    </>
  );
}

