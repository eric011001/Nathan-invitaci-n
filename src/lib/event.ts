// Datos dummy de la fiesta. Edita este archivo para personalizar la invitación.
export const event = {
  celebrant: "Nathan",
  age: 1,
  title: "¡El Gran Circo de Nathan!",
  tagline: "Pasa, pasa… ¡la función está por comenzar!",
  // Fecha en hora local de Ciudad de México
  date: "2026-11-21T16:00:00-06:00",
  dateLabel: "Sábado 21 de noviembre de 2026",
  timeLabel: "4:00 PM a 9:00 PM",
  venue: {
    name: "Cabaña de los abuelos",
    address: "Carretera a la junta (despues del crash run)",
    lat: 28.389733,
    lng: -106.967206,
  },
  dressCode: {
    title: "Código de vestimenta",
    description:
      "¡Ven de colores! Nariz roja, pelucas, tirantes y zapatos grandes son más que bienvenidos.",
  },
  itinerary: [
    { time: "4:00 PM", label: "Recepción y palomitas", icon: "🍿" },
    { time: "4:45 PM", label: "Show del payaso Chispitas", icon: "🤡" },
    { time: "6:00 PM", label: "Piñata y juegos", icon: "🎯" },
    { time: "7:00 PM", label: "Pastel y mañanitas", icon: "🎂" },
    { time: "7:30 PM", label: "Dulces, baile y bolsitas de regalo", icon: "🎁" },
  ],
  gifts: {
    title: "Mesa de regalos",
    description:
      "Tu presencia es el mejor regalo. Si deseas obsequiar algo, a Nathan le encantan los perritos, plim plim y cositas que hagan ruido",
  },
  rsvp: {
    deadline: "Confirma antes del 14 de noviembre",
    whatsapp: "526251190537",
    contactName: "Eric (papá de Nathan)",
  },
} as const;

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${event.venue.lat},${event.venue.lng}&z=16&output=embed`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.venue.lat},${event.venue.lng}`;
