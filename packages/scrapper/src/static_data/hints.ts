import { CompressedManualItemType } from "../types"
import { microsoftBdsHints } from "./hints/microsoft_bds"
import { newscordHints } from "./hints/newscord"
import { thauraHints } from "./hints/thaura"

export const Hints: CompressedManualItemType[] = [...thauraHints, ...newscordHints, ...microsoftBdsHints]
