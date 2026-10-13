import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import PlimPlim from "@/components/PlimPlim";
import CircusNotice from "@/components/CircusNotice";
import MemoriesUploader from "@/components/MemoriesUploader";
import { event } from "@/lib/event";
import { isRemembersActive } from "@/lib/remembers";

const description = `Sube las fotos y videos que tomaste en la fiesta de ${event.celebrant} para guardar estos momentos para siempre. 📸`;

export const metadata: Metadata = {
  title: `Recuerdos · ${event.title}`,
  description,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: event.title,
    title: "¡Comparte tus recuerdos del circo! 📸",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "¡Comparte tus recuerdos del circo! 📸",
    description,
  },
};

// Se evalúa en cada visita para que REMEMBERS_ACTIVE no quede fijo desde el build.
async function Content() {
  await connection();

  if (!isRemembersActive()) {
    return (
      <CircusNotice icon="🤹" title="¡Vuelve pronto!">
        Aún no fabricamos los recuerdos para que los subas. ¡La carpa abrirá muy pronto!
      </CircusNotice>
    );
  }

  return <MemoriesUploader />;
}

export default function RecuerdosPage() {
  return (
    <main className="stripes-bg min-h-svh overflow-x-hidden px-4 pt-10 pb-40 sm:px-6">
      <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <PlimPlim className="animate-bob h-32 w-32 sm:h-40 sm:w-40" />
        <p className="font-display mt-4 text-lg tracking-widest text-circus-blue sm:text-xl">{event.title}</p>
      </header>

      <Suspense>
        <Content />
      </Suspense>
    </main>
  );
}
