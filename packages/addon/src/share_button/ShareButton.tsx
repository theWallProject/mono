import React, { useState } from "react"

import { getExtensionURL, track, type TR_NAME } from "~helpers"

import shareIcon from "../../assets/images/share-icon.svg"
import { getI18nMessage } from "../helpers/i18n-keys"
import styles from "./ShareButton.module.css"

interface ShareButtonProps {
  text: string
  url?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

type SharePlatform = "li" | "fb" | "ig" | "wa" | "tg"

const platformToTrackName: Record<SharePlatform, TR_NAME> = {
  li: "share_li",
  fb: "share_fb",
  ig: "share_ig",
  wa: "share_wa",
  tg: "share_tg"
}

export const ShareButton: React.FC<ShareButtonProps> = ({ text, url, onMouseEnter, onMouseLeave }) => {
  const [isOpen, setIsOpen] = useState(false)

  const encodedText = encodeURIComponent(text)
  const encodedUrl = url ? encodeURIComponent(url) : ""

  const handleShare = (platform: SharePlatform) => {
    track("Button", "Click", platformToTrackName[platform])

    switch (platform) {
      case "li":
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`, "_blank")
        break
      case "fb":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, "_blank")
        break
      case "ig":
        window.open("https://www.instagram.com/", "_blank")
        break
      case "wa":
        window.open(`https://wa.me/?text=${encodedText} ${encodedUrl}`, "_blank")
        break
      case "tg":
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, "_blank")
        break
    }
  }

  return (
    <div
      className={styles.shareButtonContainer}
      onMouseEnter={() => {
        onMouseEnter?.()
        setIsOpen(true)
      }}
      onMouseLeave={() => {
        onMouseLeave?.()
        setIsOpen(false)
      }}>
      <button type="button" className={styles.pillBadge} onClick={() => setIsOpen(!isOpen)}>
        <img src={getExtensionURL(shareIcon)} alt="" />
        {getI18nMessage("modalShareButton")}
      </button>

      <div className={`${styles.dropdown} ${isOpen ? styles.visible : ""}`}>
          <button
            type="button"
            className={styles.shareIcon}
            onClick={() => handleShare("li")}
            aria-label="Share on LinkedIn">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <path
                d="M33.3333 5H6.66667C5.74619 5 5 5.74619 5 6.66667V33.3333C5 34.2538 5.74619 35 6.66667 35H33.3333C34.2538 35 35 34.2538 35 33.3333V6.66667C35 5.74619 34.2538 5 33.3333 5ZM14.1667 30H10V16.6667H14.1667V30ZM12.0833 14.7917C10.7417 14.7917 9.66667 13.7083 9.66667 12.375C9.66667 11.0417 10.75 9.95833 12.0833 9.95833C13.4167 9.95833 14.5 11.0417 14.5 12.375C14.5 13.7083 13.4167 14.7917 12.0833 14.7917ZM30.8333 30H26.6667V23.5417C26.6667 21.9583 26.6333 19.9167 24.45 19.9167C22.2333 19.9167 21.9 21.65 21.9 23.4167V30H17.7333V16.6667H21.7333V18.5417H21.7917C22.3583 17.4583 23.7833 16.3083 25.9167 16.3083C30.1417 16.3083 30.8333 19.0833 30.8333 22.6667V30Z"
                fill="white"
              />
            </svg>
          </button>

          <button
            type="button"
            className={styles.shareIcon}
            onClick={() => handleShare("fb")}
            aria-label="Share on Facebook">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <path
                d="M35 20C35 11.7157 28.2843 5 20 5C11.7157 5 5 11.7157 5 20C5 27.4873 10.4843 33.7107 17.5 34.8181V24.375H13.75V20H17.5V16.625C17.5 12.9231 19.6891 10.9375 23.0641 10.9375C24.6766 10.9375 26.3672 11.2266 26.3672 11.2266V14.875H24.5047C22.6719 14.875 22.1094 16.0016 22.1094 17.1562V20H26.1953L25.5547 24.375H22.1094V34.8181C29.5157 33.7107 35 27.4873 35 20Z"
                fill="white"
              />
            </svg>
          </button>

          <button
            type="button"
            className={styles.shareIcon}
            onClick={() => handleShare("wa")}
            aria-label="Share on WhatsApp">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <path
                d="M30.4167 9.5C27.6667 6.75 24 5.25 20.0833 5.25C12 5.25 5.41667 11.8333 5.41667 19.9167C5.41667 22.5 6.08333 25 7.33333 27.25L5.25 34.75L12.9167 32.7083C15.0833 33.8333 17.5 34.4167 20 34.4167C28.0833 34.4167 34.75 27.8333 34.75 19.75C34.75 15.8333 33.1667 12.25 30.4167 9.5ZM20.0833 32.0833C17.8333 32.0833 15.6667 31.5 13.75 30.4167L13.3333 30.1667L8.75 31.4167L10.0833 26.9167L9.83333 26.5C8.58333 24.5 7.91667 22.25 7.91667 19.9167C7.91667 13.25 13.3333 7.83333 20.0833 7.83333C23.3333 7.83333 26.4167 9.08333 28.6667 11.4167C30.9167 13.75 32.25 16.75 32.1667 19.8333C32.1667 26.5833 26.75 32.0833 20.0833 32.0833ZM26.6667 22.8333C26.3333 22.6667 24.5833 21.8333 24.3333 21.6667C24 21.5833 23.8333 21.5 23.5833 21.8333C23.3333 22.1667 22.6667 22.9167 22.5 23.1667C22.3333 23.3333 22.1667 23.4167 21.8333 23.25C21.5 23.0833 20.3333 22.6667 18.9167 21.4167C17.8333 20.4167 17.0833 19.1667 16.9167 18.8333C16.75 18.5 16.9167 18.3333 17.0833 18.1667C17.25 18 17.4167 17.8333 17.5833 17.6667C17.75 17.5 17.8333 17.3333 17.9167 17.1667C18 17 17.9167 16.75 17.8333 16.5833C17.75 16.4167 17.0833 14.6667 16.75 14C16.5 13.3333 16.1667 13.4167 15.9167 13.4167C15.75 13.4167 15.5 13.4167 15.25 13.4167C15 13.4167 14.5833 13.5 14.25 13.8333C13.9167 14.1667 13.0833 14.9167 13.0833 16.6667C13.0833 18.4167 14.25 20.0833 14.4167 20.3333C14.5833 20.5833 17 24.3333 20.75 25.8333C21.6667 26.25 22.3333 26.5 22.9167 26.6667C23.8333 26.9167 24.6667 26.8333 25.3333 26.75C26.0833 26.5833 27.5 25.9167 27.75 25.1667C28.0833 24.4167 28.0833 23.75 27.9167 23.5833C27.8333 23.4167 27.5833 23.25 27.25 23.0833C26.9167 22.9167 26.6667 22.8333 26.6667 22.8333Z"
                fill="white"
              />
            </svg>
          </button>

          <button
            type="button"
            className={styles.shareIcon}
            onClick={() => handleShare("tg")}
            aria-label="Share on Telegram">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5ZM27.9375 14.6875L25.3125 26.5625C25.125 27.4375 24.5625 27.6562 23.8125 27.25L19.6875 24.1875L17.6875 26.125C17.4688 26.3438 17.2812 26.5312 16.875 26.5312L17.1562 22.3438L24.8438 15.4375C25.1875 15.1562 24.7812 15 24.3125 15.2812L14.875 21.2188L10.8125 19.9375C9.9375 19.6562 9.90625 19.0312 11 18.5938L26.8125 12.6562C27.5312 12.375 28.1875 12.8438 27.9375 14.6875Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
    </div>
  )
}
