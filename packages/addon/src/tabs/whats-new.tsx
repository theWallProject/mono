import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook"
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin"
import { FaTelegram } from "@react-icons/all-files/fa/FaTelegram"
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp"
import React, { useEffect } from "react"

import backgroundImage from "../../assets/images/bg-pattern.png"
import shieldIcon from "../../assets/images/shield-icon.svg"
import { getExtensionURL, track, trackPageView } from "../helpers"
import { getI18nMessage } from "../helpers/i18n-keys"
import styles from "../whats-new.module.css"

function WhatsNew() {
  useEffect(() => {
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.background = "#b72b00"
    document.title = "What's New - The Wall"
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const from = params.get("from") || "unknown"
    const to = params.get("to") || "unknown"
    const toUnderscored = to.replace(/\./g, "_")
    const fromUnderscored = from.replace(/\./g, "_")
    trackPageView(`whatsnew_update_${fromUnderscored}_to_${toUnderscored}`)
  }, [])

  const extensionName = getI18nMessage("extensionName")

  // The page is opened as tabs/whats-new.html?from=<old>&to=<version>, so the version shown
  // to the user comes from the URL the background script built. Reading it here instead of
  // hardcoding it means a release can never display a stale version number.
  const shownVersion = new URLSearchParams(window.location.search).get("to") ?? ""

  const handleShare = (platform: string) => {
    const url = "https://the-wall.win"
    const text = "Check out The Wall extension!"
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)

    switch (platform) {
      case "fb":
        track("Button", "Click", "whatsnew_share_fb")
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, "_blank")
        break
      case "tw":
        track("Button", "Click", "whatsnew_share_tw")
        window.open(`https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`, "_blank")
        break
      case "li":
        track("Button", "Click", "whatsnew_share_li")
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`, "_blank")
        break
      case "wa":
        track("Button", "Click", "whatsnew_share_wa")
        window.open(`https://wa.me/?text=${encodedText} ${encodedUrl}`, "_blank")
        break
      case "tg":
        track("Button", "Click", "whatsnew_share_tg")
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, "_blank")
        break
    }
  }

  const handleMonthly = () => {
    track("Button", "Click", "whatsnew_donate_monthly")
    window.open("https://ko-fi.com/thewalladdon", "_blank")
  }

  const handleContact = () => {
    track("Button", "Click", "whatsnew_contact")
    window.open("mailto:the.wall.addon@proton.me?subject=Contact - The Wall Extension", "_blank")
  }

  const handleDonationImage = () => {
    track("Button", "Click", "whatsnew_donation_image")
  }

  const handleVisitWebsite = () => {
    track("Button", "Click", "whatsnew_visit_website")
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.bgLayer}
        style={{
          backgroundColor: "#b72b00",
          backgroundImage: `url(${getExtensionURL(backgroundImage)})`
        }}
      />
      <div className={styles.bgOverlay} />

      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          {/* Masthead: the release is an issue, not a changelog entry */}
          <div className={styles.versionSection}>
            <img src={getExtensionURL(shieldIcon)} alt="The Wall Logo" className={styles.theWallLogo} />
            <div className={styles.versionContent}>
              <h1 className={styles.combinedTitle}>{extensionName}</h1>
              <p className={styles.version}>Issue {shownVersion}</p>
            </div>
          </div>

          {/* Hero: poster scale. The number is the headline, not a stat line. */}
          <section className={`${styles.featureSection} ${styles.heroSection}`}>
            <p className={styles.heroEyebrow}>Companies in the database</p>
            <p className={styles.heroPoster}>30,000</p>
            <p className={styles.heroSub}>
              Up from 20,000. Ten thousand companies added in one release — each one checked by hand before it went in.
            </p>
          </section>

          {/* What the jump actually cost */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>What ten thousand takes</h2>
            <p className={styles.featureText}>
              Not a bulk import. Every company needs a source, a reason, and a category before it can earn a warning —
              and the checking is manual. That is why ten thousand entries took far longer than the number suggests.
            </p>
          </section>

          {/* Privacy: verifiable, and unusual */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>The list never leaves your browser</h2>
            <p className={styles.featureText}>
              The only thing that ever leaves is a count of which buttons got clicked — never the site you were on.
            </p>
          </section>

          {/* AFSC dataset — the adds are the story, not the rejects */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>The AFSC list joined the database</h2>
            <p className={styles.featureText}>
              <strong>81</strong> companies from the American Friends Service Committee&apos;s public dataset — 78 of
              them US firms, so they get flagged on sites you would not otherwise expect.
            </p>
            <p className={styles.featureText}>
              Every row was checked against the source before it went in, and anything the evidence could not support
              stayed out.
            </p>
          </section>

          {/* Severity tiers */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>A direct link is not the same as an indirect one</h2>
            <p className={styles.featureText}>
              <strong style={{ color: "#b72b00" }}>Red</strong> — a direct connection: Israeli headquarters, a{" "}
              <code>.il</code> domain, or a BDS priority target.
            </p>
            <p className={styles.featureText}>
              <strong style={{ color: "#b45309" }}>Yellow</strong> — an indirect one: a founder, an investor, or a
              community connection.
            </p>
            <p className={styles.featureText}>
              Both are warnings. The colour tells you how strong the case is, so the two never look alike.
            </p>
          </section>

          {/* The funding trade-off, stated as cause and effect. No apology, no ask. */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>Why this issue took longer</h2>
            <p className={styles.featureText}>
              Donations were low this cycle, so the hours went to paid work. The Wall is a side project — it does not
              pay rent, the paid work does.
            </p>
            <p className={styles.featureText}>
              That is the whole trade-off, stated plainly:{" "}
              <strong>
                more support means less time spent elsewhere, which means more companies checked and issues that arrive
                sooner.
              </strong>
            </p>
          </section>

          {/* Urgent Appeal */}
          <section className={`${styles.featureSection} ${styles.urgentSection}`}>
            <h2 className={styles.sectionTitle}>Fund the next ten thousand</h2>
            <p className={styles.featureText} style={{ fontWeight: "600" }}>
              $1 a month is time — the difference between an issue every season and one every few weeks.
            </p>
            <p className={styles.featureText}>
              The money does not buy gratitude. It buys companies checked, sources read, and entries that keep arriving.
            </p>
            <a
              href="https://ko-fi.com/thewalladdon"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donationImageLink}
              onClick={handleDonationImage}>
              <picture>
                <source
                  media="(min-width: 1024px)"
                  srcSet="https://the-wall.win/dynamic/donations.png?maxRowBricks=15"
                />
                <source
                  media="(min-width: 640px)"
                  srcSet="https://the-wall.win/dynamic/donations.png?maxRowBricks=15"
                />
                <img
                  src="https://the-wall.win/dynamic/donations.png?maxRowBricks=11"
                  alt="The Wall donation tracker — each brick represents a supporter"
                  className={styles.donationImage}
                />
              </picture>
            </a>
            <div className={styles.donateButtonRow}>
              <button className={`${styles.donateButton} ${styles.largeDonateButton}`} onClick={handleMonthly}>
                Donate Monthly
              </button>
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <button className={`${styles.donateButton} ${styles.largeDonateButton}`} onClick={handleMonthly}>
              Donate Monthly
            </button>
            <a
              href="https://the-wall.win"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              onClick={handleVisitWebsite}>
              Visit the-wall.win
            </a>
            <button className={styles.contactButton} onClick={handleContact}>
              Send Feedback
            </button>
          </div>

          <div className={styles.shareSection}>
            <span className={styles.shareLabel}>Share:</span>
            <div className={styles.shareButtons}>
              <button className={styles.shareButton} onClick={() => handleShare("fb")} aria-label="Share on Facebook">
                <FaFacebook size={24} color="#3b5998" />
              </button>
              <button
                className={styles.shareButton}
                onClick={() => handleShare("tw")}
                aria-label="Share on X (Twitter)">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="#000000">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button className={styles.shareButton} onClick={() => handleShare("li")} aria-label="Share on LinkedIn">
                <FaLinkedin size={24} color="#0e76a8" />
              </button>
              <button className={styles.shareButton} onClick={() => handleShare("wa")} aria-label="Share on WhatsApp">
                <FaWhatsapp size={24} color="#25D366" />
              </button>
              <button className={styles.shareButton} onClick={() => handleShare("tg")} aria-label="Share on Telegram">
                <FaTelegram size={24} color="#0088cc" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsNew
