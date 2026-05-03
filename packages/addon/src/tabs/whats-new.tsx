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

const YOUTUBE_VIDEO_ID = "8Zg1xq5SJEw"
const YOUTUBE_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`
const YOUTUBE_THUMBNAIL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`

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

  const handleReport = () => {
    track("Button", "Click", "whatsnew_report")
    window.open("mailto:the.wall.addon@proton.me?subject=Report - The Wall Extension", "_blank")
  }

  const handleYouTube = () => {
    track("Button", "Click", "whatsnew_youtube_telpshow")
    window.open(YOUTUBE_URL, "_blank")
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
          {/* Version number */}
          <div className={styles.versionSection}>
            <img src={getExtensionURL(shieldIcon)} alt="The Wall Logo" className={styles.theWallLogo} />
            <div className={styles.versionContent}>
              <h1 className={styles.combinedTitle}>What&apos;s New — {extensionName}</h1>
              <p className={styles.version}>Version 1.15.0</p>
            </div>
          </div>

          {/* Custom Reasons */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>Custom Boycott Reasons</h2>
            <p className={styles.featureText}>
              We&apos;ve added support for custom boycott reasons with source links. When a company is flagged,
              you&apos;ll now see the specific connection alongside a &quot;View Source&quot; link that takes you
              directly to the evidence. More transparency, more accountability.
            </p>
          </section>

          {/* Urgent Appeal */}
          <section className={`${styles.featureSection} ${styles.urgentSection}`}>
            <h2 className={styles.sectionTitle}>Your Support Is Critical</h2>
            <p className={styles.featureText} style={{ fontWeight: "600" }}>
              This project needs your help to survive. A monthly donation of any amount — even $1 — gives me the
              stability to dedicate real time to new features, bug fixes, and data updates instead of chasing freelance
              gigs.
            </p>
            <p className={styles.featureText}>
              Every brick on this wall represents someone who believes this project matters. See the wall grow in
              real-time:
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

          {/* Community Spotlight - Telpshow */}
          <section className={`${styles.featureSection} ${styles.communitySection}`}>
            <h2 className={styles.sectionTitle}>Community Spotlight</h2>
            <p className={styles.featureText}>
              Huge thanks to <strong>Telpshow</strong> for covering The Wall on YouTube and spreading the word. His
              support means a lot to this project.
            </p>
            <div className={styles.videoThumbnailContainer}>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoThumbnailLink}
                onClick={handleYouTube}>
                <div className={styles.videoThumbnailWrapper}>
                  <img
                    src={YOUTUBE_THUMBNAIL}
                    alt="Telpshow's YouTube coverage of The Wall"
                    className={styles.videoThumbnail}
                  />
                  <div className={styles.playOverlay}>
                    <svg className={styles.playIcon} viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <span className={styles.videoCaption}>Watch on YouTube</span>
              </a>
            </div>
          </section>

          {/* Install Drop Notice */}
          <section className={`${styles.featureSection} ${styles.installDropSection}`}>
            <h2 className={styles.sectionTitle}>Mysterious Install Count Drop</h2>
            <p className={styles.featureText}>
              In just a few days, our install count went from over 10,000 to around 3,000 — a disappearance of roughly
              7,000 installs with no explanation. We suspect this may be a mistake or possibly harassment from Google,
              and we are actively investigating.
            </p>
            <p className={styles.featureText} style={{ fontWeight: "600" }}>
              If you&apos;ve experienced any issues, please report them.
            </p>
            <p className={styles.featureText}>
              More updates soon. In the meantime, sharing the extension and donating is the best way to help save this
              project.
            </p>
            <button className={styles.reportButton} onClick={handleReport}>
              Report an Issue
            </button>
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
              Contact Us
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
