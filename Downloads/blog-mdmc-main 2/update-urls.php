<?php
/**
 * Script de migration des URLs WordPress
 * À exécuter UNE SEULE FOIS puis supprimer
 */

// Chargement de WordPress
require_once('wp-config.php');
require_once('wp-includes/wp-db.php');

// Connexion à la base de données
$wpdb = new wpdb(DB_USER, DB_PASSWORD, DB_NAME, DB_HOST);

echo "🔄 DÉBUT DE LA MIGRATION DES URLS\n";
echo "================================\n\n";

// Vérification de la connexion DB
if ($wpdb->last_error) {
    die("❌ ERREUR: Impossible de se connecter à la base de données\n" . $wpdb->last_error);
}

echo "✅ Connexion à la base de données réussie\n";

// Ancienne et nouvelle URL
$old_url = 'https://blog-wp-production.up.railway.app';
$new_url = 'https://blog.mdmcmusicads.com';

echo "📝 Ancien domaine: $old_url\n";
echo "📝 Nouveau domaine: $new_url\n\n";

// 1. Mise à jour des options principales
echo "1️⃣ Mise à jour wp_options...\n";

$home_updated = $wpdb->update(
    $wpdb->prefix . 'options',
    array('option_value' => $new_url),
    array('option_name' => 'home')
);

$siteurl_updated = $wpdb->update(
    $wpdb->prefix . 'options',
    array('option_value' => $new_url),
    array('option_name' => 'siteurl')
);

if ($home_updated !== false && $siteurl_updated !== false) {
    echo "   ✅ URLs home et siteurl mises à jour\n";
} else {
    echo "   ❌ Erreur lors de la mise à jour des options\n";
    if ($wpdb->last_error) {
        echo "   Erreur: " . $wpdb->last_error . "\n";
    }
}

// 2. Mise à jour du contenu des posts
echo "2️⃣ Mise à jour contenu posts...\n";

$posts_updated = $wpdb->query($wpdb->prepare("
    UPDATE {$wpdb->prefix}posts 
    SET post_content = REPLACE(post_content, %s, %s)
", $old_url, $new_url));

echo "   ✅ $posts_updated posts mis à jour\n";

// 3. Mise à jour des excerpts
$excerpts_updated = $wpdb->query($wpdb->prepare("
    UPDATE {$wpdb->prefix}posts 
    SET post_excerpt = REPLACE(post_excerpt, %s, %s)
", $old_url, $new_url));

echo "   ✅ $excerpts_updated excerpts mis à jour\n";

// 4. Mise à jour des commentaires
echo "3️⃣ Mise à jour commentaires...\n";

$comments_updated = $wpdb->query($wpdb->prepare("
    UPDATE {$wpdb->prefix}comments 
    SET comment_content = REPLACE(comment_content, %s, %s)
", $old_url, $new_url));

echo "   ✅ $comments_updated commentaires mis à jour\n";

// 5. Mise à jour des méta données
echo "4️⃣ Mise à jour métadonnées...\n";

$postmeta_updated = $wpdb->query($wpdb->prepare("
    UPDATE {$wpdb->prefix}postmeta 
    SET meta_value = REPLACE(meta_value, %s, %s)
", $old_url, $new_url));

echo "   ✅ $postmeta_updated métadonnées posts mises à jour\n";

// 6. Vérification finale
echo "\n5️⃣ Vérification finale...\n";

$home_check = $wpdb->get_var("SELECT option_value FROM {$wpdb->prefix}options WHERE option_name = 'home'");
$siteurl_check = $wpdb->get_var("SELECT option_value FROM {$wpdb->prefix}options WHERE option_name = 'siteurl'");

echo "   Home URL: $home_check\n";
echo "   Site URL: $siteurl_check\n";

if ($home_check === $new_url && $siteurl_check === $new_url) {
    echo "\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS!\n";
    echo "================================\n";
    echo "✅ Toutes les URLs ont été mises à jour\n";
    echo "🌐 Votre site est maintenant accessible sur: $new_url\n";
    echo "🗑️  IMPORTANT: Supprimez ce fichier update-urls.php par sécurité\n";
} else {
    echo "\n❌ ERREUR: Les URLs principales n'ont pas été correctement mises à jour\n";
    echo "Vérifiez manuellement la base de données\n";
}

echo "\n📊 RÉSUMÉ:\n";
echo "- Options: " . ($home_updated !== false ? "✅" : "❌") . "\n";
echo "- Posts: $posts_updated mis à jour\n";
echo "- Excerpts: $excerpts_updated mis à jour\n";
echo "- Commentaires: $comments_updated mis à jour\n";
echo "- Métadonnées: $postmeta_updated mises à jour\n";

?>