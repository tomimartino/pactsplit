import Link from "next/link";
import { Header } from "@/components/shell";
import { Arrow, Check, Icon, LogoMark } from "@/components/icons";
import { SplitPreview } from "@/components/split-preview";
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="live-dot" />
              BETTER TOGETHER. PAID TOGETHER.
            </div>
            <h1>
              One invoice.
              <br />
              Every teammate
              <br />
              <span>paid.</span>
              <svg viewBox="0 0 190 16" aria-hidden="true">
                <path
                  d="M3 11c49-11 108-11 183-5"
                  stroke="#B9AFE9"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </h1>
            <p>
              Great work takes a team. Send one invoice and let every USDC
              payment find its way to the right people.
            </p>
            <div className="hero-actions">
              <Link className="btn" href="/invoices/new">
                Create an invoice <Arrow />
              </Link>
              <Link className="text-link" href="/demo">
                See it in action <Arrow direction="up" />
              </Link>
            </div>
            <div className="hero-trust">
              <span>
                <Check />
                No platform fee
              </span>
              <span>
                <Check />
                Straight to your wallets
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-note">
              <span className="star-symbol">✳</span>Made for teams,
              <br />
              built on Arc.
            </div>
            <SplitPreview
              title="Brand & website design"
              amount={1000n * 10n ** 18n}
              recipients={[
                {
                  name: "Alya",
                  role: "Developer",
                  bps: 6000,
                  amount: 600n * 10n ** 18n,
                },
                {
                  name: "Rafi",
                  role: "Designer",
                  bps: 3000,
                  amount: 300n * 10n ** 18n,
                },
                {
                  name: "Nia",
                  role: "Copywriter",
                  bps: 1000,
                  amount: 100n * 10n ** 18n,
                },
              ]}
              variant="landing"
            />
            <div className="payment-note">
              <span className="small-check">
                <Check />
              </span>
              <div>
                <strong>One payment. Three happy teammates.</strong>
                <span>Illustrative payment preview</span>
              </div>
            </div>
          </div>
        </section>
        <section className="why-strip">
          <span>
            Less chasing payments.
            <br />
            <strong>More creating together.</strong>
          </span>
          <span>
            <Icon name="invoice" />
            One shareable invoice
          </span>
          <span>
            <Icon name="wallet" />
            Up to 5 team wallets
          </span>
          <span>
            <Icon name="link" />
            Transparent on Arc
          </span>
        </section>
        <section className="how-section" id="how-it-works">
          <div className="section-title">
            <span className="eyebrow">A LITTLE LESS ADMIN</span>
            <h2>
              From great work to
              <br />
              everyone getting paid.
            </h2>
            <p>Agree on the split. We take care of the rest.</p>
          </div>
          <div className="steps">
            <article>
              <span className="step-num">01</span>
              <h3>Bring your team</h3>
              <p>
                Add your teammates’ wallets and agree on each person’s share.
              </p>
            </article>
            <article>
              <span className="step-num">02</span>
              <h3>Send one invoice</h3>
              <p>
                Publish your invoice on Arc and share a single checkout link
                with your client.
              </p>
            </article>
            <article>
              <span className="step-num">03</span>
              <h3>Get paid together</h3>
              <p>
                Your client pays in native USDC. Every share arrives in the same
                transaction.
              </p>
            </article>
          </div>
        </section>
        <section className="bottom-cta">
          <div>
            <span className="eyebrow">YOUR TEAM. YOUR PACT.</span>
            <h2>Make payday a team thing.</h2>
          </div>
          <Link className="btn" href="/invoices/new">
            Create your first invoice <Arrow />
          </Link>
        </section>
      </main>
      <footer className="site-footer">
        <Link href="/" className="brand">
          <LogoMark small />
          PactSplit
        </Link>
        <span>Built for independent teams, on Arc.</span>
        <Link href="/setup">
          Network & setup <Arrow direction="up" />
        </Link>
      </footer>
    </>
  );
}
