module.exports = {
	name: "template",
	description: "Modèle point de départ des projets",
    options: {
        runs: 1, // Run sample every time
        frequency: 60 * 24, // Every 1 day
        freshChrome: "site" // Use "site" if sites are all on the same origin and share assets.
    },
	urls: [
		"https://coda-school.github.io/template-projet-html-groupe/"
	]
};
