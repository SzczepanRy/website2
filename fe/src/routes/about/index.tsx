import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about/')({
  component: AboutComponent,
})


const SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Django',
  'C++',
  'Golang',
  'Angular',
  'SEO',
]
const EXPERIENCE = [
  {
    label: 'Doświadczenie',
    title: 'Lead Frontend Developer',
    company: 'FixApp · Startup',
    period: 'Styczeń 2024 – Obecnie',
    items: [
      'Implementacja i architektura warstwy front-endowej w React i TypeScript z naciskiem na modułowość kodu.',
      'Zarządzanie globalnym stanem aplikacji oraz optymalizacja komunikacji z serwerem (React Query).',
      'Projektowanie w pełni responsywnych interfejsów (RWD) dla urządzeń mobilnych i desktopowych.',
    ],
  },
  {
    label: 'Doświadczenie',
    title: 'Praktykant IT · Frontend Developer',
    company: 'iVision',
    period: 'Grudzień 2023',
    items: [
      'Tworzenie nowoczesnych mockupów i prototypów stron w stacku React i TypeScript.',
      'Konfiguracja przepływu danych między Strapi (Headless CMS) a komponentami front-endowymi.',
      'Audyt i optymalizacja SEO — poprawa semantyki kodu oraz parametrów Core Web Vitals.',
    ],
  },
  {
    label: 'Doświadczenie',
    title: 'Praktykant IT · Fullstack Developer',
    company: 'RBC Bearings',
    period: 'Maj 2023',
    items: [
      'Projektowanie serwisów w Django REST Framework oraz wydajna wymiana danych klient–serwer.',
      'Generowanie zaawansowanych wizualizacji (spektrogramy) z wykorzystaniem Matplotlib.',
      'Budowa interfejsów w Angular 18 z mechanizmem Signals oraz optymalizacja komponentów graficznych.',
    ],
  },
  {
    label: 'Wolontariat',
    title: 'Wolontariusz Techniczny',
    company: 'Talent Days · Code Europe',
    period: '2023 – Obecnie',
    items: [
      'Wsparcie organizacyjne i techniczne podczas największych polskich konferencji technologicznych.',
      'Nawiązywanie kontaktów z przedstawicielami branży IT oraz popularyzacja dobrych praktyk programistycznych.',
    ],
  },
]
const EDUCATION = [
  {
    school: 'Akademia Górniczo-Hutnicza (AGH) w Krakowie',
    detail: 'Kierunek: Informatyka (Studia I stopnia)',
    period: '2025 – Obecnie',
  },
  {
    school: 'Technikum Łączności w Krakowie',
    detail: 'Profil: Technik Informatyk (Kwalifikacje zawodowe INF.02, INF.03 powyżej 90%)',
    period: '2020 – 2025',
  },
]
function AboutComponent() {
  return (
    <div className="about-page">
      <header className="about-header">
        <span className="about-subtitle">O mnie</span>
        <h1 className="about-title">Szczepan Rydzewski</h1>
        <p className="about-role">Fullstack Developer</p>
      </header>
      <div className="about-contact">
        <a className="about-contact-link" href="mailto:szep.rydzewski@gmail.com">
          szep.rydzewski@gmail.com
        </a>
        <a
          className="about-contact-link"
          href="https://github.com/SzczepanRy"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
      <hr className="about-divider" />
      <section className="about-section">
        <span className="about-section-label">Profil zawodowy</span>
        <p className="about-text">
          Student Informatyki na AGH oraz absolwent Technikum Łączności w Krakowie.
          Posiadam komercyjne doświadczenie zdobyte podczas praktyk zawodowych oraz
          aktywnego rozwijania projektów startupowych. Specjalizuję się w Fullstack
          Developmencie (React, Node.js, Django) oraz programowaniu sieciowym (C++, Golang).
          Wyróżniam się biegłością językową (Angielski C2) oraz wysoką orientacją na
          optymalizację wydajności i SEO.
        </p>
        <div className="about-skills">
          {SKILLS.map((skill) => (
            <span key={skill} className="about-skill">
              {skill}
            </span>
          ))}
        </div>
      </section>
      <section className="about-grid">
        {EXPERIENCE.map((entry) => (
          <article key={`${entry.company}-${entry.period}`} className="about-panel">
            <header className="about-panel-header">
              <span className="about-panel-label">{entry.label}</span>
              <h2 className="about-panel-title">{entry.title}</h2>
              <span className="about-panel-meta">
                {entry.company} · {entry.period}
              </span>
            </header>
            <div className="about-panel-body">
              {entry.items.map((item) => (
                <p key={item} className="about-panel-item">
                  {item}
                </p>
              ))}
            </div>
          </article>
        ))}
      </section>
      <section className="about-section">
        <span className="about-section-label">Edukacja</span>
        <div className="about-education">
          {EDUCATION.map((entry) => (
            <div key={entry.school} className="about-education-item">
              <h3 className="about-education-school">{entry.school}</h3>
              <p className="about-education-detail">{entry.detail}</p>
              <span className="about-education-period">{entry.period}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
