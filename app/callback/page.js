"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    // Extract code and state from URL query parameters
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    console.log("Received code:", code, "State:", state);

    if (code) {
      window.location.href = `/api/spotify/callback?code=${encodeURIComponent(code)}`;
      return;
    }

    router.push("/");
  }, [router]);

  return <div>Processing authentication...</div>;
};

export default Callback;
