
import React from 'react';
import { LeadType } from '../types';

interface HomeProps {
  onSelect: (type: LeadType) => void;
  goToCRM: () => void;
}

const Home: React.FC<HomeProps> = ({ onSelect, goToCRM }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-24">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">ImoConnect</h2>
        </div>
        <button 
          onClick={goToCRM}
          className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Área do Corretor
        </button>
      </div>

      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Encontre seu próximo imóvel com facilidade
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          A plataforma inteligente que qualifica seu interesse e garante o atendimento prioritário que você merece.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          title="Quero comprar um imóvel" 
          description="Busque a casa dos seus sonhos ou investimentos."
          icon="🏠"
          onClick={() => onSelect(LeadType.COMPRAR)}
        />
        <Card 
          title="Quero alugar um imóvel" 
          description="Opções residenciais e comerciais flexíveis."
          icon="🔑"
          onClick={() => onSelect(LeadType.ALUGAR)}
        />
        <Card 
          title="Quero vender meu imóvel" 
          description="Venda com rapidez e segurança documental."
          icon="💰"
          onClick={() => onSelect(LeadType.VENDER)}
        />
        <Card 
          title="Quero anunciar para locação" 
          description="Deixe a gestão e divulgação com especialistas."
          icon="📢"
          onClick={() => onSelect(LeadType.ANUNCIAR)}
        />
      </div>

      <footer className="mt-24 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        © 2024 ImoConnect - Plataforma de Geração de Leads Imobiliários. Todos os direitos reservados.
      </footer>
    </div>
  );
};

const Card: React.FC<{ title: string; description: string; icon: string; onClick: () => void }> = ({ title, description, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all text-left group"
  >
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
    <div className="mt-6 flex items-center text-indigo-600 font-semibold text-sm">
      Começar agora
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

export default Home;
