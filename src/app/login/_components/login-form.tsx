"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import {
  CampoRotulo,
  IconeGoogle,
  MensagemErro,
  Separador,
  classeBotaoPrimario,
  classeBotaoSecundario,
  classeInput,
} from "@/app/_components/auth/auth-shell"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [entrandoGoogle, setEntrandoGoogle] = useState(false)

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setEnviando(true)

    const resultado = await signIn("credentials", {
      email,
      password: senha,
      redirect: false,
    })

    if (resultado?.error) {
      // Mensagem única de propósito: não revelamos se o e-mail existe
      setErro("E-mail ou senha incorretos.")
      setEnviando(false)
      return
    }

    router.push("/apos-login")
    router.refresh()
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
        Entrar com Google
      </button>

      <Separador texto="ou" />

      <form onSubmit={aoEnviar} className="flex flex-col gap-4">
        {erro && <MensagemErro texto={erro} />}

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
          <div className="flex items-baseline justify-between gap-3">
            <CampoRotulo htmlFor="senha">Senha</CampoRotulo>
            <Link
              href="/forgot-password"
              className="text-xs text-km-ink-faint transition-colors hover:text-km-brand"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              id="senha"
              name="password"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              className={`${classeInput} pr-11`}
              disabled={enviando}
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
        </div>

        <button type="submit" disabled={enviando} className={classeBotaoPrimario}>
          {enviando && <Loader2 className="size-4 animate-spin" />}
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  )
}
