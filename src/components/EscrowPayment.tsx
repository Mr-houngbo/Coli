import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Receipt,
  DollarSign,
  Info
} from 'lucide-react';
import { Transaction, ColiSpace } from '../types';
import { useTransaction } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';

interface EscrowPaymentProps {
  coliSpace: ColiSpace;
  amount: number;
  onPaymentComplete?: (transaction: Transaction) => void;
  onCancel?: () => void;
  className?: string;
}

export const EscrowPayment: React.FC<EscrowPaymentProps> = ({
  coliSpace,
  amount,
  onPaymentComplete,
  onCancel,
  className = ''
}) => {
  const { createTransaction, processPayment, loading } = useTransaction();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'paypal'>('mobile_money');
  const [paymentProvider, setPaymentProvider] = useState<'orange_money' | 'wave' | 'stripe' | 'paypal'>('orange_money');
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paypalEmail: ''
  });
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculer les montants
  const commissionRate = 0.10; // 10%
  const commissionAmount = amount * commissionRate;
  const gpAmount = amount - commissionAmount;
  const insuranceAmount = coliSpace.annonce?.insurance_requested ? (coliSpace.annonce.insurance_value || 0) : 0;
  const totalAmount = amount + insuranceAmount;

  const paymentMethods = [
    {
      type: 'mobile_money' as const,
      name: 'Mobile Money',
      icon: Smartphone,
      providers: [
        { value: 'orange_money', label: 'Orange Money', color: 'orange' },
        { value: 'wave', label: 'Wave', color: 'blue' }
      ]
    },
    {
      type: 'card' as const,
      name: 'Carte Bancaire',
      icon: CreditCard,
      providers: [
        { value: 'stripe', label: 'Visa/Mastercard', color: 'purple' }
      ]
    },
    {
      type: 'paypal' as const,
      name: 'PayPal',
      icon: DollarSign,
      providers: [
        { value: 'paypal', label: 'PayPal', color: 'blue' }
      ]
    }
  ];

  const handlePaymentMethodChange = (method: typeof paymentMethod, provider: typeof paymentProvider) => {
    setPaymentMethod(method);
    setPaymentProvider(provider);
    setError(null);
  };

  const validatePaymentData = (): boolean => {
    setError(null);

    switch (paymentMethod) {
      case 'mobile_money':
        if (!paymentData.phoneNumber.trim()) {
          setError('Veuillez saisir votre numéro de téléphone');
          return false;
        }
        if (!/^[+]?[0-9]{8,15}$/.test(paymentData.phoneNumber.replace(/\s/g, ''))) {
          setError('Format de numéro de téléphone invalide');
          return false;
        }
        break;

      case 'card':
        if (!paymentData.cardNumber.replace(/\s/g, '') || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
          setError('Numéro de carte invalide');
          return false;
        }
        if (!paymentData.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) {
          setError('Date d\'expiration invalide (MM/YY)');
          return false;
        }
        if (!paymentData.cvv || paymentData.cvv.length < 3) {
          setError('CVV invalide');
          return false;
        }
        if (!paymentData.cardholderName.trim()) {
          setError('Nom du porteur requis');
          return false;
        }
        break;

      case 'paypal':
        if (!paymentData.paypalEmail.trim()) {
          setError('Email PayPal requis');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.paypalEmail)) {
          setError('Email PayPal invalide');
          return false;
        }
        break;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validatePaymentData()) return;

    try {
      setStep(3); // Étape de traitement

      // Créer la transaction
      const newTransaction = await createTransaction({
        annonce_id: coliSpace.annonce_id,
        coli_space_id: coliSpace.id,
        expediteur_id: coliSpace.expediteur_id,
        gp_id: coliSpace.gp_id,
        amount: totalAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        gp_amount: gpAmount,
        insurance_amount: insuranceAmount,
        payment_method: paymentMethod,
        payment_provider: paymentProvider,
        payment_reference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      if (!newTransaction) {
        throw new Error('Erreur lors de la création de la transaction');
      }

      setTransaction(newTransaction);

      // Traiter le paiement
      const paymentSuccess = await processPayment(newTransaction.id, {
        payment_method: paymentMethod,
        payment_provider: paymentProvider,
        ...paymentData
      });

      if (paymentSuccess) {
        setStep(4); // Succès
        if (onPaymentComplete) {
          onPaymentComplete(newTransaction);
        }
      } else {
        throw new Error('Échec du traitement du paiement');
      }

    } catch (error: any) {
      console.error('Erreur de paiement:', error);
      setError(error.message || 'Erreur lors du paiement');
      setStep(2); // Retour à la sélection
    }
  };

  const renderPaymentMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement Sécurisé
        </h2>
        <p className="text-gray-600">
          Votre paiement sera mis en séquestre jusqu'à la livraison confirmée
        </p>
      </div>

      {/* Résumé des montants */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Montant du transport</span>
          <span className="font-semibold">{amount.toLocaleString()} FCFA</span>
        </div>
        {insuranceAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Assurance</span>
            <span className="font-semibold">{insuranceAmount.toLocaleString()} FCFA</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Commission Coli (10%)</span>
          <span>{commissionAmount.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Montant pour le GP</span>
          <span>{gpAmount.toLocaleString()} FCFA</span>
        </div>
        <hr className="border-gray-300" />
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total à payer</span>
          <span>{totalAmount.toLocaleString()} FCFA</span>
        </div>
      </div>

      {/* Sélection de la méthode de paiement */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Méthode de paiement</h3>
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <div key={method.type} className="space-y-2">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === method.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePaymentMethodChange(method.type, method.providers[0].value as any)}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-6 h-6 text-gray-600" />
                  <span className="font-medium">{method.name}</span>
                  {paymentMethod === method.type && (
                    <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                  )}
                </div>
              </div>

              {/* Providers */}
              {paymentMethod === method.type && method.providers.length > 1 && (
                <div className="ml-6 space-y-2">
                  {method.providers.map((provider) => (
                    <label key={provider.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="provider"
                        value={provider.value}
                        checked={paymentProvider === provider.value}
                        onChange={(e) => setPaymentProvider(e.target.value as any)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{provider.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Continuer
      </button>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informations de Paiement
        </h2>
        <p className="text-gray-600">
          {paymentMethods.find(m => m.type === paymentMethod)?.name} - {totalAmount.toLocaleString()} FCFA
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Paiement sécurisé</p>
          <p>Votre argent sera bloqué en séquestre jusqu'à la confirmation de livraison par vous et le receveur.</p>
        </div>
      </div>

      {/* Formulaire selon la méthode */}
      {paymentMethod === 'mobile_money' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={paymentData.phoneNumber}
              onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="+221 77 123 45 67"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de carte
            </label>
            <input
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                setPaymentData(prev => ({ ...prev, cardNumber: value }));
              }}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'expiration
              </label>
              <input
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                  setPaymentData(prev => ({ ...prev, expiryDate: value }));
                }}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={paymentData.cvv}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                placeholder="123"
                maxLength={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du porteur
            </label>
            <input
              type="text"
              value={paymentData.cardholderName}
              onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
              placeholder="Jean Dupont"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {paymentMethod === 'paypal' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email PayPal
            </label>
            <input
              type="email"
              value={paymentData.paypalEmail}
              onChange={(e) => setPaymentData(prev => ({ ...prev, paypalEmail: e.target.value }))}
              placeholder="votre@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Traitement...' : `Payer ${totalAmount.toLocaleString()} FCFA`}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <Clock className="w-8 h-8 text-yellow-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Traitement en cours...
        </h2>
        <p className="text-gray-600">
          Votre paiement est en cours de traitement. Veuillez patienter.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          🔒 Votre paiement sera sécurisé en séquestre dès validation
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement Réussi !
        </h2>
        <p className="text-gray-600">
          Votre paiement de {totalAmount.toLocaleString()} FCFA a été sécurisé
        </p>
      </div>

      {transaction && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-green-800">
            <Receipt className="w-5 h-5" />
            <span className="font-semibold">Référence de transaction</span>
          </div>
          <p className="text-sm font-mono bg-white px-3 py-2 rounded border">
            {transaction.payment_reference}
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes :</h3>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          <li>• Votre argent est maintenant en séquestre sécurisé</li>
          <li>• Le GP peut maintenant prendre en charge votre colis</li>
          <li>• Les fonds seront libérés après confirmation de livraison</li>
          <li>• Vous recevrez une facture par email</li>
        </ul>
      </div>

      <button
        onClick={onCancel}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Continuer
      </button>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto ${className}`}>
      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNumber === 4 && step >= 4 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                stepNumber
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenu selon l'étape */}
      {step === 1 && renderPaymentMethodSelection()}
      {step === 2 && renderPaymentForm()}
      {step === 3 && renderProcessing()}
      {step === 4 && renderSuccess()}

      {/* Bouton d'annulation */}
      {step < 4 && onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
        >
          Annuler le paiement
        </button>
      )}
    </div>
  );
};
