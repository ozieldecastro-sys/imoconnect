
import React, { useState } from 'react';
import { LeadType } from '../types';
import { FORM_QUESTIONS } from '../constants';

interface LeadFormProps {
  type: LeadType;
  onSubmit: (formData: Record<string, string>, customerData: { name: string; phone: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ type, onSubmit, onCancel, isSubmitting }) => {
  const questions = FORM_QUESTIONS[type];
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customerData, setCustomerData] = useState({ name: '', phone: '' });
  const [step, setStep] = useState(0); // 0 for questionnaire, 1 for contact details

  const handleFieldChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const isFormValid = questions.every(q => formData[q.id]);
  const isContactValid = customerData.name.length > 2 && customerData.phone.length > 8;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      setStep(1);
    } else {
      onSubmit(formData, customerData);
    }
  };

  const typeLabels: Record<LeadType, string> = {
    [LeadType.COMPRAR]: 'Comprar Imóvel',
    [LeadType.ALUGAR]: 'Alugar Imóvel',
    [LeadType.VENDER]: 'Vender Imóvel',
    [LeadType.ANUNCIAR]: 'Anunciar Locação',
  };

  return (
    <div className="min-h-screen bg-indigo-50 py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-indigo-600 p-8 text-white">
          <button onClick={onCancel} className="mb-4 text-indigo-200 hover:text-white flex items-center gap-1 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h2 className="text-2xl font-bold">{typeLabels[type]}</h2>
          <p className="text-indigo-100 mt-1">
            {step === 0 ? 'Preencha os detalhes para um atendimento personalizado.' : 'Quase lá! Informe seus dados de contato.'}
          </p>
          <div className="flex gap-2 mt-6">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 0 ? 'bg-white' : 'bg-indigo-400'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-white' : 'bg-indigo-400'}`} />
          </div>
        </div>

        <form onSubmit={handleNext} className="p-8 space-y-6">
          {step === 0 ? (
            <>
              {questions.map(q => (
                <div key={q.id}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{q.label}</label>
                  {q.type === 'select' ? (
                    <select
                      required
                      value={formData[q.id] || ''}
                      onChange={(e) => handleFieldChange(q.id, e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    >
                      <option value="" disabled>Selecione uma opção</option>
                      {q.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      type="text"
                      placeholder="Ex: Pinheiros, São Paulo"
                      value={formData[q.id] || ''}
                      onChange={(e) => handleFieldChange(q.id, e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-md ${
                  isFormValid ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Próximo Passo
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Seu nome completo</label>
                  <input
                    required
                    type="text"
                    placeholder="Como devemos te chamar?"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone/WhatsApp</label>
                  <input
                    required
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!isContactValid || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center ${
                  isContactValid && !isSubmitting ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : 'Finalizar Solicitação'}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(0)}
                className="w-full text-slate-500 font-medium hover:text-slate-700 transition-colors"
              >
                Voltar para as perguntas
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
