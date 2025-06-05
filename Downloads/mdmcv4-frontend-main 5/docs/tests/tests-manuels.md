# Guide de Tests Manuels - Intégrations

## Prérequis
- Application en mode développement
- Navigateur web (Chrome/Firefox recommandé)
- Console développeur ouverte

## 1. Tests de Connexion

### Test 1.1 : Connexion à une plateforme
1. Accédez à la page des intégrations
2. Vérifiez que la liste des plateformes s'affiche correctement
3. Sélectionnez une plateforme
4. Remplissez le formulaire de connexion avec des données de test :
   - URL : `https://test-platform.example.com`
   - Clé API : `test-api-key`
   - Secret API : `test-api-secret`
5. Cliquez sur "Connecter"
6. Vérifiez que :
   - Le statut passe à "Connecté"
   - Un message de succès s'affiche
   - Les logs montrent une connexion réussie

### Test 1.2 : Déconnexion d'une plateforme
1. Sélectionnez une plateforme connectée
2. Cliquez sur "Déconnecter"
3. Confirmez la déconnexion
4. Vérifiez que :
   - Le statut passe à "Déconnecté"
   - Un message de succès s'affiche
   - Les logs montrent une déconnexion réussie

## 2. Tests des Webhooks

### Test 2.1 : Création d'un webhook
1. Sélectionnez une plateforme connectée
2. Accédez à l'onglet "Webhooks"
3. Cliquez sur "Ajouter un webhook"
4. Remplissez le formulaire :
   - URL : `https://votre-app.example.com/webhook`
   - Événements : sélectionnez "event.created"
   - Format : JSON
5. Cliquez sur "Créer"
6. Vérifiez que :
   - Le webhook apparaît dans la liste
   - Le statut est "Actif"
   - Les logs montrent une création réussie

### Test 2.2 : Modification d'un webhook
1. Sélectionnez un webhook existant
2. Cliquez sur "Modifier"
3. Modifiez l'URL ou les événements
4. Cliquez sur "Enregistrer"
5. Vérifiez que les modifications sont appliquées

### Test 2.3 : Suppression d'un webhook
1. Sélectionnez un webhook
2. Cliquez sur "Supprimer"
3. Confirmez la suppression
4. Vérifiez que le webhook est retiré de la liste

## 3. Tests de Synchronisation

### Test 3.1 : Synchronisation manuelle
1. Sélectionnez une plateforme connectée
2. Accédez à l'onglet "Synchronisation"
3. Choisissez un type de données
4. Cliquez sur "Synchroniser"
5. Vérifiez que :
   - La progression s'affiche
   - Les données sont synchronisées
   - Les logs montrent une synchronisation réussie

### Test 3.2 : Synchronisation automatique
1. Configurez une synchronisation automatique :
   - Fréquence : toutes les heures
   - Types de données : tous
2. Activez la synchronisation
3. Attendez la première synchronisation
4. Vérifiez les logs et les données

## 4. Tests des Logs

### Test 4.1 : Consultation des logs
1. Accédez à l'onglet "Logs"
2. Testez les filtres :
   - Par plateforme
   - Par niveau (info, warning, error)
   - Par période
3. Vérifiez que les logs s'affichent correctement

### Test 4.2 : Analyse des erreurs
1. Forcez une erreur (ex: déconnexion réseau)
2. Vérifiez que l'erreur est enregistrée
3. Consultez les détails de l'erreur
4. Vérifiez les recommandations de résolution

## 5. Tests de Performance

### Test 5.1 : Charge de webhooks
1. Créez 10 webhooks différents
2. Vérifiez que :
   - L'interface reste réactive
   - Les webhooks fonctionnent correctement
   - Les performances sont acceptables

### Test 5.2 : Synchronisation de masse
1. Configurez une synchronisation avec beaucoup de données
2. Vérifiez que :
   - La progression s'affiche correctement
   - L'interface reste réactive
   - Les données sont correctement synchronisées

## 6. Tests de Sécurité

### Test 6.1 : Validation des entrées
1. Testez des entrées invalides :
   - URL mal formée
   - Clés API invalides
   - Caractères spéciaux
2. Vérifiez que les erreurs sont gérées correctement

### Test 6.2 : Gestion des tokens
1. Vérifiez que les tokens sont stockés de manière sécurisée
2. Testez la déconnexion et reconnexion
3. Vérifiez que les anciens tokens sont invalidés

## Points à Vérifier

### Interface Utilisateur
- [ ] Les formulaires sont clairs et intuitifs
- [ ] Les messages d'erreur sont explicites
- [ ] Les confirmations sont demandées pour les actions importantes
- [ ] L'interface est responsive

### Performance
- [ ] Les temps de chargement sont acceptables
- [ ] L'interface reste réactive pendant les opérations longues
- [ ] Les données sont mises en cache efficacement

### Sécurité
- [ ] Les données sensibles sont masquées
- [ ] Les tokens sont gérés de manière sécurisée
- [ ] Les validations sont effectuées côté client et serveur

### Logs et Monitoring
- [ ] Les logs sont clairs et compréhensibles
- [ ] Les erreurs sont correctement enregistrées
- [ ] Les statistiques sont à jour

## Rapport de Test

Pour chaque test effectué, notez :
1. La date et l'heure du test
2. Le résultat (succès/échec)
3. Les éventuels problèmes rencontrés
4. Les suggestions d'amélioration 