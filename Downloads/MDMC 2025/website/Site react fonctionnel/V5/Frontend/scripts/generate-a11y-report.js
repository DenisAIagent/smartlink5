const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORT_DIR = path.join(__dirname, '../reports/a11y');
const REPORT_FILE = path.join(REPORT_DIR, 'accessibility-report.json');

// Créer le répertoire des rapports s'il n'existe pas
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Fonction pour exécuter axe-core sur une URL
async function runAxeOnUrl(url) {
  try {
    const axeResults = await execSync(`npx axe ${url} --format json`);
    return JSON.parse(axeResults);
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${url}:`, error.message);
    return null;
  }
}

// Fonction pour générer le rapport
async function generateReport() {
  const baseUrl = 'http://localhost:5173'; // URL de développement
  const urls = [
    '/',
    '/artists',
    '/smartlinks',
    '/reviews',
    '/contact',
    '/admin/login'
  ];

  const report = {
    timestamp: new Date().toISOString(),
    urls: {}
  };

  for (const url of urls) {
    console.log(`Analyse de ${url}...`);
    const results = await runAxeOnUrl(`${baseUrl}${url}`);
    if (results) {
      report.urls[url] = {
        violations: results.violations,
        passes: results.passes,
        incomplete: results.incomplete,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Sauvegarder le rapport
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`Rapport généré : ${REPORT_FILE}`);

  // Générer un résumé
  const summary = {
    totalViolations: Object.values(report.urls).reduce((acc, curr) => acc + curr.violations.length, 0),
    totalPasses: Object.values(report.urls).reduce((acc, curr) => acc + curr.passes.length, 0),
    urls: Object.keys(report.urls).map(url => ({
      url,
      violations: report.urls[url].violations.length,
      passes: report.urls[url].passes.length
    }))
  };

  console.log('\nRésumé du rapport :');
  console.log('------------------');
  console.log(`Total des violations : ${summary.totalViolations}`);
  console.log(`Total des tests réussis : ${summary.totalPasses}`);
  console.log('\nPar URL :');
  summary.urls.forEach(({ url, violations, passes }) => {
    console.log(`${url}:`);
    console.log(`  - Violations : ${violations}`);
    console.log(`  - Tests réussis : ${passes}`);
  });
}

// Exécuter le script
generateReport().catch(console.error); 