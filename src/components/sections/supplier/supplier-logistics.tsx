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
      {/* A divided list rather than boxed cards: reads as an editorial spec
          sheet and keeps this section distinct from the surrounding grids. */}
      <dl className="mt-5 divide-y divide-line border-t border-line">
        {items.map((it) => (
          <div key={it.label} className="flex items-start gap-4 py-5">
            <it.Icon
              size={20}
              weight="regular"
              className="mt-0.5 shrink-0 text-accent-fg"
            />
            <div className="grid flex-1 gap-1 sm:grid-cols-[180px_1fr] sm:gap-6">
              <dt className="text-sm font-medium text-ink">{it.label}</dt>
              <dd className="text-sm leading-relaxed text-muted">{it.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
