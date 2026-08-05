export type Energy = "basse" | "moyenne" | "haute";
export type Place = "dedans" | "dehors" | "peu-importe";
export type Budget = "0" | "20" | "50" | "80+";
export type Duration = "30" | "60" | "120" | "soirée";
export type Vibe = "potes" | "groupe" | "date" | "peu-importe";

export type Plan = {
  id: string;
  title: string;
  blurb: string;
  steps: string[];
  durationMin: number;
  budgetMax: number;
  energy: Energy;
  place: "dedans" | "dehors";
  category: string;
  /** Ambiances où cette idée a du sens. */
  vibes: Exclude<Vibe, "peu-importe">[];
};

export const PLANS: Plan[] = [
  {
    id: "p1",
    title: "Pique-nique improvisé au parc",
    blurb: "Sortir du canapé sans réserver. Panier, couverture, 90 minutes dehors.",
    steps: [
      "Choisir le parc le plus proche (10 min max)",
      "Acheter 2–3 trucs sympas en chemin",
      "Téléphones en mode avion pendant le repas",
    ],
    durationMin: 90,
    budgetMax: 25,
    energy: "moyenne",
    place: "dehors",
    category: "sortie légère",
    vibes: ["potes", "groupe", "date"],
  },
  {
    id: "p2",
    title: "Soirée cuisine à l’aveugle",
    blurb: "Chacun achète un ingrédient surprise. Vous cuisinez avec ce que vous avez.",
    steps: [
      "Chacun sort 15 min pour 1 ingrédient mystère",
      "Timer 45 min pour inventer le plat",
      "Noter le plat : à refaire / jamais",
    ],
    durationMin: 90,
    budgetMax: 20,
    energy: "moyenne",
    place: "dedans",
    category: "maison",
    vibes: ["potes", "groupe", "date"],
  },
  {
    id: "p3",
    title: "Marche photo à deux",
    blurb: "Un quartier, 20 photos chacune·e, puis vote du top 3.",
    steps: [
      "Choisir un quartier peu fréquenté",
      "Marcher 40 min en silence photo",
      "Comparer et élire 3 favoris",
    ],
    durationMin: 60,
    budgetMax: 0,
    energy: "moyenne",
    place: "dehors",
    category: "créatif",
    vibes: ["date", "potes"],
  },
  {
    id: "p4",
    title: "Café + jeu de cartes",
    blurb: "Le lieu du coin, 1 partie, zéro scroll. Simple et efficace.",
    steps: [
      "Choisir un café à moins de 15 min",
      "Commander, poser les téléphones",
      "Jouer 2 manches minimum",
    ],
    durationMin: 60,
    budgetMax: 20,
    energy: "basse",
    place: "dehors",
    category: "sortie légère",
    vibes: ["potes", "date"],
  },
  {
    id: "p5",
    title: "Salon cinéma thème",
    blurb: "Pas Netflix au hasard : un thème, un snack, une règle anti-téléphone.",
    steps: [
      "Tirer un thème (années 90, voyage, comédie)",
      "Préparer un snack en 10 min",
      "Film + 5 min de débrief à la fin",
    ],
    durationMin: 120,
    budgetMax: 10,
    energy: "basse",
    place: "dedans",
    category: "maison",
    vibes: ["potes", "groupe", "date"],
  },
  {
    id: "p6",
    title: "Challenge 3 restos street",
    blurb: "Goûter 3 stands / food trucks, 1 portion chacun, comparer.",
    steps: [
      "Lister 3 spots à moins de 2 km",
      "Budget max 8 € par stop",
      "Élire le gagnant en rentrant",
    ],
    durationMin: 90,
    budgetMax: 30,
    energy: "haute",
    place: "dehors",
    category: "food",
    vibes: ["potes", "groupe"],
  },
  {
    id: "p7",
    title: "Atelier cocktail maison",
    blurb: "2 recettes, 1 mocktail, dégustation à l’aveugle.",
    steps: [
      "Choisir 2 recettes simples",
      "Préparer sans goûter (à l’aveugle)",
      "Noter et garder la favorite",
    ],
    durationMin: 60,
    budgetMax: 25,
    energy: "basse",
    place: "dedans",
    category: "maison",
    vibes: ["potes", "groupe", "date"],
  },
  {
    id: "p8",
    title: "Sunset + glace",
    blurb: "Le plan anti-“on verra” : point de vue + glace, rentrer avant 21 h.",
    steps: [
      "Checker l’heure du coucher de soleil",
      "Acheter 2 glaces en route",
      "10 min sans parler, juste regarder",
    ],
    durationMin: 60,
    budgetMax: 15,
    energy: "basse",
    place: "dehors",
    category: "sortie légère",
    vibes: ["date"],
  },
  {
    id: "p9",
    title: "Escape room DIY",
    blurb: "Cachez 5 indices dans l’appart. L’autre a 30 min pour résoudre.",
    steps: [
      "Un partenaire prépare 5 indices (15 min)",
      "L’autre résout en 30 min chrono",
      "Inverser les rôles une autre fois",
    ],
    durationMin: 60,
    budgetMax: 0,
    energy: "haute",
    place: "dedans",
    category: "jeu",
    vibes: ["potes", "groupe", "date"],
  },
  {
    id: "p10",
    title: "Concert / open mic surprise",
    blurb: "Choisir un lieu live ce soir, sans lire les avis 20 minutes.",
    steps: [
      "Ouvrir un agenda culturel local",
      "Prendre le premier créneau possible",
      "Y aller, même 45 minutes seulement",
    ],
    durationMin: 120,
    budgetMax: 40,
    energy: "haute",
    place: "dehors",
    category: "culture",
    vibes: ["potes", "groupe", "date"],
  },
  {
    id: "p11",
    title: "Massage + playlist 20 min",
    blurb: "Énergie basse, connexion haute. Timer, huile, silence.",
    steps: [
      "Chacun prépare 1 playlist courte",
      "10 min massage chacun",
      "Thé / eau + 5 min de calme",
    ],
    durationMin: 30,
    budgetMax: 0,
    energy: "basse",
    place: "dedans",
    category: "connexion",
    vibes: ["date"],
  },
  {
    id: "p12",
    title: "Balade marché + plat du soir",
    blurb: "Acheter uniquement ce qui inspire, cuisiner ensemble après.",
    steps: [
      "Aller au marché / épicerie fine",
      "Budget fixe : 25 € max",
      "Cuisiner le butin à deux",
    ],
    durationMin: 120,
    budgetMax: 40,
    energy: "moyenne",
    place: "dehors",
    category: "food",
    vibes: ["date", "potes"],
  },
  {
    id: "p13",
    title: "Tournoi mini-jeux salon",
    blurb: "3 manches, un tableau de scores, un vainqueur. Fonctionne dès 3.",
    steps: [
      "Choisir 3 jeux courts (cartes, téléphone, défi)",
      "Chacun marque les points sur une feuille",
      "Couronne improvisée pour le gagnant",
    ],
    durationMin: 90,
    budgetMax: 0,
    energy: "haute",
    place: "dedans",
    category: "jeu",
    vibes: ["groupe", "potes"],
  },
  {
    id: "p14",
    title: "Apéro thématique collab",
    blurb: "Chacun amène un truc sur un thème (année, pays, couleur).",
    steps: [
      "Tirer un thème en 10 secondes",
      "Chacun prépare / achète 1 apport",
      "Déguster et voter le meilleur apport",
    ],
    durationMin: 120,
    budgetMax: 25,
    energy: "moyenne",
    place: "dedans",
    category: "maison",
    vibes: ["groupe", "potes"],
  },
  {
    id: "p15",
    title: "Session board game express",
    blurb: "Un jeu de société, une seule partie, règle anti-téléphone.",
    steps: [
      "Choisir un jeu ≤ 45 min",
      "Expliquer les règles en 5 min max",
      "Finir la partie sans pause téléphone",
    ],
    durationMin: 60,
    budgetMax: 0,
    energy: "moyenne",
    place: "dedans",
    category: "jeu",
    vibes: ["potes", "groupe", "date"],
  },
  {
    id: "p16",
    title: "Tour des bars low-cost",
    blurb: "2 adresses max, 1 conso chacune, comparer l’ambiance.",
    steps: [
      "Lister 2 bars à moins de 20 min",
      "Budget fixe par personne",
      "Élire le gagnant en sortant",
    ],
    durationMin: 120,
    budgetMax: 30,
    energy: "haute",
    place: "dehors",
    category: "sortie légère",
    vibes: ["potes", "groupe"],
  },
  {
    id: "p17",
    title: "Brunch maison en rôles",
    blurb: "Chacun a une station : œufs, pain, fruits, vaisselle.",
    steps: [
      "Répartir 4 rôles",
      "Timer 40 min de prep",
      "Manger sans téléphone 30 min",
    ],
    durationMin: 90,
    budgetMax: 25,
    energy: "moyenne",
    place: "dedans",
    category: "food",
    vibes: ["groupe", "potes", "date"],
  },
  {
    id: "p18",
    title: "Course à pied (ou marche) duo",
    blurb: "3 km max, rythme de celui qui est le plus lent.",
    steps: [
      "Choisir un parcours simple",
      "Pas de musique partagée, chacun son rythme",
      "Étirements 5 min à la fin",
    ],
    durationMin: 45,
    budgetMax: 0,
    energy: "haute",
    place: "dehors",
    category: "sport",
    vibes: ["potes", "date"],
  },
  {
    id: "p19",
    title: "Karaoké salon ridicule",
    blurb: "YouTube + micro téléphone, notes honnêtes sur 5.",
    steps: [
      "Chacun choisit 1 chanson",
      "Performance obligatoire (même 30 s)",
      "Vote du pire / meilleur",
    ],
    durationMin: 60,
    budgetMax: 0,
    energy: "haute",
    place: "dedans",
    category: "maison",
    vibes: ["potes", "groupe"],
  },
  {
    id: "p20",
    title: "Exposition / galerie flash",
    blurb: "45 min max, 3 œuvres favorites, débat en sortant.",
    steps: [
      "Trouver une expo gratuite ou ≤ 10 €",
      "Chacun note 3 coups de cœur",
      "Comparer dehors 10 min",
    ],
    durationMin: 90,
    budgetMax: 20,
    energy: "basse",
    place: "dehors",
    category: "culture",
    vibes: ["date", "potes"],
  },
  {
    id: "p21",
    title: "Soirée puzzles / Lego",
    blurb: "Un seul projet, musique basse, zéro scroll.",
    steps: [
      "Sortir puzzle ou Lego",
      "Timer 60–90 min",
      "Photo du résultat (même incomplet)",
    ],
    durationMin: 90,
    budgetMax: 0,
    energy: "basse",
    place: "dedans",
    category: "maison",
    vibes: ["date", "potes", "groupe"],
  },
  {
    id: "p22",
    title: "Food court challenge",
    blurb: "Chacun commande un truc différent, partage en 4 bouchées.",
    steps: [
      "Choisir un food court / zone food",
      "1 commande par personne, budget max fixe",
      "Goûter et classer",
    ],
    durationMin: 75,
    budgetMax: 25,
    energy: "moyenne",
    place: "dehors",
    category: "food",
    vibes: ["potes", "groupe"],
  },
  {
    id: "p23",
    title: "Lecture à voix haute 20 min",
    blurb: "Un chapitre chacun, thé, canapé. Étonnamment efficace.",
    steps: [
      "Choisir un livre ou un PDF court",
      "20 min chrono, tours de parole",
      "1 phrase de réaction chacun",
    ],
    durationMin: 30,
    budgetMax: 0,
    energy: "basse",
    place: "dedans",
    category: "connexion",
    vibes: ["date"],
  },
  {
    id: "p24",
    title: "Escape outdoor DIY",
    blurb: "5 indices cachés dans un parc, 40 min pour tout retrouver.",
    steps: [
      "Un·e prépare 5 indices (15 min d’avance)",
      "L’équipe cherche avec un timer",
      "Photo de groupe à la fin",
    ],
    durationMin: 60,
    budgetMax: 0,
    energy: "haute",
    place: "dehors",
    category: "jeu",
    vibes: ["groupe", "potes"],
  },
];

export type Constraints = {
  duration: Duration;
  budget: Budget;
  energy: Energy;
  place: Place;
  vibe: Vibe;
};

export function durationToMin(d: Duration): number {
  switch (d) {
    case "30":
      return 30;
    case "60":
      return 60;
    case "120":
      return 120;
    case "soirée":
      return 180;
  }
}

export function budgetToMax(b: Budget): number {
  switch (b) {
    case "0":
      return 0;
    case "20":
      return 20;
    case "50":
      return 50;
    case "80+":
      return 999;
  }
}

function matchesCore(
  p: Plan,
  c: Constraints,
  opts: { looseDuration?: boolean; looseBudget?: boolean; looseEnergy?: boolean },
): boolean {
  const maxMin = durationToMin(c.duration);
  const maxBudget = budgetToMax(c.budget);
  const energyRank = { basse: 1, moyenne: 2, haute: 3 };
  const durationSlack = opts.looseDuration ? 60 : 30;
  const energySlack = opts.looseEnergy ? 2 : 1;
  const budget = opts.looseBudget ? 999 : maxBudget;

  if (p.durationMin > maxMin + durationSlack) return false;
  if (p.budgetMax > budget) return false;
  if (energyRank[p.energy] > energyRank[c.energy] + energySlack) return false;
  if (c.place !== "peu-importe" && p.place !== c.place) return false;
  return true;
}

function matchesVibe(p: Plan, vibe: Vibe): boolean {
  if (!vibe || vibe === "peu-importe") return true;
  return p.vibes.includes(vibe);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Filtre progressif : ambiance d’abord, puis on assouplit le cadre si besoin. */
export function filterPlans(c: Constraints): Plan[] {
  const stages = [
    { looseDuration: false, looseBudget: false, looseEnergy: false },
    { looseDuration: true, looseBudget: false, looseEnergy: false },
    { looseDuration: true, looseBudget: true, looseEnergy: false },
    { looseDuration: true, looseBudget: true, looseEnergy: true },
  ];

  for (const stage of stages) {
    const withVibe = PLANS.filter(
      (p) => matchesVibe(p, c.vibe) && matchesCore(p, c, stage),
    );
    if (withVibe.length >= 3) return withVibe;
  }

  // Dernier recours : garder l’ambiance, ignorer le reste du cadre
  const vibeOnly = PLANS.filter((p) => matchesVibe(p, c.vibe));
  if (vibeOnly.length) return vibeOnly;

  return [...PLANS];
}

/** Nombre d’idées qui collent exactement au cadre affiché (filtres stricts). */
export function countMatchingPlans(c: Constraints): number {
  return PLANS.filter(
    (p) =>
      matchesVibe(p, c.vibe) &&
      matchesCore(p, c, {
        looseDuration: false,
        looseBudget: false,
        looseEnergy: false,
      }),
  ).length;
}

/** Deck prêt à voter : filtré, mélangé, max 6. */
export function buildDeck(constraints: Constraints): Plan[] {
  return shuffle(filterPlans(constraints)).slice(0, 6);
}

export function vibeLabel(v: Vibe): string {
  switch (v) {
    case "potes":
      return "entre potes";
    case "groupe":
      return "en groupe";
    case "date":
      return "en date";
    default:
      return "toutes ambiances";
  }
}

const VALID_VIBES: Vibe[] = ["potes", "groupe", "date", "peu-importe"];
const VALID_DURATIONS: Duration[] = ["30", "60", "120", "soirée"];
const VALID_BUDGETS: Budget[] = ["0", "20", "50", "80+"];
const VALID_ENERGIES: Energy[] = ["basse", "moyenne", "haute"];
const VALID_PLACES: Place[] = ["dedans", "dehors", "peu-importe"];

/** Sécurise le payload API / sessionStorage. */
export function normalizeConstraints(
  raw: Partial<Constraints> | null | undefined,
): Constraints {
  return {
    duration: VALID_DURATIONS.includes(raw?.duration as Duration)
      ? (raw!.duration as Duration)
      : "60",
    budget: VALID_BUDGETS.includes(raw?.budget as Budget)
      ? (raw!.budget as Budget)
      : "20",
    energy: VALID_ENERGIES.includes(raw?.energy as Energy)
      ? (raw!.energy as Energy)
      : "moyenne",
    place: VALID_PLACES.includes(raw?.place as Place)
      ? (raw!.place as Place)
      : "peu-importe",
    vibe: VALID_VIBES.includes(raw?.vibe as Vibe)
      ? (raw!.vibe as Vibe)
      : "potes",
  };
}
