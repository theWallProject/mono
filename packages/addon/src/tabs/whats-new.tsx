import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook"
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin"
import { FaTelegram } from "@react-icons/all-files/fa/FaTelegram"
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp"
import React, { useEffect } from "react"

import backgroundImage from "../../assets/images/flag-bg.jpg"
import hintsOptionsImage from "../../assets/images/hints-options.png"
import theWallWhite from "../../assets/images/the-wall-white.png"
import { getExtensionURL, track } from "../helpers"
import styles from "../whats-new.module.css"

function WhatsNew() {
  useEffect(() => {
    // Remove default browser margins/padding
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.background = "#1b1b1b"
  }, [])

  // Get extension name from manifest
  const extensionName = chrome.i18n.getMessage("extensionName")

  const handleShare = (platform: string) => {
    const url = "https://the-wall.win"
    const text = "Check out The Wall extension!"
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)

    switch (platform) {
      case "fb":
        track("Button", "Click", "options_share_fb")
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
          "_blank"
        )
        break
      case "tw":
        track("Button", "Click", "options_share_tw")
        window.open(
          `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`,
          "_blank"
        )
        break
      case "li":
        track("Button", "Click", "options_share_li")
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`,
          "_blank"
        )
        break
      case "wa":
        track("Button", "Click", "options_share_wa")
        window.open(
          `https://wa.me/?text=${encodedText} ${encodedUrl}`,
          "_blank"
        )
        break
      case "tg":
        track("Button", "Click", "options_share_tg")
        window.open(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
          "_blank"
        )
        break
    }
  }

  const handleDonate = () => {
    track("Button", "Click", "options_donate")
    window.open("https://ko-fi.com/thewalladdon", "_blank")
  }

  const handleContact = () => {
    track("Button", "Click", "options_contact")
    window.open(
      "mailto:the.wall.addon@proton.me?subject=Contact - The Wall Extension",
      "_blank"
    )
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.bgLayer}
        style={{
          backgroundColor: "#121212",
          backgroundImage: `url(${getExtensionURL(backgroundImage)})`
        }}
      />

      {/* The Wall Logo */}
      <img
        src={getExtensionURL(theWallWhite)}
        alt="The Wall Logo"
        className={styles.theWallLogo}
      />

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
            <p className={styles.version}>Version 1.5.4</p>
          </div>

          {/* Static feature sections */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>New Platform Support</h2>
            <p className={styles.featureText}>
              We now support many new platforms including:
            </p>
            <div className={styles.platformList}>
              <span className={styles.platformItem}>YouTube</span>
              <span className={styles.platformItem}>TikTok</span>
              <span className={styles.platformItem}>GitHub</span>
              <span className={styles.platformItem}>Instagram</span>
              <span className={styles.platformItem}>Threads</span>
              <span className={styles.platformItem}>And more coming soon!</span>
            </div>
            <p className={styles.noteText}>
              Note: Platform support is not yet available for all websites.
            </p>
          </section>

          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>New Hints System</h2>
            <p className={styles.featureText}>
              Introducing a new hints system to support better actions, in
              collaboration with other{" "}
              <a
                href="https://techforpalestine.org"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}>
                TechForPalestine
              </a>{" "}
              projects like{" "}
              <a
                href="https://thaura.ai"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}>
                Thaura
              </a>{" "}
              and{" "}
              <a
                href="https://newscord.org/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}>
                Newscord
              </a>
              .
            </p>
          </section>

          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>Hints Control Options</h2>
            <p className={styles.featureText}>
              New options to control the hints system. More options coming soon!
            </p>
            <div className={styles.optionsImageContainer}>
              <img
                src={getExtensionURL(hintsOptionsImage)}
                alt="Hints Control Options"
                className={styles.optionsImage}
              />
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <button className={styles.donateButton} onClick={handleDonate}>
              Donate
            </button>
            <a
              href="https://the-wall.win"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}>
              Visit the-wall.win
            </a>
            <button className={styles.contactButton} onClick={handleContact}>
              Contact Us
            </button>
          </div>

          <div className={styles.shareSection}>
            <span className={styles.shareLabel}>Share:</span>
            <div className={styles.shareButtons}>
              <button
                className={styles.shareButton}
                onClick={() => handleShare("fb")}
                aria-label="Share on Facebook">
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
              <button
                className={styles.shareButton}
                onClick={() => handleShare("li")}
                aria-label="Share on LinkedIn">
                <FaLinkedin size={24} color="#0e76a8" />
              </button>
              <button
                className={styles.shareButton}
                onClick={() => handleShare("wa")}
                aria-label="Share on WhatsApp">
                <FaWhatsapp size={24} color="#25D366" />
              </button>
              <button
                className={styles.shareButton}
                onClick={() => handleShare("tg")}
                aria-label="Share on Telegram">
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
