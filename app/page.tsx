"use client";

import { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import JourneyMap from "./components/JourneyMap";

export default function Home() {
  const [rotaId, setRotaId] = useState<string | null>(null);

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {rotaId ? (
        <JourneyMap rotaId={rotaId} onVoltar={() => setRotaId(null)} />
      ) : (
        <HomeScreen onEscolher={(id) => setRotaId(id)} />
      )}
    </main>
  );
}
