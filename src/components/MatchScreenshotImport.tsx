import { useCallback, useId, useState } from "react";
import { useTournament } from "../state/TournamentContext";
import {
  buildOcrImportRows,
  parseLeaderboardFromOcrText,
  type ParseLeaderboardResult,
} from "../lib/ocrMatchImport";
import { recognizeMatchScreenshot } from "../lib/matchScreenshotOcr";
import type { Match } from "../types/tournament";

export function MatchScreenshotImport({ match }: { match: Match }) {
  const { tournament, dispatch } = useTournament();
  const fileId = useId();
  const [paste, setPaste] = useState("");
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParseLeaderboardResult | null>(null);
  const [busy, setBusy] = useState<"ocr" | "parse" | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runParse = useCallback(
    (text: string) => {
      setBusy("parse");
      setError(null);
      try {
        const next = parseLeaderboardFromOcrText(text, tournament.teams);
        setParsed(next);
        setRawText(text);
        if (next.matched.length === 0 && next.newTeams.length === 0) {
          setError(
            "No scoreboard rows matched. Add teams or use names that appear in the image / paste.",
          );
        }
      } finally {
        setBusy(null);
      }
    },
    [tournament.teams],
  );

  const onPickFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/")) {
        setError("Choose an image file (PNG, JPG, or WebP).");
        return;
      }
      setError(null);
      setParsed(null);
      setOcrProgress(0);
      setBusy("ocr");
      try {
        const text = await recognizeMatchScreenshot(file, (p) => setOcrProgress(p));
        setOcrProgress(1);
        runParse(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "OCR failed.");
        setParsed(null);
      } finally {
        setBusy(null);
        setOcrProgress(null);
      }
    },
    [runParse],
  );

  const onApply = useCallback(() => {
    if (!parsed) return;
    if (parsed.matched.length === 0 && parsed.newTeams.length === 0) return;

    dispatch({
      type: "importOcrMatchSnapshot",
      matchId: match.id,
      rows: buildOcrImportRows(parsed),
    });
  }, [dispatch, match.id, parsed, tournament.teams]);

  return (
    <div className="rounded-xl border border-line bg-canvas-overlay p-4 shadow-panel">
      <h3 className="text-sm font-semibold text-slate-100">Import from screenshot</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Optimized for the in-game <span className="text-slate-400">Statistics → Match results</span>{" "}
        screen: four players per squad, each line like{" "}
        <span className="font-mono text-slate-500">IGN — 5 уничтожений</span> (English “kills”
        works too). OCR uses English + Russian. If that layout is not detected, a simpler
        one-line-per-team mode is used. New squads from the board are still created when names do
        not match your roster.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input id={fileId} type="file" accept="image/*" className="sr-only" onChange={onPickFile} />
        <label
          htmlFor={fileId}
          className={`cursor-pointer rounded-md border border-accent/35 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent-glow hover:bg-accent/15 ${
            busy ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {busy === "ocr" ? "Reading image…" : "Upload image"}
        </label>
        {ocrProgress !== null && (
          <span className="text-xs tabular-nums text-slate-400">
            {Math.round(ocrProgress * 100)}%
          </span>
        )}
        <button
          type="button"
          disabled={busy !== null || !paste.trim()}
          className="rounded-md border border-line bg-canvas-raised px-3 py-1.5 text-sm text-slate-200 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => runParse(paste)}
        >
          Parse pasted text
        </button>
      </div>

      <textarea
        className="mt-2 w-full min-h-[72px] resize-y rounded-md border border-line bg-canvas px-2 py-1.5 font-mono text-xs text-slate-200 placeholder:text-slate-600"
        placeholder="Optional: paste text copied from a scoreboard (skip OCR)."
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        spellCheck={false}
      />

      {error && (
        <p className="mt-2 text-xs text-warn" role="alert">
          {error}
        </p>
      )}

      {parsed && (parsed.matched.length > 0 || parsed.newTeams.length > 0) && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-slate-400">
            Preview — {parsed.matched.length} roster match{parsed.matched.length === 1 ? "" : "es"}
            {parsed.newTeams.length > 0 ? (
              <>
                {" "}
                · {parsed.newTeams.length} new squad{parsed.newTeams.length === 1 ? "" : "s"} (will
                be created)
              </>
            ) : null}{" "}
            · active match: {match.label}
          </p>
          <div className="max-h-48 overflow-auto rounded-md border border-line bg-canvas text-xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-canvas-raised/80 text-slate-500">
                  <th className="px-2 py-1 font-medium">Team</th>
                  <th className="w-14 px-2 py-1 font-medium">Place</th>
                  <th className="w-14 px-2 py-1 font-medium">Elims</th>
                </tr>
              </thead>
              <tbody>
                {parsed.matched.map((r) => (
                  <tr key={r.teamId} className="border-b border-line/60">
                    <td className="px-2 py-1 text-slate-200">{r.teamName}</td>
                    <td className="px-2 py-1 font-mono tabular-nums text-slate-300">{r.placement}</td>
                    <td className="px-2 py-1 font-mono tabular-nums text-slate-300">{r.kills}</td>
                  </tr>
                ))}
                {parsed.newTeams.map((r, i) => (
                  <tr key={`new-${i}-${r.inferredName}`} className="border-b border-line/60 bg-accent/5">
                    <td className="px-2 py-1 text-accent-glow">
                      {r.inferredName}
                      <span className="ml-1.5 text-[10px] font-normal uppercase tracking-wide text-slate-500">
                        new
                      </span>
                    </td>
                    <td className="px-2 py-1 font-mono tabular-nums text-slate-300">{r.placement}</td>
                    <td className="px-2 py-1 font-mono tabular-nums text-slate-300">{r.kills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.unmatchedLines.length > 0 && (
            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer text-slate-400">
                {parsed.unmatchedLines.length} line
                {parsed.unmatchedLines.length === 1 ? "" : "s"} not matched
              </summary>
              <ul className="mt-1 max-h-28 list-inside list-disc space-y-0.5 overflow-auto pl-1">
                {parsed.unmatchedLines.slice(0, 12).map((u, i) => (
                  <li key={i}>
                    <span className="text-slate-500">{u.reason}: </span>
                    <span className="font-mono text-slate-600">{u.sourceLine.slice(0, 80)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <button
            type="button"
            onClick={onApply}
            disabled={busy !== null}
            className="rounded-md border border-accent/40 bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent-glow hover:bg-accent/25 disabled:opacity-40"
          >
            Apply to this match
          </button>
        </div>
      )}

      {parsed && parsed.matched.length === 0 && parsed.newTeams.length === 0 && rawText && !error && (
        <p className="mt-2 text-xs text-slate-500">Parsed text but found no scoreboard rows.</p>
      )}
    </div>
  );
}
