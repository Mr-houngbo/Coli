import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export const TestConnection: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: TestResult[] = [];

    // Test 1: Connexion Supabase
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      results.push({
        name: 'Connexion Supabase',
        status: 'success',
        message: 'Connexion établie avec succès'
      });
    } catch (error: any) {
      results.push({
        name: 'Connexion Supabase',
        status: 'error',
        message: `Erreur: ${error.message}`
      });
    }

    // Test 2: Table annonces
    try {
      const { data, error } = await supabase
        .from('annonces')
        .select('id, status, package_photos, receiver_name')
        .limit(1);
      if (error) throw error;
      results.push({
        name: 'Table annonces (nouveaux champs)',
        status: 'success',
        message: 'Tous les champs Flow-Coli sont disponibles'
      });
    } catch (error: any) {
      results.push({
        name: 'Table annonces (nouveaux champs)',
        status: 'error',
        message: `Erreur: ${error.message}`
      });
    }

    // Test 3: Table conversations
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, expediteur_id, gp_id, receveur_id, conversation_type')
        .limit(1);
      if (error) throw error;
      results.push({
        name: 'Table conversations (3 participants)',
        status: 'success',
        message: 'Support pour 3 participants activé'
      });
    } catch (error: any) {
      results.push({
        name: 'Table conversations (3 participants)',
        status: 'error',
        message: `Erreur: ${error.message}`
      });
    }

    // Test 4: Table messages
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, message_type, attachment_url, is_system_message, read_by')
        .limit(1);
      if (error) throw error;
      results.push({
        name: 'Table messages (enrichis)',
        status: 'success',
        message: 'Messages avec pièces jointes et système disponibles'
      });
    } catch (error: any) {
      results.push({
        name: 'Table messages (enrichis)',
        status: 'error',
        message: `Erreur: ${error.message}`
      });
    }

    // Test 5: Tables Flow-Coli
    const flowColiTables = ['coli_spaces', 'package_tracking', 'transactions', 'ratings', 'disputes', 'notifications'];
    for (const table of flowColiTables) {
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) throw error;
        results.push({
          name: `Table ${table}`,
          status: 'success',
          message: 'Table Flow-Coli disponible'
        });
      } catch (error: any) {
        results.push({
          name: `Table ${table}`,
          status: 'warning',
          message: `Table non créée: ${error.message}`
        });
      }
    }

    setTests(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Test de Connexion Flow-Coli
          </h2>
          <button
            onClick={runTests}
            disabled={loading}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Test en cours...' : 'Relancer les tests'}
          </button>
        </div>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start gap-3">
                {getIcon(test.status)}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tests.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Instructions :</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Si vous voyez des erreurs, exécutez le script <code>migration-fix.sql</code> dans Supabase</p>
              <p>• Les avertissements indiquent des tables optionnelles qui peuvent être créées plus tard</p>
              <p>• Tous les tests doivent être verts pour que l'application fonctionne correctement</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConnection;
