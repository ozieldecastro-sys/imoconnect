import React, { useState } from "react";
import { LeadType } from "../types";
import { FORM_QUESTIONS } from "../constants";
import { criarLeadCall } from "../firebase";

interface LeadFormProps {
  type: LeadType;
  onCancel: () => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ type, onCancel }) => {
  const questions = FORM_QUESTIONS[type];

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customerData, setCustomerData] = useState({ name: "", phone: "" });

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const isFormValid = questions.every((q) => formData[q.id]);
  const isContactValid =
    customerData.name.length > 2 && customerData.phone.length > 8;

  const mapLeadType = () => {
    switch (type) {
      case LeadType.COMPRAR:
        return "compra";
      case LeadType.ALUGAR:
        return "aluguel";
      case LeadType.VENDER:
        return "venda";
      case LeadType.ANUNCIAR:
        return "anunciar";
      default:
        return "compra";
    }
  };

  const mapPrazo = (prazo: string) => {
    const p = prazo.toLowerCase();

    if (p.includes("imediato")) return "imediato";
    if (p.includes("3")) return "curto";
    if (p.includes("planej")) return "planejando";

    return "pesquisando";
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 0) {
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        nome: customerData.name,
        telefone: customerData.phone.replace(/\D/g, ""),

        cidade: formData.cidade || "",
        bairro: formData.bairro || "",

        tipo: mapLeadType(),
        valor: Number(formData.valor || 0),
        prazo: mapPrazo(formData.prazo || ""),

        endereco: formData.endereco || null,
        formaPagamento: formData.formaPagamento || null,
        tipoImovel: formData.tipoImovel || null,
        documentacao: formData.documentacao || null,
        numQuartos: formData.numQuartos || null,
        areaImovel: formData.areaImovel || null,
        observacoes: formData.observacoes || null,
      };

      const result = await criarLeadCall(payload);

      console.log("Lead criado:", result.data);

      alert("Solicitação enviada com sucesso!");

      setFormData({});
      setCustomerData({ name: "", phone: "" });
      setStep(0);
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      alert("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabels: Record<LeadType, string> = {
    [LeadType.COMPRAR]: "Comprar Imóvel",
    [LeadType.ALUGAR]: "Alugar Imóvel",
    [LeadType.VENDER]: "Vender Imóvel",
    [LeadType.ANUNCIAR]: "Anunciar Locação",
  };

  return (
    <div className="min-h-screen bg-indigo-50 py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <button
            onClick={onCancel}
            className="mb-4 text-indigo-200 hover:text-white flex items-center gap-1 text-sm"
          >
            Voltar
          </button>

          <h2 className="text-2xl font-bold">{typeLabels[type]}</h2>

          <p className="text-indigo-100 mt-1">
            {step === 0
              ? "Preencha os detalhes para um atendimento personalizado."
              : "Quase lá! Informe seus dados de contato."}
          </p>
        </div>

        <form onSubmit={handleNext} className="p-8 space-y-6">
          {step === 0 ? (
            <>
              {questions.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {q.label}
                  </label>

                  {q.type === "select" ? (
                    <select
                      required
                      value={formData[q.id] || ""}
                      onChange={(e) =>
                        handleFieldChange(q.id, e.target.value)
                      }
                      className="w-full p-3 border border-slate-200 rounded-xl"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>

                      {q.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      type="text"
                      value={formData[q.id] || ""}
                      onChange={(e) =>
                        handleFieldChange(q.id, e.target.value)
                      }
                      className="w-full p-3 border border-slate-200 rounded-xl"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold"
              >
                Próximo Passo
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Seu nome
                </label>

                <input
                  required
                  type="text"
                  value={customerData.name}
                  onChange={(e) =>
                    setCustomerData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Telefone / WhatsApp
                </label>

                <input
                  required
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) =>
                    setCustomerData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={!isContactValid || isSubmitting}
                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold"
              >
                {isSubmitting ? "Enviando..." : "Finalizar Solicitação"}
              </button>

              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-full text-slate-500 font-medium"
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