import { SectionHeading } from "./SectionHeading";

export function AnnouncementBanner() {
  return (
    <section className="mb-9">
      <SectionHeading>Pengumuman</SectionHeading>
      <div className="mx-6 overflow-hidden rounded-2xl border border-gold/20 bg-surface/40">
        <img
          src="https://magenta-advisory-cardinal-566.mypinata.cloud/ipfs/bafybeidj6ufbk54nggvphqi775utjk4epeiqtyyhkqwbp2zalnegia5edi"
          alt="Pengumuman Thordex"
          className="h-auto w-full object-cover"
        />
      </div>
    </section>
  );
}
