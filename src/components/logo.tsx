/**
 * FINOY brand lockup — the official logo (golden sun + FINOY wordmark), served
 * as a transparent PNG so it blends with the dark navy system background.
 * Size it by height, e.g. `className="h-9 w-auto"`.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/finoy-logo.png"
      alt="FINOY"
      width={746}
      height={402}
      className={className}
    />
  );
}
