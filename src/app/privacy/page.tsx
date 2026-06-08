import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How The Vow Edit collects, uses, stores, shares, and protects wedding suppliers' personal data, in line with the Philippine Data Privacy Act.",
};

// Shared prose classes (existing design tokens only - no new aesthetic).
const h2 = "mt-12 font-serif text-2xl font-medium text-ink sm:text-3xl";
const h3 = "mt-6 font-medium text-ink";
const p = "mt-4 text-base leading-relaxed text-muted";
const ul = "mt-4 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-muted marker:text-muted/60";
const strong = "font-medium text-ink";
const rule = "my-12 border-line";

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-[680px] px-4 py-16 sm:px-6 lg:py-24">
        <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
          The Vow Edit Privacy Notice
        </h1>
        <p className="mt-5 text-sm text-muted">
          <span className={strong}>Last updated: 8 June 2026</span>
          <br />
          <span className={strong}>Effective date: 8 June 2026</span>
        </p>

        <p className={p}>
          This Privacy Notice explains how The Vow Edit (&ldquo;The Vow Edit&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, stores, shares, and
          protects personal data when wedding suppliers apply for or are listed in
          our directory at thevowedit.ph. We are committed to handling your personal
          data in accordance with Republic Act No. 10173, the Data Privacy Act of
          2012 (the &ldquo;DPA&rdquo;), its Implementing Rules and Regulations, and
          the issuances of the National Privacy Commission (the &ldquo;NPC&rdquo;).
        </p>
        <p className={p}>
          If you have any questions about this notice or how your data is handled,
          contact our Data Protection Officer using the details in the &ldquo;How
          to contact us&rdquo; section below.
        </p>

        <hr className={rule} />

        <h2 className={h2}>1. Who we are</h2>
        <p className={p}>
          The Vow Edit operates thevowedit.ph, an online directory of wedding suppliers
          serving Cebu, Philippines.
        </p>
        <ul className={ul}>
          <li>
            <span className={strong}>Operator / Personal Information Controller:</span>{" "}
            Martin Casey (sole trader), operating thevowedit.ph
          </li>
          <li>
            <span className={strong}>Business registration:</span>{" "}
            Australian Business Number (ABN) 84 263 783 878 — registered as an
            Individual / Sole Trader in Australia
          </li>
          <li>
            <span className={strong}>Data Protection Officer (DPO):</span> Martin Casey
          </li>
          <li>
            <span className={strong}>DPO contact:</span> privacy@thevowedit.ph
          </li>
        </ul>
        <p className={p}>
          We are the Personal Information Controller responsible for the personal
          data described in this notice. We remain accountable for that data even
          where we use third parties to process it on our behalf.
        </p>

        <hr className={rule} />

        <h2 className={h2}>2. What personal data we collect</h2>
        <h3 className={h3}>When you apply for a founding listing</h3>
        <p className={p}>
          When you submit the application form on thevowedit.ph, we collect the
          information you provide:
        </p>
        <ul className={ul}>
          <li>
            <span className={strong}>Business name</span>
          </li>
          <li>
            <span className={strong}>Category</span> (e.g. photography, catering,
            venues)
          </li>
          <li>
            <span className={strong}>Area served</span> (e.g. Cebu City, Mandaue,
            Lapu-Lapu / Mactan)
          </li>
          <li>
            <span className={strong}>Contact name</span>
          </li>
          <li>
            <span className={strong}>Email address</span>
          </li>
          <li>
            <span className={strong}>Mobile number</span>
          </li>
          <li>
            <span className={strong}>Website or social media link</span> (optional)
          </li>
          <li>
            <span className={strong}>Price range</span> (optional)
          </li>
        </ul>
        <p className={p}>
          We also record, automatically and on the server, a small amount of
          information tied to your submission:
        </p>
        <ul className={ul}>
          <li>
            Whether you gave consent, and the <span className={strong}>date and
            time</span> that consent was recorded
          </li>
          <li>
            The <span className={strong}>date and time</span> your application was
            received
          </li>
          <li>
            The internal <span className={strong}>status</span> of your application
            (e.g. pending review)
          </li>
        </ul>
        <p className={p}>
          We do <span className={strong}>not</span> intentionally collect sensitive
          personal information (as defined under the DPA, such as data about health,
          religion, or government-issued identifiers) through this form. Please do
          not include such information in the free-text fields.
        </p>
        <blockquote className="mt-4 border-l-2 border-line pl-4 text-base leading-relaxed text-muted">
          <span className={strong}>
            Note for sole proprietors and freelancers:
          </span>{" "}
          where your business contact details are also your personal details (for
          example, a personal mobile number or name), we treat that information as
          personal data protected under the DPA.
        </blockquote>

        <hr className={rule} />

        <h2 className={h2}>3. How we use your personal data, and our lawful basis</h2>
        <p className={p}>
          We process your personal data for the following purposes:
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border border-line bg-surface-2 px-4 py-3 font-medium text-ink">
                  Purpose
                </th>
                <th className="border border-line bg-surface-2 px-4 py-3 font-medium text-ink">
                  Lawful basis under the DPA
                </th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr>
                <td className="border border-line px-4 py-3 text-muted">
                  To review your application and decide whether to create or activate
                  your listing
                </td>
                <td className="border border-line px-4 py-3 text-muted">
                  Your <span className={strong}>consent</span>, given when you submit
                  the form
                </td>
              </tr>
              <tr>
                <td className="border border-line px-4 py-3 text-muted">
                  To contact you about your founding listing before and after launch
                </td>
                <td className="border border-line px-4 py-3 text-muted">
                  Your <span className={strong}>consent</span>, and our legitimate
                  business interest in onboarding suppliers
                </td>
              </tr>
              <tr>
                <td className="border border-line px-4 py-3 text-muted">
                  To create and display your listing in the directory so couples can
                  find you
                </td>
                <td className="border border-line px-4 py-3 text-muted">
                  Your <span className={strong}>consent</span>
                </td>
              </tr>
              <tr>
                <td className="border border-line px-4 py-3 text-muted">
                  To respond to your enquiries and provide support
                </td>
                <td className="border border-line px-4 py-3 text-muted">
                  Performance of our service to you
                </td>
              </tr>
              <tr>
                <td className="border border-line px-4 py-3 text-muted">
                  To keep records, secure our systems, and comply with legal
                  obligations
                </td>
                <td className="border border-line px-4 py-3 text-muted">
                  Compliance with legal obligations and our legitimate interests
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={p}>
          Your consent is recorded at the point of submission. You may withdraw
          consent at any time (see &ldquo;Your rights&rdquo; below); withdrawal does
          not affect the lawfulness of processing carried out before withdrawal.
        </p>
        <p className={p}>
          We will not use your personal data for purposes incompatible with those
          above without informing you and, where required, obtaining your consent.
        </p>

        <hr className={rule} />

        <h2 className={h2}>4. Who we share your personal data with</h2>
        <p className={p}>
          We do not sell your personal data. We share it only with the service
          providers who help us operate The Vow Edit, and only as needed:
        </p>
        <ul className={ul}>
          <li>
            <span className={strong}>Supabase</span> — our database provider, which
            stores your application and listing data on our behalf. Our Supabase
            database is hosted in Australia (Sydney, ap-southeast-2).
          </li>
          <li>
            <span className={strong}>Resend</span> — our email service provider, used
            to send us a notification when an application is received.
          </li>
          <li>
            <span className={strong}>Google (Gmail)</span> — we receive and read
            application notifications in a Gmail inbox, so your application details
            are also present there.
          </li>
        </ul>
        <p className={p}>
          These providers act as our Personal Information Processors. They are
          authorised to process your data only on our instructions and for the
          purposes described in this notice.
        </p>
        <p className={p}>
          Your personal data is stored and processed outside the Philippines. As a
          supplier in the Philippines, the data you submit is stored in Australia
          (our Supabase database in Sydney) and accessed by the operator, who is
          based in Australia; email is handled by Resend, which stores email
          metadata, logs, and account data in the United States, regardless of
          sending region. These are cross-border transfers, and we take reasonable
          steps to ensure your data continues to receive an adequate level of
          protection, consistent with the DPA.
        </p>
        <p className={p}>
          We may also disclose personal data where required by law, by a court, or by
          a competent government authority, or to protect our rights, users, or the
          public.
        </p>

        <hr className={rule} />

        <h2 className={h2}>5. How long we keep your personal data</h2>
        <p className={p}>
          We keep your personal data only for as long as necessary for the purposes
          set out in this notice.
        </p>
        <ul className={ul}>
          <li>
            If your application leads to an <span className={strong}>active
            listing</span>, we retain your data for as long as the listing is active
            and for a reasonable period afterwards.
          </li>
          <li>
            If your application does <span className={strong}>not</span> result in a
            listing, we retain it for up to{" "}
            <span className={strong}>6 months</span> and
            then securely delete it, unless we are required to keep it longer for
            legal reasons.
          </li>
        </ul>
        <p className={p}>
          When personal data is no longer needed, we securely dispose of it.
        </p>

        <hr className={rule} />

        <h2 className={h2}>6. How we protect your personal data</h2>
        <p className={p}>
          We apply organisational and technical measures appropriate to the risk,
          including:
        </p>
        <ul className={ul}>
          <li>
            Storing application data in a database with access controls that prevent
            the public from reading, editing, or listing applicant records.
          </li>
          <li>Restricting administrative access to authorised personnel only.</li>
          <li>Transmitting data over encrypted connections.</li>
          <li>Limiting the personal data we collect to what is necessary.</li>
        </ul>
        <p className={p}>
          No system can be guaranteed completely secure, but we work to protect your
          data and to address any incidents in line with our obligations under the
          DPA, including notifying you and the NPC where required.
        </p>

        <hr className={rule} />

        <h2 className={h2}>7. Your rights</h2>
        <p className={p}>
          Under the Data Privacy Act, you have the right to:
        </p>
        <ul className={ul}>
          <li>
            <span className={strong}>Be informed</span> about how your personal data
            is processed (this notice).
          </li>
          <li>
            <span className={strong}>Access</span> the personal data we hold about
            you.
          </li>
          <li>
            <span className={strong}>Object</span> to or{" "}
            <span className={strong}>withdraw consent</span> for the processing of
            your personal data.
          </li>
          <li>
            <span className={strong}>Rectify</span> inaccurate or incomplete data.
          </li>
          <li>
            <span className={strong}>Erase or block</span> your data where it is
            incomplete, outdated, false, unlawfully obtained, or no longer necessary
            — this includes asking us to <span className={strong}>remove your
            listing</span> at any time.
          </li>
          <li>
            <span className={strong}>Data portability</span> — to obtain a copy of
            your data in an electronic format.
          </li>
          <li>
            <span className={strong}>Be indemnified</span> for damages arising from
            inaccurate, incomplete, outdated, false, or unlawfully obtained personal
            data.
          </li>
          <li>
            <span className={strong}>Lodge a complaint</span> with the National
            Privacy Commission.
          </li>
        </ul>
        <p className={p}>
          To exercise any of these rights, contact our DPO using the details below.
          We will respond within a reasonable period as required by law. We may need
          to verify your identity before acting on a request.
        </p>

        {/*
          ============================================================
          HELD SECTION - DO NOT PUBLISH. Intentionally NOT rendered, and
          deliberately UNNUMBERED so it does not collide with the live
          sections. When published, insert as a new section and renumber
          the sections that follow it accordingly.
          Keep this here so the drafted content is not lost, but it must
          stay unpublished until the list-then-notify (public-listing)
          flow is actually live AND reviewed by a Philippine data-privacy
          lawyer. Its lawful basis (legitimate interest over publicly
          available personal data) is the area the NPC's April 2026
          advisory specifically tightened; publishing it prematurely
          commits The Vow Edit to an activity it may not yet be conducting
          compliantly. Do NOT move this into the rendered tree.

          [HOLD - DO NOT PUBLISH UNTIL THE PUBLIC-LISTING FLOW IS LIVE
          AND LEGALLY REVIEWED]

          Listings created from publicly available information

          In addition to suppliers who apply directly, we may create basic
          directory listings for wedding suppliers in Cebu using publicly
          available business information (such as business name, category,
          area, public business contact details, and a link to a public
          business page).

          - What we collect: limited factual business information only. We
            do not copy portfolio images, reviews, or other content.
          - Lawful basis: our legitimate interest in building a useful local
            directory, balanced against the rights and interests of the
            supplier. We recognise that the public availability of
            information does not by itself amount to consent.
          - Transparency and your control: where we create a listing this
            way, we will notify the supplier and clearly label the listing
            as unclaimed. You can claim your listing (to manage it yourself)
            or remove it at any time, with no questions asked. Requests to
            remove a listing are honoured promptly, and we will not re-add a
            removed listing.
          - Proportionality: we keep this information limited and accurate,
            and we do not use it in any way intended to harm the supplier.

          To claim or remove a listing, or to object to this processing,
          contact our DPO below.
          ============================================================
        */}

        <hr className={rule} />

        <h2 className={h2}>8. Changes to this notice</h2>
        <p className={p}>
          We may update this Privacy Notice from time to time. When we do, we will
          revise the &ldquo;Last updated&rdquo; date above and, where the changes are
          significant, take reasonable steps to inform you.
        </p>

        <hr className={rule} />

        <h2 className={h2}>9. How to contact us</h2>
        <p className={p}>
          For any questions, requests, or concerns about your personal data or this
          notice, contact our Data Protection Officer:
        </p>
        <ul className={ul}>
          <li>
            <span className={strong}>DPO:</span> Martin Casey
          </li>
          <li>
            <span className={strong}>Email:</span> privacy@thevowedit.ph
          </li>
        </ul>
        <p className={p}>
          You also have the right to lodge a complaint with the{" "}
          <span className={strong}>National Privacy Commission</span> (privacy.gov.ph)
          if you believe your data privacy rights have been violated.
        </p>

        <hr className={rule} />

        <p className="mt-4 text-sm italic leading-relaxed text-muted">
          This notice is provided for transparency about The Vow Edit&rsquo;s data
          practices. It is not legal advice and should be reviewed by a qualified
          Philippine data-privacy professional before publication.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
