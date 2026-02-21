# 🏢 Configuration du Showroom - Guide Complet

## ✅ Implémentation Complète

Votre showroom est maintenant intégré partout dans l'application !

---

## 📋 Qu'Est-ce Qui a Été Fixé

### 1. **Sauvegarde de la Configuration**
- ✅ Problème de sauvegarde corrigé avec opération UPSERT
- ✅ La configuration se sauvegarde maintenant correctement
- ✅ Logo et informations sont persistants

### 2. **Intégration Complète du Logo**
Le logo de votre showroom s'affiche maintenant sur:
- 🔐 **Page de Connexion** - Logo et nom du showroom
- 📱 **Sidebar** - Logo et nom en haut + infos en bas
- 🖨️ **Factures d'Achat** - Logo et infos complètes
- 📄 **Invoices Personnalisées** - Logo draggable et éditable

### 3. **Informations Affichées Partout**
- **Nom du showroom** - Sur la connexion et la sidebar
- **Logo** - Sur tous les documents et interfaces
- **Slogan** - Sur la page de connexion
- **Adresse** - Sur les factures
- **Contact** (Facebook, Instagram, WhatsApp) - Sur les factures

---

## 🔧 Comment Utiliser

### Étape 1: Aller à la Configuration
1. Cliquez sur le bouton **⚙️ Configuration** en bas de la sidebar
2. Sélectionnez l'onglet **Boutique** 🏪

### Étape 2: Changer le Logo
1. Cliquez sur la zone du logo (avec le logo actuel ou l'icône 🏎️)
2. Sélectionnez une image de votre ordinateur
3. L'aperçu s'affiche immédiatement

### Étape 3: Modifier les Informations
Remplissez les champs:
- **Nom Commercial** - Nom de votre showroom
- **Slogan Publicitaire** - Votre slogan/tagline
- **Localisation Showroom** - Adresse complète
- **Facebook** - URL du profil Facebook
- **Instagram** - Handle Instagram
- **WhatsApp** - Numéro WhatsApp

### Étape 4: Sauvegarder
Cliquez sur le bouton **Synchroniser le Showroom 💎**

**Vérification**: Un message de confirmation s'affiche

---

## 📊 Où Vos Données Apparaissent

### Sur la Connexion
```
╔═══════════════════════╗
║    [Logo Showroom]    ║
║   MON SHOWROOM NOM    ║
║  Excellence Automobile│
╚═══════════════════════╝
```

### Sur la Sidebar
```
┌─────────────────────┐
│ [Logo] MON SHOWROOM │  ← En haut
├─────────────────────┤
│ Dashboard           │
│ Showroom            │
│ Achat               │
│ ... (menu items)    │
├─────────────────────┤
│ Votre Showroom      │ ← En bas
│ MON SHOWROOM NOM    │
│ [Logo]              │
│ ⚙️ Configuration    │
└─────────────────────┘
```

### Sur les Factures d'Achat
```
┌─────────────────────────────────────┐
│  [Logo] MON SHOWROOM                │
│         Excellence Automobile        │
│         123 Rue de la Paix          │
│                                      │
│                 FACTURE D'ACHAT      │
│                 #VEH12345           │
│                                      │
│  🚗 Informations Véhicule           │
│  Marque & Modèle: Mercedes C300     │
│  ...                                 │
│                                      │
│  ✓ Contrôle de Qualité              │
│  ✓ Feux et phares                   │
│  ✓ Pneus                            │
│  ...                                 │
│                                      │
│  💰 Finances                        │
│  Coût: 15,000,000 DZD               │
│  Prix Vente: 18,000,000 DZD         │
│  Bénéfice: 3,000,000 DZD            │
└─────────────────────────────────────┘
```

### Dans l'Éditeur de Facture Personnalisée
- Tous les éléments sont **draggables**
- Vous pouvez modifier:
  - Position (X, Y)
  - Taille (Largeur, Hauteur)
  - Texte
  - Couleur
  - Police (gras/normal)
  - Taille du texte

---

## 🗄️ Schéma de Base de Données

### Table: `showroom_config`

```sql
CREATE TABLE public.showroom_config (
  id bigint PRIMARY KEY (toujours 1),
  name text,              -- Nom du showroom
  slogan text,            -- Slogan publicitaire
  address text,           -- Adresse complète
  facebook text,          -- Profil Facebook
  instagram text,         -- Handle Instagram
  whatsapp text,          -- Numéro WhatsApp
  logo_data text,         -- Logo en base64
  updated_at timestamp    -- Dernière mise à jour
);
```

---

## 🔐 Configuration des Permissions (RLS)

Les politiques RLS suivantes sont activées:

### 1. Lecture Publique
- Tous les utilisateurs authentifiés peuvent **lire** la configuration
- Cela permet à la connexion d'afficher le logo avant authentification

### 2. Modification Réservée aux Admins
- Seuls les utilisateurs avec `role = 'admin'` peuvent **modifier**
- Seuls les admins peuvent **insérer** de nouvelles configurations

---

## 🆘 Dépannage

### La configuration ne sauvegarde pas
**Vérification:**
1. ✅ Vérifiez que vous êtes connecté en tant qu'**Admin**
2. ✅ Vérifiez que votre profil a `role = 'admin'` en base
3. ✅ Vérifiez que les RLS policies sont correctement appliquées
4. ✅ Ouvrez la console (F12) pour voir les erreurs

**Test Direct en SQL:**
```sql
UPDATE public.showroom_config
SET name = 'Mon Showroom',
    slogan = 'Mon Slogan',
    address = 'Mon Adresse',
    updated_at = now()
WHERE id = 1;

SELECT * FROM public.showroom_config WHERE id = 1;
```

### Le logo ne s'affiche pas
**Causes possibles:**
1. Format d'image non supporté (utilisez JPG, PNG, WebP)
2. Image trop grande (compression recommandée)
3. Base64 invalide en base de données

**Solution:**
1. Récompressez l'image (< 500KB)
2. Réuploadez via l'interface de configuration
3. Vérifiez en F12 que `logo_data` contient une URL valide

### La sauvegarde dit "succès" mais rien ne change
**Cause:** Probablement un problème de cache du navigateur

**Solution:**
1. Appuyez sur **Ctrl+Shift+R** (hard refresh)
2. Videz le cache du navigateur
3. Fermez et rouvrez l'onglet
4. Vérifiez directement en Supabase Dashboard

---

## 📝 Migration SQL Fournie

Un fichier `SHOWROOM_CONFIG_MIGRATION.sql` a été créé avec:
- ✅ Création/mise à jour de la table
- ✅ Ajout de toutes les colonnes manquantes
- ✅ Configuration des RLS policies
- ✅ Insertion de données par défaut
- ✅ Script de vérification

**Pour utiliser:**
1. Ouvrez Supabase Dashboard
2. Allez à **SQL Editor**
3. Collez le contenu de `SHOWROOM_CONFIG_MIGRATION.sql`
4. Cliquez sur **Run** (▶️)
5. Vérifiez que tout s'exécute sans erreur

---

## 🎯 Workflow Complet

### Première Configuration
```
1. Admin se connecte
   ↓
2. Va à ⚙️ Configuration
   ↓
3. Onglet 🏪 Boutique
   ↓
4. Remplit: Nom, Slogan, Adresse
   ↓
5. Ajoute le logo
   ↓
6. Ajoute contacts (Facebook, Instagram, WhatsApp)
   ↓
7. Clique "Synchroniser le Showroom 💎"
   ↓
8. ✅ Configuration sauvegardée
```

### Affichage Utilisateurs
```
1. Nouvel utilisateur visite la page de connexion
   ↓
2. 📱 Voit le logo et nom du showroom
   ↓
3. Se connecte
   ↓
4. 📱 Voit le logo et nom dans la sidebar
   ↓
5. Crée une facture d'achat
   ↓
6. 🖨️ Facture affiche logo, slogan, adresse, contacts
   ↓
7. Peut personnaliser la facture
   ↓
8. Imprime la facture avec toutes les infos
```

---

## 📞 Informations Affichées sur les Factures

| Champ | Affichage | Onde |
|-------|-----------|------|
| Logo | Haut à gauche | Image redimensionnable |
| Nom | Titre principal | 32px gras |
| Slogan | Sous le nom | Petit texte |
| Adresse | Sous le slogan | Petit texte |
| Facebook | Bas du document | Lien cliquable |
| Instagram | Bas du document | Lien cliquable |
| WhatsApp | Bas du document | Lien cliquable |

---

## 🎨 Personnalisation des Factures

Quand vous cliquez **✏️ Personnaliser** sur une facture:

### Éléments Disponibles
- 📸 Logo Showroom (draggable, redimensionnable)
- 🏢 Nom Showroom (éditable, couleur, taille, position)
- 📋 Titre du Document (éditable)
- 🚗 Infos Véhicule (section automatique)
- 🤝 Fournisseur (section automatique)
- ✓ Contrôles de Qualité (avec ✓ et ✕)
- 💰 Résumé Financier (editable)

### Actions
- 🖱️ Drag & Drop pour déplacer
- 🎨 Changer les couleurs
- ⌨️ Éditer le texte
- 📏 Redimensionner
- 🖨️ Imprimer

---

## 🚀 Prochaines Étapes

1. **Testez la Configuration**
   - Changez le nom du showroom
   - Ajoutez un logo
   - Imprimez une facture

2. **Vérifiez l'Affichage**
   - Consultez la page de connexion
   - Vérifiez la sidebar
   - Créez et imprimez une facture

3. **Personnalisez les Factures**
   - Utilisez l'éditeur de facture
   - Positionnez les éléments
   - Ajustez les couleurs

---

## 📚 Fichiers Modifiés

- ✅ `components/Config.tsx` - Sauvegarde fixée
- ✅ `components/Login.tsx` - Affichage du showroom
- ✅ `components/Sidebar.tsx` - Logo et infos en bas
- ✅ `components/Purchase.tsx` - Factures avec showroom
- ✅ `components/InvoiceEditor.tsx` - Éditeur personnalisé
- ✅ `App.tsx` - Récupération et propagation des données
- ✅ `SHOWROOM_CONFIG_MIGRATION.sql` - Migration SQL

---

## ✨ C'est Tout!

Votre showroom est maintenant complètement intégré et fonctionnel! 🎉

Pour toute question, consultez ce guide ou vérifiez les fichiers SQL fournis.
