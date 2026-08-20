const SWAN_IMAGE_URL = "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/87fc5ab0f_IMG_4373.png";

export default function SwanLogo({ size = 48, color, className = "" }) {
  return (
    <img
      src={SWAN_IMAGE_URL}
      width={size}
      height={size}
      alt="The Muse Swan"
      className={className}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
