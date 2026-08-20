import { z } from "zod"

const NIVEIS = ["INTRODUTORIO", "INTERMEDIARIO", "AVANCADO"] as const
const TIPOS_ACESSO = ["VITALICIO", "PRAZO_DIAS"] as const
const TIPOS_AULA = ["VIDEO", "TEXTO", "PDF"] as const

export const cursoSchema = z
  .object({
    titulo: z.string().trim().min(3, "O título precisa de pelo menos 3 caracteres").max(160),
    subtitulo: z.string().trim().max(240).optional().or(z.literal("")),
    descricao: z.string().trim().max(8000).optional().or(z.literal("")),
    nivel: z.enum(NIVEIS).default("INTRODUTORIO"),
    cargaHorariaMinutos: z.coerce.number().int().min(0).max(100_000).default(0),
    precoCentavos: z.coerce.number().int().min(0, "Preço inválido").max(100_000_00),
    precoDeCentavos: z.coerce.number().int().min(0).max(100_000_00).optional().nullable(),
    tipoAcesso: z.enum(TIPOS_ACESSO).default("VITALICIO"),
    acessoDias: z.coerce.number().int().min(1).max(3650).optional().nullable(),
    emiteCertificado: z.coerce.boolean().default(true),
    percentualParaCertificado: z.coerce.number().int().min(1).max(100).default(100),
  })
  .refine(
    (d) => d.tipoAcesso !== "PRAZO_DIAS" || (d.acessoDias ?? 0) > 0,
    { message: "Informe por quantos dias o aluno terá acesso", path: ["acessoDias"] }
  )
  .refine(
    (d) => !d.precoDeCentavos || d.precoDeCentavos > d.precoCentavos,
    { message: 'O preço "de" precisa ser maior que o preço atual', path: ["precoDeCentavos"] }
  )

export const moduloSchema = z.object({
  cursoId: z.string().min(1),
  titulo: z.string().trim().min(2, "Informe o título do módulo").max(160),
  descricao: z.string().trim().max(2000).optional().or(z.literal("")),
})

export const aulaSchema = z.object({
  moduloId: z.string().min(1),
  titulo: z.string().trim().min(2, "Informe o título da aula").max(160),
  descricao: z.string().trim().max(4000).optional().or(z.literal("")),
  tipo: z.enum(TIPOS_AULA).default("VIDEO"),
  gratuita: z.coerce.boolean().default(false),
})

export const reordenarSchema = z.object({
  id: z.string().min(1),
  direcao: z.enum(["cima", "baixo"]),
})

export type CursoInput = z.input<typeof cursoSchema>
export type ModuloInput = z.infer<typeof moduloSchema>
export type AulaInput = z.infer<typeof aulaSchema>
