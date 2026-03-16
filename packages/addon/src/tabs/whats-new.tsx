import { FaAndroid } from "@react-icons/all-files/fa/FaAndroid"
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
    document.title = "What's New - The Wall"
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

  const handleVote = () => {
    track("Button", "Click", "options_vote_sadaqah")
    window.open("https://award.globalsadaqah.com/profiles/118", "_blank")
  }

  const handleAndroid = () => {
    track("Button", "Click", "options_android_app")
    window.open("https://play.google.com/store/apps/details?id=com.thewallboycott.android", "_blank")
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
              <p className={styles.version}>Version 1.10.2</p>
            </div>
          </div>

          {/* Vote CTA - Time Critical */}
          <section className={`${styles.featureSection} ${styles.voteCta}`}>
            <h2 className={styles.sectionTitle} style={{ color: "#ffffff", fontSize: "24px" }}>
              Help Us Win $5,000 <span className={styles.urgentBadge}>Time-Sensitive</span>
            </h2>
            <p className={styles.featureText} style={{ color: "#ffe1cd", fontSize: "18px" }}>
              The Wall has been nominated for the Global Sadaqah Tech For Good Award. Winning this $5,000 grant would be
              a game-changer for a solo developer project like this. It means more features, faster updates, and less
              time freelancing to keep the lights on.
            </p>
            <p className={styles.featureText} style={{ fontWeight: "600", color: "#ffffff", fontSize: "19px" }}>
              Every single vote counts. Yours could be the one that tips the scale. It takes 10 seconds and costs
              nothing.
            </p>
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <button className={styles.voteButton} onClick={handleVote}>
                Vote Now - It Takes 10 Seconds
              </button>
            </div>
          </section>

          {/* Data Enhancements */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>Massive Data Update</h2>
            <p className={styles.featureText}>
              Hundreds of data enhancements across the entire database. We ran extensive automation pipelines followed
              by hours of manual verification to detect and link social media profiles for the 20,000+ companies we
              track. LinkedIn, Facebook, X, Instagram, GitHub, YouTube, TikTok, Threads - if a flagged company has a
              presence there, we now catch it.
            </p>
            <p className={styles.featureText}>
              This means the extension now detects significantly more profiles when you browse social media. Fewer slip
              through the cracks.
            </p>
          </section>

          {/* Android App */}
          <section className={styles.featureSection}>
            <h2 className={styles.sectionTitle}>
              <FaAndroid size={22} color="#3DDC84" /> The Wall is Now on Android
            </h2>
            <p className={styles.featureText}>
              The Android app is live on Google Play. It scans your installed apps against our database of 20,000+
              companies and shows you which ones have Israeli connections. Available in English and Arabic, with more
              languages coming soon.
            </p>
            <p className={styles.featureText}>
              Hundreds of new companies are being added in the coming weeks - install now and you&apos;ll get them
              automatically.
            </p>
            <div style={{ marginTop: "16px" }}>
              <button className={`${styles.donateButton} ${styles.androidButton}`} onClick={handleAndroid}>
                Get it on Google Play
              </button>
            </div>
          </section>

          {/* Support */}
          <section className={`${styles.featureSection} ${styles.donationSection}`}>
            <h2 className={styles.sectionTitle}>Support The Wall</h2>
            <p className={styles.featureText}>
              This project is built and maintained by a solo developer. Honestly, $1/month helps me more than a one-time
              $100. Steady support means I can plan ahead and spend real time on this instead of chasing freelance gigs.
              It takes one second to set up from the Android app or Ko-fi.
            </p>
            <div style={{ marginTop: "20px" }}>
              <button className={`${styles.donateButton} ${styles.largeDonateButton}`} onClick={handleDonate}>
                Support on Ko-fi
              </button>
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <button className={styles.voteButton} onClick={handleVote}>
              Vote for The Wall
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
