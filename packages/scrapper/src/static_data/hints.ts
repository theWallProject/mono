import { ManualItemType } from "../types"
import { newscordHints } from "./hints/newscord"
import { thauraHints } from "./hints/thaura"

export const Hints: ManualItemType[] = [...thauraHints, ...newscordHints]
