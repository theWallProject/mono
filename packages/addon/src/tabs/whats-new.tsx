import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook"
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin"
import { FaTelegram } from "@react-icons/all-files/fa/FaTelegram"
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp"
import React, { useEffect } from "react"

import backgroundImage from "../../assets/images/bg-pattern.png"
import shieldIcon from "../../assets/images/shield-icon.svg"
import { getExtensionURL, track } from "../helpers"
import { getI18nMessage } from "../helpers/i18n-keys"
import styles from "../whats-new.module.css"

function WhatsNew() {
  useEffect(() => {
    // Remove default browser margins/padding
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.background = "#b72b00"
  }, [])

  // Get extension name from manifest
  const extensionName = getI18nMessage("extensionName")

  const handleShare = (platform: string) => {
    const url = "https://the-wall.win"
    const text = "Check out The Wall extension!"
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)

    switch (platform) {
      case "fb":
        track("Button", "Click", "options_share_fb")
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, "_blank")
        break
      case "tw":
        track("Button", "Click", "options_share_tw")
        window.open(`https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`, "_blank")
        break
      case "li":
        track("Button", "Click", "options_share_li")
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`, "_blank")
        break
      case "wa":
        track("Button", "Click", "options_share_wa")
        window.open(`https://wa.me/?text=${encodedText} ${encodedUrl}`, "_blank")
        break
      case "tg":
        track("Button", "Click", "options_share_tg")
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, "_blank")
        break
    }
  }

  const handleDonate = () => {
    track("Button", "Click", "options_donate")
    window.open("https://ko-fi.com/thewalladdon", "_blank")
  }

  const handleContact = () => {
    track("Button", "Click", "options_contact")
    window.open("mailto:the.wall.addon@proton.me?subject=Contact - The Wall Extension", "_blank")
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
        <div className={styles.header}>
          <h1 className={styles.title}>What&apos;s New</h1>
        </div>

        <div className={styles.content}>
          {/* Version number */}
          <div className={styles.versionSection}>
            <img src={getExtensionURL(shieldIcon)} alt="The Wall Logo" className={styles.theWallLogo} />
            <div className={styles.versionContent}>
              <h2 className={styles.sectionTitle}>{extensionName}</h2>
              <p className={styles.version}>Version 1.9.0 🎉</p>
            </div>
          </div>

          {/* Donation Message */}
          <section className={`${styles.featureSection} ${styles.donationSection}`}>
            <h2 className={styles.sectionTitle}>Support The Wall</h2>
            <p className={styles.featureText}>
              Hope you like the new look! This redesign (and everything else) was made possible by donations and support
              from Tech For Palestine. More donations = more time I can spend on updates instead of freelancing. Simple
              math, really.
            </p>
            <div style={{ marginTop: "20px" }}>
              <button className={`${styles.donateButton} ${styles.largeDonateButton}`} onClick={handleDonate}>
                Support on Ko-fi
              </button>
            </div>
          </section>

          {/* Complete UI Redesign - Highlight Section */}
          <section className={`${styles.featureSection} ${styles.highlightSection}`}>
            <h2 className={styles.sectionTitle}>Complete UI Redesign</h2>
            <p className={styles.featureText}>
              The Wall has been completely reimagined with a new shield icon, refined warning banners, and polished hint
              toasts. We swapped heavy 3D graphics for clean SVGs and added subtle glassmorphism effects. Cleaner,
              faster, and easier on the eyes.
            </p>
          </section>

          {/* Android App Coming Soon */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>
              Android App <span className={styles.comingSoonBadge}>Coming Soon</span>
            </h2>
            <p className={styles.featureText}>
              The Wall is coming to Android! Our mobile app lets you scan your installed apps against our database and
              check URLs on the go. Built with the same comprehensive database you trust, now in your pocket. Stay tuned
              for the official release!
            </p>
          </section>

          {/* LinkedIn Job Scanning - Now Stable */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>LinkedIn Job Scanning</h2>
            <p className={styles.featureText}>
              Scan LinkedIn job listings to identify flagged companies during your job search. This feature is now
              enabled by default for all users—no configuration needed. You can toggle it in the extension popup if
              needed.
            </p>
          </section>

          {/* Enhanced YouTube Support */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>Enhanced YouTube Support</h2>
            <p className={styles.featureText}>
              The Wall now works on YouTube video pages, not just channel profiles. You&apos;ll see warnings for flagged
              content wherever you watch.
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <button className={styles.donateButton} onClick={handleDonate}>
              Donate
            </button>
            <a href="https://the-wall.win" target="_blank" rel="noopener noreferrer" className={styles.link}>
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
