import React, { type FC, type MouseEventHandler } from "react"

import style from "./style.module.css"

const Button: FC<{
  title: string
  onClick: () => void
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>
  /** Set when the button opens a popup, so assistive tech announces it. */
  ariaHasPopup?: "true" | "menu" | "listbox"
  /** Current popup visibility, paired with `ariaHasPopup`. */
  ariaExpanded?: boolean
}> = ({ title, onClick, onMouseEnter, onMouseLeave, ariaHasPopup, ariaExpanded }) => {
  return (
    <button
      onClick={onClick}
      className={style.button}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...(ariaHasPopup !== undefined ? { "aria-haspopup": ariaHasPopup } : {})}
      {...(ariaExpanded !== undefined ? { "aria-expanded": ariaExpanded } : {})}>
      {title}
    </button>
  )
}

export { Button }
