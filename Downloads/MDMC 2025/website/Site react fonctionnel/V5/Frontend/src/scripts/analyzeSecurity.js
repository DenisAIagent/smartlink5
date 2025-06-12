const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const glob = require('glob');
const crypto = require('crypto');

// Configuration des chemins
const SRC_DIR = path.join(__dirname, '../../src');
const REPORTS_DIR = path.join(__dirname, '../../reports');
const SECURITY_DIR = path.join(REPORTS_DIR, 'security');

// Configuration des règles de sécurité
const SECURITY_RULES = {
  xss: {
    patterns: [
      /dangerouslySetInnerHTML/g,
      /innerHTML/g,
      /document\.write/g,
      /eval\s*\(/g,
      /new\s+Function/g
    ],
    weight: 0.3
  },
  csrf: {
    patterns: [
      /fetch\s*\(/g,
      /axios\s*\./g,
      /XMLHttpRequest/g
    ],
    weight: 0.2
  },
  injection: {
    patterns: [
      /sql\s*=/g,
      /exec\s*\(/g,
      /spawn\s*\(/g
    ],
    weight: 0.2
  },
  authentication: {
    patterns: [
      /localStorage\.setItem\s*\(/g,
      /sessionStorage\.setItem\s*\(/g,
      /cookie\s*=/g
    ],
    weight: 0.3
  }
};

// Fonction pour créer les répertoires nécessaires
const createDirectories = () => {
  if (!fs.existsSync(SECURITY_DIR)) {
    fs.mkdirSync(SECURITY_DIR, { recursive: true });
  }
};

// Fonction pour analyser les vulnérabilités XSS
const analyzeXSS = (content) => {
  const vulnerabilities = [];
  SECURITY_RULES.xss.patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      vulnerabilities.push({
        type: 'XSS',
        pattern: pattern.toString(),
        count: matches.length,
        lines: content.split('\n')
          .map((line, index) => ({ line: index + 1, content: line }))
          .filter(({ content }) => pattern.test(content))
      });
    }
  });
  return vulnerabilities;
};

// Fonction pour analyser les vulnérabilités CSRF
const analyzeCSRF = (content) => {
  const vulnerabilities = [];
  SECURITY_RULES.csrf.patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      vulnerabilities.push({
        type: 'CSRF',
        pattern: pattern.toString(),
        count: matches.length,
        lines: content.split('\n')
          .map((line, index) => ({ line: index + 1, content: line }))
          .filter(({ content }) => pattern.test(content))
      });
    }
  });
  return vulnerabilities;
};

// Fonction pour analyser les vulnérabilités d'injection
const analyzeInjection = (content) => {
  const vulnerabilities = [];
  SECURITY_RULES.injection.patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      vulnerabilities.push({
        type: 'Injection',
        pattern: pattern.toString(),
        count: matches.length,
        lines: content.split('\n')
          .map((line, index) => ({ line: index + 1, content: line }))
          .filter(({ content }) => pattern.test(content))
      });
    }
  });
  return vulnerabilities;
};

// Fonction pour analyser les vulnérabilités d'authentification
const analyzeAuthentication = (content) => {
  const vulnerabilities = [];
  SECURITY_RULES.authentication.patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      vulnerabilities.push({
        type: 'Authentication',
        pattern: pattern.toString(),
        count: matches.length,
        lines: content.split('\n')
          .map((line, index) => ({ line: index + 1, content: line }))
          .filter(({ content }) => pattern.test(content))
      });
    }
  });
  return vulnerabilities;
};

// Fonction pour analyser les dépendances
const analyzeDependencies = () => {
  const spinner = ora('Analyse des dépendances...').start();
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
    );

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const vulnerabilities = [];
    Object.entries(dependencies).forEach(([name, version]) => {
      // Vérification des versions vulnérables
      if (version.includes('alpha') || version.includes('beta') || version.includes('rc')) {
        vulnerabilities.push({
          type: 'Dependency',
          name,
          version,
          severity: 'warning',
          message: 'Version instable détectée'
        });
      }
    });

    spinner.succeed('Analyse des dépendances terminée');
    return vulnerabilities;
  } catch (error) {
    spinner.fail('Erreur lors de l\'analyse des dépendances');
    console.error(error);
    return [];
  }
};

// Fonction pour générer le rapport de sécurité
const generateSecurityReport = (vulnerabilities, dependencyVulnerabilities) => {
  const table = new Table({
    head: ['Type', 'Fichier', 'Ligne', 'Description', 'Sévérité'],
    style: { head: ['cyan'] }
  });

  vulnerabilities.forEach(vuln => {
    vuln.lines.forEach(line => {
      table.push([
        vuln.type,
        vuln.file,
        line.line,
        `Pattern: ${vuln.pattern}`,
        '⚠️'
      ]);
    });
  });

  dependencyVulnerabilities.forEach(vuln => {
    table.push([
      vuln.type,
      'package.json',
      '-',
      vuln.message,
      '⚠️'
    ]);
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport de Sécurité</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { margin-bottom: 20px; }
        .security-results { border-collapse: collapse; width: 100%; }
        .security-results th, .security-results td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .security-results th { background-color: #f5f5f5; }
        .warning { color: orange; }
        .critical { color: red; }
        .vulnerability-details { margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>Rapport de Sécurité</h1>
      <div class="summary">
        <h2>Résumé</h2>
        <p>Nombre total de vulnérabilités : ${vulnerabilities.length + dependencyVulnerabilities.length}</p>
      </div>
      <h2>Détails des Vulnérabilités</h2>
      <table class="security-results">
        <tr>
          <th>Type</th>
          <th>Fichier</th>
          <th>Ligne</th>
          <th>Description</th>
          <th>Sévérité</th>
        </tr>
        ${vulnerabilities.map(vuln => vuln.lines.map(line => `
          <tr>
            <td>${vuln.type}</td>
            <td>${vuln.file}</td>
            <td>${line.line}</td>
            <td>Pattern: ${vuln.pattern}</td>
            <td class="warning">⚠️</td>
          </tr>
        `).join('')).join('')}
        ${dependencyVulnerabilities.map(vuln => `
          <tr>
            <td>${vuln.type}</td>
            <td>package.json</td>
            <td>-</td>
            <td>${vuln.message}</td>
            <td class="warning">⚠️</td>
          </tr>
        `).join('')}
      </table>
      <div class="vulnerability-details">
        <h2>Recommandations</h2>
        <ul>
          <li>Utiliser des bibliothèques de validation des entrées</li>
          <li>Implémenter des en-têtes de sécurité appropriés</li>
          <li>Mettre à jour les dépendances vulnérables</li>
          <li>Utiliser des tokens CSRF pour les requêtes sensibles</li>
          <li>Implémenter une politique de sécurité du contenu (CSP)</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync(
    path.join(SECURITY_DIR, 'security-report.html'),
    htmlTemplate
  );

  console.log('\nRésumé de la sécurité :');
  console.log(table.toString());
};

// Fonction principale
const main = async () => {
  console.log(chalk.blue('🔒 Analyse de la sécurité...\n'));

  // Création des répertoires
  createDirectories();

  // Analyse des fichiers
  const spinner = ora('Analyse des fichiers...').start();
  try {
    const files = glob.sync('**/*.{js,jsx,ts,tsx}', { cwd: SRC_DIR });
    const vulnerabilities = [];

    files.forEach(file => {
      const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
      const fileVulnerabilities = [
        ...analyzeXSS(content),
        ...analyzeCSRF(content),
        ...analyzeInjection(content),
        ...analyzeAuthentication(content)
      ].map(vuln => ({ ...vuln, file }));

      vulnerabilities.push(...fileVulnerabilities);
    });

    spinner.succeed('Analyse des fichiers terminée');

    // Analyse des dépendances
    const dependencyVulnerabilities = analyzeDependencies();

    // Génération du rapport
    generateSecurityReport(vulnerabilities, dependencyVulnerabilities);

    console.log(chalk.green('\n✅ Analyse de la sécurité terminée !'));
    console.log(chalk.yellow(`📊 Rapport disponible à : ${path.join(SECURITY_DIR, 'security-report.html')}`));
  } catch (error) {
    spinner.fail('Erreur lors de l\'analyse de la sécurité');
    console.error(error);
    process.exit(1);
  }
};

// Exécution du script
main().catch(error => {
  console.error(chalk.red('❌ Erreur lors de l\'analyse :'), error);
  process.exit(1);
}); 