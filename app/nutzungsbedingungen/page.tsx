export const metadata = { title: 'Nutzungsbedingungen' };

const SECTIONS = [
  {
    title: '1. Geltungsbereich',
    content: 'Diese Nutzungsbedingungen regeln die Nutzung der Plattform profvote.de, auf der Studierende Bewertungen über Professoren abgeben können. Mit der Registrierung akzeptieren Nutzer diese Nutzungsbedingungen.',
  },
  {
    title: '2. Registrierung und Nutzerkonto',
    content: `(1) Die Nutzung der Bewertungsfunktion setzt eine Registrierung mit einer gültigen Universitäts-E-Mail-Adresse voraus.\n(2) Nutzer sind verpflichtet, ihre Zugangsdaten geheim zu halten.\n(3) Ein Nutzerkonto ist nicht übertragbar.\n(4) Eine Verifizierung der angegebenen E-Mail-Adresse erfolgt nicht zwingend im Rahmen der Registrierung, sondern kann im Zusammenhang mit der Abgabe einer Bewertung (z. B. durch Bestätigungslink) durchgeführt werden.\n(5) Der Betreiber behält sich vor, Bewertungen nur nach erfolgreicher Verifizierung vollständig zu berücksichtigen oder andernfalls einzuschränken bzw. zu entfernen.`,
  },
  {
    title: '3. Anonyme Bewertungen',
    content: `(1) Bewertungen werden anonym veröffentlicht.\n(2) Eine öffentliche Zuordnung zur Identität des Nutzers erfolgt nicht.\n(3) Der Betreiber behält sich vor, Bewertungen intern einem Nutzerkonto zuzuordnen, sofern dies zur Missbrauchsverhinderung oder aus rechtlichen Gründen erforderlich ist.`,
  },
  {
    title: '4. Zulässige Inhalte',
    content: `Nutzer verpflichten sich, ausschließlich sachliche und wahrheitsgemäße Bewertungen abzugeben. Insbesondere unzulässig sind:\n– Beleidigungen oder Schmähkritik\n– unwahre Tatsachenbehauptungen\n– diskriminierende oder rassistische Inhalte\n– Drohungen oder Aufrufe zu Gewalt\n– Veröffentlichung personenbezogener Daten Dritter`,
  },
  {
    title: '5. Rechte an Inhalten',
    content: `(1) Nutzer räumen dem Betreiber ein einfaches, zeitlich unbegrenztes Nutzungsrecht an ihren Bewertungen ein.\n(2) Der Betreiber ist berechtigt, Inhalte zu speichern, zu veröffentlichen und zu moderieren.`,
  },
  {
    title: '6. Moderation und Löschung von Inhalten',
    content: `(1) Der Betreiber behält sich vor, Inhalte jederzeit zu prüfen, zu ändern oder zu löschen.\n(2) Inhalte können insbesondere entfernt werden, wenn sie gegen diese Nutzungsbedingungen oder geltendes Recht verstoßen.`,
  },
  {
    title: '7. Sperrung von Nutzern',
    content: `Der Betreiber kann Nutzerkonten vorübergehend oder dauerhaft sperren, wenn:\n– gegen diese Nutzungsbedingungen verstoßen wird\n– Missbrauch der Plattform vorliegt`,
  },
  {
    title: '8. Haftung',
    content: `(1) Nutzer sind für die von ihnen veröffentlichten Inhalte selbst verantwortlich.\n(2) Der Betreiber übernimmt keine Gewähr für die Richtigkeit der Bewertungen.`,
  },
  {
    title: '9. Änderung der Nutzungsbedingungen',
    content: 'Der Betreiber behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern.',
  },
  {
    title: '10. Anwendbares Recht',
    content: 'Es gilt das Recht der Bundesrepublik Deutschland.',
  },
];

export default function NutzungsbedingungenPage() {
  return (
    <div className="container-prose py-16 sm:py-24">
      <h1>Nutzungsbedingungen</h1>
      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-ink-muted">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h3 className="mb-3 text-base font-semibold text-ink-soft">{s.title}</h3>
            {s.content.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
