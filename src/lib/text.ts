/**
 * Truncate to a character budget without cutting a word in half: trim back to
 * the last space inside the budget (or hard-cut if there's no space).
 */
export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd()
}
