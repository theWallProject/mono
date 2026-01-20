import React, { type FC, type MouseEventHandler } from "react"

import style from "./style.module.css"

const Button: FC<{
  title: string
  onClick: () => void
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>
  variant?: "primary" | "secondary"
}> = ({ title, onClick, onMouseEnter, onMouseLeave, variant = "primary" }) => {
  const className = variant === "secondary" ? `${style.button} ${style.buttonSecondary}` : style.button

  return (
    <button onClick={onClick} className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {title}
    </button>
  )
}

export { Button }
