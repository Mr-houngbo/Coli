import { supabase } from '../lib/supabaseClient';

export interface HealthCheckResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export class FlowColiHealthCheck {
  
  static async runFullCheck(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    try {
      // 1. Test de connexion Supabase
      results.push(await this.checkSupabaseConnection());
      
      // 2. Test des tables principales
      results.push(await this.checkProfilesTable());
      results.push(await this.checkConversationsTable());
      results.push(await this.checkMessagesTable());
      results.push(await this.checkAnnoncesTable());
      
      // 3. Test des relations
      results.push(await this.checkRelations());
      
      // 4. Test des données de test
      results.push(await this.checkTestData());
      
      // 5. Test des performances
      results.push(await this.checkPerformance());
      
    } catch (error) {
      results.push({
        component: 'Health Check System',
        status: 'error',
        message: `Erreur système: ${error}`,
      });
    }
    
    return results;
  }
  
  private static async checkSupabaseConnection(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        return {
          component: 'Supabase Connection',
          status: 'error',
          message: `Erreur de connexion: ${error.message}`,
        };
      }
      
      return {
        component: 'Supabase Connection',
        status: 'success',
        message: 'Connexion Supabase OK',
      };
    } catch (error) {
      return {
        component: 'Supabase Connection',
        status: 'error',
        message: `Erreur de connexion: ${error}`,
      };
    }
  }
  
  private static async checkProfilesTable(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(10);
      
      if (error) {
        return {
          component: 'Profiles Table',
          status: 'error',
          message: `Erreur table profiles: ${error.message}`,
        };
      }
      
      // Vérifier les données de test
      const jeanDupontCount = data?.filter(p => p.full_name === 'Jean Dupont').length || 0;
      const emptyNamesCount = data?.filter(p => !p.full_name || p.full_name === '').length || 0;
      
      if (jeanDupontCount > 0) {
        return {
          component: 'Profiles Table',
          status: 'warning',
          message: `${jeanDupontCount} profils "Jean Dupont" détectés - nettoyage recommandé`,
          details: { jeanDupontCount, totalProfiles: data?.length }
        };
      }
      
      if (emptyNamesCount > 0) {
        return {
          component: 'Profiles Table',
          status: 'warning',
          message: `${emptyNamesCount} profils sans nom détectés`,
          details: { emptyNamesCount, totalProfiles: data?.length }
        };
      }
      
      return {
        component: 'Profiles Table',
        status: 'success',
        message: `${data?.length || 0} profils OK`,
        details: { totalProfiles: data?.length }
      };
    } catch (error) {
      return {
        component: 'Profiles Table',
        status: 'error',
        message: `Erreur: ${error}`,
      };
    }
  }
  
  private static async checkConversationsTable(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, expediteur_id, gp_id, receveur_id')
        .limit(10);
      
      if (error) {
        return {
          component: 'Conversations Table',
          status: 'error',
          message: `Erreur table conversations: ${error.message}`,
        };
      }
      
      // Vérifier les relations
      const invalidConversations = data?.filter(c => !c.expediteur_id || !c.gp_id).length || 0;
      
      if (invalidConversations > 0) {
        return {
          component: 'Conversations Table',
          status: 'warning',
          message: `${invalidConversations} conversations avec relations manquantes`,
          details: { invalidConversations, totalConversations: data?.length }
        };
      }
      
      return {
        component: 'Conversations Table',
        status: 'success',
        message: `${data?.length || 0} conversations OK`,
        details: { totalConversations: data?.length }
      };
    } catch (error) {
      return {
        component: 'Conversations Table',
        status: 'error',
        message: `Erreur: ${error}`,
      };
    }
  }
  
  private static async checkMessagesTable(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content')
        .limit(10);
      
      if (error) {
        return {
          component: 'Messages Table',
          status: 'error',
          message: `Erreur table messages: ${error.message}`,
        };
      }
      
      // Vérifier les messages orphelins
      const orphanMessages = data?.filter(m => !m.conversation_id || !m.sender_id).length || 0;
      
      if (orphanMessages > 0) {
        return {
          component: 'Messages Table',
          status: 'warning',
          message: `${orphanMessages} messages orphelins détectés`,
          details: { orphanMessages, totalMessages: data?.length }
        };
      }
      
      return {
        component: 'Messages Table',
        status: 'success',
        message: `${data?.length || 0} messages OK`,
        details: { totalMessages: data?.length }
      };
    } catch (error) {
      return {
        component: 'Messages Table',
        status: 'error',
        message: `Erreur: ${error}`,
      };
    }
  }
  
  private static async checkAnnoncesTable(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await supabase
        .from('annonces')
        .select('id, status, ville_depart, ville_arrivee')
        .limit(10);
      
      if (error) {
        return {
          component: 'Annonces Table',
          status: 'error',
          message: `Erreur table annonces: ${error.message}`,
        };
      }
      
      // Vérifier les statuts Flow-Coli
      const validStatuses = ['active', 'secured', 'paid', 'in_transit', 'delivered', 'completed', 'cancelled'];
      const invalidStatuses = data?.filter(a => a.status && !validStatuses.includes(a.status)).length || 0;
      
      if (invalidStatuses > 0) {
        return {
          component: 'Annonces Table',
          status: 'warning',
          message: `${invalidStatuses} annonces avec statuts invalides`,
          details: { invalidStatuses, totalAnnonces: data?.length }
        };
      }
      
      return {
        component: 'Annonces Table',
        status: 'success',
        message: `${data?.length || 0} annonces OK`,
        details: { totalAnnonces: data?.length }
      };
    } catch (error) {
      return {
        component: 'Annonces Table',
        status: 'error',
        message: `Erreur: ${error}`,
      };
    }
  }
  
  private static async checkRelations(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          expediteur:profiles!conversations_expediteur_id_fkey(full_name),
          gp:profiles!conversations_gp_id_fkey(full_name)
        `)
        .limit(5);
      
      if (error) {
        return {
          component: 'Database Relations',
          status: 'error',
          message: `Erreur relations: ${error.message}`,
        };
      }
      
      return {
        component: 'Database Relations',
        status: 'success',
        message: 'Relations fonctionnelles',
        details: { testedRelations: data?.length }
      };
    } catch (error) {
      return {
        component: 'Database Relations',
        status: 'error',
        message: `Erreur: ${error}`,
      };
    }
  }
  
  private static async checkTestData(): Promise<HealthCheckResult> {
    try {
      // Vérifier les données de test dans plusieurs tables
      const [profilesRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('id').ilike('full_name', '%Jean Dupont%'),
        supabase.from('messages').select('id').ilike('content', '%test%')
      ]);
      
      const testProfiles = profilesRes.data?.length || 0;
      const testMessages = messagesRes.data?.length || 0;
      
      if (testProfiles > 0 || testMessages > 0) {
        return {
          component: 'Test Data Check',
          status: 'warning',
          message: `Données de test détectées: ${testProfiles} profils, ${testMessages} messages`,
          details: { testProfiles, testMessages }
        };
      }
      
      return {
        component: 'Test Data Check',
        status: 'success',
        message: 'Pas de données de test détectées',
      };
    } catch (error) {
      return {
        component: 'Test Data Check',
        status: 'error',
        message: `Erreur: ${error}`,
      };
    }
  }
  
  private static async checkPerformance(): Promise<HealthCheckResult> {
    try {
      const startTime = Date.now();
      
      // Test de performance simple
      await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 2000) {
        return {
          component: 'Performance Check',
          status: 'warning',
          message: `Temps de réponse lent: ${responseTime}ms`,
          details: { responseTime }
        };
      }
      
      if (responseTime > 5000) {
        return {
          component: 'Performance Check',
          status: 'error',
          message: `Temps de réponse très lent: ${responseTime}ms`,
          details: { responseTime }
        };
      }
      
      return {
        component: 'Performance Check',
        status: 'success',
        message: `Temps de réponse OK: ${responseTime}ms`,
        details: { responseTime }
      };
    } catch (error) {
      return {
        component: 'Performance Check',
        status: 'error',
        message: `Erreur: ${error}`,
      };
    }
  }
  
  static getOverallStatus(results: HealthCheckResult[]): 'success' | 'warning' | 'error' {
    if (results.some(r => r.status === 'error')) return 'error';
    if (results.some(r => r.status === 'warning')) return 'warning';
    return 'success';
  }
  
  static generateReport(results: HealthCheckResult[]): string {
    const overallStatus = this.getOverallStatus(results);
    const timestamp = new Date().toLocaleString();
    
    let report = `# 🔍 RAPPORT DE SANTÉ FLOW-COLI\n\n`;
    report += `**Date:** ${timestamp}\n`;
    report += `**Statut global:** ${overallStatus === 'success' ? '✅ EXCELLENT' : overallStatus === 'warning' ? '⚠️ ATTENTION' : '❌ PROBLÈME'}\n\n`;
    
    report += `## 📊 Détails des vérifications:\n\n`;
    
    results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      report += `### ${icon} ${result.component}\n`;
      report += `**Message:** ${result.message}\n`;
      if (result.details) {
        report += `**Détails:** ${JSON.stringify(result.details, null, 2)}\n`;
      }
      report += `\n`;
    });
    
    return report;
  }
}

export default FlowColiHealthCheck;
