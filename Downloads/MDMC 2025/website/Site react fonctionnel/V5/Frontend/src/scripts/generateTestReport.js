const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const open = require('open');

// Configuration des chemins
const REPORTS_DIR = path.join(__dirname, '../../reports');
const COVERAGE_DIR = path.join(__dirname, '../../coverage');
const JUNIT_DIR = path.join(REPORTS_DIR, 'junit');
const SONAR_DIR = path.join(REPORTS_DIR, 'sonar');

// Fonction pour créer les répertoires nécessaires
const createDirectories = () => {
  const dirs = [REPORTS_DIR, COVERAGE_DIR, JUNIT_DIR, SONAR_DIR];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Fonction pour exécuter les tests
const runTests = async () => {
  const spinner = ora('Exécution des tests...').start();
  try {
    execSync('npm test -- --coverage --reporters=default --reporters=jest-junit --reporters=jest-html-reporter --reporters=jest-sonar-reporter', {
      stdio: 'inherit'
    });
    spinner.succeed('Tests exécutés avec succès');
  } catch (error) {
    spinner.fail('Erreur lors de l\'exécution des tests');
    console.error(error);
    process.exit(1);
  }
};

// Fonction pour analyser les résultats de couverture
const analyzeCoverage = () => {
  const coverageSummary = JSON.parse(
    fs.readFileSync(path.join(COVERAGE_DIR, 'coverage-summary.json'), 'utf8')
  );

  const table = new Table({
    head: ['Catégorie', 'Statements', 'Branches', 'Functions', 'Lines'],
    style: { head: ['cyan'] }
  });

  Object.entries(coverageSummary.total).forEach(([category, stats]) => {
    table.push([
      category,
      `${stats.statements.pct}%`,
      `${stats.branches.pct}%`,
      `${stats.functions.pct}%`,
      `${stats.lines.pct}%`
    ]);
  });

  console.log('\nRésumé de la couverture de code :');
  console.log(table.toString());
};

// Fonction pour générer un rapport HTML personnalisé
const generateCustomReport = () => {
  const testReport = JSON.parse(
    fs.readFileSync(path.join(REPORTS_DIR, 'test-report.json'), 'utf8')
  );

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport de Tests</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { margin-bottom: 20px; }
        .test-results { border-collapse: collapse; width: 100%; }
        .test-results th, .test-results td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .test-results th { background-color: #f5f5f5; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
      </style>
    </head>
    <body>
      <h1>Rapport de Tests</h1>
      <div class="summary">
        <h2>Résumé</h2>
        <p>Total des tests : ${testReport.numTotalTests}</p>
        <p>Tests réussis : ${testReport.numPassedTests}</p>
        <p>Tests échoués : ${testReport.numFailedTests}</p>
        <p>Tests ignorés : ${testReport.numPendingTests}</p>
      </div>
      <h2>Détails des Tests</h2>
      <table class="test-results">
        <tr>
          <th>Nom du Test</th>
          <th>Statut</th>
          <th>Durée</th>
        </tr>
        ${testReport.testResults.map(result => `
          <tr>
            <td>${result.name}</td>
            <td class="${result.status}">${result.status}</td>
            <td>${result.duration}ms</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'custom-test-report.html'),
    htmlTemplate
  );
};

// Fonction principale
const main = async () => {
  console.log(chalk.blue('🚀 Génération du rapport de tests...\n'));

  // Création des répertoires
  createDirectories();

  // Exécution des tests
  await runTests();

  // Analyse de la couverture
  analyzeCoverage();

  // Génération du rapport personnalisé
  generateCustomReport();

  // Ouverture du rapport dans le navigateur
  const reportPath = path.join(REPORTS_DIR, 'custom-test-report.html');
  await open(reportPath);

  console.log(chalk.green('\n✅ Rapport de tests généré avec succès !'));
  console.log(chalk.yellow(`📊 Rapport disponible à : ${reportPath}`));
};

// Exécution du script
main().catch(error => {
  console.error(chalk.red('❌ Erreur lors de la génération du rapport :'), error);
  process.exit(1);
}); 