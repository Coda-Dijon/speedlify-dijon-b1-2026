/**
 * Company headcount, for the "Employees vs LCP" chart on /charts/.
 *
 * Hand-maintained on purpose. Wikidata was the obvious automated source and it
 * does not hold up: it covers 22 of the 26 Big Tech sites but only 2 of the 20
 * hosts and 2 of the 9 builders, and what it does hold is old — Uber at 12,000
 * from 2017, IBM at 352,600 from 2019. `npm run check:companies` re-queries it
 * and prints the disagreements rather than overwriting anything here.
 *
 * Crunchbase and OpenCorporates were the other candidates. OpenCorporates is
 * registry data and carries no headcount at all; Crunchbase has it but its
 * terms do not allow republishing it on a public site.
 *
 * `employees: null` means no credible public figure was found. Those sites are
 * still measured and still ranked everywhere else on this site; they are only
 * absent from this one chart, which is the honest outcome rather than a guess
 * dressed up as a data point.
 *
 * Subsidiary sites are filed under the parent that owns them, so Azure Static
 * Web Apps carries Microsoft's headcount. The chart is about the resources
 * behind a page, and those are the parent's.
 *
 * `urls[0]` is the canonical site — the company's flagship rather than a product
 * subdomain — and it is the one the chart plots. The rest are listed so that a
 * subsidiary property still resolves to the right headcount everywhere else, and
 * so the chart can fall back to one if the flagship has no measurement. Order
 * matters here; a test asserts it.
 */

/** @typedef {{ name: string, employees: number|null, asOf: string|null, source: string, wikidata?: string, urls: string[] }} Company */

/** @type {Company[]} */
export default [
];
