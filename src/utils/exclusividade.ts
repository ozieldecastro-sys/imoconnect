export function calcularExpiracao(perfil: string) {
  const agora = new Date();

  const horas = perfil === "Lead Prioritário" ? 48 : 24;

  agora.setHours(agora.getHours() + horas);

  return agora;
}