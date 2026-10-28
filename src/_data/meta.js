function goatcounterUrl(value) {
	if (!value) return "";
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new Error(`SPEEDLIFY_GOATCOUNTER_URL n’est pas une URL valide : ${JSON.stringify(value)}`);
	}
	if (url.protocol !== "https:") {
		throw new Error(`SPEEDLIFY_GOATCOUNTER_URL doit être une URL en https:// : ${JSON.stringify(value)}`);
	}
return url.href;
}

export default {
	title: "speedlify2",
	tagline: "Performances web mesurées au fil du temps",
	description:
		"Métriques Lighthouse, données Axe et données de terrain du Chrome UX Report pour une liste de sites, enregistrées et comparées au fil du temps.",
	// Indiquez l’origine de votre déploiement pour générer des URL absolues dans les métadonnées.
	// Adresse de publication de cette instance. Elle sert dans les extraits de code à copier-coller,
	// intégrés sur d’autres sites : une URL absolue est donc nécessaire, car un simple chemin
	// serait résolu par rapport à leur domaine. Ne mettez pas de barre oblique finale : les modèles
	// en ajoutent une, et deux barres produiraient //js/speedlify2-score.js.
	url: process.env.SPEEDLIFY_SITE_URL || "https://github.com/Coda-Dijon/speedlify-dijon-b1-2026",
	base_href: process.env.SPEEDLIFY_BASE_HREF || "/",
	// Emplacement du code source, indiqué par un lien dans le pied de page. Une valeur par défaut
	// est préférable à une chaîne vide : sinon, le lien disparaît sans avertissement — comme celui
	// de l’en-tête, dont l’absence est passée inaperçue pendant si longtemps. Remplacez cette valeur
	// si vous exécutez votre propre instance.
	repo: process.env.SPEEDLIFY_REPO_URL || "https://github.com/zachleat/speedlify2",

	// Point de terminaison GoatCounter, par exemple https://vous.goatcounter.com/count.
	// Le suivi est désactivé tant que cette valeur n’est pas définie : les statistiques
	// appartiennent à un déploiement donné, pas au modèle.
	goatcounter: goatcounterUrl(process.env.SPEEDLIFY_GOATCOUNTER_URL),

	// Service de favicons pour la liste des sites. `{url}` est remplacé par l’URL du site
	// encodée. Définissez cette valeur sur "" pour une compilation qui n’effectue aucune requête
	// externe — ce qui est sans doute le choix par défaut le plus judicieux pour un outil qui
	// mesure précisément le poids des ressources tierces.
	avatarService: "https://v1.indieweb-avatar.11ty.dev/{url}/",

	// Service de captures d’écran pour les pages individuelles des sites. Même substitution,
	// même option : "" désactive le service. `medium` correspond à une largeur de 650 px, avec
	// le ratio 1:1 par défaut du service. Les tailles disponibles sont small (375), medium (650),
	// large (1024) et opengraph (1200x630).
	//
	// Une requête par page de site, et non par ligne : c’est pourquoi le service est utilisé
	// sur les pages de détail plutôt que sur le classement. Une page de catégorie peut contenir
	// mille lignes ; générer mille captures d’écran ne relève plus d’une simple page, mais d’une
	// attaque par déni de service contre le serveur d’autrui.
	screenshotService: "https://v1.screenshot.11ty.dev/{url}/medium/",
};