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
          <p>
            Schätzle und Conrads Profvote GbR
            <br />
            Welserstraße 3
            <br />
            87463 Dietmannsried
          </p>
          <p className="mt-2">Vertreten durch: Valentin Schätzle, Hannes Conrads</p>
          <p className="mt-2">
            E-Mail:{' '}
            <a href="mailto:profvote-info@gmx.de" className="text-accent hover:underline">
              profvote-info@gmx.de
            </a>
          </p>
        </Section>

        <Section title="2. Erhebung personenbezogener Daten">
          <p>
            Im Folgenden informieren wir über die Erhebung personenbezogener Daten bei
            Nutzung unserer Website. Personenbezogene Daten sind alle Daten, die auf Sie
            persönlich beziehbar sind, z. B. Name, Adresse, E-Mail-Adressen,
            Nutzerverhalten.
          </p>
        </Section>

        <Section title="3. Datenerhebung bei Nutzung der Plattform">
          <SubSection title="a) Beim Besuch der Website">
            <p>
              Beim Aufrufen unserer Website werden automatisch folgende Informationen
              erfasst: IP-Adresse, Datum und Uhrzeit des Zugriffs, Name und URL der
              abgerufenen Datei, Referrer-URL, verwendeter Browser und Betriebssystem
              sowie der Name des Access-Providers.
            </p>
            <p className="mt-2">
              Diese Daten werden verarbeitet zur Gewährleistung eines reibungslosen
              Verbindungsaufbaus sowie zur Systemsicherheit und Stabilität.
              Rechtsgrundlage: Art. 6 Abs. 1 Satz 1 lit. f DSGVO.
            </p>
          </SubSection>
          <SubSection title="b) Abgabe einer Bewertung">
            <p>
              Für die Abgabe einer Bewertung ist <strong>keine Registrierung</strong>{' '}
              erforderlich. Es wird ausschließlich die Universitäts-E-Mail-Adresse
              erhoben, um die Zugehörigkeit zur jeweiligen Hochschule zu bestätigen.
              Nach erfolgreicher Verifizierung per Bestätigungslink wird die E-Mail-Adresse
              intern für Missbrauchsschutz und Moderationszwecke gespeichert und nicht
              öffentlich angezeigt. Passwörter oder Nutzerkonten werden nicht angelegt.
            </p>
            <p className="mt-2">
              Zwecke: Verifizierung der Hochschulzugehörigkeit, Verhinderung von Missbrauch.
              Rechtsgrundlage: Art. 6 Abs. 1 Satz 1 lit. f DSGVO.
            </p>
          </SubSection>
          <SubSection title="c) Bewertungen und deren Veröffentlichung">
            <p>
              Nutzer können Bewertungen über Professoren abgeben. Diese werden anonym
              veröffentlicht - es erfolgt keine öffentliche Anzeige der Identität des
              Verfassers. Der Betreiber kann im Einzelfall eine interne Zuordnung
              vornehmen, sofern dies bei Missbrauch, Verstößen gegen Nutzungsbedingungen
              oder rechtlichen Verpflichtungen erforderlich ist. Rechtsgrundlage: Art. 6
              Abs. 1 Satz 1 lit. f DSGVO.
            </p>
          </SubSection>
          <SubSection title="d) Speicherdauer">
            <p>
              Unverifizierte Bewertungen (nicht per Link bestätigt) werden automatisch
              nach 3 Tagen gelöscht. Verifizierte Bewertungen werden bis zur Löschung
              durch den Betreiber oder auf Anfrage der betroffenen Person gespeichert,
              sofern keine gesetzlichen Aufbewahrungspflichten bestehen. Die
              E-Mail-Adresse wird intern mit der Bewertung gespeichert und nicht
              öffentlich angezeigt. Eine Löschung der E-Mail-Adresse ist auf
              schriftliche Anfrage an{' '}
              <a href="mailto:profvote-info@gmx.de" className="text-accent hover:underline">
                profvote-info@gmx.de
              </a>{' '}
              möglich.
            </p>
          </SubSection>
        </Section>

        <Section title="4. Cookies">
          <p>
            Unsere Website verwendet technisch notwendige Cookies und ähnliche
            Speichertechnologien (z. B. localStorage) zur Sicherstellung der
            Funktionalität, Sicherheit und zur Speicherung Ihrer Cookie-Einwilligung.
            Passwörter oder Kontozugänge werden nicht per Cookie verwaltet.
          </p>
          <p className="mt-2">
            Technisch notwendige Cookies werden auf Grundlage von § 25 Abs. 2 TDDDG
            sowie Art. 6 Abs. 1 Satz 1 lit. f DSGVO verarbeitet. Weitere Cookies werden
            nur mit Ihrer ausdrücklichen Einwilligung gemäß Art. 6 Abs. 1 Satz 1 lit. a
            DSGVO eingesetzt.
          </p>
          <p className="mt-2">
            Sie können Ihre Cookie-Einwilligung jederzeit mit Wirkung für die Zukunft
            über den Link „Cookie-Einstellungen" im Footer dieser Website oder über Ihre
            Browser-Einstellungen ändern oder widerrufen.
          </p>
        </Section>

        <Section title="5. Weitergabe von Daten / Auftragsverarbeiter">
          <p>
            Eine Übermittlung Ihrer personenbezogenen Daten an Dritte findet nur statt,
            wenn Sie ausdrücklich eingewilligt haben, die Weitergabe zur Geltandmachung
            von Rechtsansprüchen erforderlich ist, eine gesetzliche Verpflichtung besteht
            oder dies für die Bereitstellung des Dienstes erforderlich ist.
          </p>
          <p className="mt-2">
            Wir setzen folgende Auftragsverarbeiter ein, an die ggf. personenbezogene
            Daten übermittelt werden:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-2">
            <li>
              <span className="font-medium text-ink-soft">Brevo (Sendinblue SAS)</span>,
              55 rue d'Amsterdam, 75008 Paris, Frankreich — für den Versand von
              Verifizierungs-E-Mails. Dabei wird die angegebene E-Mail-Adresse an Brevo
              übermittelt. Verarbeitung auf Grundlage von Art. 6 Abs. 1 Satz 1 lit. f
              DSGVO. Brevo ist nach dem EU-US Data Privacy Framework zertifiziert; es
              besteht ein Auftragsverarbeitungsvertrag. Datenschutzerklärung:{' '}
              <a
                href="https://www.brevo.com/legal/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                brevo.com/legal/privacypolicy
              </a>
            </li>
            <li>
              <span className="font-medium text-ink-soft">Vercel Inc.</span>, 440 N
              Barranca Ave #4133, Covina, CA 91723, USA — Hosting (siehe Abschnitt 7).
            </li>
            <li>
              <span className="font-medium text-ink-soft">Wix.com Ltd.</span>, 40 Namal
              Tel Aviv St., Tel Aviv 6350671, Israel — Headless CMS / Datenbankdienst
              (siehe Abschnitt 8).
            </li>
          </ul>
        </Section>

        <Section title="6. Ihre Rechte">
          <p>
            Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung oder Löschung
            (Art. 16/17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO),
            Widerspruch gegen die Verarbeitung (Art. 21 DSGVO) sowie
            Datenübertragbarkeit (Art. 20 DSGVO). Sie haben zudem das Recht, sich bei
            einer Datenschutz-Aufsichtsbehörde zu beschweren.
          </p>
        </Section>

        <Section title="7. Hosting &amp; Analyse-Dienste (Vercel)">
          <p>
            Unsere Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
            91723, USA gehostet. Beim Aufruf der Website verarbeitet Vercel technisch
            erforderliche Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt, Browser) zur
            Auslieferung und Absicherung des Angebots. Rechtsgrundlage: Art. 6 Abs. 1
            Satz 1 lit. f DSGVO. Soweit erforderlich, besteht ein
            Auftragsverarbeitungsvertrag mit Vercel.
          </p>
          <p className="mt-3 font-medium text-ink-soft">Vercel Web Analytics</p>
          <p className="mt-1">
            Wir nutzen Vercel Web Analytics zur Auswertung der Seitennutzung. Der Dienst
            erhebt <strong>keine Cookies</strong> und speichert <strong>keine
            personenbezogenen Daten</strong> dauerhaft. Es wird lediglich eine aggregierte,
            nicht personenbeziehbare Statistik (Seitenaufrufe, Herkunftsland, Geräteklasse)
            erzeugt. Eine individuelle Nutzeridentifikation findet nicht statt.
            Rechtsgrundlage: Art. 6 Abs. 1 Satz 1 lit. f DSGVO (berechtigtes Interesse
            an aggregierter Nutzungsanalyse ohne Tracking).
          </p>
          <p className="mt-3 font-medium text-ink-soft">Vercel Speed Insights</p>
          <p className="mt-1">
            Wir nutzen Vercel Speed Insights zur Messung der Ladegeschwindigkeit der
            Website. Dabei werden technische Performance-Metriken (Core Web Vitals)
            anonym erfasst. Es werden keine personenbezogenen Daten gespeichert.
            Rechtsgrundlage: Art. 6 Abs. 1 Satz 1 lit. f DSGVO.
          </p>
        </Section>

        <Section title="8. Wix Headless CMS">
          <p>
            Für die Verwaltung und den Abruf bestimmter Plattforminhalte verwenden wir Wix
            Headless von Wix.com Ltd., 40 Namal Tel Aviv St., Tel Aviv 6350671, Israel.
            Wix dient hierbei nicht mehr als Hosting-Anbieter der Website, sondern als
            Headless-CMS bzw. Datenquelle für Inhalte wie Professoren- und
            Bewertungsdaten.
          </p>
          <p className="mt-2">
            Die Verarbeitung erfolgt, soweit personenbezogene Daten betroffen sind, auf
            Grundlage von Art. 6 Abs. 1 Satz 1 lit. f DSGVO. Unser berechtigtes Interesse
            liegt in der technischen Verwaltung, Speicherung und Bereitstellung der für
            die Plattform erforderlichen Inhalte und Daten. Soweit erforderlich, haben wir
            mit Wix eine Vereinbarung zur Auftragsverarbeitung geschlossen.
          </p>
        </Section>

        <Section title="9. Drittlandübermittlung">
          <p>
            Bei der Nutzung von Vercel und Wix kann eine Verarbeitung personenbezogener
            Daten außerhalb der Europäischen Union bzw. des Europäischen Wirtschaftsraums
            stattfinden. Für Israel besteht ein Angemessenheitsbeschluss der Europäischen
            Kommission. Bei Übermittlungen in die USA oder andere Drittländer erfolgt die
            Absicherung, soweit erforderlich, über geeignete Garantien wie
            Standardvertragsklauseln oder vergleichbare datenschutzrechtliche
            Mechanismen.
          </p>
        </Section>

        <Section title="10. Datensicherheit">
          <p>
            Wir verwenden geeignete technische und organisatorische Sicherheitsmaßnahmen,
            um Ihre Daten vor Verlust, Missbrauch oder unbefugtem Zugriff zu schützen.
          </p>
        </Section>

        <Section title="11. Aktualität dieser Datenschutzerklärung">
          <p>
            Diese Datenschutzerklärung ist aktuell gültig, Stand: Juni 2026. Wir behalten
            uns vor, sie bei Bedarf anzupassen.
          </p>
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
