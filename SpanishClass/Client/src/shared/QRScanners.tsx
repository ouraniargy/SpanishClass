import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function QRScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false,
    );

    scanner.render(
      (decodedText) => {
        console.log("QR:", decodedText);
      },
      (error) => {
        console.warn(error);
      },
    );

    return () => {
      scanner.clear();
    };
  }, []);

  return <div id="reader" style={{ width: "300px" }} />;
}
