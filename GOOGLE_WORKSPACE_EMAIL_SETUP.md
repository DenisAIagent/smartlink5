# Configuration Email Google Workspace - Guide Complet

## ✅ État Actuel
La configuration email a été préparée dans le fichier backend `.env` avec les paramètres Google Workspace.

## 🔧 Prochaines Étapes Obligatoires

### 1. Configuration du Compte Email `noreply@mdmcmusicads.com`

#### Option A - Utiliser un Alias (Recommandé) 🎯

**Étape 1 - Créer un alias :**
- Connectez-vous à votre console Google Workspace Admin
- Allez dans **Utilisateurs** > **Gérer les utilisateurs**
- Sélectionnez un utilisateur existant (ex: votre compte principal)
- Cliquez sur **Informations utilisateur** > **Alias d'e-mail**
- Ajoutez l'alias `contact@mdmcmusicads.com`

**Étape 2 - Configurer l'authentification :**
- Connectez-vous au compte principal qui a l'alias
- Activez la 2FA si ce n'est pas déjà fait
- Générez un mot de passe d'application pour "Mail"

**Étape 3 - Utiliser les identifiants du compte principal :**
- `EMAIL_USER` = compte principal (ex: `denis@mdmcmusicads.com`)
- `EMAIL_FROM` = alias (ex: `contact@mdmcmusicads.com`)
- `EMAIL_PASSWORD` = mot de passe d'application du compte principal

#### Option B - Créer un Compte Dédié

**Étape 1 - Créer le compte :**
- Connectez-vous à votre console Google Workspace Admin
- Allez dans **Utilisateurs** > **Gérer les utilisateurs**
- Créez le compte `noreply@mdmcmusicads.com` avec un mot de passe temporaire

**Étape 2 - Activer l'authentification à deux facteurs :**
- Connectez-vous au compte `noreply@mdmcmusicads.com`
- Allez dans **Sécurité** > **Authentification à deux facteurs**
- Activez la 2FA avec votre téléphone

**Étape 3 - Générer un mot de passe d'application :**
- Toujours connecté au compte `noreply@mdmcmusicads.com`
- Allez dans **Sécurité** > **Authentification à deux facteurs**
- Cliquez sur **Mots de passe des applications**
- Générez un nouveau mot de passe pour "Mail"
- **IMPORTANT:** Copiez ce mot de passe (16 caractères), vous ne pourrez plus le voir

### 2. Mettre à Jour le Fichier `.env` du Backend

#### Si vous utilisez un alias (Option A) :
Modifiez ces lignes dans `/backend/.env` :
```env
EMAIL_USER=denis@mdmcmusicads.com
EMAIL_PASSWORD=your_actual_16_character_app_password
EMAIL_FROM=contact@mdmcmusicads.com
```

#### Si vous utilisez un compte dédié (Option B) :
Modifiez cette ligne dans `/backend/.env` :
```env
EMAIL_PASSWORD=your_actual_16_character_app_password
```

### 3. Redémarrer le Backend

Après avoir mis à jour le mot de passe :
```bash
cd backend
npm restart
# ou redémarrez votre service Railway
```

## 📧 Configuration Complète

Voici la configuration email complète qui sera utilisée :

```env
# Configuration Email Google Workspace
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@mdmcmusicads.com
EMAIL_PASSWORD=your_actual_16_character_app_password
EMAIL_FROM=noreply@mdmcmusicads.com
EMAIL_FROM_NAME=MDMC Music Ads
EMAIL_SECURE=true

# Email de réception pour le simulateur
SIMULATOR_RECIPIENT_EMAIL=contact@mdmcmusicads.com
```

## 🧪 Test de Configuration

Une fois configuré, vous pouvez tester :

1. **Test du système de mot de passe oublié :**
   - Allez sur `/admin/forgot-password`
   - Entrez votre email admin
   - Vérifiez que vous recevez l'email de réinitialisation

2. **Test du simulateur :**
   - Utilisez le simulateur sur le site
   - Vérifiez que l'email arrive à `contact@mdmcmusicads.com`

## 🚨 Sécurité

- Le mot de passe d'application Google est différent du mot de passe du compte
- Il est spécifiquement généré pour les applications tierces
- Vous pouvez le révoquer à tout moment depuis Google Workspace
- Ne partagez jamais ce mot de passe

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que la 2FA est activée
2. Vérifiez que le mot de passe d'application est correct
3. Vérifiez les logs du backend pour les erreurs SMTP
4. Contactez le support Google Workspace si nécessaire

---

**Prochaine étape :** Générez le mot de passe d'application Google et mettez à jour le fichier `.env` backend.