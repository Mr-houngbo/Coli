import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { supabase } from '../lib/supabaseClient';
import { AlertTriangle, CheckCircle, RefreshCw, Database, Shield, Download } from 'lucide-react';
import FlowColiHealthCheck, { HealthCheckResult } from '../utils/healthCheck';

export const ConversationDebug: React.FC = () => {
  const { user } = useAuth();
  const { conversations, loading } = useConversations();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [healthResults, setHealthResults] = useState<HealthCheckResult[]>([]);
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);

  const runDiagnostic = async () => {
    if (!user?.id) return;

    const results = [];

    // Test 1: Vérifier la table profiles
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(5);
      
      results.push({
        test: 'Profiles Table',
        status: error ? 'error' : 'success',
        message: error ? error.message : `${profiles?.length || 0} profils trouvés`,
        data: profiles
      });
    } catch (err: any) {
      results.push({
        test: 'Profiles Table',
        status: 'error',
        message: err.message
      });
    }

    // Test 2: Vérifier les conversations
    try {
      const { data: convs, error } = await supabase
        .from('conversations')
        .select(`
          id,
          expediteur_id,
          gp_id,
          receveur_id,
          created_at
        `)
        .limit(5);
      
      results.push({
        test: 'Conversations Table',
        status: error ? 'error' : 'success',
        message: error ? error.message : `${convs?.length || 0} conversations trouvées`,
        data: convs
      });
    } catch (err: any) {
      results.push({
        test: 'Conversations Table',
        status: 'error',
        message: err.message
      });
    }

    // Test 3: Vérifier les messages
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, content, sender_id, conversation_id, created_at')
        .limit(5);
      
      results.push({
        test: 'Messages Table',
        status: error ? 'error' : 'success',
        message: error ? error.message : `${messages?.length || 0} messages trouvés`,
        data: messages
      });
    } catch (err: any) {
      results.push({
        test: 'Messages Table',
        status: 'error',
        message: err.message
      });
    }

    // Test 4: Vérifier les relations
    try {
      const { data: relations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          expediteur:profiles!conversations_expediteur_id_fkey(full_name),
          gp:profiles!conversations_gp_id_fkey(full_name)
        `)
        .limit(3);
      
      results.push({
        test: 'Relations Test',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Relations fonctionnelles',
        data: relations
      });
    } catch (err: any) {
      results.push({
        test: 'Relations Test',
        status: 'error',
        message: err.message
      });
    }

    setTestResults(results);
    setDebugInfo({
      userId: user.id,
      conversationsCount: conversations.length,
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (user?.id) {
      runDiagnostic();
    }
  }, [user?.id]);

  const cleanupTestData = async () => {
    if (!user?.id) return;

    try {
      // Nettoyer les profils "Jean Dupont"
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: supabase.rpc('generate_name_from_email', { email_input: 'email' })
        })
        .eq('full_name', 'Jean Dupont');

      if (profileError) {
        console.error('Erreur nettoyage profils:', profileError);
      }

      // Relancer le diagnostic
      setTimeout(runDiagnostic, 1000);
    } catch (err) {
      console.error('Erreur nettoyage:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Diagnostic des Conversations
          </h2>
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Relancer le diagnostic
          </button>
        </div>

        {debugInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Informations de session</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>User ID:</strong> {debugInfo.userId}</p>
              <p><strong>Conversations chargées:</strong> {debugInfo.conversationsCount}</p>
              <p><strong>Dernière vérification:</strong> {new Date(debugInfo.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{result.test}</h3>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer">
                        Voir les données
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {testResults.some(r => r.test.includes('Jean Dupont') || r.message.includes('Jean Dupont')) && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Données de test détectées</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Des profils "Jean Dupont" ont été détectés. Cliquez ci-dessous pour nettoyer.
                </p>
                <button
                  onClick={cleanupTestData}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Nettoyer les données de test
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Instructions de correction :</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. <strong>Exécutez la migration SQL</strong> : migration-fix.sql</p>
            <p>2. <strong>Nettoyez les données de test</strong> : cleanup-test-data.sql</p>
            <p>3. <strong>Redémarrez l'application</strong> : npm run dev</p>
            <p>4. <strong>Testez les conversations</strong> : Créez une nouvelle conversation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDebug;
