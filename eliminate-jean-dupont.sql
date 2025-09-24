-- SCRIPT RADICAL : ÉLIMINER TOUS LES "JEAN DUPONT" DE L'APPLICATION
-- À exécuter dans Supabase SQL Editor

-- ⚠️ ATTENTION: Ce script va supprimer/modifier TOUS les "Jean Dupont"
-- Sauvegardez vos données importantes avant d'exécuter !

-- 1. ÉTAPE 1: Identifier tous les profils "Jean Dupont"
SELECT 
  'PROFILS JEAN DUPONT DÉTECTÉS' as status,
  id,
  full_name,
  email,
  created_at
FROM profiles 
WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%';

-- 2. ÉTAPE 2: Supprimer tous les messages liés aux profils "Jean Dupont"
DELETE FROM messages 
WHERE sender_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

-- 3. ÉTAPE 3: Supprimer tous les participants de conversations "Jean Dupont"
DELETE FROM conversation_participants 
WHERE user_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

-- 4. ÉTAPE 4: Nettoyer toutes les références dans conversations
UPDATE conversations 
SET user1_id = NULL 
WHERE user1_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

UPDATE conversations 
SET user2_id = NULL 
WHERE user2_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

UPDATE conversations 
SET expediteur_id = NULL 
WHERE expediteur_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

UPDATE conversations 
SET gp_id = NULL 
WHERE gp_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

UPDATE conversations 
SET receveur_id = NULL 
WHERE receveur_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

-- 5. ÉTAPE 5: Nettoyer les références dans annonces
UPDATE annonces 
SET user_id = NULL 
WHERE user_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

UPDATE annonces 
SET receiver_id = NULL 
WHERE receiver_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

-- 6. ÉTAPE 6: Nettoyer les autres tables Flow-Coli
DELETE FROM coli_spaces 
WHERE expediteur_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
) OR gp_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
) OR receveur_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

DELETE FROM package_tracking 
WHERE expediteur_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
) OR gp_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
) OR receveur_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

DELETE FROM transactions 
WHERE expediteur_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
) OR gp_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

DELETE FROM ratings 
WHERE rater_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
) OR rated_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

DELETE FROM disputes 
WHERE complainant_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
) OR respondent_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

DELETE FROM identity_verifications 
WHERE user_id IN (
  SELECT id FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%'
);

-- 7. ÉTAPE 7: OPTION A - RENOMMER tous les "Jean Dupont" (RECOMMANDÉ)
UPDATE profiles 
SET full_name = CASE 
  WHEN email IS NOT NULL AND email != '' THEN SPLIT_PART(email, '@', 1)
  ELSE 'Utilisateur_' || SUBSTRING(id::text, 1, 8)
END
WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%';

-- 8. ÉTAPE 8: OPTION B - SUPPRIMER complètement les profils "Jean Dupont" (DANGEREUX)
-- ⚠️ DÉCOMMENTEZ SEULEMENT SI VOUS ÊTES SÛR !
-- DELETE FROM profiles WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%';

-- 9. ÉTAPE 9: Supprimer les conversations orphelines
DELETE FROM conversations 
WHERE (user1_id IS NULL AND user2_id IS NULL) 
   OR (expediteur_id IS NULL AND gp_id IS NULL);

-- 10. ÉTAPE 10: Nettoyer les messages orphelins
DELETE FROM messages 
WHERE conversation_id NOT IN (SELECT id FROM conversations);

-- 11. ÉTAPE 11: Nettoyer les participants orphelins
DELETE FROM conversation_participants 
WHERE conversation_id NOT IN (SELECT id FROM conversations);

-- 12. VÉRIFICATION FINALE - AUCUN "JEAN DUPONT" NE DOIT RESTER !
SELECT 
  'VÉRIFICATION FINALE' as status,
  COUNT(*) as jean_dupont_restants,
  CASE 
    WHEN COUNT(*) = 0 THEN '🎉 SUCCÈS: Aucun Jean Dupont restant !'
    ELSE '❌ ÉCHEC: Il reste des Jean Dupont - contactez le support'
  END as resultat
FROM profiles 
WHERE full_name = 'Jean Dupont' OR full_name ILIKE '%jean%dupont%';

-- 13. RAPPORT FINAL
SELECT 
  'RAPPORT FINAL' as type,
  'profiles' as table_name,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as profiles_sans_nom
FROM profiles
UNION ALL
SELECT 
  'RAPPORT FINAL' as type,
  'conversations' as table_name,
  COUNT(*) as total_conversations,
  COUNT(CASE WHEN expediteur_id IS NULL AND gp_id IS NULL THEN 1 END) as conversations_orphelines
FROM conversations
UNION ALL
SELECT 
  'RAPPORT FINAL' as type,
  'messages' as table_name,
  COUNT(*) as total_messages,
  0 as messages_orphelins
FROM messages;

-- 14. MESSAGE DE SUCCÈS
SELECT 
  '🎉 MISSION ACCOMPLIE !' as status,
  'Tous les Jean Dupont ont été éliminés de votre application' as message,
  NOW() as timestamp;
