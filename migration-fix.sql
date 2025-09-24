-- Migration pour corriger les erreurs de structure de base de données
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier et corriger la table conversations
DO $$ 
BEGIN
    -- Ajouter les nouvelles colonnes si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'expediteur_id') THEN
        ALTER TABLE conversations ADD COLUMN expediteur_id UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'gp_id') THEN
        ALTER TABLE conversations ADD COLUMN gp_id UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'receveur_id') THEN
        ALTER TABLE conversations ADD COLUMN receveur_id UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'conversation_type') THEN
        ALTER TABLE conversations ADD COLUMN conversation_type TEXT DEFAULT 'public' CHECK (conversation_type IN ('public', 'private_space'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'coli_space_id') THEN
        ALTER TABLE conversations ADD COLUMN coli_space_id UUID REFERENCES coli_spaces(id);
    END IF;
END $$;

-- 2. Vérifier et corriger la table annonces
DO $$ 
BEGIN
    -- Ajouter les nouvelles colonnes si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'status') THEN
        ALTER TABLE annonces ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'secured', 'paid', 'in_transit', 'delivered', 'completed', 'cancelled'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'package_photos') THEN
        ALTER TABLE annonces ADD COLUMN package_photos TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'package_type') THEN
        ALTER TABLE annonces ADD COLUMN package_type TEXT DEFAULT 'autre' CHECK (package_type IN ('document', 'vetement', 'electronique', 'alimentaire', 'autre'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'fragile') THEN
        ALTER TABLE annonces ADD COLUMN fragile BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'urgent') THEN
        ALTER TABLE annonces ADD COLUMN urgent BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'insurance_requested') THEN
        ALTER TABLE annonces ADD COLUMN insurance_requested BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'insurance_value') THEN
        ALTER TABLE annonces ADD COLUMN insurance_value DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'receiver_id') THEN
        ALTER TABLE annonces ADD COLUMN receiver_id UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'receiver_name') THEN
        ALTER TABLE annonces ADD COLUMN receiver_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'receiver_phone') THEN
        ALTER TABLE annonces ADD COLUMN receiver_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'receiver_address') THEN
        ALTER TABLE annonces ADD COLUMN receiver_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'updated_at') THEN
        ALTER TABLE annonces ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Vérifier et corriger la table messages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'message_type') THEN
        ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'system'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachment_url') THEN
        ALTER TABLE messages ADD COLUMN attachment_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachment_type') THEN
        ALTER TABLE messages ADD COLUMN attachment_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_system_message') THEN
        ALTER TABLE messages ADD COLUMN is_system_message BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'read_by') THEN
        ALTER TABLE messages ADD COLUMN read_by TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'coli_space_id') THEN
        ALTER TABLE messages ADD COLUMN coli_space_id UUID REFERENCES coli_spaces(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'updated_at') THEN
        ALTER TABLE messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Créer la table conversation_participants si elle n'existe pas
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('expediteur', 'gp', 'receveur')),
    unread_count INTEGER DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- 5. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_conversations_expediteur ON conversations(expediteur_id);
CREATE INDEX IF NOT EXISTS idx_conversations_gp ON conversations(gp_id);
CREATE INDEX IF NOT EXISTS idx_conversations_receveur ON conversations(receveur_id);
CREATE INDEX IF NOT EXISTS idx_conversations_annonce ON conversations(annonce_id);
CREATE INDEX IF NOT EXISTS idx_conversations_coli_space ON conversations(coli_space_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_coli_space ON messages(coli_space_id);

CREATE INDEX IF NOT EXISTS idx_annonces_status ON annonces(status);
CREATE INDEX IF NOT EXISTS idx_annonces_user ON annonces(user_id);
CREATE INDEX IF NOT EXISTS idx_annonces_receiver ON annonces(receiver_id);

-- 6. Mettre à jour les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables qui ont updated_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'annonces' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_annonces_updated_at ON annonces;
        CREATE TRIGGER update_annonces_updated_at BEFORE UPDATE ON annonces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
        CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 7. Activer RLS (Row Level Security) si pas déjà fait
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;

-- 8. Créer les politiques RLS de base
-- Conversations : les utilisateurs peuvent voir leurs propres conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        auth.uid() = expediteur_id OR 
        auth.uid() = gp_id OR 
        auth.uid() = receveur_id
    );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = expediteur_id OR 
        auth.uid() = gp_id OR 
        auth.uid() = receveur_id
    );

-- Messages : les utilisateurs peuvent voir les messages de leurs conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (
                auth.uid() = conversations.expediteur_id OR 
                auth.uid() = conversations.gp_id OR 
                auth.uid() = conversations.receveur_id
            )
        )
    );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (
                auth.uid() = conversations.expediteur_id OR 
                auth.uid() = conversations.gp_id OR 
                auth.uid() = conversations.receveur_id
            )
        )
    );

-- Annonces : les utilisateurs peuvent voir toutes les annonces actives
DROP POLICY IF EXISTS "Anyone can view active annonces" ON annonces;
CREATE POLICY "Anyone can view active annonces" ON annonces
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own annonces" ON annonces;
CREATE POLICY "Users can create their own annonces" ON annonces
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own annonces" ON annonces;
CREATE POLICY "Users can update their own annonces" ON annonces
    FOR UPDATE USING (auth.uid() = user_id);

COMMIT;
