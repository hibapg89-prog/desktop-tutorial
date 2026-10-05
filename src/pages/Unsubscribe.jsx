import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const uid = params.get("uid");

  const [status, setStatus] = useState("loading"); // loading | success | error | missing

  useEffect(() => {
    if (!uid) {
      setStatus("missing");
      return;
    }

    base44.functions.invoke("unsubscribeEmail", { uid })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [uid]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#FDF5E6" }}
    >
      <div className="mb-8">
        <SwanLogo size={38} color="#C8B06A" />
      </div>

      <p
        className="text-[10px] uppercase tracking-[0.38em] mb-6"
        style={{ color: "#C8B06A" }}
      >
        The Muse · LuxeBeauty
      </p>

      {status === "loading" && (
        <p className="text-[14px] font-light" style={{ color: "#043927" }}>
          Updating your preferences…
        </p>
      )}

      {status === "success" && (
        <>
          <h1
            className="font-serif text-[28px] font-light mb-3 leading-tight"
            style={{ color: "#043927" }}
          >
            You're unsubscribed.
          </h1>
          <p className="text-[13px] font-light leading-relaxed mb-8" style={{ color: "#6b5c4a" }}>
            You won't receive weekly price-drop emails from us anymore.
            <br />
            You can re-enable them any time in{" "}
            <Link to="/account" className="underline underline-offset-2">
              Account settings
            </Link>
            .
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <h1
            className="font-serif text-[26px] font-light mb-3 leading-tight"
            style={{ color: "#043927" }}
          >
            Something went wrong.
          </h1>
          <p className="text-[13px] font-light leading-relaxed mb-8" style={{ color: "#6b5c4a" }}>
            We couldn't update your preferences right now. Please try again or
            manage your email settings in{" "}
            <Link to="/account" className="underline underline-offset-2">
              Account settings
            </Link>
            .
          </p>
        </>
      )}

      {status === "missing" && (
        <>
          <h1
            className="font-serif text-[26px] font-light mb-3 leading-tight"
            style={{ color: "#043927" }}
          >
            Invalid link.
          </h1>
          <p className="text-[13px] font-light leading-relaxed mb-8" style={{ color: "#6b5c4a" }}>
            This unsubscribe link appears to be incomplete. You can manage your
            email preferences in{" "}
            <Link to="/account" className="underline underline-offset-2">
              Account settings
            </Link>
            .
          </p>
        </>
      )}

      <Link
        to="/"
        className="text-[10px] uppercase tracking-[0.22em] font-light"
        style={{ color: "#C8B06A" }}
      >
        Back to The Muse
      </Link>
    </div>
  );
}
