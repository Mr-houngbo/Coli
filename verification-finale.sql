-- Script de vérification finale après toutes les corrections
-- À exécuter dans Supabase SQL Editor pour confirmer que tout fonctionne

-- 1. Vérifier la structure des tables principales
SELECT 
    'TABLES CHECK' as verification_type,
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'annonces', 'conversations', 'messages') THEN 'CRITICAL'
        ELSE 'OPTIONAL'
    END as importance
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
        'profiles', 'annonces', 'conversations', 'messages',
        'identity_verifications', 'coli_spaces', 'package_tracking',
        'transactions', 'ratings', 'disputes', 'notifications'
    )
ORDER BY importance, table_name;

-- 2. Vérifier les colonnes Flow-Coli dans conversations
SELECT 
    'CONVERSATIONS COLUMNS' as verification_type,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('expediteur_id', 'gp_id') THEN 'CRITICAL'
        WHEN column_name = 'receveur_id' THEN 'IMPORTANT'
        ELSE 'OPTIONAL'
    END as importance
FROM information_schema.columns 
WHERE table_name = 'conversations' 
    AND column_name IN ('expediteur_id', 'gp_id', 'receveur_id', 'conversation_type', 'coli_space_id')
ORDER BY importance;

-- 3. Vérifier les colonnes Flow-Coli dans annonces
SELECT 
    'ANNONCES COLUMNS' as verification_type,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name = 'status' THEN 'CRITICAL'
        ELSE 'IMPORTANT'
    END as importance
FROM information_schema.columns 
WHERE table_name = 'annonces' 
    AND column_name IN ('status', 'package_photos', 'package_type', 'receiver_name', 'receiver_phone')
ORDER BY importance;

-- 4. Vérifier les données de test restantes
SELECT 
    'TEST DATA CHECK' as verification_type,
    'profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN full_name = 'Jean Dupont' THEN 1 END) as jean_dupont_count,
    COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as empty_names_count
FROM profiles
UNION ALL
SELECT 
    'TEST DATA CHECK' as verification_type,
    'messages' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN content LIKE '%test%' OR content LIKE '%Test%' THEN 1 END) as test_messages_count,
    0 as empty_names_count
FROM messages;

-- 5. Vérifier les relations fonctionnelles
SELECT 
    'RELATIONS CHECK' as verification_type,
    c.id as conversation_id,
    COALESCE(e.full_name, 'MISSING') as expediteur_name,
    COALESCE(g.full_name, 'MISSING') as gp_name,
    COALESCE(r.full_name, 'NULL') as receveur_name,
    CASE 
        WHEN e.full_name IS NULL THEN 'ERROR: Missing expediteur'
        WHEN g.full_name IS NULL THEN 'ERROR: Missing GP'
        ELSE 'OK'
    END as status
FROM conversations c
LEFT JOIN profiles e ON c.expediteur_id = e.id
LEFT JOIN profiles g ON c.gp_id = g.id
LEFT JOIN profiles r ON c.receveur_id = r.id
LIMIT 5;

-- 6. Vérifier les statuts Flow-Coli
SELECT 
    'FLOW-COLI STATUS CHECK' as verification_type,
    status,
    COUNT(*) as count,
    CASE 
        WHEN status IN ('active', 'secured', 'paid', 'in_transit', 'delivered', 'completed', 'cancelled') THEN 'VALID'
        WHEN status IS NULL THEN 'NULL (OK for old records)'
        ELSE 'INVALID'
    END as validation
FROM annonces
GROUP BY status
ORDER BY count DESC;

-- 7. Vérifier les performances (messages récents)
SELECT 
    'PERFORMANCE CHECK' as verification_type,
    COUNT(*) as recent_messages,
    COUNT(DISTINCT conversation_id) as active_conversations,
    MAX(created_at) as last_message_time,
    CASE 
        WHEN MAX(created_at) > NOW() - INTERVAL '1 day' THEN 'ACTIVE'
        WHEN MAX(created_at) > NOW() - INTERVAL '7 days' THEN 'RECENT'
        ELSE 'OLD'
    END as activity_level
FROM messages
WHERE created_at > NOW() - INTERVAL '30 days';

-- 8. Résumé final de santé
SELECT 
    'FINAL HEALTH SUMMARY' as verification_type,
    'CRITICAL TABLES' as component,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('profiles', 'annonces', 'conversations', 'messages')) = 4 
        THEN 'ALL PRESENT'
        ELSE 'MISSING TABLES'
    END as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('profiles', 'annonces', 'conversations', 'messages')) as tables_found
UNION ALL
SELECT 
    'FINAL HEALTH SUMMARY' as verification_type,
    'FLOW-COLI COLUMNS' as component,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'conversations' AND column_name IN ('expediteur_id', 'gp_id')) = 2
        THEN 'FLOW-COLI READY'
        ELSE 'MIGRATION NEEDED'
    END as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'conversations' AND column_name IN ('expediteur_id', 'gp_id')) as columns_found
UNION ALL
SELECT 
    'FINAL HEALTH SUMMARY' as verification_type,
    'TEST DATA CLEANUP' as component,
    CASE 
        WHEN (SELECT COUNT(*) FROM profiles WHERE full_name = 'Jean Dupont') = 0
        THEN 'CLEAN'
        ELSE 'CLEANUP NEEDED'
    END as status,
    (SELECT COUNT(*) FROM profiles WHERE full_name = 'Jean Dupont') as jean_dupont_remaining;

-- 9. Recommandations finales
SELECT 
    'RECOMMENDATIONS' as verification_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'expediteur_id') = 0
        THEN 'URGENT: Execute migration-fix.sql'
        WHEN (SELECT COUNT(*) FROM profiles WHERE full_name = 'Jean Dupont') > 0
        THEN 'RECOMMENDED: Execute cleanup-test-data.sql'
        WHEN (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '1 day') = 0
        THEN 'INFO: No recent activity detected'
        ELSE 'SUCCESS: System appears healthy'
    END as recommendation,
    NOW() as check_timestamp;
