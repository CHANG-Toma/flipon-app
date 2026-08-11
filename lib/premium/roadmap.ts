/**
 * Feuille de route Premium à partir d’un Plan (roadmap IA ou steps).
 */
import type { Plan, PlanRoadmapStep } from '@/data/plans';

const PHASE_ORDER = ['Avant', 'Sur place', 'Après'] as const;

export function buildResultRoadmap(plan: Plan): PlanRoadmapStep[] {
  if (plan.roadmap && plan.roadmap.length >= 2) {
    return [...plan.roadmap].sort((a, b) => {
      const ia = PHASE_ORDER.indexOf(a.phase as (typeof PHASE_ORDER)[number]);
      const ib = PHASE_ORDER.indexOf(b.phase as (typeof PHASE_ORDER)[number]);
      const sa = ia === -1 ? 99 : ia;
      const sb = ib === -1 ? 99 : ib;
      return sa - sb;
    });
  }

  const steps = plan.steps?.filter(Boolean) ?? [];
  if (steps.length === 0) return [];

  const phases: Array<(typeof PHASE_ORDER)[number]> = [
    'Avant',
    'Sur place',
    'Sur place',
    'Après',
  ];
  const slice = Math.max(5, Math.round(plan.durationMin / Math.max(steps.length, 1)));

  return steps.map((s, i) => ({
    phase: phases[Math.min(i, phases.length - 1)]!,
    title: s.length > 56 ? `${s.slice(0, 53)}…` : s,
    detail: s,
    minutes: slice,
  }));
}

export function groupRoadmapByPhase(steps: PlanRoadmapStep[]) {
  const groups: { phase: string; items: PlanRoadmapStep[] }[] = [];
  for (const step of steps) {
    const last = groups[groups.length - 1];
    if (last && last.phase === step.phase) {
      last.items.push(step);
    } else {
      groups.push({ phase: step.phase, items: [step] });
    }
  }
  return groups;
}
