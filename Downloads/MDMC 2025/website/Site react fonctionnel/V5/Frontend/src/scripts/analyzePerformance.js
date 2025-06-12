const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const glob = require('glob');

// Configuration des chemins
const SRC_DIR = path.join(__dirname, '../../src');
const REPORTS_DIR = path.join(__dirname, '../../reports');
const PERFORMANCE_DIR = path.join(REPORTS_DIR, 'performance');

// Configuration des métriques
const METRICS = {
  firstContentfulPaint: {
    threshold: 1800,
    weight: 0.2
  },
  speedIndex: {
    threshold: 3300,
    weight: 0.2
  },
  largestContentfulPaint: {
    threshold: 2500,
    weight: 0.2
  },
  timeToInteractive: {
    threshold: 3500,
    weight: 0.2
  },
  totalBlockingTime: {
    threshold: 300,
    weight: 0.1
  },
  cumulativeLayoutShift: {
    threshold: 0.1,
    weight: 0.1
  }
};

// Fonction pour créer les répertoires nécessaires
const createDirectories = () => {
  if (!fs.existsSync(PERFORMANCE_DIR)) {
    fs.mkdirSync(PERFORMANCE_DIR, { recursive: true });
  }
};

// Fonction pour lancer Chrome
const launchChrome = async () => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });
  return chrome;
};

// Fonction pour analyser les performances avec Lighthouse
const analyzeWithLighthouse = async (url) => {
  const chrome = await launchChrome();
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port
  };

  try {
    const results = await lighthouse(url, options);
    await chrome.kill();
    return results.lhr;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
};

// Fonction pour analyser les performances des composants
const analyzeComponents = async () => {
  const spinner = ora('Analyse des performances des composants...').start();
  try {
    const files = glob.sync('**/*.{js,jsx,ts,tsx}', { cwd: SRC_DIR });
    const results = {};

    for (const file of files) {
      const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
      const performance = analyzeComponentPerformance(content);
      results[file] = performance;
    }

    spinner.succeed('Analyse des composants terminée');
    return results;
  } catch (error) {
    spinner.fail('Erreur lors de l\'analyse des composants');
    console.error(error);
    return {};
  }
};

// Fonction pour analyser les performances d'un composant
const analyzeComponentPerformance = (content) => {
  const metrics = {
    renderCount: 0,
    effectCount: 0,
    stateCount: 0,
    propCount: 0,
    memoCount: 0
  };

  // Analyse des rendus
  metrics.renderCount = (content.match(/render\s*\(/g) || []).length;
  metrics.effectCount = (content.match(/useEffect\s*\(/g) || []).length;
  metrics.stateCount = (content.match(/useState\s*\(/g) || []).length;
  metrics.propCount = (content.match(/props\./g) || []).length;
  metrics.memoCount = (content.match(/useMemo\s*\(/g) || []).length;

  return metrics;
};

// Fonction pour générer le rapport de performance
const generatePerformanceReport = async (lighthouseResults, componentResults) => {
  const table = new Table({
    head: ['Métrique', 'Valeur', 'Seuil', 'Statut'],
    style: { head: ['cyan'] }
  });

  // Ajout des métriques Lighthouse
  Object.entries(METRICS).forEach(([metric, config]) => {
    const value = lighthouseResults.audits[metric].numericValue;
    const status = value <= config.threshold ? '✅' : '❌';
    table.push([
      metric,
      `${(value / 1000).toFixed(2)}s`,
      `${(config.threshold / 1000).toFixed(2)}s`,
      status
    ]);
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport de Performance</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { margin-bottom: 20px; }
        .performance-results { border-collapse: collapse; width: 100%; }
        .performance-results th, .performance-results td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .performance-results th { background-color: #f5f5f5; }
        .pass { color: green; }
        .fail { color: red; }
        .component-analysis { margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>Rapport de Performance</h1>
      <div class="summary">
        <h2>Résumé des Métriques Lighthouse</h2>
        <p>Score de Performance : ${lighthouseResults.categories.performance.score * 100}</p>
      </div>
      <h2>Détails des Métriques</h2>
      <table class="performance-results">
        <tr>
          <th>Métrique</th>
          <th>Valeur</th>
          <th>Seuil</th>
          <th>Statut</th>
        </tr>
        ${Object.entries(METRICS).map(([metric, config]) => `
          <tr>
            <td>${metric}</td>
            <td>${(lighthouseResults.audits[metric].numericValue / 1000).toFixed(2)}s</td>
            <td>${(config.threshold / 1000).toFixed(2)}s</td>
            <td class="${lighthouseResults.audits[metric].numericValue <= config.threshold ? 'pass' : 'fail'}">
              ${lighthouseResults.audits[metric].numericValue <= config.threshold ? '✅' : '❌'}
            </td>
          </tr>
        `).join('')}
      </table>
      <div class="component-analysis">
        <h2>Analyse des Composants</h2>
        <table class="performance-results">
          <tr>
            <th>Composant</th>
            <th>Rendus</th>
            <th>Effets</th>
            <th>États</th>
            <th>Props</th>
            <th>Mémo</th>
          </tr>
          ${Object.entries(componentResults).map(([file, metrics]) => `
            <tr>
              <td>${file}</td>
              <td>${metrics.renderCount}</td>
              <td>${metrics.effectCount}</td>
              <td>${metrics.stateCount}</td>
              <td>${metrics.propCount}</td>
              <td>${metrics.memoCount}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync(
    path.join(PERFORMANCE_DIR, 'performance-report.html'),
    htmlTemplate
  );

  console.log('\nRésumé des performances :');
  console.log(table.toString());
};

// Fonction principale
const main = async () => {
  console.log(chalk.blue('⚡ Analyse des performances...\n'));

  // Création des répertoires
  createDirectories();

  // Analyse avec Lighthouse
  const spinner = ora('Analyse avec Lighthouse...').start();
  try {
    const lighthouseResults = await analyzeWithLighthouse('http://localhost:3000');
    spinner.succeed('Analyse Lighthouse terminée');

    // Analyse des composants
    const componentResults = await analyzeComponents();

    // Génération du rapport
    await generatePerformanceReport(lighthouseResults, componentResults);

    console.log(chalk.green('\n✅ Analyse des performances terminée !'));
    console.log(chalk.yellow(`📊 Rapport disponible à : ${path.join(PERFORMANCE_DIR, 'performance-report.html')}`));
  } catch (error) {
    spinner.fail('Erreur lors de l\'analyse des performances');
    console.error(error);
    process.exit(1);
  }
};

// Exécution du script
main().catch(error => {
  console.error(chalk.red('❌ Erreur lors de l\'analyse :'), error);
  process.exit(1);
}); 