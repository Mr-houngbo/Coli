-- Script de nettoyage des données de test - ADAPTÉ À VOTRE SCHÉMA
-- À exécuter dans Supabase SQL Editor pour supprimer les données de test

-- 1. Supprimer les messages de test
DELETE FROM messages WHERE content LIKE '%test%' OR content LIKE '%Jean Dupont%';

-- 2. Mettre à jour les profils existants avec des noms par défaut basés sur l'email
-- CECI VA CORRIGER LE PROBLÈME "JEAN DUPONT"
UPDATE profiles 
SET full_name = CASE 
  WHEN full_name = 'Jean Dupont' OR full_name IS NULL OR full_name = '' 
  THEN COALESCE(
    SPLIT_PART(email, '@', 1),
    'Utilisateur ' || SUBSTRING(id::text, 1, 8)
  )
  ELSE full_name
END
WHERE full_name = 'Jean Dupont' OR full_name IS NULL OR full_name = '';

-- 3. Nettoyer les annonces de test
DELETE FROM annonces WHERE description LIKE '%test%' OR ville_depart = 'Test' OR ville_arrivee = 'Test';

-- 4. Réinitialiser les compteurs de messages non lus (dans conversation_participants)
UPDATE conversation_participants SET unread_count = 0 WHERE unread_count IS NULL;

-- 5. Nettoyer les conversations orphelines (sans participants valides)
DELETE FROM conversations 
WHERE id NOT IN (
  SELECT DISTINCT conversation_id 
  FROM conversation_participants 
  WHERE conversation_id IS NOT NULL
) AND created_at < NOW() - INTERVAL '1 day';

-- 6. Supprimer les participants de conversations avec des profils "Jean Dupont"
DELETE FROM conversation_participants 
WHERE user_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont'
);

-- 7. Mettre à jour les colonnes user1_id et user2_id dans conversations si elles pointent vers Jean Dupont
UPDATE conversations 
SET user1_id = NULL 
WHERE user1_id IN (SELECT id FROM profiles WHERE full_name = 'Jean Dupont');

UPDATE conversations 
SET user2_id = NULL 
WHERE user2_id IN (SELECT id FROM profiles WHERE full_name = 'Jean Dupont');

-- 8. Mettre à jour les colonnes Flow-Coli dans conversations si elles pointent vers Jean Dupont
UPDATE conversations 
SET expediteur_id = NULL 
WHERE expediteur_id IN (SELECT id FROM profiles WHERE full_name = 'Jean Dupont');

UPDATE conversations 
SET gp_id = NULL 
WHERE gp_id IN (SELECT id FROM profiles WHERE full_name = 'Jean Dupont');

UPDATE conversations 
SET receveur_id = NULL 
WHERE receveur_id IN (SELECT id FROM profiles WHERE full_name = 'Jean Dupont');

-- 9. Supprimer les profils de test "Jean Dupont" qui ne sont pas liés à des utilisateurs réels
-- ATTENTION: Seulement ceux avec des emails de test
DELETE FROM profiles 
WHERE full_name = 'Jean Dupont' 
  AND (email LIKE '%test%' OR email LIKE '%example%' OR email IS NULL);

-- 10. Vérifier les données après nettoyage
SELECT 
  'profiles' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN full_name = 'Jean Dupont' THEN 1 END) as jean_dupont_count,
  COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as empty_names_count
FROM profiles
UNION ALL
SELECT 
  'conversations' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN expediteur_id IS NULL AND gp_id IS NULL THEN 1 END) as orphaned_conversations,
  0 as empty_names_count
FROM conversations
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN content LIKE '%Jean Dupont%' THEN 1 END) as jean_dupont_messages,
  COUNT(CASE WHEN content LIKE '%test%' THEN 1 END) as test_messages
FROM messages
UNION ALL
SELECT 
  'conversation_participants' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphaned_participants,
  0 as empty_names_count
FROM conversation_participants;

-- 11. Rapport final
SELECT 
  'NETTOYAGE TERMINÉ' as status,
  NOW() as timestamp,
  'Vérifiez les résultats ci-dessus' as message;

-- 12. Recommandations post-nettoyage
SELECT 
  'RECOMMANDATIONS' as type,
  CASE 
    WHEN (SELECT COUNT(*) FROM profiles WHERE full_name = 'Jean Dupont') = 0
    THEN '✅ SUCCÈS: Tous les Jean Dupont ont été supprimés ou renommés'
    ELSE '⚠️ ATTENTION: Il reste des profils Jean Dupont - vérifiez manuellement'
  END as message;
