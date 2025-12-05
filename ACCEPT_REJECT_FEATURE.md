# Feature: Accept/Reject Actions

## Vue d'ensemble

Cette fonctionnalité ajoute des actions "Accepter" et "Refuser" pour les accords en attente d'approbation (status: PENDING_APPROVAL) sur le tableau de bord principal.

## Modifications apportées

### 1. Nouveau composant: ConfirmationModal (`src/components/ConfirmationModal.tsx`)

Un composant de modal de confirmation réutilisable avec:
- Interface claire et professionnelle
- Support pour différentes couleurs selon l'action (success, error, warning)
- Textes personnalisables (titre, message, boutons)
- Respecte la palette de couleurs BNC (rouge, gris, blanc)

**Props:**
- `open`: booléen pour contrôler la visibilité
- `title`: titre du modal
- `message`: message de confirmation
- `confirmText`: texte du bouton de confirmation (défaut: "Confirmer")
- `cancelText`: texte du bouton d'annulation (défaut: "Annuler")
- `confirmColor`: couleur du bouton de confirmation ('primary' | 'error' | 'success' | 'warning')
- `onConfirm`: callback appelé lors de la confirmation
- `onCancel`: callback appelé lors de l'annulation

### 2. AgreementTable mis à jour (`src/pages/Dashboard/components/AgreementTable.tsx`)

Ajout de:
- Une nouvelle colonne "Actions" avec des boutons icônes
- Boutons "Accepter" (✓ vert) et "Refuser" (✗ rouge) pour les accords PENDING_APPROVAL
- Gestion de l'état du modal de confirmation
- Tooltips pour améliorer l'UX
- Blocage de la propagation des clics pour éviter l'ouverture des détails lors du clic sur les actions

**Nouvelle prop:**
- `onStatusChange?: (agreementId: string, newStatus: AgreementStatus) => void`

### 3. Dashboard mis à jour (`src/pages/Dashboard/Dashboard.tsx`)

Ajout de:
- Handler `handleStatusChange` pour gérer les changements de statut
- Mise à jour des données mock après changement de statut
- Notifications Snackbar pour le feedback utilisateur
- Rafraîchissement automatique des données après modification

## Comportement

### Workflow utilisateur:

1. **Affichage des boutons**: Les boutons "Accepter" et "Refuser" apparaissent uniquement pour les accords avec le statut `PENDING_APPROVAL`

2. **Clic sur un bouton**: 
   - Un modal de confirmation s'affiche
   - Le clic ne déclenche pas l'ouverture des détails de l'accord

3. **Modal de confirmation**:
   - **Pour "Accepter"**: 
     - Titre: "Accepter l'accord"
     - Message: "Êtes-vous sûr de vouloir accepter l'accord [NUMERO] ? Le statut sera changé en 'Valide'."
     - Bouton vert "Accepter"
   - **Pour "Refuser"**:
     - Titre: "Refuser l'accord"
     - Message: "Êtes-vous sûr de vouloir refuser l'accord [NUMERO] ? Le statut sera changé en 'Deleted'."
     - Bouton rouge "Refuser"

4. **Confirmation**:
   - Si confirmé: Le statut de l'accord est mis à jour
     - "Accepter" → statut `ACTIVE` (affiché comme "valide")
     - "Refuser" → statut `TERMINATED` (affiché comme "deleted")
   - Si annulé: Aucune action, le modal se ferme

5. **Feedback**:
   - Une notification Snackbar apparaît en bas à droite
   - Message de succès: "L'accord [NUMERO] a été accepté/refusé avec succès."
   - Message d'erreur en cas de problème

6. **Mise à jour automatique**:
   - Le tableau se rafraîchit automatiquement
   - L'accord disparaît de l'onglet "Pending"
   - L'accord apparaît dans l'onglet correspondant (Active ou Deleted)
   - Les compteurs des onglets sont mis à jour

## Design et couleurs

La fonctionnalité respecte la palette de couleurs BNC:
- **Rouge** (#c62828): Bouton "Refuser" et actions destructives
- **Vert** (#2e7d32): Bouton "Accepter" et actions de confirmation
- **Gris** (#e0e0e0): Bordures et éléments secondaires
- **Blanc**: Arrière-plan des modals et cartes

## Intégration avec le système mock

La fonctionnalité met à jour directement les données mockées:
- Modification du statut dans `mockAgreements`
- Rafraîchissement des requêtes GraphQL
- Mise à jour des compteurs de statuts

## Tests recommandés

### Tests manuels à effectuer:

1. ✅ Vérifier que les boutons apparaissent uniquement pour les accords PENDING_APPROVAL
2. ✅ Tester le clic sur "Accepter" et vérifier le modal
3. ✅ Tester le clic sur "Refuser" et vérifier le modal
4. ✅ Confirmer une acceptation et vérifier:
   - Le statut passe à ACTIVE
   - L'accord disparaît de l'onglet Pending
   - L'accord apparaît dans l'onglet Active
   - Notification de succès affichée
5. ✅ Confirmer un refus et vérifier:
   - Le statut passe à TERMINATED
   - L'accord disparaît de l'onglet Pending
   - L'accord apparaît dans l'onglet Deleted
   - Notification de succès affichée
6. ✅ Annuler une action et vérifier qu'aucune modification n'est effectuée
7. ✅ Vérifier que le clic sur les boutons n'ouvre pas les détails de l'accord
8. ✅ Vérifier le responsive design sur différentes tailles d'écran

## Améliorations futures possibles

- Ajouter une animation lors du changement de statut
- Permettre l'annulation d'une action récente (undo)
- Ajouter des permissions utilisateur pour ces actions
- Intégrer avec une vraie API backend au lieu des mocks
- Ajouter des logs d'audit pour tracer les changements de statut
- Permettre d'ajouter un commentaire lors du refus

## Notes techniques

- Utilise React Hooks (useState) pour la gestion d'état locale
- Compatible avec TypeScript
- Utilise Material-UI pour les composants UI
- Respecte les conventions de code du projet
- Composants réutilisables et maintenables