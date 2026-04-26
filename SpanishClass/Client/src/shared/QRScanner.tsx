import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";
import { apiPost } from "../api/api";

type Props = {
  onSuccess?: () => void;
};

export default function QRScanner({ onSuccess }: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        if (processingRef.current) return;
        processingRef.current = true;

        try {
          await apiPost("/booking/validate-ticket", {
            bookingId: decodedText,
          });

          alert("✅ Check-in successful!");

          scanner.clear();

          onSuccess?.();
        } catch (err) {
          alert("❌ Invalid or already used ticket");
        } finally {
          processingRef.current = false;
        }
      },
      (error) => {},
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onSuccess]);

  return <div id="reader" style={{ width: "100%" }} />;
}
