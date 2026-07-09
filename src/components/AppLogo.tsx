import { cn } from '@/lib/utils'

/**
 * The engraved gold "BILLY McCOMISKEY" wordmark from the mockups.
 * Rendered as a heading so screen readers announce the site name.
 */
export function AppLogo({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'font-heading leading-none tracking-[0.12em] text-brand-gold select-none',
        className
      )}
    >
      <span className="block text-[0.7em]">BILLY</span>
      <span className="block">McCOMISKEY</span>
    </p>
  )
}
