import { STITCH_DESKTOP_HTML } from "@/lib/stitch/desktop-html";
import { STITCH_MOBILE_HTML } from "@/lib/stitch/mobile-html";

export default function HomePage() {
  return (
    <>
      {/* Mobile — Stitch package (1) */}
      <div className="bg-[#FBFBF9] text-on-surface lg:hidden">
        <div
          className="mx-auto flex min-h-screen w-full max-w-[var(--content-max)] flex-col pb-24"
          dangerouslySetInnerHTML={{ __html: STITCH_MOBILE_HTML }}
        />
      </div>

      {/* Desktop — Stitch package (2) */}
      <div
        className="hidden bg-[#FBFBF9] text-on-surface antialiased lg:block"
        dangerouslySetInnerHTML={{ __html: STITCH_DESKTOP_HTML }}
      />
    </>
  );
}
