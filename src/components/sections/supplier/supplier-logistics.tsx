import {
  ClockCountdown,
  GlobeHemisphereWest,
  AirplaneTilt,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";

type Item = { Icon: typeof Wallet; label: string; value: string };

// "Good to know": the practical details that move a couple from interested to
// inquiring — response time, downpayment/payment, travel, overseas couples.
// Renders only the items that have data; hides entirely if none.
export function SupplierLogistics({
  responseTimeNote,
  worksWithOverseasCouples,
  travelFeeNote,
  bookingTerms,
}: {
  responseTimeNote: string | null;
  worksWithOverseasCouples: boolean;
  travelFeeNote: string | null;
  bookingTerms: string | null;
}) {
  const items: Item[] = [];
  if (responseTimeNote)
    items.push({ Icon: ClockCountdown, label: "Response time", value: responseTimeNote });
  if (bookingTerms)
    items.push({ Icon: Wallet, label: "Booking & payment", value: bookingTerms });
  if (travelFeeNote)
    items.push({ Icon: AirplaneTilt, label: "Travel", value: travelFeeNote });
  if (worksWithOverseasCouples)
    items.push({
      Icon: GlobeHemisphereWest,
      label: "Overseas couples",
      value: "Works with couples planning from abroad.",
    });

  if (!items.length) return null;

  return (
    <section aria-labelledby="logistics-heading">
      <h2
        id="logistics-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Good to know
      </h2>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex gap-3 rounded-2xl border border-line bg-surface-2 p-4"
          >
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
              <it.Icon size={18} weight="regular" />
            </span>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
                {it.label}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-ink">
                {it.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
