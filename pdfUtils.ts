/**
 * Download HTML as PDF using html2pdf.js (browser only).
 * Renders the HTML in a temporary iframe, then captures and saves as PDF.
 */

// @ts-expect-error no types for html2pdf.js
import html2pdf from 'html2pdf.js';

export function downloadHtmlAsPdf(html: string, filename: string): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position:absolute;left:-9999px;width:8.5in;height:11in;');
  document.body.appendChild(iframe);

  return new Promise((resolve, reject) => {
    iframe.srcdoc = html;
    iframe.onload = () => {
      try {
        const el = iframe.contentDocument?.body;
        if (!el) {
          iframe.remove();
          reject(new Error('Could not access iframe body'));
          return;
        }
        const opts = {
          margin: 0.35,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'in', format: 'letter', hotfixes: ['px_scaling'] },
          pagebreak: { mode: ['css', 'legacy'], before: '.pdf-page-break-before', after: '.pdf-page-break-after' },
        };
        html2pdf().set(opts).from(el).save().then(() => {
          iframe.remove();
          resolve();
        }).catch((err: unknown) => {
          iframe.remove();
          reject(err);
        });
      } catch (e) {
        iframe.remove();
        reject(e);
      }
    };
    iframe.onerror = () => {
      iframe.remove();
      reject(new Error('Failed to load HTML in iframe'));
    };
  });
}
