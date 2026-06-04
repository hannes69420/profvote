export const metadata = { title: 'Rechtliche Grundlagen' };

export default function RechtlichesPage() {
  return (
    <div className="container-prose py-16 sm:py-24">
      <h1>Rechtliche Grundlagen</h1>
      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-ink-muted">

        <section>
          <h3 className="mb-3 text-base font-semibold text-ink-soft">Meinungsfreiheit und Rechtmäßigkeit der Plattform</h3>
          <p>Der Betrieb dieser Bewertungsplattform ist rechtlich zulässig und basiert auf dem Grundrecht der Meinungsfreiheit gemäß Art. 5 Abs. 1 Grundgesetz (GG). Die Veröffentlichung von Bewertungen über Professor:innen stellt grundsätzlich eine zulässige Meinungsäußerung dar, sofern sie sich auf die berufliche Tätigkeit bezieht und nicht beleidigend oder unwahr ist.</p>
          <p className="mt-3">Insbesondere hat der Bundesgerichtshof im sogenannten „Spickmich"-Urteil (BGH, Urteil vom 23.06.2009 – VI ZR 196/08) entschieden, dass Bewertungsplattformen für Lehrpersonen zulässig sind. Dabei wurde festgestellt, dass das öffentliche Interesse an Information und Transparenz die Persönlichkeitsrechte der bewerteten Personen überwiegen kann, solange die Bewertungen sachlich bleiben.</p>
          <p className="mt-3">Auch das allgemeine Persönlichkeitsrecht gemäß § 823 BGB steht der Veröffentlichung von Bewertungen nicht entgegen, sofern keine Schmähkritik, Beleidigung oder falsche Tatsachenbehauptungen vorliegen.</p>
          <p className="mt-3">Darüber hinaus ist die Bewertung von Lehrveranstaltungen ein anerkannter Bestandteil der Qualitätssicherung im Hochschulbereich und wird durch die Hochschulgesetze der Länder unterstützt.</p>
          <p className="mt-3">Diese Plattform dient dem freien Austausch von Erfahrungen und Meinungen sowie der Transparenz im Bildungsbereich und bewegt sich im Rahmen der geltenden gesetzlichen Bestimmungen.</p>
        </section>

        <section>
          <h3 className="mb-3 text-base font-semibold text-ink-soft">Hinweis zum Umgang mit Bewertungen</h3>
          <p>Alle Bewertungen müssen sachlich formuliert sein und dürfen keine rechtswidrigen Inhalte enthalten. Beleidigungen, Schmähkritik oder falsche Tatsachenbehauptungen sind nicht zulässig und werden entfernt.</p>
        </section>

        <section>
          <h3 className="mb-3 text-base font-semibold text-ink-soft">Kontakt und Klärung von Anliegen</h3>
          <p>Sollten Professor:innen oder andere betroffene Personen mit einer Bewertung nicht einverstanden sein oder Klärungsbedarf sehen, besteht jederzeit die Möglichkeit, uns über die angegebenen Kontaktmöglichkeiten zu erreichen. Wir nehmen solche Anliegen ernst und prüfen diese sorgfältig. Unser Ziel ist es, gemeinsam eine faire, transparente und angemessene Lösung zu finden.</p>
          <p className="mt-3">E-Mail: <a href="mailto:profvote-info@gmx.de" className="text-accent hover:underline">profvote-info@gmx.de</a></p>
        </section>

        <section>
          <h3 className="mb-3 text-base font-semibold text-ink-soft">Melde- und Moderationskonzept</h3>

          <SubSection title="Ziel der Moderation">
            <p>Ziel ist es, rechtswidrige Inhalte zu verhindern und eine sachliche und faire Bewertungsplattform zu gewährleisten.</p>
          </SubSection>

          <SubSection title="Meldefunktion">
            <p>Die Plattform stellt über unser Kontaktformular eine leicht zugängliche Möglichkeit bereit, Inhalte zu melden. Meldungen können insbesondere erfolgen durch betroffene Professoren, registrierte Nutzer und Dritte.</p>
          </SubSection>

          <SubSection title="Ablauf bei Meldungen">
            <p>Nach Eingang einer Meldung wird zunächst geprüft, ob ein offensichtlicher Verstoß vorliegt. Bei klaren Verstößen erfolgt eine sofortige Löschung oder Sperrung. In unklaren Fällen wird der Inhalt vorübergehend deaktiviert und intern geprüft.</p>
          </SubSection>

          <SubSection title="Kriterien für rechtswidrige Inhalte">
            <p>Ein Inhalt wird insbesondere entfernt, wenn er beleidigend oder ehrverletzend ist, nachweislich falsche Tatsachen enthält, Persönlichkeitsrechte verletzt oder gegen geltendes Recht verstößt.</p>
          </SubSection>

          <SubSection title="Dokumentation">
            <p>Alle Meldungen und Maßnahmen werden intern dokumentiert, um die Einhaltung rechtlicher Anforderungen nachweisen zu können.</p>
          </SubSection>

          <SubSection title="Wiederholte Verstöße">
            <p>Nutzer, die wiederholt gegen die Regeln verstoßen, werden verwarnt, temporär gesperrt oder dauerhaft ausgeschlossen.</p>
          </SubSection>

          <SubSection title="Kooperation mit Betroffenen">
            <p>Betroffene Personen haben die Möglichkeit, eine Stellungnahme einzureichen, die in die Prüfung einbezogen wird.</p>
          </SubSection>

          <SubSection title="Rechtliche Verpflichtungen">
            <p>Im Falle gesetzlicher Verpflichtungen werden Inhalte entfernt und ggf. relevante Daten an zuständige Behörden übermittelt.</p>
          </SubSection>
        </section>
      </div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="mb-1 font-medium text-ink-soft">{title}</h4>
      {children}
    </div>
  );
}
