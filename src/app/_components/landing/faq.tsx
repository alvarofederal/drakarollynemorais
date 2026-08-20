import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faq } from "@/config/landing"

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-km-line py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs tracking-[0.14em] text-km-brand uppercase">
            Dúvidas frequentes
          </span>
          <h2 className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance text-km-ink sm:text-4xl">
            Antes de se inscrever.
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faq.map((item, i) => (
            <AccordionItem
              key={item.pergunta}
              value={`item-${i}`}
              className="border-km-line-soft"
            >
              <AccordionTrigger className="text-left text-base font-medium text-km-ink hover:no-underline">
                {item.pergunta}
              </AccordionTrigger>
              <AccordionContent className="text-[0.95rem] leading-relaxed text-km-ink-soft">
                {item.resposta}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
