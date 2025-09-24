# 🔧 GUIDE DE MAINTENANCE FLOW-COLI

## 📋 **VÉRIFICATIONS RÉGULIÈRES**

### **🔍 Diagnostic Hebdomadaire**

Allez sur `/test` → Onglet "Debug Conversations" et vérifiez :

- ✅ **Profiles Table** : Pas d'erreur, noms cohérents
- ✅ **Conversations Table** : Relations correctes
- ✅ **Messages Table** : Pas de messages orphelins
- ✅ **Relations Test** : Jointures fonctionnelles

### **🧹 Nettoyage Mensuel**

Exécutez dans Supabase SQL Editor :

```sql
-- Nettoyage automatique des données obsolètes
DELETE FROM messages WHERE created_at < NOW() - INTERVAL '6 months';
DELETE FROM conversations WHERE created_at < NOW() - INTERVAL '6 months' AND 
  (SELECT COUNT(*) FROM messages WHERE conversation_id = conversations.id) = 0;
```

---

## ⚠️ **SIGNAUX D'ALERTE**

### **🚨 Problèmes à surveiller :**

1. **Navbar disparaît** → Vérifier structure des routes
2. **Noms "Jean Dupont"** → Exécuter cleanup-test-data.sql
3. **Messages ne s'envoient pas** → Vérifier ConversationContext
4. **Pages lentes** → Optimiser les requêtes SQL
5. **Erreurs 400** → Vérifier migration-fix.sql

### **🔧 Actions correctives :**

| Problème | Solution Rapide | Solution Complète |
|----------|-----------------|-------------------|
| **Navbar manquante** | Redémarrer l'app | Vérifier App.tsx routes |
| **Conversations bugées** | `/test` → Debug | cleanup-test-data.sql |
| **Données corrompues** | Nettoyage manuel | Migration complète |
| **Performances lentes** | Cache browser | Optimiser requêtes |

---

## 🚀 **BONNES PRATIQUES**

### **📊 Monitoring continu :**

- **Utilisez** `/test` pour diagnostic régulier
- **Surveillez** les logs de la console
- **Vérifiez** les performances Supabase
- **Testez** les nouvelles fonctionnalités

### **🔒 Sécurité des données :**

- **Sauvegardez** avant migrations importantes
- **Testez** sur environnement de dev d'abord
- **Documentez** tous les changements
- **Gardez** les scripts de nettoyage à jour

### **⚡ Performance :**

- **Limitez** les requêtes complexes
- **Utilisez** la pagination pour les listes
- **Optimisez** les images et assets
- **Surveillez** l'usage de la bande passante

---

## 📈 **ÉVOLUTION ET AMÉLIORATIONS**

### **🔄 Mises à jour régulières :**

1. **Supabase** : Vérifier les nouvelles fonctionnalités
2. **React/TypeScript** : Maintenir les dépendances
3. **Flow-Coli** : Ajouter de nouvelles étapes si besoin
4. **UI/UX** : Améliorer l'expérience utilisateur

### **📊 Métriques à suivre :**

- **Temps de chargement** des pages
- **Taux d'erreur** des conversations
- **Utilisation** des fonctionnalités Flow-Coli
- **Satisfaction** utilisateur

---

## 🆘 **PROCÉDURE D'URGENCE**

### **En cas de panne majeure :**

1. **Diagnostic immédiat** : `/test` → Tous les onglets
2. **Vérification DB** : Supabase dashboard
3. **Rollback** : Version précédente si nécessaire
4. **Communication** : Informer les utilisateurs
5. **Correction** : Appliquer les fixes
6. **Test complet** : Vérifier toutes les fonctionnalités

### **Scripts de récupération :**

```sql
-- Récupération d'urgence
-- 1. Réinitialiser les conversations
UPDATE conversations SET unread_count = 0;

-- 2. Nettoyer les messages orphelins
DELETE FROM messages WHERE conversation_id NOT IN (SELECT id FROM conversations);

-- 3. Corriger les profils
UPDATE profiles SET full_name = SPLIT_PART(email, '@', 1) WHERE full_name IS NULL OR full_name = '';
```

---

## 📞 **CONTACTS ET RESSOURCES**

### **Documentation :**
- `GUIDE-FLOW-COLI.md` : Guide utilisateur complet
- `PROBLEMES-RESOLUS.md` : Solutions aux problèmes courants
- `INTEGRATION-COMPLETE.md` : État de l'intégration

### **Scripts utiles :**
- `migration-fix.sql` : Migration principale
- `cleanup-test-data.sql` : Nettoyage des données
- `/test` : Diagnostic intégré

### **Outils de monitoring :**
- Supabase Dashboard
- Browser DevTools
- Page `/test` avec diagnostic

---

**🎯 Avec ce guide, votre application Flow-Coli restera stable et performante !** 🚀✨
