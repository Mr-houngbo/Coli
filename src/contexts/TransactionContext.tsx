import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Transaction, TransactionContextType } from '../types';
import { useAuth } from './AuthContext';

const TransactionContext = createContext<TransactionContextType | null>(null);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Créer une nouvelle transaction
  const createTransaction = async (
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Transaction] Creating new transaction:', data);

      // Calculer automatiquement les montants (sera fait par le trigger SQL aussi)
      const commissionAmount = data.amount * data.commission_rate;
      const gpAmount = data.amount - commissionAmount - (data.insurance_amount || 0);

      const transactionData = {
        ...data,
        commission_amount: commissionAmount,
        gp_amount: gpAmount,
        payment_status: 'pending' as const,
        payment_reference: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const { data: result, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select('*')
        .single();

      if (error) throw error;

      const newTransaction = result as Transaction;
      
      // Ajouter à la liste locale
      setTransactions(prev => [newTransaction, ...prev]);
      setCurrentTransaction(newTransaction);

      console.log('[Transaction] Transaction created successfully:', newTransaction.id);
      return newTransaction;

    } catch (error: any) {
      console.error('[Transaction] Error creating transaction:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Traiter un paiement
  const processPayment = async (transactionId: string, paymentData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Transaction] Processing payment for:', transactionId);

      // Simuler le traitement du paiement selon le provider
      const { payment_method, payment_provider } = paymentData;
      
      let paymentResult;
      
      switch (payment_provider) {
        case 'orange_money':
          paymentResult = await processOrangeMoneyPayment(paymentData);
          break;
        case 'wave':
          paymentResult = await processWavePayment(paymentData);
          break;
        case 'stripe':
          paymentResult = await processStripePayment(paymentData);
          break;
        case 'paypal':
          paymentResult = await processPayPalPayment(paymentData);
          break;
        default:
          throw new Error(`Provider de paiement non supporté: ${payment_provider}`);
      }

      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }

      // Mettre à jour la transaction avec le statut payé
      const { error } = await supabase
        .from('transactions')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          payment_reference: paymentResult.reference
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Passer automatiquement en escrow après paiement réussi
      await escrowPayment(transactionId, paymentResult.escrow_reference);

      // Mettre à jour localement
      setTransactions(prev => 
        prev.map(txn => 
          txn.id === transactionId 
            ? { 
                ...txn, 
                payment_status: 'escrowed',
                paid_at: new Date().toISOString(),
                escrowed_at: new Date().toISOString(),
                payment_reference: paymentResult.reference,
                escrow_reference: paymentResult.escrow_reference
              }
            : txn
        )
      );

      console.log('[Transaction] Payment processed successfully');
      return true;

    } catch (error: any) {
      console.error('[Transaction] Error processing payment:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre en séquestre (escrow)
  const escrowPayment = async (transactionId: string, escrowReference: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          payment_status: 'escrowed',
          escrowed_at: new Date().toISOString(),
          escrow_reference: escrowReference
        })
        .eq('id', transactionId);

      if (error) throw error;

      console.log('[Transaction] Payment escrowed successfully');
      return true;
    } catch (error: any) {
      console.error('[Transaction] Error escrowing payment:', error);
      return false;
    }
  };

  // Libérer les fonds (après livraison confirmée)
  const releaseEscrow = async (transactionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Transaction] Releasing escrow for:', transactionId);

      const { error } = await supabase
        .from('transactions')
        .update({
          payment_status: 'released',
          released_at: new Date().toISOString(),
          release_reference: `REL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Mettre à jour localement
      setTransactions(prev => 
        prev.map(txn => 
          txn.id === transactionId 
            ? { 
                ...txn, 
                payment_status: 'released',
                released_at: new Date().toISOString()
              }
            : txn
        )
      );

      // Générer la facture automatiquement
      await generateInvoice(transactionId);

      console.log('[Transaction] Escrow released successfully');
      return true;

    } catch (error: any) {
      console.error('[Transaction] Error releasing escrow:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Rembourser une transaction
  const refundTransaction = async (transactionId: string, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Transaction] Refunding transaction:', transactionId, reason);

      const { error } = await supabase
        .from('transactions')
        .update({
          payment_status: 'refunded',
          // Ajouter la raison du remboursement dans un champ notes si nécessaire
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Mettre à jour localement
      setTransactions(prev => 
        prev.map(txn => 
          txn.id === transactionId 
            ? { ...txn, payment_status: 'refunded' }
            : txn
        )
      );

      console.log('[Transaction] Transaction refunded successfully');
      return true;

    } catch (error: any) {
      console.error('[Transaction] Error refunding transaction:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les transactions d'un utilisateur
  const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`expediteur_id.eq.${userId},gp_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userTransactions = data as Transaction[];
      setTransactions(userTransactions);
      
      return userTransactions;

    } catch (error: any) {
      console.error('[Transaction] Error fetching user transactions:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Générer une facture
  const generateInvoice = async (transactionId: string): Promise<string | null> => {
    try {
      const transaction = transactions.find(txn => txn.id === transactionId);
      if (!transaction) return null;

      // Générer un numéro de facture unique
      const invoiceNumber = `INV_${new Date().getFullYear()}_${Date.now()}`;
      
      // Ici, vous intégreriez un service de génération de PDF
      // Pour l'instant, on simule avec une URL
      const invoiceUrl = `/invoices/${invoiceNumber}.pdf`;

      const { error } = await supabase
        .from('transactions')
        .update({
          invoice_number: invoiceNumber,
          invoice_url: invoiceUrl
        })
        .eq('id', transactionId);

      if (error) throw error;

      console.log('[Transaction] Invoice generated:', invoiceNumber);
      return invoiceUrl;

    } catch (error: any) {
      console.error('[Transaction] Error generating invoice:', error);
      return null;
    }
  };

  // Fonctions de paiement par provider (simulées)
  const processOrangeMoneyPayment = async (paymentData: any) => {
    // Simulation Orange Money API
    console.log('[Transaction] Processing Orange Money payment...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simuler délai API
    
    return {
      success: true,
      reference: `OM_${Date.now()}`,
      escrow_reference: `ESC_OM_${Date.now()}`
    };
  };

  const processWavePayment = async (paymentData: any) => {
    // Simulation Wave API
    console.log('[Transaction] Processing Wave payment...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      reference: `WAVE_${Date.now()}`,
      escrow_reference: `ESC_WAVE_${Date.now()}`
    };
  };

  const processStripePayment = async (paymentData: any) => {
    // Simulation Stripe API
    console.log('[Transaction] Processing Stripe payment...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      success: true,
      reference: `STRIPE_${Date.now()}`,
      escrow_reference: `ESC_STRIPE_${Date.now()}`
    };
  };

  const processPayPalPayment = async (paymentData: any) => {
    // Simulation PayPal API
    console.log('[Transaction] Processing PayPal payment...');
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    return {
      success: true,
      reference: `PP_${Date.now()}`,
      escrow_reference: `ESC_PP_${Date.now()}`
    };
  };

  // Charger les transactions de l'utilisateur au démarrage
  useEffect(() => {
    if (user?.id) {
      getUserTransactions(user.id);
    }
  }, [user?.id]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `or(expediteur_id.eq.${user.id},gp_id.eq.${user.id})`
        },
        (payload) => {
          console.log('[Transaction] Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTransaction = payload.new as Transaction;
            setTransactions(prev => [newTransaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedTransaction = payload.new as Transaction;
            setTransactions(prev => 
              prev.map(txn => 
                txn.id === updatedTransaction.id 
                  ? updatedTransaction
                  : txn
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const value = {
    transactions,
    currentTransaction,
    loading,
    error,
    createTransaction,
    processPayment,
    releaseEscrow,
    refundTransaction,
    getUserTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction doit être utilisé à l\'intérieur d\'un TransactionProvider');
  }
  return context;
};
