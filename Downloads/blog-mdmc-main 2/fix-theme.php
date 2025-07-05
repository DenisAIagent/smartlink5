<?php
// Script temporaire pour corriger le thème WordPress
// À supprimer après utilisation

// Charger WordPress
require_once('wp-config.php');
require_once('wp-load.php');

// Vérifier si nous sommes connectés en tant qu'administrateur
if (!current_user_can('switch_themes')) {
    echo "Erreur : Vous devez être connecté en tant qu'administrateur.";
    exit;
}

// Changer le thème vers un thème qui existe
$new_theme = 'mdmc-theme-new'; // ou 'twentytwentyfive' si le thème personnalisé ne fonctionne pas

// Vérifier si le thème existe
if (!wp_get_theme($new_theme)->exists()) {
    $new_theme = 'twentytwentyfive'; // Thème par défaut WordPress
}

// Activer le nouveau thème
switch_theme($new_theme);

echo "Thème changé vers : " . $new_theme . "<br>";
echo "Le site devrait maintenant fonctionner correctement.<br>";
echo "Vous pouvez supprimer ce fichier fix-theme.php après utilisation.";
?> 