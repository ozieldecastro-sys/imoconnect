import { useEffect, useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";
import { functions } from "../firebase";

type Corretor = {
  id?: string;
  nome?: string;
  email?: string;
  plano?: string;
  tipoUsuario?: string;
  ativo?: boolean;
  qualificacaoConcluida?: boolean;
};

type LoginResponse = {
  sucesso: boolean;
  message: string;
  corretor: Corretor;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const mensagemEhSucesso = useMemo(() => {
    return msg.toLowerCase().includes("sucesso");
  }, [msg]);

  useEffect(() => {
    const corretor = localStorage.getItem("corretor");

    if (corretor) {
      navigate("/dashboard");
    }
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
        localStorage.setItem("corretor", JSON.stringify(data.corretor));
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
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 lg:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-10 text-white lg:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
                  <span>🏢</span>
                  <span>ImoConnect</span>
                </div>

                <h1 className="mt-8 text-4xl font-bold leading-tight">
                  Plataforma inteligente para operação de leads imobiliários
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
                  Organize sua operação, compre leads com mais clareza, acompanhe
                  seu saldo, visualize oportunidades e evolua sua performance
                  comercial dentro da plataforma.
                </p>
              </div>

              <div className="mt-10 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm font-semibold text-white">
                    O que você já encontra no sistema
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    <li>• Dashboard profissional</li>
                    <li>• Extrato financeiro</li>
                    <li>• Leads com classificação comercial</li>
                    <li>• Controle de plano BASIC / PRO / ADMIN</li>
                    <li>• Operação com exclusividade e distribuição</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-blue-500/15 p-4 text-sm text-blue-100 ring-1 ring-white/10">
                  Próxima evolução do produto: qualificação inteligente de
                  corretores para distribuição cada vez mais precisa.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center lg:text-left">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 lg:mx-0">
                  <span>🛡️</span>
                  <span>Acesso do corretor</span>
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                  Entrar no ImoConnect
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use seu email e senha para acessar sua operação dentro da
                  plataforma.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                    <span className="text-slate-400">✉️</span>
                    <input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Senha
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                    <span className="text-slate-400">🔑</span>
                    <input
                      type="password"
                      placeholder="Digite sua senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={carregando}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {carregando ? "Entrando..." : "Entrar"}
                </button>

                {msg && (
                  <div
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      mensagemEhSucesso
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {!mensagemEhSucesso && <span className="shrink-0">⚠️</span>}
                    <span>{msg}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-800">
                  Importante
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Nesta fase, o sistema já está preparado para evoluir para a
                  qualificação oficial dos corretores. No próximo passo, vamos
                  construir esse fluxo de forma estruturada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}