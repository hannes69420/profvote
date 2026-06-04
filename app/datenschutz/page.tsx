export const metadata = { title: 'Datenschutzerklärung' };

export default function DatenschutzPage() {
  return (
    <div className="container-prose py-16 sm:py-24">
      <h1>Datenschutzerklärung</h1>
      <p className="mt-4 text-sm text-ink-muted">
        Informationen nach Art. 13, 14 und 21 der Datenschutz-Grundverordnung (DS-GVO)
      </p>
      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-ink-muted">

        <Section title="1. Verantwortlicher">
          <p>Schätzle und Conrads Profvote GbR<br />Welserstraße 3<br />87463 Dietmannsried</p>
          <p className="mt-2">Vertreten durch: Valentin Schätzle, Hannes Conrads</p>
          <p className="mt-2">E-Mail: <a href="mailto:profvote-info@gmx.de" className="text-accent hover:underline">profvote-info@gmx.de</a></p>
        </Section>

        <Section title="2. Erhebung personenbezogener Daten">
          <p>Im Folgenden informieren wir über die Erhebung personenbezogener Daten bei Nutzung unserer Website. Personenbezogene Daten sind alle Daten, die auf Sie persönlich beziehbar sind, z. B. Name, Adresse, E-Mail-Adressen, Nutzerverhalten.</p>
        </Section>

        <Section title="3. Registrierung und Nutzerkonto">
          <SubSection title="a) Beim Besuch der Website">
            <p>Beim Aufrufen unserer Website werden automatisch folgende Informationen erfasst: IP-Adresse, Datum und Uhrzeit des Zugriffs, Name und URL der abgerufenen Datei, Referrer-URL, verwendeter Browser und Betriebssystem sowie der Name des Access-Providers.</p>
            <p className="mt-2">Diese Daten werden verarbeitet zur Gewährleistung eines reibungslosen Verbindungsaufbaus sowie zur Systemsicherheit und Stabilität. Rechtsgrundlage: Art. 6 Abs. 1 Satz 1 lit. f DSGVO.</p>
          </SubSection>
          <SubSection title="b) Registrierung und Nutzerkonto">
            <p>Für die Abgabe von Bewertungen ist eine Registrierung erforderlich. Dabei erheben wir: Universitäts-E-Mail-Adresse, Passwort (verschlüsselt gespeichert).</p>
            <p className="mt-2">Zwecke: Verifizierung der Zugehörigkeit zu einer Hochschule, Verhinderung von Missbrauch. Rechtsgrundlage: Art. 6 Abs. 1 Satz 1 lit. b DSGVO.</p>
          </SubSection>
          <SubSection title="c) Bewertungen und deren Veröffentlichung">
            <p>Nutzer können Bewertungen über Professoren abgeben. Diese werden anonym veröffentlicht — es erfolgt keine öffentliche Anzeige der Identität des Verfassers. Der Betreiber kann im Einzelfall eine interne Zuordnung vornehmen, sofern dies bei Missbrauch, Verstößen gegen Nutzungsbedingungen oder rechtlichen Verpflichtungen erforderlich ist. Rechtsgrundlage: Art. 6 Abs. 1 Satz 1 lit. f DSGVO.</p>
          </SubSection>
          <SubSection title="d) Speicherdauer">
            <p>Die nutzerbezogenen Daten werden gelöscht, sobald Sie Ihr Nutzerkonto löschen, sofern keine gesetzlichen Aufbewahrungspflichten bestehen. Bereits abgegebene Bewertungen bleiben auch nach Löschung des Nutzerkontos weiterhin sichtbar, da diese anonym veröffentlicht werden.</p>
          </SubSection>
        </Section>

        <Section title="4. Cookies">
          <p>Unsere Website verwendet Cookies zur Speicherung von Login-Informationen, zur Sicherstellung der technischen Funktionalität sowie zur Verbesserung der Benutzerfreundlichkeit.</p>
          <p className="mt-2">Technisch notwendige Cookies werden auf Grundlage von Art. 6 Abs. 1 Satz 1 lit. b und lit. f DSGVO verarbeitet. Weitere Cookies werden nur mit Ihrer Einwilligung gemäß Art. 6 Abs. 1 Satz 1 lit. a DSGVO eingesetzt.</p>
          <p className="mt-2">Sie können die Speicherung von Cookies über Ihre Browser-Einstellungen einschränken oder verhindern.</p>
        </Section>

        <Section title="5. Weitergabe von Daten">
          <p>Eine Übermittlung Ihrer personenbezogenen Daten an Dritte findet nur statt, wenn Sie ausdrücklich eingewilligt haben, die Weitergabe zur Geltendmachung von Rechtsansprüchen erforderlich ist, eine gesetzliche Verpflichtung besteht oder dies für die Abwicklung von Vertragsverhältnissen erforderlich ist.</p>
        </Section>

        <Section title="6. Ihre Rechte">
          <p>Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung oder Löschung (Art. 16/17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Widerspruch gegen die Verarbeitung (Art. 21 DSGVO) sowie Datenübertragbarkeit (Art. 20 DSGVO). Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.</p>
        </Section>

        <Section title="7. Hosting">
          <p>Unsere Website wird bei Wix.com Ltd., 40 Namal Tel Aviv St., Tel Aviv 6350671, Israel gehostet. Wir haben mit dem Hoster einen Vertrag zur Auftragsverarbeitung (AVV) geschlossen. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 Satz 1 lit. f DSGVO. Israel gilt nach Beschluss der Europäischen Kommission als Staat mit angemessenem Datenschutzniveau.</p>
        </Section>

        <Section title="8. Datensicherheit">
          <p>Wir verwenden geeignete technische und organisatorische Sicherheitsmaßnahmen, um Ihre Daten vor Verlust, Missbrauch oder unbefugtem Zugriff zu schützen.</p>
        </Section>

        <Section title="9. Aktualität dieser Datenschutzerklärung">
          <p>Diese Datenschutzerklärung ist aktuell gültig, Stand: März 2026. Wir behalten uns vor, sie bei Bedarf anzupassen.</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-base font-semibold text-ink-soft">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="mb-2 font-medium text-ink-soft">{title}</h4>
      {children}
    </div>
  );
}
