<?php
/**
 * Script de nettoyage cache WordPress après migration
 * À exécuter après la migration des URLs
 */

// Chargement minimal de WordPress
define('WP_USE_THEMES', false);
require_once('wp-config.php');
require_once('wp-load.php');

echo "🧹 NETTOYAGE CACHE POST-MIGRATION\n";
echo "================================\n\n";

// 1. Nettoyage cache objet WordPress
if (function_exists('wp_cache_flush')) {
    if (wp_cache_flush()) {
        echo "✅ Cache objet WordPress vidé\n";
    } else {
        echo "⚠️  Cache objet non disponible ou déjà vide\n";
    }
}

// 2. Nettoyage transients WordPress
global $wpdb;
$transients_deleted = $wpdb->query("
    DELETE FROM {$wpdb->options} 
    WHERE option_name LIKE '_transient_%' 
    OR option_name LIKE '_site_transient_%'
");
echo "✅ $transients_deleted transients supprimés\n";

// 3. Forcer mise à jour rewrite rules
flush_rewrite_rules(true);
echo "✅ Règles de réécriture mises à jour\n";

// 4. Nettoyage cache des widgets
if (function_exists('wp_cache_delete')) {
    wp_cache_delete('alloptions', 'options');
    echo "✅ Cache des options WordPress vidé\n";
}

// 5. Forcer rechargement des options
wp_cache_delete('home', 'options');
wp_cache_delete('siteurl', 'options');
echo "✅ Cache des URLs forcé à se recharger\n";

// 6. Mise à jour robots.txt virtual
update_option('blog_public', get_option('blog_public'));
echo "✅ Configuration SEO rafraîchie\n";

// 7. Vérification finale des URLs
$home_url = get_option('home');
$site_url = get_option('siteurl');

echo "\n🔍 VÉRIFICATION POST-NETTOYAGE:\n";
echo "   Home URL: $home_url\n";
echo "   Site URL: $site_url\n";

if (strpos($home_url, 'blog.mdmcmusicads.com') !== false && 
    strpos($site_url, 'blog.mdmcmusicads.com') !== false) {
    echo "\n🎉 MIGRATION RÉUSSIE!\n";
    echo "✅ URLs correctement configurées\n";
    echo "✅ Cache vidé avec succès\n";
    echo "\n🌐 Votre site est prêt sur: https://blog.mdmcmusicads.com\n";
} else {
    echo "\n⚠️  ATTENTION: URLs non mises à jour correctement\n";
    echo "Vérifiez la base de données\n";
}

echo "\n📝 PROCHAINES ÉTAPES:\n";
echo "1. Testez l'accès à: https://blog.mdmcmusicads.com\n";
echo "2. Vérifiez l'admin: https://blog.mdmcmusicads.com/wp-admin/\n";
echo "3. Supprimez ce script par sécurité\n";
echo "4. Retirez RELOCATE=true du wp-config.php\n";

?>