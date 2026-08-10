"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HudIcon, type HudIconName } from "@/components/ui/HudIcon";

/** Always-available "How to Play" button + reference modal. */
export function HelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="How to play"
        className="stencil flex h-7 items-center gap-1 rounded border border-amber-500/50 bg-amber-500/10 px-2 text-[11px] text-amber-400 hover:bg-amber-500/20"
      >
        <span className="text-sm leading-none">?</span> Help
      </button>
      <AnimatePresence>
        {open && <RulesModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-navy-950/90 p-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="dm-panel w-full max-w-lg space-y-4 p-5"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="stencil text-lg text-steel-100">How to Play</h2>
          <button
            onClick={onClose}
            className="stencil rounded border border-navy-600 px-2 py-0.5 text-xs text-navy-300 hover:text-steel-100"
          >
            Close
          </button>
        </div>

        {/* Goal */}
        <Section title="The Goal">
          <p>
            You&apos;re a shipyard <b className="text-steel-100">Superintendent</b>. Score the
            most <Term icon="prestige">Prestige Points (PP)</Term> to get promoted.
          </p>
          <p className="mt-1 text-amber-400/90">
            But it&apos;s semi-cooperative: if{" "}
            <b className="text-alert-red">Shipyard Integrity (SI)</b> hits{" "}
            <b className="text-alert-red">0</b>, <b>everyone loses</b> — even the leader. Balance
            ambition with keeping the yard alive.
          </p>
        </Section>

        {/* Round loop */}
        <Section title="Each Round — 5 Phases">
          <ol className="space-y-1.5">
            <Step n="1" name="Contract">
              (Round 1) Pick a ship — <b>Side A</b> is easier. Sets your starting dice.
            </Step>
            <Step n="2" name="Event">
              A card fires — good or bad. Read it and acknowledge.
            </Step>
            <Step n="3" name="Planning">
              Draft a <b className="text-steel-100">Work Order</b> from the Market, then place a
              card from your hand into a <b>drydock slot</b> (costs{" "}
              <Term icon="material">Material</Term>).
            </Step>
            <Step n="4" name="Action">
              You get <b>2 actions</b>. Assign a colored <b>die</b> to a matching slot on a staged
              job → it becomes a <b>countdown timer</b> ($1 wages each). Or procure resources, speed
              a die, or Pass.
            </Step>
            <Step n="5" name="Resolution">
              Every die ticks down 1. A die hitting <b>0</b> gets the job inspected: ~85% pays its
              PP, ~15% is <b className="text-alert-red">Growth Work</b> (complications).
            </Step>
          </ol>
        </Section>

        {/* Resources */}
        <Section title="Resources">
          <div className="grid grid-cols-1 gap-1.5">
            <Term icon="funding">
              <b className="text-steel-100">Funding</b> — pays $1 wages per working die.
            </Term>
            <Term icon="material">
              <b className="text-steel-100">Material</b> — spent to stage jobs into drydock slots.
            </Term>
            <Term icon="prestige">
              <b className="text-steel-100">Prestige (PP)</b> — your score. Most PP wins.
            </Term>
          </div>
        </Section>

        {/* Glossary */}
        <Section title="Key Terms">
          <dl className="space-y-1">
            <Def t="Shipyard Integrity (SI)">
              Shared health of the yard. Persistent Problems drain it each round. Hits 0 → everyone
              loses.
            </Def>
            <Def t="Dice = timers">
              An assigned die shows a number that counts down 1 per round. At 0, the job is inspected.
            </Def>
            <Def t="Growth Work">
              A ~15% inspection failure — extra work/complications instead of a clean payout.
            </Def>
            <Def t="Persistent Problem">
              A lingering event that drains SI every round until someone clears it.
            </Def>
            <Def t="Disciplines">
              Dice come in 5 colors (Hull, Engineering, Electrical, Combat, Support) that must match
              a job&apos;s requirement slots.
            </Def>
          </dl>
        </Section>

        <p className="stencil text-center text-[10px] text-navy-400">
          The fleet won&apos;t wait. Tip: never win the PP race by letting the yard sink.
        </p>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="stencil text-xs text-amber-400">{title}</h3>
      <div className="hud-rule mb-2 mt-1" />
      <div className="text-[13px] leading-relaxed text-steel-300">{children}</div>
    </div>
  );
}

function Step({ n, name, children }: { n: string; name: string; children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="stencil mt-0.5 shrink-0 text-amber-400">{n}</span>
      <span>
        <b className="stencil text-steel-100">{name}.</b> {children}
      </span>
    </li>
  );
}

function Term({ icon, children }: { icon: HudIconName; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <HudIcon name={icon} size={14} />
      <span>{children}</span>
    </span>
  );
}

function Def({ t, children }: { t: string; children: ReactNode }) {
  return (
    <div>
      <dt className="inline font-bold text-steel-100">{t}: </dt>
      <dd className="inline text-navy-200">{children}</dd>
    </div>
  );
}
