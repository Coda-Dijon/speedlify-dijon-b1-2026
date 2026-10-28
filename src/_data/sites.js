import fs from "node:fs";
import path from "node:path";

const REPORT_FILE = process.env.SPEEDLIFY_REPORT_FILE || "report.json";

/**
 * Source de référence unique de la compilation : le rapport généré.
 *
 * Toute l’analyse — tendances, classements, comparaisons, couverture — est
 * effectuée par `speedlify report`, et non ici. Ce fichier ne fait que charger
 * le résultat. Ainsi, la compilation Eleventy lit un seul fichier, n’ouvre
 * aucune mesure et ne peut rien modifier comme effet secondaire. `npm run build`
 * exécute d’abord l’étape de génération du rapport.
 */
export default function () {
	const file = path.resolve(REPORT_FILE);

	if (!fs.existsSync(file)) {
		throw new Error(
			`Aucun rapport trouvé à l’emplacement ${REPORT_FILE}.\n\n` +
				`  Le site est compilé à partir d’un rapport généré, et non directement\n` +
				`  à partir des mesures. Générez-le avec :\n\n` +
				`      npx speedlify report\n\n` +
				`  ou exécutez \`npm run build\`, qui effectue les deux étapes.\n`
);
}

let report;
try {
	report = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (err) {
	throw new Error(`Impossible d’analyser ${REPORT_FILE} : ${err.message}. Relancez \`npx speedlify report\`.`);
}

// Un rapport généré par une autre version de la projection serait affiché
// avec des champs manquants au lieu de provoquer une erreur. C’est plus
// difficile à diagnostiquer que de signaler le problème ici.
if (report.version !== 1) {
	throw new Error(
		`${REPORT_FILE} a été généré par une version incompatible (version détectée : ${report.version}). ` +
		`Relancez \`npx speedlify report\`.`
	);
}

return report;
}