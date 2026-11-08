import { useEffect, useState } from "react";

export type Route = "beranda" | "pet" | "riwayat" | "pengaturan";

export const ROUTES: readonly Route[] = ["beranda", "pet", "riwayat", "pengaturan"];

function readRoute(): Route {
  const name = window.location.hash.replace(/^#\/?/, "");
  return (ROUTES as readonly string[]).includes(name) ? (name as Route) : "beranda";
}

export const routeHref = (route: Route): string => `#/${route}`;

/** Tiny hash router: four tabs, no dependency. Back and forward buttons work. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
