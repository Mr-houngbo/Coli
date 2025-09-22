import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MailCheck, RefreshCw } from 'lucide-react';

const EmailConfirmation: React.FC = () => {
  const location = useLocation() as { state?: { email?: string } };
  const initialEmail = location?.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsSending(true);
    setError(null);
    setSent(false);
    try {
      if (!email) {
        setError("Veuillez renseigner votre email pour renvoyer le lien.");
        return;
      }
      // Resend confirmation email
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Impossible de renvoyer l\'email pour le moment.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mb-4">
          <MailCheck className="h-7 w-7 text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmez votre email</h1>
        <p className="text-gray-600 mb-4">
          Votre compte a été créé avec succès.
          {email ? (
            <> Un email de confirmation a été envoyé à <span className="font-medium">{email}</span>.</>
          ) : (
            <> Un email de confirmation vous a été envoyé.</>
          )}
          Veuillez cliquer sur le lien dans cet email pour activer votre compte avant de pouvoir vous connecter.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
            />
            <button
              onClick={handleResend}
              disabled={isSending}
              className="inline-flex items-center gap-2 px-4 h-12 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSending ? 'animate-spin' : ''}`} />
              {isSending ? 'Envoi...' : 'Renvoyer' }
            </button>
          </div>

          {sent && <p className="text-sm text-green-600">Email de confirmation renvoyé avec succès.</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <Link
            to="/"
            className="inline-block w-full text-center mt-2 px-4 h-12 leading-[3rem] rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
