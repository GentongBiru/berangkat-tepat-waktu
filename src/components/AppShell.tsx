import { useEffect, useRef } from "react";
import { BottomNav } from "./BottomNav";
import { useRoute, type Route } from "../hooks/useRoute";
import { useAppState } from "../state/AppStateProvider";
import { Beranda } from "../screens/Beranda";
import { PetSaya } from "../screens/PetSaya";
import { Riwayat } from "../screens/Riwayat";
import { Pengaturan } from "../screens/Pengaturan";
import { id } from "../strings/id";

const TITLES: Record<Route, string> = {
  beranda: id.nav.home,
  pet: id.nav.pet,
  riwayat: id.nav.history,
  pengaturan: id.nav.settings,
};

export function AppShell() {
  const route = useRoute();
  const { demoMode, storageOk, loadIssues } = useAppState();
  const mainRef = useRef<HTMLElement>(null);
  const previousRoute = useRef<Route>(route);

  useEffect(() => {
    document.title = `${TITLES[route]} · ${id.appName}`;
    // Move focus to the new screen only when the route really changed (not on first
    // load, and safe under StrictMode's double effect run), then start at the top.
    if (previousRoute.current !== route) {
      previousRoute.current = route;
      mainRef.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [route]);

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__name">{id.appName}</span>
      </header>

      {demoMode && (
        <div className="banner banner--demo" role="status">
          {id.shell.demoBanner}
        </div>
      )}
      {!storageOk && (
        <div className="banner banner--warn" role="alert">
          {id.shell.storageWarning}
        </div>
      )}
      {loadIssues.length > 0 && (
        <div className="banner banner--warn" role="status">
          {id.shell.loadIssuesWarning}
        </div>
      )}

      <main ref={mainRef} tabIndex={-1} className="app__main">
        {route === "beranda" && <Beranda />}
        {route === "pet" && <PetSaya />}
        {route === "riwayat" && <Riwayat />}
        {route === "pengaturan" && <Pengaturan />}
      </main>

      <BottomNav current={route} />
    </div>
  );
}
