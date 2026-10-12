import CircusTent from "@/components/CircusTent";
import PlimPlim from "@/components/PlimPlim";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import { event, mapsDirectionsUrl, mapsEmbedUrl } from "@/lib/event";

const balloons = [
  { color: "#d62828", left: "6%", top: "12%", delay: "0s" },
  { color: "#fcbf49", left: "86%", top: "8%", delay: "1.2s" },
  { color: "#1d4e89", left: "14%", top: "62%", delay: "2.1s" },
  { color: "#2a9d8f", left: "80%", top: "58%", delay: "0.6s" },
];

function Balloon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 110" className="h-24 w-14 sm:h-32 sm:w-20" aria-hidden>
      <ellipse cx="30" cy="30" rx="26" ry="30" fill={color} />
      <ellipse cx="21" cy="20" rx="6" ry="9" fill="#fff" opacity="0.35" />
      <polygon points="26,59 34,59 30,66" fill={color} />
      <path d="M30,66 Q22,80 32,92 Q40,102 28,110" stroke="#2b2d42" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display mb-6 text-center text-4xl tracking-wide text-circus-red drop-shadow-[0_3px_0_#fcbf49] sm:text-5xl">
      {children}
    </h2>
  );
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="ticket flex flex-col items-center p-6 text-center">
      <span className="text-5xl" aria-hidden>
        {icon}
      </span>
      <h3 className="font-display mt-3 text-2xl tracking-wide text-circus-blue">{title}</h3>
      <div className="mt-2 text-lg text-slate-700">{children}</div>
    </div>
  );
}

export default function Home() {
  const whatsappText = encodeURIComponent(
    `¡Hola! Confirmo mi asistencia a la fiesta de ${event.celebrant} 🎪. Somos __ personas.`,
  );

  return (
    <>
      <CircusTent />

      <main className="overflow-x-hidden">
        {/* Hero */}
        <section className="stripes-bg relative flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
          {balloons.map((b) => (
            <div
              key={b.left}
              className="animate-float absolute"
              style={{ left: b.left, top: b.top, animationDelay: b.delay }}
            >
              <Balloon color={b.color} />
            </div>
          ))}

          <Reveal className="relative flex flex-col items-center">
            <p className="font-display text-xl tracking-widest text-circus-blue sm:text-2xl">
              Estás invitado a
            </p>
            <h1 className="font-display mt-2 text-5xl leading-none text-circus-red drop-shadow-[0_4px_0_#fcbf49] sm:text-7xl">
              {event.title}
            </h1>
            <PlimPlim className="animate-bob my-6 h-48 w-48 sm:h-64 sm:w-64" />
            <p className="max-w-md text-xl text-slate-700">
              ¡{event.celebrant} cumple <strong className="text-circus-red">{event.age} año</strong> y queremos
              celebrarlo contigo bajo la gran carpa!
            </p>
            <p className="mt-10 animate-bounce text-sm font-semibold tracking-widest text-circus-blue uppercase">
              Desliza ↓
            </p>
          </Reveal>
        </section>

        {/* Cuenta regresiva */}
        <section className="bg-circus-blue px-6 py-16 text-white">
          <Reveal>
            <h2 className="font-display mb-8 text-center text-3xl tracking-wide text-circus-yellow sm:text-4xl">
              La función comienza en…
            </h2>
            <Countdown date={event.date} />
          </Reveal>
        </section>

        {/* Detalles */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <SectionTitle>Detalles de la función</SectionTitle>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            <Reveal>
              <InfoCard icon="📅" title="Fecha">
                {event.dateLabel}
              </InfoCard>
            </Reveal>
            <Reveal>
              <InfoCard icon="⏰" title="Hora">
                {event.timeLabel}
              </InfoCard>
            </Reveal>
            <Reveal>
              <InfoCard icon="🎪" title="Lugar">
                {event.venue.name}
              </InfoCard>
            </Reveal>
          </div>
        </section>

        {/* Ubicación */}
        <section className="stripes-bg px-6 py-20">
          <Reveal className="mx-auto max-w-4xl">
            <SectionTitle>¿Cómo llegar?</SectionTitle>
            <div className="ticket overflow-hidden p-3">
              <iframe
                title={`Mapa de ${event.venue.name}`}
                src={mapsEmbedUrl}
                className="h-80 w-full rounded-xl sm:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="flex flex-col items-center gap-4 p-4 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <p className="font-display text-xl text-circus-blue">{event.venue.name}</p>
                  <p className="text-slate-600">{event.venue.address}</p>
                </div>
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display shrink-0 rounded-full bg-circus-red px-6 py-3 tracking-wide text-white shadow-[0_5px_0_#9d0208] transition hover:scale-105"
                >
                  📍 Abrir en Google Maps
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Itinerario */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <Reveal>
            <SectionTitle>Programa</SectionTitle>
          </Reveal>
          <ol className="relative space-y-6 border-l-4 border-dashed border-circus-yellow pl-8">
            {event.itinerary.map((item) => (
              <li key={item.time}>
                <Reveal className="relative">
                  <span className="absolute top-1/2 -left-[3.15rem] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-circus-red text-xl shadow">
                    {item.icon}
                  </span>
                  <div className="rounded-2xl bg-white p-4 shadow-md">
                    <p className="font-display text-circus-blue">{item.time}</p>
                    <p className="text-lg text-slate-700">{item.label}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Vestimenta y regalos */}
        <section className="bg-circus-red px-6 py-20">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            <Reveal>
              <InfoCard icon="🎭" title={event.dressCode.title}>
                {event.dressCode.description}
              </InfoCard>
            </Reveal>
            <Reveal>
              <InfoCard icon="🎁" title={event.gifts.title}>
                {event.gifts.description}
              </InfoCard>
            </Reveal>
          </div>
        </section>

        {/* RSVP */}
        <section className="stripes-bg px-6 py-20 text-center">
          <Reveal className="mx-auto max-w-xl">
            <SectionTitle>¿Vienes a la función?</SectionTitle>
            <p className="text-lg text-slate-700">{event.rsvp.deadline}</p>
            <p className="mb-8 text-slate-600">Contacto: {event.rsvp.contactName}</p>
            <a
              href={`https://wa.me/${event.rsvp.whatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display inline-block rounded-full border-4 border-white bg-[#25d366] px-10 py-4 text-2xl tracking-wide text-white shadow-[0_6px_0_#128c7e] transition hover:scale-105"
            >
              ✅ Confirmar por WhatsApp
            </a>
          </Reveal>
        </section>

        <footer className="bg-circus-blue px-6 py-10 text-center text-white">
          <p className="font-display text-2xl tracking-wide text-circus-yellow">¡Te esperamos! 🎈</p>
          <p className="mt-2 text-sm opacity-80">Con cariño, la familia de {event.celebrant}</p>
        </footer>
      </main>
    </>
  );
}
