const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const glob = require('glob');
const esprima = require('esprima');
const escodegen = require('escodegen');

// Configuration des chemins
const SRC_DIR = path.join(__dirname, '../../src');
const REPORTS_DIR = path.join(__dirname, '../../reports');
const QUALITY_DIR = path.join(REPORTS_DIR, 'quality');

// Configuration des métriques
const METRICS = {
  complexity: {
    threshold: 10,
    weight: 0.3
  },
  maintainability: {
    threshold: 60,
    weight: 0.3
  },
  coverage: {
    threshold: 80,
    weight: 0.2
  },
  duplication: {
    threshold: 5,
    weight: 0.2
  }
};

// Fonction pour créer les répertoires nécessaires
const createDirectories = () => {
  if (!fs.existsSync(QUALITY_DIR)) {
    fs.mkdirSync(QUALITY_DIR, { recursive: true });
  }
};

// Fonction pour analyser la complexité cyclomatique
const analyzeComplexity = (ast) => {
  let complexity = 1;

  const traverse = (node) => {
    if (node.type === 'IfStatement' ||
        node.type === 'ForStatement' ||
        node.type === 'ForInStatement' ||
        node.type === 'ForOfStatement' ||
        node.type === 'WhileStatement' ||
        node.type === 'DoWhileStatement' ||
        node.type === 'SwitchCase' ||
        node.type === 'CatchClause' ||
        node.type === 'ConditionalExpression') {
      complexity++;
    }

    if (node.type === 'LogicalExpression' &&
        (node.operator === '&&' || node.operator === '||')) {
      complexity++;
    }

    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(traverse);
        } else {
          traverse(node[key]);
        }
      }
    }
  };

  traverse(ast);
  return complexity;
};

// Fonction pour analyser la maintenabilité
const analyzeMaintainability = (ast, lines) => {
  const volume = lines * Math.log2(analyzeComplexity(ast));
  const maintainability = 171 - 5.2 * Math.log2(volume) - 0.23 * analyzeComplexity(ast) - 16.2 * Math.log2(lines);
  return Math.max(0, Math.min(100, maintainability));
};

// Fonction pour analyser la duplication de code
const analyzeDuplication = (content) => {
  const lines = content.split('\n');
  const uniqueLines = new Set(lines);
  return ((lines.length - uniqueLines.size) / lines.length) * 100;
};

// Fonction pour analyser la couverture de code
const analyzeCoverage = () => {
  try {
    const coverageSummary = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../coverage/coverage-summary.json'), 'utf8')
    );
    return coverageSummary.total.lines.pct;
  } catch (error) {
    return 0;
  }
};

// Fonction pour analyser les dépendances circulaires
const analyzeCircularDependencies = (files) => {
  const dependencies = new Map();
  const circularDependencies = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
    const imports = content.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];
    const fileDependencies = imports.map(imp => {
      const match = imp.match(/from\s+['"]([^'"]+)['"]/);
      return match ? match[1] : null;
    }).filter(Boolean);

    dependencies.set(file, fileDependencies);
  });

  const visited = new Set();
  const recursionStack = new Set();

  const dfs = (file) => {
    visited.add(file);
    recursionStack.add(file);

    const fileDependencies = dependencies.get(file) || [];
    for (const dependency of fileDependencies) {
      if (!visited.has(dependency)) {
        if (dfs(dependency)) {
          return true;
        }
      } else if (recursionStack.has(dependency)) {
        circularDependencies.push([file, dependency]);
        return true;
      }
    }

    recursionStack.delete(file);
    return false;
  };

  for (const file of files) {
    if (!visited.has(file)) {
      dfs(file);
    }
  }

  return circularDependencies;
};

// Fonction pour analyser la taille des fonctions
const analyzeFunctionSize = (ast) => {
  const functionSizes = [];

  const traverse = (node) => {
    if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression') {
      const functionBody = escodegen.generate(node);
      const lines = functionBody.split('\n').length;
      functionSizes.push({
        name: node.id ? node.id.name : 'anonymous',
        lines
      });
    }

    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(traverse);
        } else {
          traverse(node[key]);
        }
      }
    }
  };

  traverse(ast);
  return functionSizes;
};

// Fonction pour générer le rapport de qualité
const generateQualityReport = (results) => {
  const table = new Table({
    head: ['Fichier', 'Complexité', 'Maintenabilité', 'Duplication', 'Score'],
    style: { head: ['cyan'] }
  });

  Object.entries(results).forEach(([file, metrics]) => {
    const score = calculateQualityScore(metrics);
    table.push([
      file,
      `${metrics.complexity} (${metrics.complexity <= METRICS.complexity.threshold ? '✅' : '❌'})`,
      `${metrics.maintainability.toFixed(1)} (${metrics.maintainability >= METRICS.maintainability.threshold ? '✅' : '❌'})`,
      `${metrics.duplication.toFixed(1)}% (${metrics.duplication <= METRICS.duplication.threshold ? '✅' : '❌'})`,
      `${score.toFixed(1)}%`
    ]);
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport de Qualité du Code</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { margin-bottom: 20px; }
        .quality-results { border-collapse: collapse; width: 100%; }
        .quality-results th, .quality-results td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .quality-results th { background-color: #f5f5f5; }
        .pass { color: green; }
        .fail { color: red; }
        .circular-dependencies { margin-top: 30px; }
        .function-sizes { margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>Rapport de Qualité du Code</h1>
      <div class="summary">
        <h2>Résumé</h2>
        <p>Nombre de fichiers analysés : ${Object.keys(results).length}</p>
        <p>Score moyen : ${calculateAverageScore(results).toFixed(1)}%</p>
        <p>Couverture de code : ${results.coverage}%</p>
      </div>
      <h2>Détails par Fichier</h2>
      <table class="quality-results">
        <tr>
          <th>Fichier</th>
          <th>Complexité</th>
          <th>Maintenabilité</th>
          <th>Duplication</th>
          <th>Score</th>
        </tr>
        ${Object.entries(results).filter(([file]) => file !== 'coverage').map(([file, metrics]) => `
          <tr>
            <td>${file}</td>
            <td class="${metrics.complexity <= METRICS.complexity.threshold ? 'pass' : 'fail'}">
              ${metrics.complexity}
            </td>
            <td class="${metrics.maintainability >= METRICS.maintainability.threshold ? 'pass' : 'fail'}">
              ${metrics.maintainability.toFixed(1)}
            </td>
            <td class="${metrics.duplication <= METRICS.duplication.threshold ? 'pass' : 'fail'}">
              ${metrics.duplication.toFixed(1)}%
            </td>
            <td>
              ${calculateQualityScore(metrics).toFixed(1)}%
            </td>
          </tr>
        `).join('')}
      </table>
      <div class="circular-dependencies">
        <h2>Dépendances Circulaires</h2>
        <ul>
          ${results.circularDependencies.map(([file1, file2]) => `
            <li>${file1} → ${file2}</li>
          `).join('')}
        </ul>
      </div>
      <div class="function-sizes">
        <h2>Tailles des Fonctions</h2>
        <table class="quality-results">
          <tr>
            <th>Fichier</th>
            <th>Fonction</th>
            <th>Lignes</th>
          </tr>
          ${Object.entries(results).filter(([file]) => file !== 'coverage' && file !== 'circularDependencies').map(([file, metrics]) => 
            metrics.functionSizes.map(size => `
              <tr>
                <td>${file}</td>
                <td>${size.name}</td>
                <td>${size.lines}</td>
              </tr>
            `).join('')
          ).join('')}
        </table>
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync(
    path.join(QUALITY_DIR, 'quality-report.html'),
    htmlTemplate
  );

  console.log('\nRésumé de la qualité du code :');
  console.log(table.toString());
};

// Fonction pour calculer le score de qualité
const calculateQualityScore = (metrics) => {
  const complexityScore = Math.max(0, 100 - (metrics.complexity / METRICS.complexity.threshold) * 100);
  const maintainabilityScore = metrics.maintainability;
  const duplicationScore = Math.max(0, 100 - (metrics.duplication / METRICS.duplication.threshold) * 100);

  return (
    complexityScore * METRICS.complexity.weight +
    maintainabilityScore * METRICS.maintainability.weight +
    duplicationScore * METRICS.duplication.weight
  );
};

// Fonction pour calculer le score moyen
const calculateAverageScore = (results) => {
  const scores = Object.entries(results)
    .filter(([file]) => file !== 'coverage' && file !== 'circularDependencies')
    .map(([_, metrics]) => calculateQualityScore(metrics));

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

// Fonction principale
const main = async () => {
  console.log(chalk.blue('🔍 Analyse de la qualité du code...\n'));

  // Création des répertoires
  createDirectories();

  // Analyse des fichiers
  const spinner = ora('Analyse des fichiers...').start();
  try {
    const files = glob.sync('**/*.{js,jsx,ts,tsx}', { cwd: SRC_DIR });
    const results = {};

    files.forEach(file => {
      const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
      const ast = esprima.parseScript(content, { loc: true });
      const lines = content.split('\n').length;

      results[file] = {
        complexity: analyzeComplexity(ast),
        maintainability: analyzeMaintainability(ast, lines),
        duplication: analyzeDuplication(content),
        functionSizes: analyzeFunctionSize(ast)
      };
    });

    // Analyse des dépendances circulaires
    results.circularDependencies = analyzeCircularDependencies(files);

    // Analyse de la couverture
    results.coverage = analyzeCoverage();

    spinner.succeed('Analyse des fichiers terminée');

    // Génération du rapport
    generateQualityReport(results);

    console.log(chalk.green('\n✅ Analyse de la qualité terminée !'));
    console.log(chalk.yellow(`📊 Rapport disponible à : ${path.join(QUALITY_DIR, 'quality-report.html')}`));
  } catch (error) {
    spinner.fail('Erreur lors de l\'analyse de la qualité');
    console.error(error);
    process.exit(1);
  }
};

// Exécution du script
main().catch(error => {
  console.error(chalk.red('❌ Erreur lors de l\'analyse :'), error);
  process.exit(1);
}); 