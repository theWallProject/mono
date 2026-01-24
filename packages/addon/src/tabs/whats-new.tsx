import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook"
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin"
import { FaTelegram } from "@react-icons/all-files/fa/FaTelegram"
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp"
import React, { useEffect } from "react"

import backgroundImage from "../../assets/images/bg-pattern.png"
import linkedinJobsOptionsImage from "../../assets/images/linkedin.png"
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

      {/* The Wall Logo */}
      <img src={getExtensionURL(shieldIcon)} alt="The Wall Logo" className={styles.theWallLogo} />

      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div>
            <p className={styles.pluginName}>{extensionName}</p>
            <h1 className={styles.title}>What&apos;s New</h1>
          </div>
        </div>

        <div className={styles.content}>
          {/* Version number */}
          <div className={styles.versionSection}>
            <p className={styles.version}>Version 1.7.0</p>
          </div>

          {/* Donation Message */}
          <section className={`${styles.featureSection} ${styles.donationSection}`}>
            <h2 className={styles.sectionTitle}>💝 Support The Wall</h2>
            <p className={styles.featureText}>
              The Wall is a passion project that takes countless hours to develop and maintain—time I could be spending
              on freelancing. AI tools and infrastructure also come with real costs. Your monthly support, no matter how
              small, helps me dedicate more time to building features that matter for Palestine. Every contribution
              makes a difference.
            </p>
            <div style={{ marginTop: "20px" }}>
              <button className={`${styles.donateButton} ${styles.largeDonateButton}`} onClick={handleDonate}>
                ☕ Support on Ko-fi
              </button>
            </div>
          </section>

          {/* Static feature sections */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>🛡️ Full BDS Support</h2>
            <p className={styles.featureText}>
              The Wall now includes comprehensive BDS (Boycott, Divestment, Sanctions) support. Companies on the BDS
              list, including Microsoft, now appear as hints with suggested alternatives. Official BDS labeling in the
              interface is coming soon.
            </p>
          </section>

          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>💼 LinkedIn Job Listings (Experimental)</h2>
            <p className={styles.featureText}>
              New experimental feature to scan LinkedIn job listing pages for flagged companies. This feature can be
              enabled in the extension options. We&apos;re actively improving detection accuracy and performance.
            </p>
            <div className={styles.imageContainer}>
              <img
                src={getExtensionURL(linkedinJobsOptionsImage)}
                alt="LinkedIn Job Listings Feature"
                className={styles.featureImage}
              />
            </div>
          </section>

          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>📹 Enhanced YouTube Support</h2>
            <p className={styles.featureText}>
              The Wall now works on YouTube video pages, not just channel profiles. You&apos;ll see warnings for flagged
              content wherever you watch.
            </p>
          </section>

          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>✨ Fresh New Design</h2>
            <p className={styles.featureText}>
              We&apos;ve launched a redesigned website at{" "}
              <a href="https://the-wall.win" target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                the-wall.win
              </a>
              . The extension interface and a new icon are being updated to match the new brand identity.
            </p>
          </section>

          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>🚀 Coming Soon</h2>
            <p className={styles.featureText}>We&apos;re working on exciting new ways to use The Wall:</p>
            <ul className={styles.featureList}>
              <li>Android app for mobile protection</li>
              <li>Telegram bot for instant company checks</li>
            </ul>
          </section>

          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>⚡ Technical Improvements</h2>
            <p className={styles.featureText}>
              Behind the scenes, we&apos;ve made significant improvements including automated testing, better error
              handling, and performance optimizations to ensure The Wall runs smoothly and reliably.
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
                <svg width={24} height={24} viewBox="0 0 24 24" fill="#8899ac">
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
