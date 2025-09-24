-- Script de nettoyage des données de test
-- À exécuter dans Supabase SQL Editor pour supprimer les données de test

-- 1. Supprimer les messages de test
DELETE FROM messages WHERE content LIKE '%test%' OR content LIKE '%Jean Dupont%';

-- 2. Supprimer les conversations de test (optionnel - soyez prudent)
-- DELETE FROM conversations WHERE created_at < NOW() - INTERVAL '1 day' AND id IN (
--   SELECT id FROM conversations WHERE expediteur_id IN (
--     SELECT id FROM profiles WHERE full_name = 'Jean Dupont'
--   )
-- );

-- 3. Supprimer les profils de test "Jean Dupont" (ATTENTION: cela peut casser des relations)
-- DELETE FROM profiles WHERE full_name = 'Jean Dupont' AND email LIKE '%test%';

-- 4. Mettre à jour les profils existants avec des noms par défaut basés sur l'email
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

-- 5. Nettoyer les annonces de test
DELETE FROM annonces WHERE description LIKE '%test%' OR ville_depart = 'Test' OR ville_arrivee = 'Test';

-- 6. Réinitialiser les compteurs de messages non lus (dans conversation_participants)
UPDATE conversation_participants SET unread_count = 0 WHERE unread_count IS NULL;

-- 7. Vérifier les données après nettoyage
SELECT 
  'profiles' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN full_name = 'Jean Dupont' THEN 1 END) as jean_dupont_count
FROM profiles
UNION ALL
SELECT 
  'conversations' as table_name,
  COUNT(*) as count,
  0 as jean_dupont_count
FROM conversations
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN content LIKE '%Jean Dupont%' THEN 1 END) as jean_dupont_count
FROM messages
UNION ALL
SELECT 
  'annonces' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN description LIKE '%test%' THEN 1 END) as test_count
FROM annonces;
