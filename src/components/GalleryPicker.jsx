import { useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Gallery opens the device's native photo library — same file-input pattern as Camera,
// without capture="environment" so it goes to the photo library instead of the lens.
// On selection the image is uploaded to the CDN and onNext receives a real accessible URL.
export default function GalleryPicker({ onCancel, onNext }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) { onCancel(); return; }
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onNext(file_url);
    } catch {
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleChange}
      onCancel={onCancel}
    />
  );
}
