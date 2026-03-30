"use client";

export default function PressKit() {
  return (
    <div className="min-h-screen bg-navy-950 text-steel-300">
      {/* Hero */}
      <div
        className="relative h-[60vh] min-h-[400px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url(/marketing/social/reddit-banner.jpg)" }}
      >
        <div className="absolute inset-0 bg-navy-950/60" />
        <div className="relative text-center space-y-4 px-4">
          <h1 className="text-5xl sm:text-7xl font-bold text-steel-100 tracking-tight">
            DRYDOCK MASTERS
          </h1>
          <p className="text-xl sm:text-2xl text-amber-400 tracking-widest">
            THE FLEET WON&apos;T WAIT
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <a
              href="https://pm-game-flame.vercel.app"
              className="rounded-lg bg-amber-500 px-8 py-3 text-lg font-bold text-navy-900 hover:bg-amber-400 transition-colors"
            >
              PLAY FREE NOW
            </a>
            <a
              href="https://github.com/Anguijm/PM-game"
              className="rounded-lg border border-steel-300 px-8 py-3 text-lg font-bold text-steel-300 hover:bg-steel-300/10 transition-colors"
            >
              SOURCE CODE
            </a>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-steel-100">About the Game</h2>
          <p className="text-lg leading-relaxed">
            Drydock Masters is a semi-cooperative board game where 2-6 players
            manage a naval shipyard under pressure. Assign Labor Dice to Work
            Orders, race against countdown timers, and survive Condition Found
            Reports that threaten to bury you in extra work.
          </p>
          <p className="text-lg leading-relaxed">
            The catch: you share one Shipyard Integrity bar. If it hits zero,
            everyone&apos;s fired. But only the Superintendent with the most
            Prestige Points earns the promotion to Dock Master.
          </p>
        </section>

        {/* Quick Facts */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Players", value: "2-6" },
            { label: "Rounds", value: "12" },
            { label: "Price", value: "Free" },
            { label: "Platform", value: "Browser" },
          ].map((fact) => (
            <div
              key={fact.label}
              className="rounded-lg border border-navy-600 bg-navy-800 p-4 text-center"
            >
              <div className="text-2xl font-bold text-amber-400">{fact.value}</div>
              <div className="text-xs text-navy-400 uppercase mt-1">{fact.label}</div>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-steel-100">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Semi-cooperative tension — shared survival, individual victory",
              "Labor Dice countdown system",
              "15 secret per-player objectives",
              "15 achievements to unlock",
              "Daily Challenge with global leaderboard",
              "5 AI bot strategies",
              "Online multiplayer with emote wheel",
              "Mobile responsive — play on any device",
              "Guided tutorial with The Foreman",
              "Balanced across 3,400+ AI-simulated games",
            ].map((f) => (
              <div
                key={f}
                className="flex items-start gap-2 text-sm text-navy-200"
              >
                <span className="text-amber-400 mt-0.5">▸</span>
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* Videos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-steel-100">Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <video
                src="/marketing/gameplay-overview.mp4"
                controls
                className="rounded-lg w-full"
                poster="/marketing/key-art.jpg"
              />
              <p className="text-xs text-navy-400 mt-1">Gameplay Overview (55s)</p>
            </div>
            <div>
              <video
                src="/marketing/the-tension.mp4"
                controls
                className="rounded-lg w-full"
                poster="/marketing/social/twitter-card.jpg"
              />
              <p className="text-xs text-navy-400 mt-1">The Tension (30s)</p>
            </div>
          </div>
        </section>

        {/* Screenshots / Art */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-steel-100">Press Assets</h2>
          <p className="text-sm text-navy-400">
            Click to view full size. All assets free to use for press coverage.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { src: "/marketing/key-art.jpg", label: "Key Art (4K)" },
              { src: "/marketing/social/twitter-card.jpg", label: "Twitter Card" },
              { src: "/marketing/social/instagram-square.jpg", label: "Instagram" },
              { src: "/marketing/social/reddit-banner.jpg", label: "Reddit Banner" },
              { src: "/images/promo/bg-shipyard.jpg", label: "Shipyard" },
              { src: "/images/promo/bg-blueprint.jpg", label: "Blueprint" },
            ].map((img) => (
              <a key={img.src} href={img.src} target="_blank" rel="noopener">
                <img
                  src={img.src}
                  alt={img.label}
                  className="rounded-lg w-full h-32 object-cover hover:opacity-80 transition-opacity"
                />
                <p className="text-[10px] text-navy-400 mt-1">{img.label}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="text-center space-y-2 pt-8 border-t border-navy-600">
          <h2 className="text-xl font-bold text-steel-100">Contact</h2>
          <p className="text-sm text-navy-400">
            GitHub:{" "}
            <a href="https://github.com/Anguijm/PM-game" className="text-amber-400 hover:underline">
              Anguijm/PM-game
            </a>
          </p>
          <p className="text-xs text-navy-600 mt-4">
            Built with Claude (Anthropic) + Gemini (Google) AI governance framework
          </p>
        </section>
      </div>
    </div>
  );
}
