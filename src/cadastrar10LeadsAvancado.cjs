"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const criarLead_1 = require("./utils/criarLead");
/**
 * Função para calcular score e definir nível e preço do lead
 * Baseado na Fase 1:
 * Score = Urgência + Tipo + Valor
 * Nível: Oportunidade, Qualificado, Prioritário
 * Preço: R$7, R$15, R$30
 */
function calcularScore(tipo, valor, urgencia) {
    let score = 0;
    // Urgência
    switch (urgencia) {
        case "economico":
            score += 10;
            break;
        case "qualificado":
            score += 25;
            break;
        case "prioritario":
            score += 50;
            break;
        default: score += 10;
    }
    // Tipo
    switch (tipo) {
        case "compra":
            score += 30;
            break;
        case "aluguel":
            score += 20;
            break;
        case "venda":
            score += 15;
            break;
        case "anunciar":
            score += 10;
            break;
    }
    // Valor
    if (valor <= 264000)
        score += 5;
    else if (valor <= 1000000)
        score += 10;
    else
        score += 15;
    // Determinar nível
    let nivelLead = "";
    if (score >= 80)
        nivelLead = "Prioritário";
    else if (score >= 60)
        nivelLead = "Qualificado";
    else
        nivelLead = "Oportunidade";
    // Determinar preço
    let precoLead = 0;
    if (score >= 80)
        precoLead = 30;
    else if (score >= 60)
        precoLead = 15;
    else
        precoLead = 7;
    return { score, nivelLead, precoLead };
}
// Array de 10 leads de exemplo com diferentes orçamentos e tipos
const leadsExemplo = [
    { nome: "João Silva", telefone: "87999911111", tipo: "compra", valor: 250000, cidade: "Juazeiro", bairro: "Centro", urgencia: "prioritario" },
    { nome: "Maria Souza", telefone: "87999922222", tipo: "aluguel", valor: 1200, cidade: "Petrolina", bairro: "Areia Branca", urgencia: "qualificado" },
    { nome: "Carlos Pereira", telefone: "87999933333", tipo: "venda", valor: 450000, cidade: "Juazeiro", bairro: "José e Maria", urgencia: "economico" },
    { nome: "Ana Lima", telefone: "87999944444", tipo: "anunciar", valor: 350000, cidade: "Petrolina", bairro: "Vila Eduardo", urgencia: "qualificado" },
    { nome: "Pedro Santos", telefone: "87999955555", tipo: "compra", valor: 800000, cidade: "Juazeiro", bairro: "Alto do Cruzeiro", urgencia: "prioritario" },
    { nome: "Larissa Fernandes", telefone: "87999966666", tipo: "aluguel", valor: 1800, cidade: "Petrolina", bairro: "Cohab", urgencia: "economico" },
    { nome: "Rafael Oliveira", telefone: "87999977777", tipo: "venda", valor: 600000, cidade: "Juazeiro", bairro: "Itaberaba", urgencia: "qualificado" },
    { nome: "Beatriz Gomes", telefone: "87999988888", tipo: "anunciar", valor: 420000, cidade: "Petrolina", bairro: "Cosme e Damião", urgencia: "prioritario" },
    { nome: "Fernando Costa", telefone: "87999999900", tipo: "compra", valor: 150000, cidade: "Juazeiro", bairro: "Tancredo Neves", urgencia: "economico" },
    { nome: "Juliana Ribeiro", telefone: "87999900011", tipo: "aluguel", valor: 900, cidade: "Petrolina", bairro: "Centro", urgencia: "qualificado" },
];
function cadastrarLeads() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const lead of leadsExemplo) {
            const { score, nivelLead, precoLead } = calcularScore(lead.tipo, lead.valor, lead.urgencia);
            // Preencher dados completos do lead
            const leadData = {
                nome: lead.nome,
                telefone: lead.telefone,
                tipo: lead.tipo,
                categoria: lead.tipo.charAt(0).toUpperCase() + lead.tipo.slice(1), // "Compra", "Aluguel" etc
                valor: lead.valor,
                cidade: lead.cidade,
                bairro: lead.bairro,
                urgencia: lead.urgencia,
                score,
                nivelLead,
                precoLead,
            };
            try {
                yield (0, criarLead_1.criarLead)(leadData);
                console.log(`Lead ${lead.nome} cadastrado com sucesso! Score: ${score}, Nível: ${nivelLead}, Preço: R$${precoLead}`);
            }
            catch (err) {
                console.error(`Erro ao cadastrar lead ${lead.nome}:`, err);
            }
        }
        console.log("Todos os 10 leads de exemplo foram cadastrados com score e nível.");
    });
}
// Executar
cadastrarLeads();
