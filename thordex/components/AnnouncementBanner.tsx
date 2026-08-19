import { Megaphone } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

// Catatan: ini merepresentasikan blok "KOSONG" pada wireframe — didesain
// sebagai slot pengumuman/banner yang tampil rapi saat belum ada isi.
export function AnnouncementBanner() {
  return (
    <section className="mb-9">
      <SectionHeading>Pengumuman</SectionHeading>
      <div className="mx-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gold/20 bg-surface/40 py-8 text-center">
        <Megaphone className="h-5 w-5 text-sage" strokeWidth={1.5} />
        <p className="text-sm text-sage">Belum ada pengumuman baru saat ini.</p>
      </div>
    </section>
  );
}
