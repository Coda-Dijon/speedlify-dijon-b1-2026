/**
 * The starting configuration for a new instance.
 *
 * `npm run reset` copies this over `config/sites.js`, which is the file the
 * measurement and report steps actually read. Edit that one; this stays as the
 * thing to fall back to.
 *
 * Everything below is the smallest configuration that runs. The upstream
 * project's own config carries several hundred more lines — imported community
 * lists, pinned URLs, archived sites, per-category politeness — none of which
 * mean anything outside that instance. Add what you need as you need it; the
 * defaults here are chosen so that measuring three sites works on the first
 * `npm run measure` without touching anything else.
 */

export default {
    // Lighthouse runs per URL per measurement. The median run is kept. 3 trades
    // wall-clock time for a number that is not one noisy sample.
    runs: 3,

    // "filmstrip" keeps Lighthouse's loading frames for each site; "none" keeps
    // only the two screenshots the axe pass takes. Frames are committed, so a
    // large site list is a reason to turn them off per category.
    screenshots: "filmstrip",

    // "mobile" matches what Lighthouse scores by default and what the published
    // numbers mean. `--desktop` overrides it for a single run.
    formFactor: "mobile",

    // How long a measurement counts as current, and how long before a site is
    // reported as stale. Both are overridable per category and per site.
    freshnessHours: 24,
    staleAfterHours: 48,

    // Sites per `npm run measure`. The stalest are chosen first.
    batchSize: 20,

    // Measurements kept per site before the oldest are pruned by `npm run clean`.
    historyLimit: 120,

    // A site whose last attempt errored waits this long before being tried
    // again, and that wait doubles with each consecutive failure when
    // `failureBackoff` is on: 1h, 2, 4, 8, 16, capped at 24.
    retryErrorsAfterHours: 6,
    failureBackoff: true,

    // How many consecutive measurements must agree on a redirect before it is
    // treated as a move rather than a blip.
    redirectConfirmations: 3,

    groups: {
        "html-b1-2026-template": {
            showHealth: true,
            showEmbed: true,
            compareEligible: false,

            excludeFromPerfectScores: true,
            name: "html-b1-2026-template",
            enabled: true,
            description: "Projet template de page HTML hébergée sur Github Pages",
            sites: [
                {url: "https://coda-dijon.github.io/html-b1-2026-template/index.html"},
                {url: "https://coda-dijon.github.io/html-b1-2026-template/"}, // Readme
                {url: "https://coda-dijon.github.io/html-b1-2026-template/docs/Github-Pages"},
                {url: "https://coda-dijon.github.io/html-b1-2026-template/docs/Serveur-http"},
            ],
        },
        "html-b1-2026-g1": {
            name: "html-b1-2026-g1",
            enabled: true,
            description: "Groupe 1 : Projet HTML CSS des B1 Coda Dijon 2026",
            sites: [
                {url: "https://coda-dijon.github.io/html-b1-2026-g1/index.html"},
            ],
        },
        "html-b1-2026-g2": {
            name: "html-b1-2026-g2",
            enabled: true,
            description: "Groupe 2 : Projet HTML CSS des B1 Coda Dijon 2026",
            sites: [
                {url: "https://coda-dijon.github.io/html-b1-2026-g2/index.html"},
            ],
        },
        "html-b1-2026-g3": {
            name: "html-b1-2026-g3",
            enabled: true,
            description: "Groupe 3 : Projet HTML CSS des B1 Coda Dijon 2026",
            sites: [
                {url: "https://coda-dijon.github.io/html-b1-2026-g3/index.html"},
            ],
        },
        "html-b1-2026-g4": {
            name: "html-b1-2026-g4",
            enabled: true,
            description: "Groupe 4 : Projet HTML CSS des B1 Coda Dijon 2026",
            sites: [
                {url: "https://coda-dijon.github.io/html-b1-2026-g4/index.html"},
            ],
        },
        "html-b1-2026-g5": {
            name: "html-b1-2026-g5",
            enabled: true,
            description: "Groupe 5 : Projet HTML CSS des B1 Coda Dijon 2026",
            sites: [
                {url: "https://coda-dijon.github.io/html-b1-2026-g5/index.html"},
            ],
        },
        "html-b1-2026-g6": {
            name: "html-b1-2026-g6",
            enabled: true,
            description: "Groupe 6 : Projet HTML CSS des B1 Coda Dijon 2026",
            sites: [
                {url: "https://coda-dijon.github.io/html-b1-2026-g6/index.html"},
            ],
        },
        "html-b1-2026-g7": {
            name: "html-b1-2026-g7",
            enabled: true,
            description: "Groupe 7 : Projet HTML CSS des B1 Coda Dijon 2026",
            sites: [
                {url: "https://coda-dijon.github.io/html-b1-2026-g7/index.html"},
            ],
        },
        "autres-sites-coda-dijon": {
            name: "autres-sites-coda-dijon",
            enabled: true,
            description: "Quelques autres sites de Coda Dijon analysés",
            sites: [
                {url: "https://coda-dijon.github.io/crack-me/"},
                {url: "https://coda-dijon.github.io/developper-avec-conscience/"},
            ],
        },

    },
};
