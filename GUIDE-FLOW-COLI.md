# 🚀 GUIDE COMPLET FLOW-COLI

## 📖 **INTRODUCTION**

Félicitations ! Votre application Coli a été transformée en une marketplace de niveau professionnel avec l'architecture **Flow-Coli**. Ce guide vous explique comment utiliser toutes les nouvelles fonctionnalités.

---

## 🎯 **ÉTAPES POUR COMMENCER**

### **1. 🗄️ MIGRATION DE LA BASE DE DONNÉES**

**OBLIGATOIRE** - Exécutez d'abord le script SQL dans Supabase :

```sql
-- Copiez tout le contenu de migration-fix.sql dans Supabase SQL Editor
-- Puis cliquez sur "Run"
```

### **2. 🚀 DÉMARRER L'APPLICATION**

```bash
npm run dev
```

### **3. 🧪 ACCÉDER À LA PAGE DE TEST**

```
http://localhost:5173/test
```

---

## 🔑 **NOUVELLES FONCTIONNALITÉS**

### **🛡️ 1. VÉRIFICATION D'IDENTITÉ (KYC)**

#### **Où l'utiliser :**
- Page Profil → Onglet "Vérification KYC"
- Obligatoire pour utiliser Flow-Coli

#### **Comment procéder :**
1. Allez sur `/profile`
2. Cliquez sur l'onglet "Vérification KYC"
3. Suivez les 4 étapes :
   - **Étape 1** : Type de document (CNI/Passeport)
   - **Étape 2** : Photo recto du document
   - **Étape 3** : Photo verso (si nécessaire)
   - **Étape 4** : Selfie avec le document

#### **Statuts possibles :**
- 🟡 **En attente** : Document soumis, en cours de vérification
- 🟢 **Vérifié** : Identité confirmée, accès complet
- 🔴 **Rejeté** : Document non conforme, à refaire

---

### **🚀 2. FLOW-COLI (WORKFLOW 8 ÉTAPES)**

#### **Déclenchement :**
- Cliquez sur le bouton **"🚀 Flow-Coli"** sur une annonce active
- Remplace l'ancien bouton "Prendre"

#### **Les 8 étapes du Flow-Coli :**

1. **📦 Création** - Annonce publiée
2. **🔒 Sécurisation** - GP sélectionné, receveur défini
3. **🏠 Espace privé** - Zone sécurisée créée
4. **💳 Paiement** - Escrow activé
5. **📋 Récupération** - GP récupère le colis
6. **🚛 Transport** - Colis en transit
7. **📍 Livraison** - Remise au receveur
8. **✅ Finalisation** - Transaction terminée

#### **Rôles et responsabilités :**
- **Expéditeur** : Initie, paie, valide la récupération
- **GP (Grand Porteur)** : Transporte, valide chaque étape
- **Receveur** : Confirme la réception

---

### **💳 3. SYSTÈME DE PAIEMENT ESCROW**

#### **Fonctionnement :**
- Les fonds sont bloqués jusqu'à la livraison
- Commission automatique de 10%
- Remboursement possible en cas de problème

#### **Méthodes de paiement :**
- 📱 **Mobile Money** : Orange Money, Wave
- 💳 **Carte bancaire** : Stripe
- 🌐 **PayPal** : Paiements internationaux

#### **Processus :**
1. Montant calculé automatiquement
2. Choix du mode de paiement
3. Paiement sécurisé
4. Fonds en séquestre
5. Libération à la livraison

---

### **🏆 4. BADGES DE CONFIANCE**

#### **Types de badges :**
- ✅ **Identité vérifiée** : KYC complété
- 📱 **Téléphone vérifié** : Numéro confirmé
- ⭐ **Top noté** : Excellente réputation
- 🚛 **Voyageur fréquent** : GP expérimenté
- 📧 **Email vérifié** : Adresse confirmée

#### **Comment les obtenir :**
- Complétez votre profil
- Vérifiez votre identité
- Obtenez de bonnes évaluations
- Effectuez des transactions réussies

---

### **📊 5. DASHBOARD AVANCÉ**

#### **Accès :**
- Page Dashboard avec nouvelles statistiques
- Suivi en temps réel des transactions

#### **Métriques disponibles :**
- Score de confiance (0-100)
- Nombre de transactions
- Taux de réussite
- Note moyenne
- Revenus générés

---

### **⚖️ 6. GESTION DES LITIGES**

#### **Quand l'utiliser :**
- Colis endommagé
- Colis perdu
- Problème de paiement
- Mauvaise communication

#### **Processus :**
1. Ouvrir un litige
2. Fournir des preuves (photos, documents)
3. Arbitrage par l'équipe
4. Résolution et compensation

---

## 🎮 **GUIDE D'UTILISATION PRATIQUE**

### **👤 POUR UN EXPÉDITEUR**

1. **Préparation :**
   - Complétez votre KYC
   - Ajoutez vos informations de paiement

2. **Publier une annonce :**
   - Indiquez origine/destination
   - Spécifiez poids et type de colis
   - Ajoutez 3 photos minimum
   - Définissez le prix

3. **Quand un GP se propose :**
   - Vérifiez son profil et badges
   - Acceptez ou refusez la proposition
   - Le Flow-Coli se déclenche automatiquement

4. **Pendant le transport :**
   - Suivez en temps réel
   - Communiquez via l'espace privé
   - Validez chaque étape

### **🚛 POUR UN GP (GRAND PORTEUR)**

1. **Préparation :**
   - KYC obligatoire
   - Profil complet avec itinéraires

2. **Chercher des annonces :**
   - Filtrez par destination
   - Cliquez sur "🚀 Flow-Coli"
   - Négociez si nécessaire

3. **Pendant la mission :**
   - Récupérez le colis (photos obligatoires)
   - Mettez à jour le statut
   - Livrez au receveur
   - Confirmez la livraison

### **📦 POUR UN RECEVEUR**

1. **Notification :**
   - Vous recevez un SMS/email
   - Accès à l'espace privé

2. **Suivi :**
   - Suivez l'avancement
   - Communiquez avec le GP

3. **Réception :**
   - Vérifiez l'état du colis
   - Confirmez la réception
   - Évaluez le service

---

## 🔧 **RÉSOLUTION DE PROBLÈMES**

### **❌ Erreurs courantes**

#### **"Vérification d'identité requise"**
- **Solution** : Allez sur `/profile` → Onglet KYC
- Complétez les 4 étapes de vérification

#### **"Impossible de démarrer Flow-Coli"**
- **Solution** : Vérifiez que la migration SQL est exécutée
- Allez sur `/test` pour diagnostiquer

#### **"Erreur de paiement"**
- **Solution** : Vérifiez votre méthode de paiement
- Contactez le support si nécessaire

### **🧪 Page de diagnostic**

Allez sur `/test` pour :
- Tester la connexion à la base de données
- Voir des exemples d'annonces avec tous les statuts
- Diagnostiquer les problèmes

---

## 📱 **NAVIGATION DANS L'APPLICATION**

### **🏠 Pages principales**

| Page | URL | Description |
|------|-----|-------------|
| **Accueil** | `/` | Vue d'ensemble |
| **Annonces** | `/annonces` | Liste des annonces |
| **Test** | `/test` | Page de diagnostic |
| **Profil** | `/profile` | Profil + KYC + Badges |
| **Dashboard** | `/dashboard` | Statistiques avancées |
| **Conversations** | `/conversations` | Messages privés |

### **🎯 Nouvelles sections du profil**

1. **Profil** - Informations personnelles
2. **Vérification KYC** - Documents d'identité
3. **Confiance & Badges** - Réputation

---

## 🎉 **AVANTAGES DU FLOW-COLI**

### **🛡️ Pour la sécurité :**
- Identité vérifiée de tous les participants
- Photos obligatoires à chaque étape
- Paiement sécurisé par Escrow
- Double validation des actions importantes

### **💰 Pour l'économie :**
- Commission transparente de 10%
- Paiements automatiques
- Facturation intégrée
- Gestion des remboursements

### **📱 Pour l'expérience :**
- Interface moderne et intuitive
- Notifications en temps réel
- Suivi complet des transactions
- Communication sécurisée

---

## 🚀 **PROCHAINES ÉTAPES**

1. **Exécutez la migration SQL**
2. **Testez sur `/test`**
3. **Complétez votre KYC**
4. **Explorez les nouvelles fonctionnalités**
5. **Publiez votre première annonce Flow-Coli**

---

## 📞 **SUPPORT**

Si vous rencontrez des problèmes :

1. **Diagnostic automatique** : `/test`
2. **Vérifiez la migration SQL**
3. **Consultez ce guide**
4. **Contactez le support technique**

---

**🎯 Votre marketplace Coli est maintenant prête pour révolutionner le transport de colis en Afrique !** 🌍✨
