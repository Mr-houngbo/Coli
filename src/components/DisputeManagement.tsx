import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle,
  Shield,
  FileText,
  Camera,
  User,
  Calendar,
  DollarSign,
  Scale,
  Eye,
  Send
} from 'lucide-react';
import { Dispute, ColiSpace, Transaction } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface DisputeManagementProps {
  coliSpace?: ColiSpace;
  transaction?: Transaction;
  onDisputeCreated?: (dispute: Dispute) => void;
  onDisputeResolved?: (dispute: Dispute) => void;
  className?: string;
}

interface DisputeFormData {
  reason: Dispute['reason'];
  description: string;
  evidence_urls: string[];
  requested_action: 'refund' | 'partial_refund' | 'release_payment' | 'mediation';
  requested_amount?: number;
}

export const DisputeManagement: React.FC<DisputeManagementProps> = ({
  coliSpace,
  transaction,
  onDisputeCreated,
  onDisputeResolved,
  className = ''
}) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'view' | 'history'>('create');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création de litige
  const [formData, setFormData] = useState<DisputeFormData>({
    reason: 'package_not_delivered',
    description: '',
    evidence_urls: [],
    requested_action: 'refund'
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  const disputeReasons = [
    { value: 'package_not_delivered', label: 'Colis non livré', icon: AlertTriangle },
    { value: 'package_damaged', label: 'Colis endommagé', icon: AlertTriangle },
    { value: 'wrong_package', label: 'Mauvais colis reçu', icon: AlertTriangle },
    { value: 'late_delivery', label: 'Livraison en retard', icon: Clock },
    { value: 'gp_no_show', label: 'GP ne s\'est pas présenté', icon: User },
    { value: 'payment_issue', label: 'Problème de paiement', icon: DollarSign },
    { value: 'other', label: 'Autre', icon: FileText }
  ];

  const requestedActions = [
    { value: 'refund', label: 'Remboursement complet', description: 'Récupérer 100% du montant payé' },
    { value: 'partial_refund', label: 'Remboursement partiel', description: 'Récupérer une partie du montant' },
    { value: 'release_payment', label: 'Libérer le paiement', description: 'Finaliser la transaction' },
    { value: 'mediation', label: 'Médiation', description: 'Demander l\'intervention d\'un médiateur' }
  ];

  useEffect(() => {
    if (coliSpace?.id) {
      fetchDisputes();
    }
  }, [coliSpace?.id]);

  const fetchDisputes = async () => {
    if (!coliSpace?.id) return;
    
    setLoading(true);
    try {
      // Simulation - remplacez par votre API
      const mockDisputes: Dispute[] = [
        {
          id: '1',
          coli_space_id: coliSpace.id,
          transaction_id: transaction?.id || '',
          complainant_id: user?.id || '',
          respondent_id: coliSpace.gp_id,
          reason: 'package_not_delivered',
          description: 'Le colis n\'a jamais été livré malgré le statut "livré"',
          status: 'open',
          priority: 'high',
          evidence_urls: [],
          requested_action: 'refund',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setDisputes(mockDisputes);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        alert(`${file.name} dépasse la taille maximale de 10MB`);
        return false;
      }
      return true;
    });

    setEvidenceFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 fichiers
  };

  const removeEvidenceFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDispute = async () => {
    if (!coliSpace || !transaction || !user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Upload des fichiers de preuve
      const evidenceUrls: string[] = [];
      for (const file of evidenceFiles) {
        // Simulation d'upload - remplacez par votre logique
        const url = `https://storage.supabase.com/disputes/${coliSpace.id}/${Date.now()}_${file.name}`;
        evidenceUrls.push(url);
      }

      const newDispute: Omit<Dispute, 'id' | 'created_at' | 'updated_at'> = {
        coli_space_id: coliSpace.id,
        transaction_id: transaction.id,
        complainant_id: user.id,
        respondent_id: user.id === coliSpace.expediteur_id ? coliSpace.gp_id : coliSpace.expediteur_id,
        reason: formData.reason,
        description: formData.description,
        status: 'open',
        priority: 'medium',
        evidence_urls: evidenceUrls,
        requested_action: formData.requested_action,
        requested_amount: formData.requested_amount
      };

      // Simulation de création - remplacez par votre API
      const createdDispute: Dispute = {
        ...newDispute,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setDisputes(prev => [createdDispute, ...prev]);
      
      if (onDisputeCreated) {
        onDisputeCreated(createdDispute);
      }

      // Reset form
      setFormData({
        reason: 'package_not_delivered',
        description: '',
        evidence_urls: [],
        requested_action: 'refund'
      });
      setEvidenceFiles([]);
      setActiveTab('view');

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'open': return 'text-yellow-700 bg-yellow-100';
      case 'in_review': return 'text-blue-700 bg-blue-100';
      case 'resolved': return 'text-green-700 bg-green-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Dispute['status']) => {
    const labels = {
      open: 'Ouvert',
      in_review: 'En cours d\'examen',
      resolved: 'Résolu',
      rejected: 'Rejeté'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderCreateDispute = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Signaler un Problème
        </h2>
        <p className="text-gray-600">
          Décrivez le problème rencontré avec cette transaction
        </p>
      </div>

      {/* Informations de la transaction */}
      {coliSpace && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Transaction concernée</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Trajet:</span>
              <span className="ml-2 font-medium">
                {coliSpace.annonce?.ville_depart} → {coliSpace.annonce?.ville_arrivee}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Montant:</span>
              <span className="ml-2 font-medium">
                {transaction?.amount?.toLocaleString()} FCFA
              </span>
            </div>
            <div>
              <span className="text-gray-600">GP:</span>
              <span className="ml-2 font-medium">{coliSpace.gp?.full_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2 font-medium">
                {new Date(coliSpace.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Raison du litige */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quel est le problème ? *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {disputeReasons.map((reason) => {
            const IconComponent = reason.icon;
            return (
              <button
                key={reason.value}
                onClick={() => setFormData(prev => ({ ...prev, reason: reason.value as any }))}
                className={`p-4 border-2 rounded-lg flex items-center space-x-3 text-left transition-colors ${
                  formData.reason === reason.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{reason.label}</span>
                {formData.reason === reason.value && (
                  <CheckCircle className="w-5 h-5 text-red-500 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description détaillée */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description détaillée *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          placeholder="Décrivez en détail le problème rencontré..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Preuves */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preuves (photos, documents)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="evidence-upload"
          />
          <label
            htmlFor="evidence-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Cliquez pour ajouter des fichiers
            </span>
            <span className="text-xs text-gray-500">
              Images, PDF, Word - Max 10MB par fichier
            </span>
          </label>
        </div>

        {evidenceFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {evidenceFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeEvidenceFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action demandée */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quelle solution souhaitez-vous ? *
        </label>
        <div className="space-y-3">
          {requestedActions.map((action) => (
            <label key={action.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="requested_action"
                value={action.value}
                checked={formData.requested_action === action.value}
                onChange={(e) => setFormData(prev => ({ ...prev, requested_action: e.target.value as any }))}
                className="mt-1 text-red-600"
              />
              <div>
                <div className="font-medium text-gray-900">{action.label}</div>
                <div className="text-sm text-gray-600">{action.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Montant demandé (si remboursement partiel) */}
      {formData.requested_action === 'partial_refund' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant du remboursement demandé (FCFA)
          </label>
          <input
            type="number"
            value={formData.requested_amount || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, requested_amount: parseInt(e.target.value) || 0 }))}
            max={transaction?.amount || 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum: {transaction?.amount?.toLocaleString()} FCFA
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Important</p>
            <ul className="space-y-1">
              <li>• Votre litige sera examiné par notre équipe sous 24-48h</li>
              <li>• Les fonds resteront bloqués pendant l'examen</li>
              <li>• Fournissez le maximum de preuves pour accélérer le traitement</li>
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmitDispute}
        disabled={loading || !formData.description.trim()}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Envoi en cours...' : 'Signaler le Problème'}
      </button>
    </div>
  );

  const renderViewDisputes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Mes Litiges</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Scale className="w-4 h-4" />
          <span>{disputes.length} litige(s)</span>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-12">
          <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun litige</h3>
          <p className="text-gray-600">Vous n'avez signalé aucun problème pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {disputeReasons.find(r => r.value === dispute.reason)?.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Litige #{dispute.id} • {new Date(dispute.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
                    {getStatusLabel(dispute.status)}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(dispute.priority)}`}>
                    {dispute.priority}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{dispute.description}</p>

              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preuves jointes:</p>
                  <div className="flex space-x-2">
                    {dispute.evidence_urls.map((url, index) => (
                      <div key={index} className="w-16 h-16 bg-gray-100 rounded border">
                        <img 
                          src={url} 
                          alt={`Preuve ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Action demandée: <span className="font-medium">
                    {requestedActions.find(a => a.value === dispute.requested_action)?.label}
                  </span>
                  {dispute.requested_amount && (
                    <span> ({dispute.requested_amount.toLocaleString()} FCFA)</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDispute(dispute)}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Détails</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDisputeDetails = () => {
    if (!selectedDispute) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDispute(null)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Retour à la liste
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDispute.status)}`}>
            {getStatusLabel(selectedDispute.status)}
          </span>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {disputeReasons.find(r => r.value === selectedDispute.reason)?.label}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>Litige #{selectedDispute.id}</div>
                <div>Priorité: <span className={`font-medium ${getPriorityColor(selectedDispute.priority)}`}>
                  {selectedDispute.priority}
                </span></div>
                <div>Créé le: {new Date(selectedDispute.created_at).toLocaleDateString('fr-FR')}</div>
                <div>Mis à jour: {new Date(selectedDispute.updated_at).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{selectedDispute.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Action demandée</h3>
              <p className="text-gray-700">
                {requestedActions.find(a => a.value === selectedDispute.requested_action)?.label}
                {selectedDispute.requested_amount && (
                  <span className="ml-2 font-medium">
                    ({selectedDispute.requested_amount.toLocaleString()} FCFA)
                  </span>
                )}
              </p>
            </div>

            {selectedDispute.evidence_urls && selectedDispute.evidence_urls.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Preuves</h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedDispute.evidence_urls.map((url, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded border">
                      <img 
                        src={url} 
                        alt={`Preuve ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDispute.admin_response && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Réponse de l'équipe Coli</h3>
                <p className="text-blue-800">{selectedDispute.admin_response}</p>
                {selectedDispute.resolved_at && (
                  <p className="text-xs text-blue-600 mt-2">
                    Résolu le {new Date(selectedDispute.resolved_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'create', label: 'Signaler un Problème', icon: AlertTriangle },
    { id: 'view', label: 'Mes Litiges', icon: Scale },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {!selectedDispute ? (
        <>
          {/* Navigation par onglets */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {activeTab === 'create' && renderCreateDispute()}
            {activeTab === 'view' && renderViewDisputes()}
          </div>
        </>
      ) : (
        <div className="p-6">
          {renderDisputeDetails()}
        </div>
      )}
    </div>
  );
};
