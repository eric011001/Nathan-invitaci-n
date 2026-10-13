import type { ReactNode } from "react";

export default function CircusNotice({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="ticket mx-auto mt-10 flex max-w-xl flex-col items-center overflow-hidden text-center">
      <div className="circus-awning h-6 w-full" aria-hidden />
      <div className="flex flex-col items-center p-8">
        <span className="animate-wiggle text-6xl" aria-hidden>
          {icon}
        </span>
        <h2 className="font-display mt-4 text-3xl tracking-wide text-circus-red sm:text-4xl">{title}</h2>
        <div className="mt-3 text-lg text-slate-700">{children}</div>
      </div>
    </div>
  );
}
