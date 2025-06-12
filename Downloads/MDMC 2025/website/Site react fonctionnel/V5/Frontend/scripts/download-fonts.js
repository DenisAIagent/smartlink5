const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const FONTS_DIR = path.join(__dirname, '../public/fonts');

// Créer le répertoire des polices s'il n'existe pas
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Fonction pour télécharger un fichier
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// Fonction pour optimiser une police avec fonttools
async function optimizeFont(inputPath, outputPath) {
  try {
    execSync(`pyftsubset "${inputPath}" --output-file="${outputPath}" --unicodes=U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD`);
  } catch (error) {
    console.error(`Erreur lors de l'optimisation de la police: ${error.message}`);
  }
}

// Télécharger et optimiser les polices
async function main() {
  try {
    // Télécharger Inter
    console.log('Téléchargement de Inter...');
    await downloadFile(
      'https://github.com/rsms/inter/raw/master/docs/font-files/Inter.var.woff2',
      path.join(FONTS_DIR, 'inter-var.woff2')
    );

    // Télécharger Montserrat
    console.log('Téléchargement de Montserrat...');
    await downloadFile(
      'https://github.com/JulietaUla/Montserrat/raw/master/fonts/webfonts/Montserrat-Bold.woff2',
      path.join(FONTS_DIR, 'montserrat-bold.woff2')
    );

    console.log('Téléchargement terminé !');
  } catch (error) {
    console.error('Erreur lors du téléchargement des polices:', error);
  }
}

main(); 