"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Check, Eye, EyeOff, Loader2 } from "lucide-react"
import {
  CampoRotulo,
  IconeGoogle,
  MensagemErro,
  Separador,
  classeBotaoPrimario,
  classeBotaoSecundario,
  classeInput,
} from "@/app/_components/auth/auth-shell"

/** Espelha a política de `registerSchema` — feedback imediato, sem ida ao servidor. */
function conferirSenha(senha: string) {
  return [
    { rotulo: "Pelo menos 8 caracteres", ok: senha.length >= 8 },
    { rotulo: "Pelo menos uma letra", ok: /[a-zA-Z]/.test(senha) },
    { rotulo: "Pelo menos um número", ok: /[0-9]/.test(senha) },
  ]
}

export function RegisterForm() {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [entrandoGoogle, setEntrandoGoogle] = useState(false)

  const requisitos = conferirSenha(senha)
  const senhaValida = requisitos.every((r) => r.ok)

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setEnviando(true)

    try {
      const resposta = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, email, password: senha }),
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setErro(dados.error ?? "Não foi possível criar a conta.")
        setEnviando(false)
        return
      }

      // Cadastro feito: já entra na plataforma, sem passo extra
      const login = await signIn("credentials", {
        email,
        password: senha,
        redirect: false,
      })

      if (login?.error) {
        router.push("/login")
        return
      }

      router.push("/apos-login")
      router.refresh()
    } catch {
      setErro("Erro de conexão. Tente novamente.")
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => {
          setEntrandoGoogle(true)
          signIn("google", { callbackUrl: "/apos-login" })
        }}
        disabled={entrandoGoogle || enviando}
        className={classeBotaoSecundario}
      >
        {entrandoGoogle ? <Loader2 className="size-4 animate-spin" /> : <IconeGoogle />}
        Criar conta com Google
      </button>

      <Separador texto="ou" />

      <form onSubmit={aoEnviar} className="flex flex-col gap-4">
        {erro && <MensagemErro texto={erro} />}

        <div className="flex flex-col gap-1.5">
          <CampoRotulo htmlFor="nome">Nome completo</CampoRotulo>
          <input
            id="nome"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como deve aparecer no seu certificado"
            className={classeInput}
            disabled={enviando}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <CampoRotulo htmlFor="email">E-mail</CampoRotulo>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            className={classeInput}
            disabled={enviando}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <CampoRotulo htmlFor="senha">Senha</CampoRotulo>
          <div className="relative">
            <input
              id="senha"
              name="password"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Crie uma senha"
              className={`${classeInput} pr-11`}
              disabled={enviando}
              aria-describedby="requisitos-senha"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-km-ink-faint transition-colors hover:text-km-ink"
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {senha.length > 0 && (
            <ul id="requisitos-senha" className="flex flex-col gap-1 pt-1">
              {requisitos.map((r) => (
                <li
                  key={r.rotulo}
                  className={
                    r.ok
                      ? "flex items-center gap-1.5 text-xs text-km-brand"
                      : "flex items-center gap-1.5 text-xs text-km-ink-faint"
                  }
                >
                  <Check className={r.ok ? "size-3.5" : "size-3.5 opacity-40"} />
                  {r.rotulo}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={enviando || !senhaValida}
          className={classeBotaoPrimario}
        >
          {enviando && <Loader2 className="size-4 animate-spin" />}
          {enviando ? "Criando conta…" : "Criar conta"}
        </button>

        <p className="text-center text-xs leading-relaxed text-km-ink-faint">
          Ao criar sua conta você concorda com os{" "}
          <a href="/termos-de-uso" className="underline hover:text-km-brand">
            Termos de uso
          </a>{" "}
          e a{" "}
          <a href="/politica-de-privacidade" className="underline hover:text-km-brand">
            Política de privacidade
          </a>
          .
        </p>
      </form>
    </div>
  )
}
