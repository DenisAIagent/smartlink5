-- 🔄 SCRIPT DE MIGRATION DES URLS WORDPRESS
-- À exécuter dans phpMyAdmin Railway ou MySQL client

-- 1. Sauvegarde des URLs actuelles (pour rollback si nécessaire)
CREATE TABLE IF NOT EXISTS backup_urls_migration AS
SELECT option_name, option_value FROM wp_options 
WHERE option_name IN ('home', 'siteurl');

-- 2. Mise à jour des URLs principales
UPDATE wp_options 
SET option_value = 'https://blog.mdmcmusicads.com' 
WHERE option_name = 'home';

UPDATE wp_options 
SET option_value = 'https://blog.mdmcmusicads.com' 
WHERE option_name = 'siteurl';

-- 3. Mise à jour du contenu des posts
UPDATE wp_posts 
SET post_content = REPLACE(post_content, 'https://blog-wp-production.up.railway.app', 'https://blog.mdmcmusicads.com');

-- 4. Mise à jour des excerpts
UPDATE wp_posts 
SET post_excerpt = REPLACE(post_excerpt, 'https://blog-wp-production.up.railway.app', 'https://blog.mdmcmusicads.com');

-- 5. Mise à jour des commentaires
UPDATE wp_comments 
SET comment_content = REPLACE(comment_content, 'https://blog-wp-production.up.railway.app', 'https://blog.mdmcmusicads.com');

-- 6. Mise à jour des métadonnées
UPDATE wp_postmeta 
SET meta_value = REPLACE(meta_value, 'https://blog-wp-production.up.railway.app', 'https://blog.mdmcmusicads.com');

-- 7. Mise à jour des options de thème (liens dans customizer, etc.)
UPDATE wp_options 
SET option_value = REPLACE(option_value, 'https://blog-wp-production.up.railway.app', 'https://blog.mdmcmusicads.com')
WHERE option_value LIKE '%https://blog-wp-production.up.railway.app%';

-- 8. Vérification finale
SELECT 'Vérification URLs principales:' as status;
SELECT option_name, option_value FROM wp_options WHERE option_name IN ('home', 'siteurl');

SELECT 'Migration terminée!' as status;

-- POUR ROLLBACK EN CAS DE PROBLÈME, EXÉCUTER :
-- UPDATE wp_options SET option_value = 'https://blog-wp-production.up.railway.app' WHERE option_name = 'home';
-- UPDATE wp_options SET option_value = 'https://blog-wp-production.up.railway.app' WHERE option_name = 'siteurl';