import { useEffect, useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { functions, db } from "../firebase";

type Corretor = {
  id?: string;
  nome?: string;
  email?: string;
  plano?: string;
  tipoUsuario?: string;
  ativo?: boolean;
  qualificacaoConcluida?: boolean;
  planoStatus?: string;
  planoIniciadoEm?: any;
  planoExpiraEm?: any;
  planoOrigem?: string;
  ultimoPagamentoPlanoEm?: any;
};

type LoginResponse = {
  sucesso: boolean;
  message: string;
  corretor: Corretor;
};

function montarCorretorSeguro(corretor: Corretor | null | undefined): Corretor {
  return {
    id: corretor?.id || "",
    nome: corretor?.nome || "Usuário",
    email: corretor?.email || "",
    plano: corretor?.plano || "BASIC",
    tipoUsuario: corretor?.tipoUsuario || "corretor",
    ativo: corretor?.ativo,
    qualificacaoConcluida: corretor?.qualificacaoConcluida,
    planoStatus: corretor?.planoStatus || "",
    planoIniciadoEm: corretor?.planoIniciadoEm || null,
    planoExpiraEm: corretor?.planoExpiraEm || null,
    planoOrigem: corretor?.planoOrigem || "",
    ultimoPagamentoPlanoEm: corretor?.ultimoPagamentoPlanoEm || null,
  };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [validandoSessao, setValidandoSessao] = useState(true);
  const navigate = useNavigate();

  const mensagemEhSucesso = useMemo(() => {
    return msg.toLowerCase().includes("sucesso");
  }, [msg]);

  async function enriquecerCorretorComFirestore(corretorBase: Corretor) {
    const corretorSeguro = montarCorretorSeguro(corretorBase);

    if (!corretorSeguro.id) {
      return corretorSeguro;
    }

    try {
      const usuarioRef = doc(db, "usuarios", corretorSeguro.id);
      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()) {
        return corretorSeguro;
      }

      const usuarioBanco = usuarioSnap.data();

      return {
        ...corretorSeguro,
        nome: usuarioBanco.nome || corretorSeguro.nome || "Usuário",
        email: usuarioBanco.email || corretorSeguro.email || "",
        plano: usuarioBanco.plano || corretorSeguro.plano || "BASIC",
        tipoUsuario:
          usuarioBanco.tipoUsuario || corretorSeguro.tipoUsuario || "corretor",
        ativo:
          typeof usuarioBanco.ativo === "boolean"
            ? usuarioBanco.ativo
            : corretorSeguro.ativo,
        qualificacaoConcluida:
          typeof usuarioBanco.qualificacaoConcluida === "boolean"
            ? usuarioBanco.qualificacaoConcluida
            : corretorSeguro.qualificacaoConcluida,
        planoStatus: usuarioBanco.planoStatus || "",
        planoIniciadoEm: usuarioBanco.planoIniciadoEm || null,
        planoExpiraEm: usuarioBanco.planoExpiraEm || null,
        planoOrigem: usuarioBanco.planoOrigem || "",
        ultimoPagamentoPlanoEm: usuarioBanco.ultimoPagamentoPlanoEm || null,
      } as Corretor;
    } catch (error) {
      console.error(
        "Erro ao enriquecer sessão com dados do Firestore. Mantendo dados base:",
        error
      );
      return corretorSeguro;
    }
  }

  useEffect(() => {
    async function validarSessaoExistente() {
      const corretorSalvo = localStorage.getItem("corretor");

      if (!corretorSalvo) {
        setValidandoSessao(false);
        return;
      }

      try {
        const corretorLocal = JSON.parse(corretorSalvo);
        const corretorAtualizado = await enriquecerCorretorComFirestore(
          montarCorretorSeguro(corretorLocal)
        );

        localStorage.setItem("corretor", JSON.stringify(corretorAtualizado));
        navigate("/dashboard");
      } catch (error) {
        console.error("Erro ao validar sessão existente:", error);
        localStorage.removeItem("corretor");
      } finally {
        setValidandoSessao(false);
      }
    }

    validarSessaoExistente();
  }, [navigate]);

  const handleLogin = async () => {
    setMsg("");

    if (!email.trim() || !senha.trim()) {
      setMsg("Preencha email e senha para entrar.");
      return;
    }

    try {
      setCarregando(true);

      const login = httpsCallable(functions, "loginCorretor");
      const res = await login({ email: email.trim(), senha });
      const data = res.data as LoginResponse;

      if (data?.sucesso) {
        const corretorBase = montarCorretorSeguro(data.corretor);
        const corretorAtualizado = await enriquecerCorretorComFirestore(corretorBase);

        localStorage.setItem("corretor", JSON.stringify(corretorAtualizado));
        setMsg(data.message || "Login realizado com sucesso.");

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
        return;
      }

      setMsg("Não foi possível realizar o login.");
    } catch (error: any) {
      const mensagem =
        error?.message ||
        error?.details ||
        "Erro ao logar. Verifique seus dados e tente novamente.";

      setMsg(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eaf2ff_0%,#f8fafc_220px,#f8fafc_100%)] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1080px] items-center">
        <div className="grid w-full overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_22px_54px_rgba(15,23,42,0.12)] lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_58%,#2563eb_100%)] p-7 text-white lg:block">
            <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black text-blue-100 backdrop-blur">
                  <span>🏢</span>
                  <span>ImoConnect</span>
                </div>

                <h1 className="mt-5 max-w-lg text-[1.9rem] font-black leading-[1.05] tracking-[-0.05em]">
                  Venda melhor com mais controle, velocidade e inteligência
                </h1>

                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-200">
                  Acesse sua operação para acompanhar leads, avançar no CRM,
                  controlar seu financeiro e trabalhar oportunidades com muito
                  mais clareza comercial.
                </p>

                <div className="mt-5 rounded-[20px] border border-emerald-300/20 bg-emerald-400/10 p-4 backdrop-blur">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
                    Vantagem do Plano PRO
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">
                    Menor custo por lead, mais tempo de exclusividade e mais
                    margem para operar com estratégia.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-blue-100">
                      Mais margem
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-100">
                      Compre leads com melhor custo e proteja seu resultado.
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-blue-100">
                      Mais controle
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-100">
                      Acompanhe carteira, funil e exclusividade com mais precisão.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-[20px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm font-black text-white">
                    O que você desbloqueia ao entrar
                  </p>

                  <div className="mt-3 grid gap-2">
                    <div className="rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-slate-200">
                      Oportunidades organizadas em dashboard profissional
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-slate-200">
                      CRM para evoluir cada atendimento com disciplina
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-slate-200">
                      Financeiro claro para operar com segurança
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100 backdrop-blur">
                  Corretores que acompanham melhor a carteira e respondem mais
                  rápido tendem a converter mais.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-7 lg:p-8">
            <div className="w-full max-w-md">
              <div className="mb-7 text-center lg:text-left">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[11px] font-black text-blue-700 lg:mx-0">
                  <span>🛡️</span>
                  <span>Acesso do corretor</span>
                </div>

                <h2 className="mt-4 text-[2rem] font-black tracking-[-0.05em] text-slate-900">
                  Entrar no ImoConnect
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Entre para operar seus leads com mais organização, visão e
                  vantagem comercial.
                </p>
              </div>

              {validandoSessao ? (
                <div className="rounded-[20px] border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
                  Validando sua sessão...
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">
                      Email
                    </label>

                    <div className="flex items-center gap-3 rounded-[18px] border border-slate-300 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <span className="text-slate-400">✉️</span>
                      <input
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full border-0 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">
                      Senha
                    </label>

                    <div className="flex items-center gap-3 rounded-[18px] border border-slate-300 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <span className="text-slate-400">🔑</span>
                      <input
                        type="password"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full border-0 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={carregando}
                    className="inline-flex w-full items-center justify-center rounded-[18px] bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {carregando ? "Entrando..." : "Entrar na plataforma"}
                  </button>

                  {msg && (
                    <div
                      className={`flex items-start gap-3 rounded-[18px] border px-4 py-3 text-sm font-medium ${
                        mensagemEhSucesso
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {!mensagemEhSucesso && <span className="shrink-0">⚠️</span>}
                      {mensagemEhSucesso && <span className="shrink-0">✅</span>}
                      <span>{msg}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-800">
                  Mais disciplina, mais resultado
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Quem acompanha melhor a carteira, responde rápido e trabalha o
                  funil com consistência tende a aproveitar mais oportunidades.
                </p>
              </div>

              <div className="mt-5 rounded-[20px] border border-blue-100 bg-blue-50 p-4 lg:hidden">
                <p className="text-sm font-black text-blue-800">Plano PRO</p>
                <p className="mt-2 text-sm leading-6 text-blue-700">
                  Menor custo por lead, mais tempo de exclusividade e mais
                  vantagem para operar com inteligência no ImoConnect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}