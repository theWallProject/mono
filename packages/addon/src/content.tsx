import shareButtonstyleText from "data-text:src/share_button/ShareButton.module.css"
import styleText from "data-text:src/ui/style.module.css"
import type { PlasmoCSConfig } from "plasmo"
import { Banner } from "src/ui/Banner"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = [styleText, shareButtonstyleText].join("\n")
  return style
}

const Content = () => {
  return <Banner />
}

export default Content
