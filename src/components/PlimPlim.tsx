import Image from "next/image";

type Props = { className?: string };

// Coloca tu imagen en public/plim-plim.png (fondo transparente recomendado).
export const PLIM_PLIM_SRC = "/plim-plim.png";

export default function PlimPlim({ className }: Props) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Image
        src={PLIM_PLIM_SRC}
        alt="Plim Plim"
        fill
        sizes="(min-width: 640px) 256px, 192px"
        className="object-contain"
        priority
      />
    </div>
  );
}
