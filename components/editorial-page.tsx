import Link from "next/link"

export function EditorialPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[] }) {
  return <main className="editorial-page"><header className="editorial-header"><Link href="/" className="text-link">CLP Jewels</Link><Link href="/" className="text-link">Back to collection</Link></header><article className="editorial-content"><p className="eyebrow gold-text">{eyebrow}</p><h1>{title}</h1><p className="editorial-intro">{intro}</p>{sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}</article></main>
}
