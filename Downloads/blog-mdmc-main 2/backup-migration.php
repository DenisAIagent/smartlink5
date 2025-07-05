<?php
/**
 * Script de backup complet pour migration WordPress
 * Backup de la base de données, du thème et des médias
 */

// Charger WordPress
require_once('wp-config.php');
require_once('wp-load.php');

// Vérifier les permissions
if (!current_user_can('export')) {
    die('Erreur : Permissions insuffisantes pour effectuer le backup.');
}

// Configuration
$backup_dir = 'backup-migration-' . date('Y-m-d-H-i-s');
$backup_path = ABSPATH . $backup_dir;

// Créer le répertoire de backup
if (!file_exists($backup_path)) {
    mkdir($backup_path, 0755, true);
}

echo "<h2>🔄 Backup en cours pour migration WordPress</h2>";

// 1. BACKUP DE LA BASE DE DONNÉES
echo "<h3>📊 1. Backup de la base de données...</h3>";

$db_backup_file = $backup_path . '/database-backup.sql';
$command = sprintf(
    'mysqldump -h %s -u %s -p%s %s > %s',
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    $db_backup_file
);

exec($command, $output, $return_var);

if ($return_var === 0) {
    echo "✅ Base de données sauvegardée : " . $db_backup_file . "<br>";
} else {
    echo "❌ Erreur lors du backup de la base de données<br>";
}

// 2. BACKUP DU THÈME PERSONNALISÉ
echo "<h3>🎨 2. Backup du thème personnalisé...</h3>";

$theme_source = ABSPATH . 'wp-content/themes/mdmc-theme-new';
$theme_dest = $backup_path . '/theme-mdmc-new';

if (is_dir($theme_source)) {
    // Copier le thème
    function copyDirectory($src, $dst) {
        $dir = opendir($src);
        @mkdir($dst);
        while (($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . '/' . $file)) {
                    copyDirectory($src . '/' . $file, $dst . '/' . $file);
                } else {
                    copy($src . '/' . $file, $dst . '/' . $file);
                }
            }
        }
        closedir($dir);
    }
    
    copyDirectory($theme_source, $theme_dest);
    echo "✅ Thème sauvegardé : " . $theme_dest . "<br>";
} else {
    echo "❌ Thème mdmc-theme-new non trouvé<br>";
}

// 3. BACKUP DES MÉDIAS (UPLOADS)
echo "<h3>📁 3. Backup des médias...</h3>";

$uploads_source = ABSPATH . 'wp-content/uploads';
$uploads_dest = $backup_path . '/uploads';

if (is_dir($uploads_source)) {
    copyDirectory($uploads_source, $uploads_dest);
    echo "✅ Médias sauvegardés : " . $uploads_dest . "<br>";
} else {
    echo "❌ Dossier uploads non trouvé<br>";
}

// 4. BACKUP DES PLUGINS ACTIFS
echo "<h3>🔌 4. Backup des plugins actifs...</h3>";

$active_plugins = get_option('active_plugins');
$plugins_list = $backup_path . '/active-plugins.txt';

$plugins_content = "Plugins actifs :\n";
foreach ($active_plugins as $plugin) {
    $plugins_content .= "- " . $plugin . "\n";
}

file_put_contents($plugins_list, $plugins_content);
echo "✅ Liste des plugins sauvegardée : " . $plugins_list . "<br>";

// 5. BACKUP DES OPTIONS DU THÈME
echo "<h3>⚙️ 5. Backup des options du thème...</h3>";

$theme_options = array();
$theme_options['theme_mods_mdmc-theme-new'] = get_option('theme_mods_mdmc-theme-new');
$theme_options['mdmc_theme_options'] = get_option('mdmc_theme_options');

$options_file = $backup_path . '/theme-options.json';
file_put_contents($options_file, json_encode($theme_options, JSON_PRETTY_PRINT));
echo "✅ Options du thème sauvegardées : " . $options_file . "<br>";

// 6. CRÉER UN FICHIER README AVEC LES INSTRUCTIONS
echo "<h3>📋 6. Création du guide de migration...</h3>";

$readme_content = "# Guide de Migration WordPress - MDMC Music Ads

## Contenu du backup
- **database-backup.sql** : Base de données complète
- **theme-mdmc-new/** : Thème personnalisé MDMC
- **uploads/** : Tous les médias et images
- **active-plugins.txt** : Liste des plugins actifs
- **theme-options.json** : Options et personnalisations du thème

## Instructions de migration

### 1. Préparation du nouveau serveur
- WordPress doit être installé sur le nouveau serveur
- Créer une base de données vide
- Noter les informations de connexion (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)

### 2. Import de la base de données
```bash
mysql -h [DB_HOST] -u [DB_USER] -p [DB_NAME] < database-backup.sql
```

### 3. Upload des fichiers
- Copier le dossier `theme-mdmc-new/` vers `wp-content/themes/`
- Copier le dossier `uploads/` vers `wp-content/uploads/`

### 4. Configuration WordPress
- Modifier `wp-config.php` avec les nouvelles informations de base de données
- Mettre à jour les URLs dans la base de données :
```sql
UPDATE wp_options SET option_value = REPLACE(option_value, 'https://blog-wp-production.up.railway.app', 'https://nouveau-domaine.com');
UPDATE wp_posts SET guid = REPLACE(guid, 'https://blog-wp-production.up.railway.app', 'https://nouveau-domaine.com');
UPDATE wp_posts SET post_content = REPLACE(post_content, 'https://blog-wp-production.up.railway.app', 'https://nouveau-domaine.com');
```

### 5. Activation du thème
- Aller dans Apparence > Thèmes
- Activer le thème 'MDMC Theme New'

### 6. Import des options du thème
- Utiliser un plugin comme 'Customizer Export/Import' ou
- Restaurer manuellement les options depuis theme-options.json

### 7. Installation des plugins
- Installer et activer les plugins listés dans active-plugins.txt

## Notes importantes
- Sauvegarder avant toute modification
- Tester sur un environnement de développement d'abord
- Vérifier les permissions des fichiers uploadés
- Mettre à jour les liens internes si nécessaire

## Support
En cas de problème, vérifier :
- Les permissions des dossiers (755 pour les dossiers, 644 pour les fichiers)
- La configuration de la base de données
- Les logs d'erreur PHP et MySQL
";

$readme_file = $backup_path . '/README-MIGRATION.md';
file_put_contents($readme_file, $readme_content);
echo "✅ Guide de migration créé : " . $readme_file . "<br>";

// 7. CRÉER UNE ARCHIVE ZIP
echo "<h3>📦 7. Création de l'archive ZIP...</h3>";

$zip_file = ABSPATH . $backup_dir . '.zip';
$zip = new ZipArchive();

if ($zip->open($zip_file, ZipArchive::CREATE) === TRUE) {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($backup_path),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if (!$file->isDir()) {
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($backup_path) + 1);
            $zip->addFile($filePath, $relativePath);
        }
    }
    
    $zip->close();
    echo "✅ Archive ZIP créée : " . $zip_file . "<br>";
} else {
    echo "❌ Erreur lors de la création de l'archive ZIP<br>";
}

// 8. AFFICHER LE RÉSUMÉ
echo "<h3>🎯 Résumé du backup</h3>";
echo "<p><strong>Dossier de backup :</strong> " . $backup_path . "</p>";
echo "<p><strong>Archive ZIP :</strong> " . $zip_file . "</p>";
echo "<p><strong>Taille du backup :</strong> " . round(filesize($zip_file) / 1024 / 1024, 2) . " MB</p>";

echo "<h3>✅ Backup terminé avec succès !</h3>";
echo "<p>Vous pouvez maintenant télécharger l'archive ZIP et procéder à la migration sur votre nouveau serveur.</p>";
echo "<p><a href='" . $backup_dir . '.zip' . "' download>📥 Télécharger l'archive ZIP</a></p>";

?> 