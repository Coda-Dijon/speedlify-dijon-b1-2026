# speedlify2

Mesurez les performances Web d’une liste de sites et comparez les résultats au fil du temps. Lighthouse pour les données de laboratoire, le Chrome UX Report pour les données de terrain issues d’utilisateurs réels, des journaux JSON en ajout seulement pour conserver l’historique, et un site statique Build Awesome pour afficher les résultats.

- [Voir le site en direct sur `coda-dijon.github.io/speedlify-dijon-b1-2026`](https://coda-dijon.github.io/speedlify-dijon-b1-2026/)
- Le successeur de [`zachleat/speedlify`](https://github.com/zachleat/speedlify).

```bash
npm install
npm run measure     # mesure un lot des sites dont les données sont les plus anciennes
npm run backfill    # initialise environ 25 semaines d’historique CrUX (nécessite CRUX_API_KEY)
npm start           # génère le rapport, puis le construit et le sert sur localhost:8080
```

## Créer votre propre instance

**Utilisez ce modèle**, ne faites pas de fork. Un fork conserve tous les commits de ce dépôt et reste lié à celui-ci ; le bouton de création à partir d’un modèle vous fournit un dépôt avec un seul commit, qui vous appartient. Rien dans ce projet ne peut effacer l’historique d’un fork depuis l’intérieur : cette étape doit donc être effectuée sur GitHub, et non ici.

Ensuite, avant de mesurer quoi que ce soit :

```bash
npm install
npm run reset
```

`npm run reset` vide votre instance. Exécutez-le d’abord : sans cela, `npm run measure` consacrera son premier lot aux sites de la liste ci-dessus plutôt qu’aux vôtres. La commande affiche toutes les opérations prévues et attend que vous saisissiez `reset`. Elle :

- supprime `results/`, qui contient environ 30 Mo de mesures propres à cette instance, ainsi que les journaux d’exécution associés ;
- remplace `config/sites.js` par [`config/sites.example.js`](config/sites.example.js) — trois sites dans une catégorie, suffisamment pour démarrer ;
- supprime les listes de sites importées dans `config/` (environ 1 500 URL issues de la communauté Eleventy, des listes de sites de démarrage et des listes des anciens membres), ainsi que les scripts qui les génèrent ;
- vide la file de priorité et le fichier `report.json` généré.

Le code, les workflows, `src/`, `lib/` et votre historique Git sont conservés. Si vous l’exécutez deux fois, le second lancement vous indiquera qu’il n’y a rien à faire.

```bash
npm run reset -- --dry-run   # affiche le plan sans rien modifier
npm run reset -- --yes       # ignore la confirmation, pour les scripts
```

Deux paramètres sont à définir ensuite. Ils sont tous deux lus depuis l’environnement, avec les valeurs de cette instance comme valeurs de repli — voir [`src/_data/meta.js`](src/_data/meta.js) :

```bash
SPEEDLIFY_SITE_URL=https://example.com   # adresse de publication de votre instance
SPEEDLIFY_REPO_URL=https://github.com/you/your-repo
```

Modifiez ensuite `config/sites.js` : votre propre instance est prête à fonctionner.

```bash
npm run measure
npm start
```

Un choix de conception hérité mérite d’être connu : chaque mesure est volontairement ajoutée au dépôt. Les workflows `measure` et `publish` s’exécutent séparément, sur des clones distincts, et le dépôt est leur seul canal de communication. Votre dépôt prendra de l’ampleur comme celui-ci. [`npm run clean`](#dimensionnement) supprime les anciennes mesures lorsque cela devient nécessaire.

## Fonctionnement

Trois étapes indépendantes. Aucune n’attend les autres, et aucune n’exige qu’une étape précédente soit entièrement terminée.

```
speedlify measure            →  results/      collecter
speedlify report             →  report.json   analyser
npx @awesome.me/buildawesome →  _site/        générer
```

1. **`speedlify measure --limit=N`** mesure les **N sites dont les mesures sont les plus anciennes**, puis s’arrête. Lighthouse est exécuté N fois par URL ; la médiane est conservée et chaque mesure est enregistrée dans un fichier JSON distinct de `results/`. Vous pouvez lancer cette commande aussi souvent que vous le souhaitez, depuis autant de machines que vous le souhaitez : chaque exécution sélectionne indépendamment les sites les plus en retard. La couverture s’améliore ainsi sans coordination, verrou ni file d’attente.
2. **`speedlify report`** lit les mesures et effectue toutes les analyses — tendances, classements, écarts, significativité et couverture — puis écrit un unique fichier `report.json`.
3. **`npx @awesome.me/buildawesome`** génère le site à partir de ce fichier. La commande n’ouvre **aucun** fichier de mesure : la génération dépend uniquement du rapport, fonctionne avec un clone en lecture seule et ne peut pas modifier un cache comme effet secondaire.

`npm run build` exécute les étapes 2 et 3.

Le rapport affiche **toutes les données réussies disponibles, des plus récentes aux plus anciennes**. Les sites sans données, dont les données sont anciennes ou dont les mesures échouent actuellement sont quand même affichés, avec une étiquette, au lieu de bloquer la génération. Rien n’est récupéré lors de l’exécution : le site publié se compose de HTML, de CSS et de SVG intégrés au moment de la génération. Il ne contient aucun JavaScript côté client, pas même pour les graphiques en courbes.

### Le rapport

```bash
speedlify report              # -> report.json
speedlify report --pretty     # indentation pour faciliter la lecture
speedlify report --out=x.json # autre emplacement (ou définir SPEEDLIFY_REPORT_FILE)
```

Le rapport se décrit lui-même : en plus des entrées, il contient les définitions des métriques — libellé, unité et note — utilisées par le site. Il peut donc être exploité sans cette base de code. Il n’est pas publié avec le site : il sert d’entrée à la génération et, lorsque tous les sites sont couverts, il peut atteindre plusieurs dizaines de mégaoctets. Le site publie à la place un petit fichier par site à l’adresse **`/api/site/<slug>.json`**, que le composant d’intégration lit.

Pour récupérer une catégorie entière en une seule requête, l’API propose **`/api/group/<group-slug>.json`**. Elle est générée à partir de la même projection que les fichiers individuels, afin que les valeurs correspondent toujours :

```json
{
  "group": "Build Awesome Starters",
  "slug": "11ty-starters",
  "updated": "2026-09-28T03:57:46.977Z",
  "count": 160,
  "sites": [
    {
      "url": "https://eleventy-excellent.netlify.app/",
      "requestedUrl": "https://eleventy-excellent.netlify.app/",
      "slug": "eleventy--excellent-netlify-app",
      "page": "/site/eleventy--excellent-netlify-app/",
      "measured": true,
      "stale": false,
      "rank": 85,
      "total": 400,
      "lighthouse": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      },
      "axe": 0,
      "cwv": null
    }
  ]
}
```

`rank` est le classement du site parmi tous les sites, comme dans `/api/site/`. La propriété `sites` est triée selon ce classement, les sites non classés étant placés à la fin. Les sites non mesurés sont inclus avec `"measured": false` et des scores `null`. `requestedUrl` est l’URL telle qu’elle apparaît dans la liste source de la catégorie ; elle peut différer de `url` après normalisation ou redirection. `updated` correspond à la mesure la plus récente de la catégorie.

**`/api/groups.json`** répertorie le nom `group` de chaque catégorie, son `slug`, le nombre de sites `count` et le chemin de son API `api`.

`report.json` est généré à partir des données et ignoré par Git. Il pèse environ 24 ko par site avec une fenêtre de 120 points, soit environ 26 Mo pour 1 000 sites. Si vous publiez à cette échelle, envisagez de désactiver le transfert des données brutes (« passthrough »).

Deux éléments ne sont volontairement pas dupliqués : les tendances contiennent un simple tableau `values`, et non un objet par point de mesure — chaque site compte environ 26 tendances, donc la version naïve réécrivait 26 fois son historique. L’historique `history` est limité aux lignes réellement affichées dans le tableau du journal.

### Fraîcheur des données affichées

Les sites étant mesurés selon un calendrier glissant, le rapport est toujours un instantané d’un ensemble de données inégalement actualisé. Chaque tableau comprend une colonne **Updated** indiquant l’ancienneté des chiffres du site. Ils passent en orange lorsque leur ancienneté dépasse `staleAfterHours`, et chaque page de site indique l’âge des données affichées. La page d’accueil résume la couverture : nombre de sites disposant de données, âge médian, nombre de sites dont les données sont anciennes et nombre de sites jamais mesurés.

Les sites sont identifiés par leur **URL**, et non par un nom configuré — `11ty.dev`, `developer.mozilla.org/en-US`. Si supprimer `www.` rendait deux URL suivies identiques à l’affichage, les deux le conservent.

### Deux niveaux de stockage

Une mesure enregistrée contient environ 4 ko de détails imbriqués. Le rapport a besoin de toutes ces données pour exactement **une mesure par site** — la plus récente ayant réussi. Pour créer les graphiques, il lui faut environ deux douzaines de valeurs scalaires par point. Chaque site conserve donc les deux formats suivants :

```
results/<url-hash>/<timestamp>.json    les archives — détails complets, ajout seulement
results/<url-hash>/series.json         la projection — valeurs scalaires à plat, une par ligne
```

Mesures effectuées sur 1 000 sites pendant 365 jours :

| Lecture du rapport     | Temps     | Mémoire vive | Disque   |
|------------------------|-----------|--------------|----------|
| via `series.json`      | **1,3 s** | **152 Mo**   | 136 Mo   |
| via les données brutes | 24,6 s    | 1 053 Mo     | 1 482 Mo |

Le coût de génération dépend du **nombre de sites**, et non de la profondeur de l’historique.

`series.json` est un **cache dérivé** : toutes ses valeurs peuvent être recalculées à partir des archives :

```bash
speedlify reindex
```

Le cache est automatiquement reconstruit s’il est manquant, corrompu ou en retard par rapport aux données brutes. Un dossier `results/` existant ne nécessite donc aucune migration. Les points étant écrits un par ligne, une nouvelle mesure ajoute exactement une ligne aux différences Git.

Le conserver dans le dépôt est le comportement par défaut — cela accélère les générations à partir d’un nouveau clone —, mais le supprimer ne pose aucun problème.

### Mesures glissantes

Il n’y a pas de « balayage complet » à terminer ni à réussir. Une exécution qui mesure 20 sites sur 1 000 est une exécution réussie.

```bash
speedlify measure --limit=20             # les 20 sites les plus en retard, puis arrêt
speedlify measure --limit=40 --shard=2/4 # 40 sites les plus en retard dans un quart distinct
speedlify list --stale                   # afficher les sites qui prennent du retard
```

Ordre de priorité pour sélectionner les lots :

1. **Jamais mesurés** — un site sans aucune donnée est le cas le plus urgent.
2. **Mesure la plus ancienne** — selon l’ancienneté.

Sont ignorés : les sites mesurés depuis moins de `freshnessHours` et ceux qui se trouvent dans leur période d’attente après un échec. Une URL hors service depuis une semaine passe à une nouvelle tentative quotidienne (1 h → 2 h → 4 h → … → 24 h), au lieu d’occuper un emplacement dans chaque lot avant les sites disposant de données réelles.

La sélection ne lit **aucun contenu de fichier** : l’ancienneté est déterminée à partir de l’horodatage dans chaque nom de fichier. Sélectionner un lot parmi 1 000 sites prend environ 0,5 seconde et 1 Mo de mémoire.

`--shard=i/n` répartit la liste de façon déterministe à partir du hachage des URL, afin que plusieurs machines puissent effectuer des mesures en parallèle sans se chevaucher ni se coordonner. La répartition des fragments reste stable même si vous réordonnez la configuration.

### Dimensionnement

Mesuré sur cette machine : **environ 9,8 s par exécution Lighthouse** (médiane : 8,3 s). Avec la valeur par défaut `runs: 3`, cela représente environ 30 s par site.

| Sites | Fréquence      | Configuration             | Chaque site est mesuré tous les… |
|------:|----------------|---------------------------|----------------------------------|
|    50 | chaque heure   | `--limit=20`              | environ 2,5 heures               |
|   200 | toutes les 2 h | `--limit=40`, 2 fragments | environ 5 heures                 |
| 1 000 | toutes les 2 h | `--limit=40`, 4 fragments | environ 12 heures                |

Choisissez la valeur de `--limit` en fonction de la durée souhaitée pour **une exécution**, et non du nombre total de sites de votre liste.

> **N’exécutez pas Lighthouse simultanément dans un même processus.** Il partage un état global : `lighthouse-logger` utilise `marky`, qui enregistre des noms globaux `performance.mark()`. Les exécutions simultanées entrent en conflit et échouent. Le parallélisme doit provenir de processus ou de machines distincts ; c’est le rôle de `--shard`. Même dans ce cas, un parallélisme par quatre sur 12 cœurs réduit mesurablement `benchmarkIndex` d’environ 4 % à cause de la concurrence pour le processeur. C’est précisément ce que l’avertissement sur la dérive de l’environnement est conçu pour détecter.

## Configuration

Les sites se trouvent dans [`config/sites.js`](config/sites.js) :

```js
export default {
    runs: 3,               // exécutions Lighthouse par URL ; la médiane est conservée
    formFactor: "mobile",  // ou "desktop"
    freshnessHours: 20,    // ignorer les URL mesurées plus récemment
    batchSize: null,       // limite --limit par défaut ; null = aucune limite
    staleAfterHours: 48,   // les données plus anciennes sont signalées dans le rapport
    historyLimit: 120,     // mesures par site chargées lors de la génération

    groups: {
        ssg: {
            name: "Static Site Generators",
            showEmbed: true,     // proposer le code d’intégration sur les pages de ces sites
            sites: [{name: "Eleventy", url: "https://www.11ty.dev/"}],
        },
    },
};
```

L’historique est associé à l’URL, et non au nom. Renommer un site ne supprime pas son historique.

`showEmbed` est désactivé par défaut : une page de site ne comporte la section « Embed this score » que si l’une de ses catégories l’active. Le code proposé invite le lecteur à publier un badge actualisé pour ce site. Cela convient à un répertoire auquel les personnes peuvent soumettre leur propre site, mais pas à une liste d’entreprises que personne ici ne représente.

`showHiringStatus` est également désactivé par défaut : un site de cette catégorie dont le code contient `<meta name="hiring-status" content="open">` (ou `"open remote"`) reçoit une étiquette « Open to Work » (ou « Open to Remote Work ») à côté de son nom.

### Lorsqu’un site change d’adresse

Lighthouse suit les redirections. Un site qui change d’adresse continuerait donc autrement à enregistrer ses résultats sous son ancienne URL : les métriques changeraient sans qu’aucune explication ne soit donnée. speedlify compare l’URL demandée et l’URL finale à chaque exécution, puis réagit à leur différence.

Une redirection n’est considérée comme un **changement confirmé** que si les deux conditions suivantes sont réunies :

- **Elle est permanente.** Il s’agit d’une redirection 301 ou 308, ou du passage de `http` à `https` pour la même URL. Une redirection 302, 303 ou 307 vers une autre adresse signifie que le changement est temporaire.
- **Elle est stable.** La même destination est observée lors de `redirectConfirmations` exécutions consécutives réussies (3 par défaut). Cette vérification permet de détecter les tests A/B, les redirections géographiques et les pages de maintenance, qui peuvent sembler permanentes pendant une ou deux exécutions.

Les changements confirmés sont automatiquement enregistrés dans `results/aliases.json`. Modifiez la configuration pour utiliser la nouvelle URL : **l’historique suivra automatiquement**, sans intervention manuelle :

```bash
speedlify redirects     # afficher les redirections et celles qui ont été confirmées
```

La page du site indique alors où le changement d’adresse a eu lieu, et les lignes de l’historique correspondant à l’ancienne adresse sont marquées. Une variation brusque apparaît ainsi comme un changement d’adresse, et non comme une régression.

Les alias sont volontairement stockés dans `results/` plutôt que dans `config/sites.js` : la configuration est écrite et vérifiée manuellement, tandis que les alias sont un état observé, dérivé des mesures. Une redirection temporaire ne peut donc jamais modifier silencieusement quelque chose que vous avez écrit. Pour déclarer manuellement un changement d’adresse — avant qu’il ait été observé, ou pour remplacer la détection — utilisez `previousUrls` :

```js
{
    name: "Nuxt", url
:
    "https://nuxt.new/", previousUrls
:
    ["https://nuxt.com/"]
}
```

Si une URL est à la fois mesurée directement et déclarée comme `previousUrls` pour un autre site, le chargement de la configuration est refusé, car son historique serait comptabilisé deux fois.

Si vous changez une URL sans qu’aucune redirection n’ait été observée, l’ancien historique n’est pas perdu : il apparaît sur la page d’accueil comme « orphelin » au lieu d’être supprimé.

## Apparence

Inspirée des [classements Eleventy](https://www.11ty.dev/speedlify/) : en-tête centré, URL affichée en monospace avec un favicon, rangs `#1` et médailles 🥇🥈🥉 pour le podium, ainsi que des anneaux de score pour les quatre catégories Lighthouse.

**Sombre par défaut, clair sur demande.** Le mode sombre ignore les préférences système. Le pied de page contient le composant [`<solar-eclipse-toggle>`](https://github.com/zachleat/solar-eclipse-toggle). Avec `data-theme-default="dark"` sur `<html>`, il enregistre le choix du thème clair dans `data-theme="light"` sur `<html>` et dans `localStorage`. Revenir au thème sombre supprime cette valeur. Les couleurs utilisent `light-dark()` : c’est `color-scheme` qui choisit la palette.

Un bloc intégré dans `<head>` applique le thème enregistré avant le premier affichage. Sans JavaScript, le bouton reste désactivé et la page reste en mode sombre.

Les anneaux de score sont des SVG intégrés, générés lors de la compilation. Speedlify utilise un composant Web qui intègre le JSON complet des résultats dans chaque ligne, mais un arc se résume à un `stroke-dasharray` : obtenir la même image ne nécessite donc aucun JavaScript.

Les favicons constituent **l’unique requête externe** effectuée par le site généré : ils passent par le même service d’avatars que Speedlify. Définissez `meta.avatarService` sur `""` dans [`src/_data/meta.js`](src/_data/meta.js) pour les supprimer et rendre le résultat entièrement autonome — c’est probablement le choix qui convient à un outil qui mesure le poids des sites tiers.

## Classement

L’algorithme de classement est repris de [performance-leaderboard](https://github.com/zachleat/performance-leaderboard), tel qu’il est décrit dans [Eleventy Leaderboard](https://www.zachleat.com/web/eleventy-leaderboard-speedlify/#the-algorithm-and-tiebreaker-changes) :

1. **Nombre d’anneaux par couleur**, en commençant par la pire. On considère toute la rangée d’anneaux comme des nombres, et non comme un total. Les six anneaux — les quatre catégories Lighthouse, axe et Core Web Vitals — sont classés en vert, ambre, rouge ou gris, puis comptés. Le moins de rouges l’emporte, puis le moins de gris, ensuite le moins d’ambre, et enfin le plus de verts. Un site qui affiche du rouge est moins bien classé qu’un site sans rouge, quels que soient ses autres résultats.
2. **Couleur de l’anneau axe** : vert, puis ambre, gris et rouge. On compare la couleur de l’anneau, pas le nombre de violations : deux sites qui affichent les mêmes six couleurs peuvent différer par l’anneau ambre. Ce critère demande si l’anneau de l’accessibilité est celui qui est ambre. Il arrive juste après le comptage des anneaux et avant toute mesure de vitesse : un site lent vaut mieux qu’un site inaccessible.
3. **Core Web Vitals**, mesurés auprès de vrais utilisateurs : on compare d’abord la gravité des échecs, puis leur nombre. Une valeur juste en dessous du seuil « bon » vaut mieux qu’une valeur mauvaise. Un site que CrUX n’a jamais échantillonné n’est pas évalué à cette étape : il passe au critère suivant, sans bonus ni pénalité liée à l’absence de données.
4. **Somme des quatre catégories Lighthouse** (de 0 à 400), la valeur la plus élevée l’emportant. Ce critère n’intervient que lorsque deux sites ont les mêmes anneaux, la même couleur pour l’anneau d’accessibilité et le même verdict sur les données réelles — les points sont alors le seul élément qui puisse les départager.
5. **Nombre minimal de violations axe**, comptées comme des *nœuds en infraction* : une règle enfreinte sur huit éléments correspond à huit violations. Ce critère affine le résultat de l’étape 2 : à ce stade, une et trente violations ont la même couleur, mais leur nombre permet de trancher. Il départage environ un cinquième du classement. Sans lui, les sites concernés seraient départagés par la vitesse, ce qui placerait un site avec quatre violations devant un site qui n’en a qu’une.
6. **Valeur de départage**, la plus faible l’emportant :

```text
50000 * speedIndex / poids + TTFB + TBT
```

Le Speed Index est rapporté au kilo-octet. À Speed Index égal, un site lourd est plus impressionnant qu’un site presque vide : à poids égal, le Speed Index le plus faible l’emporte. On ajoute TTFB et TBT pour tenir compte de la latence du serveur et du blocage du fil principal.

Le poids utilisé dans ce rapport inclut intégralement le document, le CSS et le JavaScript, mais plafonne les **images à 400 kB** et les **polices à 100 kB**. Ainsi, un site ne peut pas remonter dans le classement simplement en envoyant d’énormes images inutiles.

Les sites qui n’ont aucune mesure réussie sont classés en dernier, plutôt que de recevoir un score nul. L’ordre des lignes *est* le classement : la position d’une ligne et le rang affiché ne peuvent donc jamais diverger.

### Pourquoi les bandes de couleur passent avant les points

Un total traite les catégories comme une monnaie d’échange : on peut sacrifier un résultat pour en améliorer un autre. Ainsi, 100/100/100/80 donne 380 et bat 90/90/90/90, qui donne 360, alors que le premier site affiche un anneau ambre, contre quatre anneaux verts pour le second — une ligne qui semble moins bonne que celle juste en dessous. Le classement par bandes considère qu’un anneau qui n’est plus vert révèle un problème que les points gagnés ailleurs ne peuvent pas compenser.

La même logique place l’anneau axe avant le total. Une violation axe ne coûte aucun point au score Lighthouse — axe est exécuté séparément. Un site pourrait donc cumuler quatre violations avec un score parfait de 400 et dépasser un site dont le seul défaut est un anneau pénalisé dans son total. Dans les données d’exemple, preactjs.com se trouvait exactement six places au-dessus de typescriptlang.org à cause de cet échange. Comparer la couleur de l’anneau avant les points élimine cette incohérence, et le nombre de violations départage ensuite les sites, après le total.

Le gris — absence de données — est comptabilisé dans sa propre catégorie, entre le rouge et l’ambre. Une catégorie Lighthouse sans score et une exécution axe qui n’a jamais eu lieu sont toutes deux non vérifiées ; une mesure non effectuée ne signifie pas que le site est sans défaut et ne doit pas lui permettre de gagner des places. Mais une vérification qui n’a pas eu lieu ne constitue pas non plus un échec constaté : elle coûte donc moins qu’un résultat rouge.

**Core Web Vitals est comptabilisé comme les autres anneaux**, avec une exception : un indicateur qui n’a pas été échantillonné compte comme vert. La plupart des sites de ce corpus n’ont pas assez de trafic pour être échantillonnés par CrUX, et cela renseigne sur leur trafic, pas sur leur qualité. À l’inverse, une mesure axe manquante signifie qu’une vérification n’a pas abouti et coûte des places. Traiter les données CrUX manquantes comme une absence a fait chuter 171 des 179 sites parfaits sous le rang 36, derrière les huit qui disposaient de données terrain. Un indicateur mesuré qui échoue affiche un anneau rouge, comme n’importe quel autre. Il est également réévalué à l’étape suivante, où la gravité de l’échec départage les sites que le comptage des couleurs n’a pas pu distinguer.

### Archiver une URL

`config/archived.json` permet de retirer une URL du classement sans la supprimer. Un site archivé n’est ni mesuré, ni classé, ni lié : il n’a aucune ligne ni page, mais ses mesures enregistrées restent sur le disque et son nom apparaît en texte brut au bas de la page d’accueil.

```json
{
  "urls": [
    "https://example.com/"
  ]
}
```

C’est une solution intermédiaire. Supprimer une URL d’une catégorie fait perdre son historique et laisse un répertoire orphelin ; la laisser en place maintient un site inactif dans les classements et continue à lui envoyer du trafic.

**Les sites sont automatiquement archivés après `archiveAfterFailures` échecs consécutifs** (14 par défaut ; la valeur `0` désactive cette fonction). Ce statut est déduit du nombre d’échecs enregistrés, plutôt que sauvegardé dans `archived.json`, ce qui le rend réversible : une mesure réussie remet le compteur à zéro et le site réintègre le classement sans modification manuelle. Les sites archivés automatiquement continuent d’être mesurés, au rythme quotidien prévu par le mécanisme de nouvelle tentative : un site qui cesse d’être mesuré ne peut jamais cesser d’échouer. Les sites archivés manuellement ne sont pas remesurés.

**N’utilisez pas cette fonction pour les sites qui ont abandonné Eleventy.** Ils continuent d’être mesurés et sont automatiquement reclassés dans 11ty Emeritus grâce à `requireGenerator`. Les archiver ferait perdre les mesures qui montrent ce changement. Archivez plutôt un site dont le domaine a expiré ou est désormais parqué.

Les URL sont inscrites ici plutôt que supprimées d’un fichier de catégorie, car les listes de la communauté et des projets de démarrage sont générées : toute suppression dans ces fichiers disparaîtrait à la prochaine importation. Une seule entrée suffit pour une URL présente dans plusieurs catégories.

### L’accessibilité est évaluée par une véritable exécution d’axe

L’étape 2 s’appuie sur une analyse axe-core autonome, et non sur le score d’accessibilité Lighthouse. Lighthouse n’exécute qu’un sous-ensemble des règles d’axe et intègre les résultats dans un score pondéré ; une page peut obtenir 93 tout en échouant à 13 vérifications axe — c’est précisément le cas de `jekyllrb.com` dans les données d’exemple.

L’analyse se connecte à l’instance de Chrome que `chrome-launcher` a déjà démarrée pour Lighthouse. Elle ajoute donc un chargement de page par site, sans nécessiter de second téléchargement du navigateur. Elle est exécutée une fois par mesure, plutôt qu’une fois par exécution Lighthouse, puisqu’il s’agit d’une analyse statique du DOM rendu.

Si axe échoue ou dépasse le délai imparti, la mesure est tout de même conservée : l’accessibilité est un critère de départage, et perdre l’enregistrement entier serait un mauvais compromis. Un site sans données axe est classé après un site qui en possède, afin qu’une exécution ratée ne lui donne pas par défaut l’avantage lors du départage.

Les cinq classements par indicateur (performance, accessibilité, LCP, poids et requêtes) continuent d’être calculés et sont disponibles dans `report.json` comme classements secondaires.

### Configuration avec `.env`

Un fichier `.env` à la racine du projet est chargé automatiquement par chaque commande et par la compilation. Copiez [`.env.example`](.env.example) pour commencer :

```bash
cp .env.example .env
```

Deux comportements à connaître :

- **Les variables d’environnement réelles sont prioritaires.** Une valeur définie par le shell ou la CI n’est jamais remplacée par le fichier. Un `.env` local oublié ne peut donc pas masquer un secret `CRUX_API_KEY` dans GitHub Actions. (Une variable vide est tout de même considérée comme définie.)
- **L’absence de `.env` n’est pas une erreur.** Ce fichier est facultatif et ignoré par Git ; toutes les variables qu’il peut définir ont une valeur par défaut fonctionnelle.

Le chargement s’appuie sur `process.loadEnvFile`, intégré à Node (Node 20.12+), sans dépendance supplémentaire. Pour utiliser un autre fichier, définissez `SPEEDLIFY_ENV_FILE=.env.local`.

| Variable                    | Valeur par défaut                        | Fonction                                                                             |
|-----------------------------|------------------------------------------|--------------------------------------------------------------------------------------|
| `CHROME_PATH`               | —                                        | Chemin vers le binaire de Chrome ou d’un navigateur compatible                       |
| `CRUX_API_KEY`              | —                                        | Données terrain du rapport Chrome UX, y compris INP                                  |
| `SPEEDLIFY_RESULTS_DIR`     | `results`                                | Emplacement des mesures                                                              |
| `SPEEDLIFY_LOGS_DIR`        | `logs`                                   | Emplacement des journaux d’exécution NDJSON                                          |
| `SPEEDLIFY_REPORT_FILE`     | `report.json`                            | Fichier produit par `speedlify report` et lu lors de la compilation                  |
| `SPEEDLIFY_ENV_FILE`        | `.env`                                   | Fichier d’environnement à charger                                                    |
| `SPEEDLIFY_SITE_URL`        | —                                        | Origine du site déployé, utilisée pour les métadonnées                               |
| `SPEEDLIFY_REPO_URL`        | `https://github.com/zachleat/speedlify2` | Lien vers le dépôt dans le pied de page                                              |
| `SPEEDLIFY_GOATCOUNTER_URL` | —                                        | Point de terminaison GoatCounter ; ajoute le script de comptage lorsqu’il est défini |

## Données d’utilisateurs réels (recommandé)

Lighthouse fournit des données de laboratoire : une simulation exécutée sur une machine, avec une limitation synthétique du débit. Le Chrome UX Report fournit des données issues de l’expérience réelle des utilisateurs de Chrome sur les 28 derniers jours.

Deux raisons rendent ces données particulièrement utiles :

- **INP est mesuré uniquement sur le terrain.** Lighthouse ne peut pas mesurer l’Interaction to Next Paint en laboratoire : une navigation à froid ne comprend aucune interaction. Sans CrUX, il manque un tiers des Core Web Vitals, et TBT sert de substitut approximatif.
- **L’écart entre laboratoire et terrain est révélateur.** Si les résultats de laboratoire restent stables alors que les résultats terrain se dégradent, le problème vient souvent d’un public que vous ne testez pas : appareils plus lents, réseaux de moindre qualité ou région que vous venez de commencer à desservir.

Pour configurer CrUX :

1. Créez une clé API dans la console Google Cloud.
2. Activez la **Chrome UX Report API** sur ce projet.
3. Exportez la clé, puis vérifiez la configuration :

```bash
export CRUX_API_KEY=your-key-here
npx speedlify check
```

Ensuite, préremplissez l’historique. L’API CrUX History renvoie environ 25 points de données hebdomadaires par requête. Une nouvelle installation peut ainsi disposer immédiatement de six mois de tendances terrain, au lieu d’attendre six mois pour les constituer :

```bash
npx speedlify backfill
```

### En l’absence de clé

Core Web Vitals est **entièrement ignoré** : aucun panneau, badge ni indicateur sur la page d’accueil. Sans CrUX, il n’y a pas d’INP ; la seule autre donnée disponible serait une approximation en laboratoire, et l’appeler « Core Web Vitals » laisserait croire à une mesure qui n’a pas été effectuée. Tout le reste — scores, temps de laboratoire, poids, fil principal, accessibilité et hygiène — reste inchangé.

Lorsqu’une clé est définie, certains sites ne renvoient aucune donnée, faute de trafic Chrome. C’est attendu et ce n’est pas une erreur : pour ces sites, une approximation clairement identifiée en laboratoire utilise TBT à la place d’INP, puisque CrUX est bien configuré, mais que cette URL n’est tout simplement pas couverte.

Les données terrain déjà stockées dans `results/` sont toujours affichées, même si la clé est absente lors d’une compilation ultérieure.

## Mesures effectuées

Chaque exécution enregistre bien plus que les quatre scores Lighthouse, car les scores sont des **indicateurs retardés** : les indicateurs avancés permettent de détecter une régression avant qu’elle ne prenne de l’ampleur.

| Groupe                     | Mesures                                                                                                                                   |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **Scores**                 | Performance, Accessibilité, Bonnes pratiques, SEO                                                                                         |
| **Temps de laboratoire**   | LCP, CLS, TBT, FCP, Speed Index, TTFB, FID potentiel maximal, temps de réponse du serveur, RTT réseau                                     |
| **Sous-parties du LCP**    | TTFB, délai de chargement de la ressource, durée de chargement, délai de rendu de l’élément                                               |
| **Données terrain (CrUX)** | LCP, **INP**, CLS, FCP, TTFB — 75e percentile et répartition complète entre « bon », « à améliorer » et « mauvais »                       |
| **Poids**                  | Nombre total d’octets et de requêtes, répartis par type de ressource ; taille du document principal                                       |
| **Tiers**                  | Volume transféré et temps passé sur le fil principal, par entité                                                                          |
| **Fil principal**          | Évaluation des scripts, styles et mise en page, analyse syntaxique, ramasse-miettes ; nombre de tâches longues et durée de la plus longue |
| **Gaspillage**             | JavaScript et CSS inutilisés, JavaScript obsolète ou dupliqué, octets non minifiés, ressources bloquant le rendu, octets mal mis en cache |
| **DOM**                    | Nombre d’éléments, profondeur, nombre maximal d’enfants                                                                                   |
| **Accessibilité**          | Nombre d’audits échoués et de nœuds concernés, ainsi que les audits en question                                                           |
| **Hygiène**                | HTTPS, HSTS, CSP, protection contre le clickjacking, isolation de l’origine, Trusted Types, bfcache, protocole HTTP, erreurs de console   |
| **Environnement**          | Version de Lighthouse, facteur de forme, méthode de limitation du débit et **indice de référence**                                        |

### Pourquoi enregistrer l’indice de référence

`benchmarkIndex` mesure les performances du processeur de la machine qui a exécuté le test. Un exécuteur CI plus lent ou occupé dégrade toutes les mesures dépendantes du processeur — TBT, TTI et charge du fil principal, entre autres — et peut donner l’impression d’une véritable régression.

speedlify enregistre cet indice comme une mesure à part entière et affiche une bannière d’avertissement sur la page d’un site si la machine de mesure s’est écartée de plus de 20 % de sa propre référence. C’est la cause la plus fréquente des fausses régressions dans le suivi synthétique, et la plupart des outils ne l’enregistrent pas du tout.

### Signal et bruit

Les mesures en laboratoire fluctuent. Comparer une nouvelle mesure à une seule ancienne produit une série de fausses régressions, ce qui finit par apprendre aux utilisateurs à ignorer leur tableau de bord de performance.

Deux mécanismes limitent ce problème :

- Lighthouse est exécuté N fois pour chaque mesure, et c’est la **médiane**, plutôt que le meilleur résultat, qui est conservée.
- Un changement n’est signalé comme **significatif** que s’il dépasse le niveau de bruit observé pour cette mesure : la médiane des écarts absolus entre mesures consécutives. Il faut au moins trois points de données ; les premières exécutions ne signalent donc volontairement rien.

## Journaux

Chaque exécution écrit des données NDJSON, avec un objet JSON par ligne :

- `logs/<runId>.ndjson` — journal complet des événements de l’exécution
- `logs/runs.ndjson` — une ligne de résumé par exécution, ajoutée au fichier au fil du temps

Les deux fichiers permettent les recherches avec `grep`, et l’historique des exécutions est publié sur `/runs/`. Vous pouvez ainsi savoir si une exécution s’est réellement terminée, sans accès shell à la machine de compilation.

```bash
# Tous les avertissements et toutes les erreurs de toutes les exécutions
grep -h '"level":"warn"\|"level":"error"' logs/*.ndjson | jq .

# Résultat d'un site pour une exécution donnée
jq 'select(.data.url == "https://example.com/")' logs/2026-01-01*.ndjson

# Aperçu de l'historique des exécutions
npx speedlify runs
```

Les mesures échouées sont enregistrées avec un champ `error` au lieu d’être supprimées : « ce site était hors ligne mardi » est une donnée utile à afficher sur le graphique.

## Commandes

```bash
speedlify measure [options]    # Mesurer un lot des sites dont la dernière mesure est la plus ancienne
speedlify report [--out=F]     # Générer le rapport JSON utilisé lors de la compilation du site
speedlify backfill             # Préremplir environ 25 semaines d'historique CrUX
speedlify check                # Vérifier la clé API CrUX
speedlify list [--stale]       # Afficher les sites configurés, des plus anciens aux plus récents
speedlify runs [--limit=N]     # Afficher les exécutions récentes à partir du journal
speedlify redirects            # Afficher les redirections détectées et les changements de site confirmés
speedlify reindex              # Reconstruire series.json à partir des enregistrements bruts
speedlify prune [options]      # Supprimer les anciens enregistrements bruts (la série est conservée)
```

Options utiles :

| Option             | Effet                                                                        |
|--------------------|------------------------------------------------------------------------------|
| `--group=ssg,docs` | Ne traiter que ces groupes de configuration                                  |
| `--url=<url>`      | Ne traiter que cette URL                                                     |
| `--filter=<text>`  | Sites dont le nom ou l’URL contient ce texte                                 |
| `--runs=<n>`       | Remplacer le nombre d’exécutions par site                                    |
| `--desktop`        | Mesurer la version pour ordinateur plutôt que pour mobile                    |
| `--force`          | Ignorer le délai de fraîcheur                                                |
| `--no-field`       | Ignorer CrUX                                                                 |
| `--quiet`          | Ne rien afficher dans la console ; le fichier journal est tout de même écrit |

L’élagage supprime les **enregistrements bruts** anciens, mais conserve `series.json`. Les graphiques et les tendances gardent donc tout leur historique, même lorsque l’archive détaillée a été supprimée. Un nombre minimal d’enregistrements récents par site est également conservé, pour qu’une URL inactive depuis longtemps ne perde jamais entièrement ses données détaillées :

```bash
speedlify prune --days=365 --keep=30 --dry-run
```

## Automatisation

Deux workflows distincts sont utilisés :

- [`measure.yml`](.github/workflows/measure.yml) — toutes les deux heures, quatre fragments exécutés en parallèle traitent chacun un lot limité et enregistrent les résultats dans le dépôt. L’échec d’un fragment n’interrompt pas les autres.
- [`publish.yml`](.github/workflows/publish.yml) — toutes les heures et à chaque push, compile et déploie les données disponibles. Il n’attend jamais qu’une exécution de mesure se termine et n’échoue jamais parce que la couverture est incomplète.

Pour les utiliser, ajoutez `CRUX_API_KEY` aux secrets du dépôt et activez GitHub Pages en choisissant « GitHub Actions » comme source. Sans ce secret, les deux workflows continuent de fonctionner ; seules les données terrain sont ignorées.

Les fragments écrivent dans des répertoires distincts, mais envoient leurs modifications vers une seule branche. L’étape de commit rebase et réessaie donc en cas de conflit d’envoi.

`results/` et `logs/` ne sont volontairement **pas** ignorés par Git : ils constituent le jeu de données. Les commiter permet à l’historique de s’accumuler dans le contrôle de version, aux différences d’être affichées clairement et au site d’être reconstruit à partir d’un nouveau clonage.

## Structure du projet

```text
config/sites.js        liste des sites
lib/
  runner.js            pilote Chrome sans interface et Lighthouse
  metrics.js           convertit LHR en enregistrement compact à conserver
  crux.js              client Chrome UX Report (données actuelles et historique)
  redirect.js          détection des redirections et confirmation des changements de site
  aliases.js           changements d’URL détectés et assemblage de l’historique
  schedule.js          sélection des sites à mesurer dans un lot limité
  series.js            projection des enregistrements en points de série aplatis
  report.js            mesures → report.json (analyse complète)
  report-metrics.js    mesures affichées dans les graphiques et leurs libellés
  rank.js              algorithme de classement et critères de départage
  axe.js               analyse autonome de l’accessibilité avec axe-core
  env.js               charge .env sans écraser les variables d’environnement réelles
  compare.js           tendances, écarts, rangs et significativité
  store.js             archive en ajout seulement et séries dérivées
  log.js               journalisation des exécutions au format NDJSON
bin/speedlify.js           interface en ligne de commande
src/                   modèles de compilation Awesome et données de compilation
report.json            rapport généré (dérivé, ignoré par Git)
results/               jeu de données (suivi par Git)
logs/                  journaux d’exécution (suivis par Git)
```

## Remarques

- Nécessite Node 22.19+ et une installation locale de Chrome ou Chromium (`chrome-launcher` la détecte).
- Lighthouse 13 a renommé de nombreux audits avec des identifiants `*-insight`. `lib/metrics.js` gère ces changements avec prudence et enregistre `null` pour les données manquantes : une mise à niveau de Lighthouse dégrade une mesure, sans interrompre l’historique.
- Le hachage d’URL utilisé dans `results/` doit rester stable. Ne modifiez pas `urlHash()` sans migrer les noms des répertoires.

## Licence

MIT