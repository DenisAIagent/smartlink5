# 🔄 INSTRUCTIONS DE MIGRATION WORDPRESS

## ✅ ÉTAPES DÉJÀ RÉALISÉES

1. **✅ wp-config.php modifié** avec les nouvelles URLs
2. **✅ Scripts SQL et PHP créés** pour la migration
3. **✅ Script de nettoyage cache préparé**

## 🚀 ÉTAPES À SUIVRE MAINTENANT

### 1️⃣ EXÉCUTER LE SCRIPT SQL (OBLIGATOIRE)

**Connectez-vous à phpMyAdmin Railway** et exécutez le fichier `migration-urls.sql` :

```sql
-- Copiez-collez tout le contenu de migration-urls.sql
-- dans l'onglet SQL de phpMyAdmin
```

**OU via ligne de commande Railway :**
```bash
# Si vous avez accès au terminal Railway
mysql -h mysql.railway.internal -u root -p railway < migration-urls.sql
```

### 2️⃣ EXÉCUTER LE NETTOYAGE CACHE

**Via navigateur** : `https://blog.mdmcmusicads.com/clear-cache.php`

**OU via Railway terminal :**
```bash
php clear-cache.php
```

### 3️⃣ FINALISATION

1. **Testez l'accès** : https://blog.mdmcmusicads.com
2. **Vérifiez l'admin** : https://blog.mdmcmusicads.com/wp-admin/
3. **Supprimez les scripts** par sécurité :
   - `update-urls.php`
   - `clear-cache.php` 
   - `migration-urls.sql`

### 4️⃣ OPTIMISATION POST-MIGRATION

Retirez la ligne RELOCATE du wp-config.php :
```php
// Supprimez ou commentez cette ligne après migration réussie
// define( 'RELOCATE', true );
```

## 🆘 EN CAS DE PROBLÈME

### Rollback d'urgence dans wp-config.php :
```php
define( 'WP_HOME', 'https://blog-wp-production.up.railway.app' );
define( 'WP_SITEURL', 'https://blog-wp-production.up.railway.app' );
// define( 'RELOCATE', true ); // Commentez cette ligne
```

### Rollback base de données :
```sql
UPDATE wp_options SET option_value = 'https://blog-wp-production.up.railway.app' WHERE option_name = 'home';
UPDATE wp_options SET option_value = 'https://blog-wp-production.up.railway.app' WHERE option_name = 'siteurl';
```

## 📊 STATUT ACTUEL

- ✅ Configuration wp-config.php : TERMINÉE
- ⏳ Migration base de données : **À FAIRE**
- ⏳ Nettoyage cache : **À FAIRE**
- ⏳ Tests finaux : **À FAIRE**

**PROCHAINE ACTION CRITIQUE :** Exécuter `migration-urls.sql` dans phpMyAdmin Railway