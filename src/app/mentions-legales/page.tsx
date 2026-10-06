"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RumiosLogo } from "@/components/RumiosLogo";
import { useLang, type Lang } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

const COMPANY = {
  name: "VEREDA NUMÉRICA - UNIPESSOAL LDA",
  nipc: "519 436 830",
  capital: "1 000 €",
  address: "Avenida Engenheiro Arantes e Oliveira, n.º 3, R/C, Lisboa (freguesia de Areeiro), Portugal",
  manager: "Aurélien Floriant De Nunzio",
  email: "contact@rumios.ai",
  site: "rumios.ai",
};

const HOST = "Netlify, Inc. — 512 2nd Street, Suite 200, San Francisco, CA 94107, USA — netlify.com";

type Section = { title: string; body: React.ReactNode };

const CONTENT: Record<Lang, { back: string; title: string; updated: string; sections: Section[] }> = {
  fr: {
    back: "Retour à l'accueil",
    title: "Mentions légales",
    updated: "Dernière mise à jour : octobre 2026",
    sections: [
      {
        title: "Éditeur du site",
        body: (
          <>
            <p>Le site {COMPANY.site} et le service Rumios sont édités par :</p>
            <ul>
              <li><strong>{COMPANY.name}</strong>, société unipersonnelle à responsabilité limitée (sociedade unipessoal por quotas) de droit portugais</li>
              <li>Capital social : {COMPANY.capital}</li>
              <li>Siège social : {COMPANY.address}</li>
              <li>Immatriculée à la Conservatória do Registo Comercial de Lisboa sous le NIPC / NIF {COMPANY.nipc}</li>
              <li>Contact : <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
            </ul>
          </>
        ),
      },
      {
        title: "Directeur de la publication",
        body: <p>{COMPANY.manager}, gérant.</p>,
      },
      {
        title: "Hébergement",
        body: <p>{HOST}</p>,
      },
      {
        title: "Propriété intellectuelle",
        body: (
          <p>
            L&apos;ensemble des contenus du site (textes, interface, logo, marque Rumios, éléments graphiques et logiciels) est la propriété
            exclusive de {COMPANY.name}, sauf mention contraire. Toute reproduction, représentation ou adaptation, totale ou partielle,
            sans autorisation écrite préalable est interdite.
          </p>
        ),
      },
      {
        title: "Données personnelles",
        body: (
          <p>
            {COMPANY.name}{" "}est responsable du traitement des données personnelles collectées via le site, conformément au Règlement
            général sur la protection des données (RGPD). Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
            de limitation, de portabilité et d&apos;opposition, que vous pouvez exercer en écrivant à{" "}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Vous pouvez également introduire une réclamation auprès de
            l&apos;autorité de contrôle portugaise, la CNPD (cnpd.pt).
          </p>
        ),
      },
      {
        title: "Règlement des litiges",
        body: (
          <p>
            Les présentes mentions sont régies par le droit portugais. Conformément à la réglementation portugaise, un livre de
            réclamations électronique est disponible sur livroreclamacoes.pt. En cas de litige de consommation, vous pouvez recourir
            à une entité de résolution alternative des litiges, notamment le Centro de Arbitragem de Conflitos de Consumo de Lisboa
            (centroarbitragemlisboa.pt).
          </p>
        ),
      },
    ],
  },
  en: {
    back: "Back to home",
    title: "Legal notice",
    updated: "Last updated: October 2026",
    sections: [
      {
        title: "Publisher",
        body: (
          <>
            <p>The {COMPANY.site} website and the Rumios service are published by:</p>
            <ul>
              <li><strong>{COMPANY.name}</strong>, a Portuguese single-member private limited company (sociedade unipessoal por quotas)</li>
              <li>Share capital: {COMPANY.capital}</li>
              <li>Registered office: {COMPANY.address}</li>
              <li>Registered with the Conservatória do Registo Comercial de Lisboa under NIPC / NIF {COMPANY.nipc}</li>
              <li>Contact: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
            </ul>
          </>
        ),
      },
      {
        title: "Publication director",
        body: <p>{COMPANY.manager}, managing director.</p>,
      },
      {
        title: "Hosting",
        body: <p>{HOST}</p>,
      },
      {
        title: "Intellectual property",
        body: (
          <p>
            All content on this website (texts, interface, logo, the Rumios brand, graphics and software) is the exclusive property of{" "}
            {COMPANY.name} unless stated otherwise. Any full or partial reproduction, representation or adaptation without prior
            written consent is prohibited.
          </p>
        ),
      },
      {
        title: "Personal data",
        body: (
          <p>
            {COMPANY.name} is the controller of personal data collected through this website, in accordance with the General Data
            Protection Regulation (GDPR). You have the right to access, rectify, erase, restrict, port and object to the processing of
            your data, which you can exercise by writing to <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. You may also
            lodge a complaint with the Portuguese supervisory authority, the CNPD (cnpd.pt).
          </p>
        ),
      },
      {
        title: "Dispute resolution",
        body: (
          <p>
            This legal notice is governed by Portuguese law. In accordance with Portuguese regulations, an electronic complaints book
            is available at livroreclamacoes.pt. For consumer disputes, you may turn to an alternative dispute resolution entity,
            such as the Centro de Arbitragem de Conflitos de Consumo de Lisboa (centroarbitragemlisboa.pt).
          </p>
        ),
      },
    ],
  },
  pt: {
    back: "Voltar ao início",
    title: "Informação legal",
    updated: "Última atualização: outubro de 2026",
    sections: [
      {
        title: "Entidade responsável",
        body: (
          <>
            <p>O site {COMPANY.site} e o serviço Rumios são explorados por:</p>
            <ul>
              <li><strong>{COMPANY.name}</strong>, sociedade unipessoal por quotas</li>
              <li>Capital social: {COMPANY.capital}</li>
              <li>Sede: {COMPANY.address}</li>
              <li>Matriculada na Conservatória do Registo Comercial de Lisboa com o NIPC / NIF {COMPANY.nipc}</li>
              <li>Contacto: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
            </ul>
          </>
        ),
      },
      {
        title: "Diretor da publicação",
        body: <p>{COMPANY.manager}, gerente.</p>,
      },
      {
        title: "Alojamento",
        body: <p>{HOST}</p>,
      },
      {
        title: "Propriedade intelectual",
        body: (
          <p>
            Todos os conteúdos do site (textos, interface, logótipo, marca Rumios, elementos gráficos e software) são propriedade
            exclusiva da {COMPANY.name}, salvo indicação em contrário. É proibida qualquer reprodução, representação ou adaptação,
            total ou parcial, sem autorização prévia por escrito.
          </p>
        ),
      },
      {
        title: "Dados pessoais",
        body: (
          <p>
            A {COMPANY.name} é responsável pelo tratamento dos dados pessoais recolhidos através do site, nos termos do Regulamento
            Geral sobre a Proteção de Dados (RGPD). Pode exercer os seus direitos de acesso, retificação, apagamento, limitação,
            portabilidade e oposição escrevendo para <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Pode igualmente
            apresentar reclamação junto da Comissão Nacional de Proteção de Dados (cnpd.pt).
          </p>
        ),
      },
      {
        title: "Resolução de litígios",
        body: (
          <p>
            A presente informação rege-se pela lei portuguesa. Livro de Reclamações Eletrónico disponível em livroreclamacoes.pt. Em
            caso de litígio de consumo, o consumidor pode recorrer a uma entidade de resolução alternativa de litígios, nomeadamente
            o Centro de Arbitragem de Conflitos de Consumo de Lisboa (centroarbitragemlisboa.pt).
          </p>
        ),
      },
    ],
  },
};

export default function MentionsLegalesPage() {
  const { lang, setLang } = useLang();
  const c = CONTENT[lang];

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <header className="border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-5 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <RumiosLogo size={20} />
            <span className="text-[13px] font-semibold tracking-tight">RUMIOS</span>
          </Link>
          <div className="flex items-center gap-1">
            {(["fr", "en", "pt"] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "text-[11px] font-medium px-2 py-1 rounded-full transition-colors",
                  l === lang ? "bg-stone-900 text-white" : "text-stone-400 hover:text-stone-900"
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 md:px-6 py-10 md:py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-stone-500 hover:text-stone-900 transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> {c.back}
        </Link>
        <h1 className="text-[28px] md:text-[36px] font-bold tracking-tight mb-2">{c.title}</h1>
        <p className="text-[13px] text-stone-400 mb-10">{c.updated}</p>

        <div className="space-y-9">
          {c.sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-[17px] font-semibold mb-3">{s.title}</h2>
              <div className="text-[14px] text-stone-600 leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-violet-600 [&_a]:underline [&_a]:underline-offset-2">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
