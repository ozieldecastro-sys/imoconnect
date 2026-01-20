
import React, { useState, useEffect } from 'react';
import { Lead, LeadCategory, LeadStatus, BrokerPlan } from '../types';

interface CRMProps {
  leads: Lead[];
  brokerPlan: BrokerPlan;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onActivateLeads: (ids: string[]) => void;
  onTogglePlan: () => void;
  goBack: () => void;
}

type Tab = 'VITRINE' | 'CRM' | 'CATALOGO' | 'ASSINATURA';

const CRM: React.FC<CRMProps> = ({ leads, brokerPlan, onUpdateStatus, onActivateLeads, onTogglePlan, goBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('VITRINE');
  const [filter, setFilter] = useState<LeadCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<Lead | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Restrição de Plano: Free só vê Oportunidades na Vitrine
  const vitrineLeads = leads.filter(l => {
    if (!l.isActivated) {
      if (brokerPlan === 'FREE') return l.category === LeadCategory.OPORTUNIDADE;
      return true;
    }
    return false;
  });

  const myLeads = leads.filter(l => l.isActivated);

  const getFilteredLeads = () => {
    const base = activeTab === 'VITRINE' ? vitrineLeads : myLeads;
    let result = base;
    if (filter !== 'ALL') result = result.filter(l => l.category === filter);
    if (statusFilter !== 'ALL') result = result.filter(l => l.status === statusFilter);
    return result;
  };

  const currentLeads = getFilteredLeads();

  const getRemainingTime = (exclusiveUntil: string) => {
    const end = new Date(exclusiveUntil);
    const diff = end.getTime() - currentTime.getTime();
    if (diff <= 0) return 'Expirado';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m restantes`;
  };

  const categoryColors: Record<LeadCategory, string> = {
    [LeadCategory.OPORTUNIDADE]: 'bg-blue-100 text-blue-700 border-blue-200',
    [LeadCategory.QUALIFICADO]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    [LeadCategory.PRIORITARIO]: 'bg-rose-100 text-rose-700 font-bold border-rose-200',
  };

  const statusLabels: Record<LeadStatus, string> = {
    [LeadStatus.NOVO]: 'Novo',
    [LeadStatus.EM_ATENDIMENTO]: 'Em Atendimento',
    [LeadStatus.VISITA_REALIZADA]: 'Visita Realizada',
    [LeadStatus.PROPOSTA_ENVIADA]: 'Proposta Enviada',
    [LeadStatus.FECHADO]: 'Fechado',
    [LeadStatus.PERDIDO]: 'Perdido',
  };

  const toggleLeadSelection = (id: string) => {
    const newSelected = new Set(selectedLeadIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedLeadIds(newSelected);
  };

  const handleBulkActivate = () => {
    onActivateLeads(Array.from(selectedLeadIds));
    setSelectedLeadIds(new Set());
  };

  const totalActivationPrice = Array.from(selectedLeadIds).reduce((acc, id) => {
    const lead = leads.find(l => l.id === id);
    return acc + (lead?.preco_lead || 0);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-slate-800 hidden sm:block">Painel do Corretor</h1>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {(['VITRINE', 'CRM', 'CATALOGO', 'ASSINATURA'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab === 'VITRINE' ? 'Vitrine' : tab === 'CRM' ? 'Mini CRM' : tab === 'CATALOGO' ? 'Catálogo' : 'Plano PRO'}
                {tab === 'CRM' && brokerPlan === 'FREE' && (
                  <span className="ml-1.5 text-[8px] bg-indigo-600 text-white px-1 py-0.5 rounded leading-none">PRO</span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div 
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                brokerPlan === 'PRO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${brokerPlan === 'PRO' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              {brokerPlan === 'PRO' ? 'CORRETOR PRO' : 'GRATUITO'}
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">JD</div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'VITRINE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vitrine de Oportunidades</h2>
                <p className="text-slate-500 text-sm">
                  {brokerPlan === 'FREE' ? 'Você está vendo apenas Leads em Oportunidade.' : 'Acesso total aos leads qualificados e prioritários.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['ALL', LeadCategory.PRIORITARIO, LeadCategory.QUALIFICADO, LeadCategory.OPORTUNIDADE] as const).map(cat => (
                  <button
                    key={cat}
                    disabled={brokerPlan === 'FREE' && cat !== 'ALL' && cat !== LeadCategory.OPORTUNIDADE}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all border ${
                      filter === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                  >
                    {cat === 'ALL' ? 'Todos' : cat}
                    {cat !== 'ALL' && cat !== LeadCategory.OPORTUNIDADE && brokerPlan === 'FREE' && ' 🔒'}
                  </button>
                ))}
              </div>
            </div>

            {brokerPlan === 'FREE' && (
              <div className="bg-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-indigo-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <p className="text-sm font-bold">Leads Prioritários estão disponíveis apenas para corretores PRO.</p>
                </div>
                <button onClick={() => setActiveTab('ASSINATURA')} className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase">Fazer Upgrade</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentLeads.length === 0 ? (
                <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center">
                  <p className="text-slate-400 font-medium">Nenhuma oportunidade disponível para o seu plano no momento.</p>
                </div>
              ) : (
                currentLeads.map(lead => (
                  <div key={lead.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest border ${categoryColors[lead.category]}`}>
                            {lead.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">SCORE: {lead.score}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={selectedLeadIds.has(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{lead.customerName.split(' ')[0]} ***</h3>
                      <p className="text-xs text-slate-500 font-medium mb-4">{lead.formData.localizacao}</p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Interesse</p>
                          <p className="text-xs text-slate-700 font-bold">{lead.type}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Imóvel</p>
                          <p className="text-xs text-slate-700 font-bold truncate">{lead.formData.imovel_tipo}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-50 pt-3">
                         <span className="flex items-center gap-1">
                            <svg className="h-3 w-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
                            {lead.exclusividade_horas}h Excl.
                         </span>
                         <span className="font-bold text-slate-800">R$ {lead.preco_lead.toFixed(2)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onActivateLeads([lead.id])}
                      className="w-full bg-slate-50 border-t border-slate-100 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-wider"
                    >
                      Liberar contato
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'CRM' && (
          <div className="space-y-6 animate-in fade-in">
            {brokerPlan === 'FREE' ? (
              <div className="bg-white border-2 border-indigo-100 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔒</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">O Mini CRM é exclusivo para corretores PRO</h3>
                <p className="text-slate-600 mb-8">
                  Assine o plano PRO para gerenciar seus leads, status e histórico. Ferramenta indispensável para alta performance.
                </p>
                <button 
                  onClick={() => setActiveTab('ASSINATURA')}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all"
                >
                  Conhecer Planos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myLeads.length === 0 ? (
                  <div className="col-span-full py-20 bg-white border border-slate-200 rounded-2xl text-center">
                    <p className="text-slate-400 font-medium">Você ainda não ativou nenhuma oportunidade.</p>
                  </div>
                ) : (
                  currentLeads.map(lead => (
                    <div key={lead.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-200 transition-all flex flex-col sm:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${categoryColors[lead.category]}`}>
                              {lead.category}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 mt-2">{lead.customerName}</h3>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Tempo Restante</p>
                             <p className={`text-xs font-black ${getRemainingTime(lead.exclusiveUntil) === 'Expirado' ? 'text-red-500' : 'text-indigo-600'}`}>
                                {getRemainingTime(lead.exclusiveUntil)}
                             </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="flex-1">
                             <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Status Atual</p>
                             <select 
                               value={lead.status}
                               onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                               className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
                             >
                               {Object.values(LeadStatus).map(s => (
                                 <option key={s} value={s}>{statusLabels[s]}</option>
                               ))}
                             </select>
                           </div>
                           <button 
                             onClick={() => setSelectedLeadDetail(lead)}
                             className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                               <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                             </svg>
                           </button>
                        </div>

                        <a 
                          href={`https://wa.me/55${lead.customerPhone.replace(/\D/g, '')}?text=Olá ${lead.customerName}, vi seu interesse no ImoConnect!`}
                          target="_blank" rel="noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-xs font-bold text-center transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          Continuar Atendimento
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'CATALOGO' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Catálogo de Imóveis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-b-4 border-b-indigo-500">
                   <div className="h-48 bg-slate-200 relative overflow-hidden">
                      <img src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80&sig=${i}`} alt="Imóvel" className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">Venda</div>
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">R$ 450.000</div>
                   </div>
                   <div className="p-6">
                      <h4 className="font-bold text-slate-800 mb-1">Apartamento Vista Park</h4>
                      <p className="text-xs text-slate-500 mb-4">São Paulo, SP</p>
                      <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase">
                        <span>3 Quartos</span>
                        <span>2 Vagas</span>
                        <span>80m²</span>
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'ASSINATURA' && (
          <div className="space-y-12 animate-in fade-in max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Escolha seu Plano</h2>
              <p className="text-slate-500 font-medium">Torne-se um Corretor PRO e domine o mercado imobiliário.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plano Gratuito */}
              <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col opacity-70">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Plano Gratuito</h3>
                <div className="text-3xl font-black text-slate-900 mb-6">R$ 0<span className="text-sm font-normal text-slate-400">/mês</span></div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Acesso a Leads em Oportunidade
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-slate-300 font-bold">✕</span>
                    Sem Exclusividade na Ativação
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-slate-300 font-bold">✕</span>
                    Sem Mini CRM
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-slate-300 font-bold">✕</span>
                    Sem Histórico de Atendimento
                  </li>
                </ul>

                <button 
                  disabled={brokerPlan === 'FREE'}
                  onClick={onTogglePlan}
                  className="w-full py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  {brokerPlan === 'FREE' ? 'Plano Atual' : 'Migrar para Grátis'}
                </button>
              </div>

              {/* Plano PRO */}
              <div className="bg-white border-4 border-indigo-600 p-8 rounded-3xl flex flex-col relative shadow-2xl shadow-indigo-100 scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recomendado</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Corretor PRO</h3>
                <div className="text-4xl font-black text-indigo-600 mb-2">R$ 97,00<span className="text-sm font-normal text-slate-400">/mês</span></div>
                <p className="text-[11px] font-bold text-emerald-600 mb-6 flex items-center gap-1">
                  <span className="text-lg">💰</span> R$ 970,00 à vista no PIX (Economize 15%)
                </p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-slate-800 font-semibold">
                    <span className="text-indigo-600 font-bold">✓</span>
                    Acesso a Leads Prioritários (Alta Conversão)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-800 font-semibold">
                    <span className="text-indigo-600 font-bold">✓</span>
                    Mini CRM Exclusivo
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-800 font-semibold">
                    <span className="text-indigo-600 font-bold">✓</span>
                    Histórico e Gestão de Leads
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-800 font-semibold">
                    <span className="text-indigo-600 font-bold">✓</span>
                    Prioridade na Distribuição
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-800 font-semibold">
                    <span className="text-indigo-600 font-bold">✓</span>
                    Funcionalidades Avançadas de IA
                  </li>
                </ul>

                <button 
                  onClick={onTogglePlan}
                  className="w-full py-4 rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 uppercase tracking-tighter"
                >
                  {brokerPlan === 'PRO' ? 'Já é PRO - Sair' : 'Assinar Plano PRO'}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                 <h4 className="text-xl font-bold mb-2">Por que ser PRO?</h4>
                 <p className="text-slate-400 text-sm max-w-md">Corretores PRO convertem até 4x mais leads por conta da qualidade prioritária e ferramentas de gestão exclusivas.</p>
               </div>
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-10 h-10 rounded-full border-2 border-slate-900" alt="Corretor" />
                 ))}
                 <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold border-2 border-slate-900">+2k</div>
               </div>
            </div>
          </div>
        )}
      </main>

      {activeTab === 'VITRINE' && selectedLeadIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between border border-slate-700">
            <div className="flex flex-col pl-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Selecionados</span>
              <span className="text-lg font-black text-indigo-400">{selectedLeadIds.size} Leads</span>
            </div>
            <div className="text-right pr-4">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Investimento</span>
              <div className="text-xl font-black text-white">R$ {totalActivationPrice.toFixed(2)}</div>
            </div>
            <button 
              onClick={handleBulkActivate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black transition-all active:scale-95 text-xs uppercase tracking-tighter"
            >
              Liberar contatos
            </button>
          </div>
        </div>
      )}

      {selectedLeadDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="bg-slate-50 px-8 py-6 flex items-center justify-between border-b border-slate-100">
                 <div>
                   <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${categoryColors[selectedLeadDetail.category]}`}>
                     {selectedLeadDetail.category}
                   </span>
                   <h2 className="text-2xl font-bold text-slate-800 mt-1">{selectedLeadDetail.customerName}</h2>
                 </div>
                 <button onClick={() => setSelectedLeadDetail(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                 <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-1">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Score IA</p>
                       <p className="text-3xl font-black text-indigo-600">{selectedLeadDetail.score}/100</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Exclusividade</p>
                       <p className="text-sm font-bold text-slate-700">{getRemainingTime(selectedLeadDetail.exclusiveUntil)}</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Respostas do Formulário</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {Object.entries(selectedLeadDetail.formData).map(([key, value]) => (
                         <div key={key} className="bg-slate-50 p-4 rounded-2xl">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{key.replace('_', ' ')}</p>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{value}</p>
                         </div>
                       ))}
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mt-8">Análise Estratégica</h4>
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-800 italic">
                       "{selectedLeadDetail.scoreReasoning}"
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-white border-t border-slate-50">
                 <button onClick={() => setSelectedLeadDetail(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Fechar Detalhes</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
