import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook"
import { FaInstagram } from "@react-icons/all-files/fa/FaInstagram"
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin"
import { FaTelegram } from "@react-icons/all-files/fa/FaTelegram"
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp"
import React, { useEffect } from "react"

import eventRooted from "../../assets/images/event-rooted.jpg"
import eventTechRebellion from "../../assets/images/event-tech-rebellion.jpg"
import graffitiBalloons from "../../assets/images/graffiti-balloons.png"
import moFollow from "../../assets/images/mo-follow.jpg"
import shieldIcon from "../../assets/images/shield-icon.svg"
import wallTexture from "../../assets/images/wall-texture.jpg"
import wikipediaInfluenceMap from "../../assets/images/wikipedia-influence-map.webp"
import { getExtensionURL, track, trackPageView } from "../helpers"
import styles from "../whats-new.module.css"

function WhatsNew() {
  useEffect(() => {
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.background = "#241f1b"
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

  const handleNewsTechRebellion = () => {
    track("Button", "Click", "whatsnew_news_techrebellion")
  }

  const handleNewsRooted = () => {
    track("Button", "Click", "whatsnew_news_rooted")
  }

  const handleCamouflage = () => {
    track("Button", "Click", "whatsnew_camouflage_ig")
  }

  const handleWikipediaReport = () => {
    track("Button", "Click", "whatsnew_wikipedia_report")
  }

  const handleNewsAmazon = () => {
    track("Button", "Click", "whatsnew_news_amazon")
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.bgLayer}
        style={{ backgroundImage: `url(${getExtensionURL(wallTexture)})` }}
      />

      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          {/* Masthead: a wheat-paste poster naming the issue. */}
          <div className={`${styles.paper} ${styles.masthead} ${styles.tiltLeft}`}>
            <img src={getExtensionURL(shieldIcon)} alt="The Wall Logo" className={styles.theWallLogo} />
            <div className={styles.mastheadText}>
              <h1 className={styles.mastheadTitle}>The Wall — Boycott Assistant</h1>
              <p className={styles.mastheadSub}>What’s changed in the addon · v{shownVersion}</p>
            </div>
          </div>

          {/* Two families of paper on this wall: what the addon changed, and what
              the movement is doing. The band says which one you are reading. */}
          <div className={styles.groupBand}>
            <span className={styles.groupBandText}>New features</span>
          </div>

          {/* The number is the front page. Nothing else gets this size. */}
          <section className={`${styles.paper} ${styles.heroPoster} ${styles.tiltRight}`}>
            <p className={styles.heroEyebrow}>Companies in the database</p>
            <p className={styles.heroBefore}>20,000</p>
            <p className={styles.heroFigure}>23,000</p>
            <p className={styles.heroSub}>Every row checked by hand.</p>
          </section>

          {/* The ask. The brick tracker stops being a widget here: each brick is a
              supporter, on the wall the page is named for. */}
          <section className={`${styles.paper} ${styles.askPoster} ${styles.tiltLeftSoft}`}>
            <h2 className={styles.askTitle}>Fund the next update</h2>
            <p className={styles.featureText} style={{ fontWeight: "600" }}>
              $1 a month is time: an update every few weeks instead of every season.
            </p>
            <p className={styles.featureText}>It buys companies checked, sources read, entries arriving.</p>
            <a
              href="https://ko-fi.com/thewalladdon"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donationImageLink}
              onClick={handleDonationImage}>
              <img
                src="https://the-wall.win/dynamic/donations.png?maxRowBricks=15"
                alt="The Wall donation tracker — each brick represents a supporter"
                className={styles.donationImage}
              />
            </a>
            <div className={styles.donateButtonRow}>
              <button className={styles.donateButton} onClick={handleMonthly}>
                Donate Monthly
              </button>
            </div>
          </section>
          {/* AFSC dataset — named in full, linked, and reasoned */}
          <section className={`${styles.paper} ${styles.notice} ${styles.tiltLeftSoft}`}>
            <h2 className={styles.sectionTitle}>Peace, since 1917.</h2>
            <p className={styles.featureText}>
              The{" "}
              <a
                href="https://investigate.afsc.org/download-our-data"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.inlineLink}>
                American Friends Service Committee
              </a>{" "}
              — Quaker peace work since 1917 — published a list of <strong>81</strong> companies, 78 of them US
              firms, flagged on sites you would not expect. None are free until all are.
            </p>
            <p className={styles.featureText}>
              Each row checked against the source; anything the evidence could not support stayed out.
            </p>
          </section>

          {/* Severity tiers */}
          <section className={`${styles.paper} ${styles.notice} ${styles.tiltRightSoft}`}>
            <h2 className={styles.sectionTitle}>Red is not yellow.</h2>
            <p className={styles.featureText}>
              <strong className={styles.tierRed}>Red</strong> — a direct connection: Israeli headquarters, a{" "}
              <code>.il</code> domain, or a BDS priority target.
            </p>
            <p className={styles.featureText}>
              <strong className={styles.tierAmber}>Yellow</strong> — an indirect one: a founder, an investor, or a
              community connection.
            </p>
            <p className={styles.featureText}>Both are warnings. The colour says how strong the case is.</p>
          </section>

          {/* The dig and the link it came from, on one scrap — the shopping
              calendar is not the events board. */}
          <section className={`${styles.paper} ${styles.sideNote} ${styles.tiltRightSoft}`}>
            <p className={styles.sideNoteKicker}>Black Friday</p>
            <p className={styles.sideNoteText}>
              Amazon will be cheaper for a day. The reason it is on the list is not seasonal.
            </p>
            <a
              href="https://www.amazonworkerintifada.com/petition"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sideNoteLink}
              onClick={handleNewsAmazon}>
              Amazon Worker Intifada — add your name →
            </a>
          </section>

          <div className={styles.groupBand}>
            <span className={styles.groupBandText}>Tech for Palestine</span>
          </div>

          {/* The report that landed two days ago, read by hand and quoted with
              its own numbers. */}
          <section className={`${styles.paper} ${styles.notice} ${styles.tiltLeftSoft}`}>
            <div className={styles.reportGrid}>
              <div className={styles.reportMedia}>
                <img
                  src={getExtensionURL(wikipediaInfluenceMap)}
                  alt="Wikipedia influence map: who is trying to shape what AI learns"
                  className={styles.reportMap}
                />
                <p className={styles.reportCaption}>
                  Who is trying to shape what AI learns. Diagram: Tech for Palestine.
                </p>
              </div>
              <div className={styles.reportBody}>
                <span className={styles.reportTag}>Report</span>
                <h2 className={styles.sectionTitle}>Israel Is Attacking Wikipedia</h2>
                <p className={styles.featureText}>
                  Tech for Palestine documented <strong>17</strong> campaigns to shape Wikipedia since 2001 — nine
                  of them still running. Israel’s 2026 propaganda budget is <strong>$729M</strong>, up from $150M,
                  and $46.5M of it buys AI chatbots that answer differently.
                </p>
                <p className={styles.featureText}>
                  They checked every claim in the ADL’s “Editing for Hate” against the edits it cites. None held
                  up.
                </p>
                <a
                  href="https://techforpalestine.org/wikipedia-report"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.reportLink}
                  onClick={handleWikipediaReport}>
                  Read the report →
                </a>
              </div>
            </div>
          </section>
          <section className={`${styles.paper} ${styles.newsBoard} ${styles.tiltRightSoft}`}>
            <div className={styles.newsHead}>
              <p className={styles.newsKicker}>Events</p>
              <h2 className={styles.newsTitle}>Show up.</h2>
            </div>

            <div className={styles.newsGrid}>
              <a
                href="https://rooted.techforpalestine.org"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newsRow}
                onClick={handleNewsRooted}>
                <span className={styles.newsThumbWrap}>
                  <img
                    src={getExtensionURL(eventRooted)}
                    alt="ROOTED — Tech for Palestine summit, Amman, 3 December 2026"
                    className={styles.newsThumb}
                  />
                  <span className={styles.newsStamp}>
                    <span className={styles.newsStampDay}>03</span>
                    <span className={styles.newsStampMonth}>Dec 2026</span>
                  </span>
                </span>
                <span className={styles.newsBody}>
                  <span className={styles.newsMeta}>
                    <span className={styles.eventTag}>Event</span>
                    <span className={styles.newsWhere}>Amman</span>
                  </span>
                  <span className={styles.newsName}>ROOTED</span>
                  <span className={styles.newsWhat}>Tech, ethics and alternatives. 200 seats.</span>
                  <span className={styles.newsCta}>Event page →</span>
                </span>
              </a>

              <a
                href="https://techrebellion.techforpalestine.org/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newsRow}
                onClick={handleNewsTechRebellion}>
                <span className={styles.newsThumbWrap}>
                  <img
                    src={getExtensionURL(eventTechRebellion)}
                    alt="Tech Rebellion — Tech for Palestine, Berlin, 12 December 2026"
                    className={styles.newsThumb}
                  />
                  <span className={styles.newsStamp}>
                    <span className={styles.newsStampDay}>12</span>
                    <span className={styles.newsStampMonth}>Dec 2026</span>
                  </span>
                </span>
                <span className={styles.newsBody}>
                  <span className={styles.newsMeta}>
                    <span className={styles.eventTag}>Event</span>
                    <span className={styles.newsWhere}>Berlin</span>
                  </span>
                  <span className={styles.newsName}>Tech Rebellion</span>
                  <span className={styles.newsWhat}>
                    One day for technologists, organisers, artists and allies.
                  </span>
                  <span className={styles.newsCta}>Event page →</span>
                </span>
              </a>
            </div>
          </section>

          {/* A voice worth following. Pinned as a poster, not a footnote. */}
          <section className={`${styles.paper} ${styles.spotlight} ${styles.tiltLeftSoft}`}>
            <div className={styles.spotlightGrid}>
              <img
                src={moFollow}
                alt="Mo in camouflage"
                className={styles.spotlightImage}
              />
              <div className={styles.spotlightBody}>
                <p className={styles.spotlightKicker}>Follow the work</p>
                <h2 className={styles.spotlightTitle}>Mo is still posting.</h2>
                <p className={styles.featureText}>
                  Meta has deleted more than 40 of his accounts. He is a Palestinian content creator, and he posts
                  anyway.
                </p>
                <p className={styles.featureText}>
                  This link always points at his latest Instagram account.
                </p>
                <a
                  href="https://nexusg8.com/meet/mohamz?via=link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.spotlightLink}
                  onClick={handleCamouflage}>
                  <FaInstagram size={18} aria-hidden="true" />
                  <span>His latest account</span>
                </a>
              </div>
            </div>
          </section>

        </div>

        <footer className={`${styles.footer} ${styles.tiltLeftSoft}`}>
          <p className={styles.footerKicker}>Elsewhere</p>
          <h2 className={styles.footerTitle}>Share the addon, or tell us off.</h2>
          <div className={styles.socialRow}>
            <button
              className={styles.socialTile}
              onClick={() => handleShare("fb")}
              aria-label="Share on Facebook">
              <FaFacebook size={22} aria-hidden="true" />
              <span>Facebook</span>
            </button>
            <button
              className={styles.socialTile}
              onClick={() => handleShare("tw")}
              aria-label="Share on X (Twitter)">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X</span>
            </button>
            <button
              className={styles.socialTile}
              onClick={() => handleShare("li")}
              aria-label="Share on LinkedIn">
              <FaLinkedin size={22} aria-hidden="true" />
              <span>LinkedIn</span>
            </button>
            <button
              className={styles.socialTile}
              onClick={() => handleShare("wa")}
              aria-label="Share on WhatsApp">
              <FaWhatsapp size={22} aria-hidden="true" />
              <span>WhatsApp</span>
            </button>
            <button
              className={styles.socialTile}
              onClick={() => handleShare("tg")}
              aria-label="Share on Telegram">
              <FaTelegram size={22} aria-hidden="true" />
              <span>Telegram</span>
            </button>
          </div>
          <div className={styles.footerFoot}>
            <button className={styles.feedbackButton} onClick={handleContact}>
              Send feedback
            </button>
            <a
              href="https://the-wall.win"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerSite}
              onClick={handleVisitWebsite}>
              the-wall.win
            </a>
          </div>
        </footer>
      </div>

      {/* Sprayed on the wall itself, beside the ask — placement is an HTML concern,
          not baked into the wall tile, so window size can never crop it. */}
      <img
        src={getExtensionURL(graffitiBalloons)}
        alt=""
        aria-hidden="true"
        className={styles.graffiti}
      />
    </div>
  )
}

export default WhatsNew
