"use client";

import { useEffect } from "react";
import { ProgressProvider } from "@bprogress/next/app";
import { useProgress } from "@bprogress/react";
import { usePathname, useSearchParams } from "next/navigation";

function RouteProgressEvents() {
  const { start, stop } = useProgress();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("data-disable-progress") === "true") return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:")) return;
      if (href.startsWith("tel:")) return;
      if (href.startsWith("javascript:")) return;
      if (href.startsWith("blob:")) return;

      const targetUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (targetUrl.origin !== currentUrl.origin) return;
      if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) return;

      start(0.2, 0);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [start]);

  useEffect(() => {
    stop(250);
  }, [pathname, searchParams, stop]);

  return null;
}

export default function ProgressProviderWrapper({
    children,
 }: {
    children: React.ReactNode;
}) {
  return (
    <ProgressProvider
      height="4px"
      color={"#8321c8"}
      options={{showSpinner: false}}
      stopDelay={250}
      shallowRouting
      disableAnchorClick
    >
      <RouteProgressEvents />
      {children}
    </ProgressProvider>
  );
}
