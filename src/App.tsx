import { AppStateProvider } from "./state/AppStateProvider";
import { AppShell } from "./components/AppShell";

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
