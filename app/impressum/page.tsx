export const metadata = { title: 'Impressum' };

export default function ImpressumPage() {
  return (
    <div className="container-prose py-16 sm:py-24">
      <h1>Impressum</h1>
      <div className="prose mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-ink-muted">
        <section>
          <h3 className="mb-2 text-base font-semibold text-ink-soft">Angaben gemäß § 5 DDG</h3>
          <p>Schätzle und Conrads Profvote GbR<br />Welserstraße 3<br />87463 Dietmannsried</p>
          <p className="mt-3">Vertreten durch die Gesellschafter:<br />Valentin Schätzle<br />Hannes Conrads</p>
        </section>

        <section>
          <h3 className="mb-2 text-base font-semibold text-ink-soft">Kontakt</h3>
          <p>E-Mail: <a href="mailto:profvote-info@gmx.de" className="text-accent hover:underline">profvote-info@gmx.de</a></p>
        </section>

        <section>
          <h3 className="mb-2 text-base font-semibold text-ink-soft">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
          <p>Valentin Schätzle, Hannes Conrads (Anschrift wie oben)</p>
        </section>

        <section>
          <h3 className="mb-2 text-base font-semibold text-ink-soft">Haftung für Nutzerinhalte (Bewertungen)</h3>
          <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
        </section>

        <section>
          <h3 className="mb-2 text-base font-semibold text-ink-soft">Haftung für Links</h3>
          <p>Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
        </section>

        <section>
          <h3 className="mb-2 text-base font-semibold text-ink-soft">Urheberrechtshinweis</h3>
          <p>Die auf unserer Internetseite vorhandenen Texte, Bilder, Fotos, Videos oder Grafiken unterliegen in der Regel dem Schutz des Urheberrechts. Jede unberechtigte Verwendung (insbesondere die Vervielfältigung, Bearbeitung oder Verbreitung) dieser urheberrechtsgeschützten Inhalte ist daher untersagt. Wenn Sie beabsichtigen, diese Inhalte oder Teile davon zu verwenden, kontaktieren Sie uns bitte im Voraus unter den oben stehenden Angaben. Soweit wir nicht selbst Inhaber der benötigten urheberrechtlichen Nutzungsrechte sein sollten, bemühen wir uns, einen Kontakt zum Berechtigten zu vermitteln.</p>
        </section>

        <section>
          <h3 className="mb-2 text-base font-semibold text-ink-soft">Verbraucherstreitbeilegung</h3>
          <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
        </section>
      </div>
    </div>
  );
}
