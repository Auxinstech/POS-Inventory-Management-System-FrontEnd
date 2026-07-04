import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { useEffect, useRef } from "react";
import { clearPrintUrl } from "../../Redux/Ducks/orderSlice";

const AutoPrintPdf = () => {
  const dispatch = useAppDispatch();
  const pdfUrl = useAppSelector((x) => x.Order.printUrl);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Create hidden iframe once
  useEffect(() => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    return () => {
      document.body.removeChild(iframe);
      iframeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!pdfUrl || !iframeRef.current) return;

    const printPdf = async () => {
      try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const iframe = iframeRef.current;
        if (!iframe) return;

        iframe.src = blobUrl;

        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          URL.revokeObjectURL(blobUrl); // cleanup after load
          dispatch(clearPrintUrl());
        };
      } catch (err) {
        console.error("Print error:", err);
        dispatch(clearPrintUrl());
      }
    };

    printPdf();
  }, [pdfUrl]);

  return null;
};

export default AutoPrintPdf;
