import { ManualItemType } from "../types";
import { thauraHints } from "./hints/thaura";
import { newscordHints } from "./hints/newscord";

export const Hints: ManualItemType[] = [...thauraHints, ...newscordHints];
