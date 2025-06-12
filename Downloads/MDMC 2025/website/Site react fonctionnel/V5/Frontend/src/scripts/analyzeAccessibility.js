const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const glob = require('glob');
const axe = require('axe-core');
const puppeteer = require('puppeteer');

// Configuration des chemins
const SRC_DIR = path.join(__dirname, '../../src');
const REPORTS_DIR = path.join(__dirname, '../../reports');
const ACCESSIBILITY_DIR = path.join(REPORTS_DIR, 'accessibility');

// Configuration des règles d'accessibilité
const ACCESSIBILITY_RULES = {
  semantic: {
    patterns: [
      /<div[^>]*role="button"[^>]*>/g,
      /<div[^>]*role="link"[^>]*>/g,
      /<div[^>]*role="tab"[^>]*>/g,
      /<div[^>]*role="list"[^>]*>/g,
      /<div[^>]*role="listitem"[^>]*>/g
    ],
    weight: 0.3
  },
  aria: {
    patterns: [
      /aria-label="[^"]*"/g,
      /aria-describedby="[^"]*"/g,
      /aria-hidden="[^"]*"/g,
      /aria-expanded="[^"]*"/g,
      /aria-controls="[^"]*"/g
    ],
    weight: 0.2
  },
  keyboard: {
    patterns: [
      /onKeyDown/g,
      /onKeyPress/g,
      /onKeyUp/g,
      /tabIndex/g
    ],
    weight: 0.2
  },
  color: {
    patterns: [
      /color:\s*#[0-9a-fA-F]{3,6}/g,
      /background-color:\s*#[0-9a-fA-F]{3,6}/g,
      /background:\s*#[0-9a-fA-F]{3,6}/g
    ],
    weight: 0.3
  }
};

// Fonction pour créer les répertoires nécessaires
const createDirectories = () => {
  if (!fs.existsSync(ACCESSIBILITY_DIR)) {
    fs.mkdirSync(ACCESSIBILITY_DIR, { recursive: true });
  }
};

// Fonction pour analyser avec Axe
const analyzeWithAxe = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      axe.run(document, {
        resultTypes: ['violations', 'passes', 'incomplete'],
        rules: {
          'color-contrast': { enabled: true },
          'document-title': { enabled: true },
          'html-has-lang': { enabled: true },
          'image-alt': { enabled: true },
          'label': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'meta-viewport': { enabled: true },
          'object-alt': { enabled: true },
          'tabindex': { enabled: true }
        }
      }, (err, results) => {
        if (err) throw err;
        resolve(results);
      });
    });
  });

  await browser.close();
  return results;
};

// Fonction pour analyser la sémantique
const analyzeSemantic = (content) => {
  const issues = [];
  ACCESSIBILITY_RULES.semantic.patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'Semantic',
        pattern: pattern.toString(),
        count: matches.length,
        lines: content.split('\n')
          .map((line, index) => ({ line: index + 1, content: line }))
          .filter(({ content }) => pattern.test(content))
      });
    }
  });
  return issues;
};

// Fonction pour analyser les attributs ARIA
const analyzeAria = (content) => {
  const issues = [];
  ACCESSIBILITY_RULES.aria.patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'ARIA',
        pattern: pattern.toString(),
        count: matches.length,
        lines: content.split('\n')
          .map((line, index) => ({ line: index + 1, content: line }))
          .filter(({ content }) => pattern.test(content))
      });
    }
  });
  return issues;
};

// Fonction pour analyser la navigation au clavier
const analyzeKeyboard = (content) => {
  const issues = [];
  ACCESSIBILITY_RULES.keyboard.patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'Keyboard',
        pattern: pattern.toString(),
        count: matches.length,
        lines: content.split('\n')
          .map((line, index) => ({ line: index + 1, content: line }))
          .filter(({ content }) => pattern.test(content))
      });
    }
  });
  return issues;
};

// Fonction pour analyser les contrastes de couleur
const analyzeColor = (content) => {
  const issues = [];
  ACCESSIBILITY_RULES.color.patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'Color',
        pattern: pattern.toString(),
        count: matches.length,
        lines: content.split('\n')
          .map((line, index) => ({ line: index + 1, content: line }))
          .filter(({ content }) => pattern.test(content))
      });
    }
  });
  return issues;
};

// Fonction pour générer le rapport d'accessibilité
const generateAccessibilityReport = async (axeResults, codeIssues) => {
  const table = new Table({
    head: ['Type', 'Fichier', 'Ligne', 'Description', 'Sévérité'],
    style: { head: ['cyan'] }
  });

  // Ajout des résultats Axe
  axeResults.violations.forEach(violation => {
    table.push([
      'Axe',
      violation.nodes[0].html,
      '-',
      violation.description,
      '⚠️'
    ]);
  });

  // Ajout des problèmes de code
  codeIssues.forEach(issue => {
    issue.lines.forEach(line => {
      table.push([
        issue.type,
        issue.file,
        line.line,
        `Pattern: ${issue.pattern}`,
        '⚠️'
      ]);
    });
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport d'Accessibilité</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { margin-bottom: 20px; }
        .accessibility-results { border-collapse: collapse; width: 100%; }
        .accessibility-results th, .accessibility-results td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .accessibility-results th { background-color: #f5f5f5; }
        .warning { color: orange; }
        .critical { color: red; }
        .recommendations { margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>Rapport d'Accessibilité</h1>
      <div class="summary">
        <h2>Résumé</h2>
        <p>Nombre total de violations : ${axeResults.violations.length + codeIssues.length}</p>
        <p>Tests réussis : ${axeResults.passes.length}</p>
        <p>Tests incomplets : ${axeResults.incomplete.length}</p>
      </div>
      <h2>Détails des Violations</h2>
      <table class="accessibility-results">
        <tr>
          <th>Type</th>
          <th>Élément</th>
          <th>Description</th>
          <th>Sévérité</th>
        </tr>
        ${axeResults.violations.map(violation => `
          <tr>
            <td>Axe</td>
            <td>${violation.nodes[0].html}</td>
            <td>${violation.description}</td>
            <td class="warning">⚠️</td>
          </tr>
        `).join('')}
        ${codeIssues.map(issue => issue.lines.map(line => `
          <tr>
            <td>${issue.type}</td>
            <td>${line.content}</td>
            <td>Pattern: ${issue.pattern}</td>
            <td class="warning">⚠️</td>
          </tr>
        `).join('')).join('')}
      </table>
      <div class="recommendations">
        <h2>Recommandations</h2>
        <ul>
          <li>Utiliser des éléments HTML sémantiques appropriés</li>
          <li>Ajouter des attributs ARIA lorsque nécessaire</li>
          <li>Assurer une navigation au clavier complète</li>
          <li>Maintenir un contraste de couleur suffisant</li>
          <li>Fournir des alternatives textuelles pour les images</li>
          <li>Structurer le contenu de manière logique</li>
          <li>Utiliser des libellés descriptifs pour les formulaires</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync(
    path.join(ACCESSIBILITY_DIR, 'accessibility-report.html'),
    htmlTemplate
  );

  console.log('\nRésumé de l\'accessibilité :');
  console.log(table.toString());
};

// Fonction principale
const main = async () => {
  console.log(chalk.blue('♿ Analyse de l\'accessibilité...\n'));

  // Création des répertoires
  createDirectories();

  // Analyse avec Axe
  const spinner = ora('Analyse avec Axe...').start();
  try {
    const axeResults = await analyzeWithAxe('http://localhost:3000');
    spinner.succeed('Analyse Axe terminée');

    // Analyse du code
    const files = glob.sync('**/*.{js,jsx,ts,tsx}', { cwd: SRC_DIR });
    const codeIssues = [];

    files.forEach(file => {
      const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
      const fileIssues = [
        ...analyzeSemantic(content),
        ...analyzeAria(content),
        ...analyzeKeyboard(content),
        ...analyzeColor(content)
      ].map(issue => ({ ...issue, file }));

      codeIssues.push(...fileIssues);
    });

    // Génération du rapport
    await generateAccessibilityReport(axeResults, codeIssues);

    console.log(chalk.green('\n✅ Analyse de l\'accessibilité terminée !'));
    console.log(chalk.yellow(`📊 Rapport disponible à : ${path.join(ACCESSIBILITY_DIR, 'accessibility-report.html')}`));
  } catch (error) {
    spinner.fail('Erreur lors de l\'analyse de l\'accessibilité');
    console.error(error);
    process.exit(1);
  }
};

// Exécution du script
main().catch(error => {
  console.error(chalk.red('❌ Erreur lors de l\'analyse :'), error);
  process.exit(1);
}); 