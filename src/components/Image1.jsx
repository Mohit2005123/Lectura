import Image from 'next/image'

export function Image1() {
  return (
    <Image
      src="https://cdn.prod.website-files.com/650cb1873bf1d844158df7a1/650cb1883bf1d844158df846_CircleBg.webp"
      alt=""
      width={192}  // Specify the original image width
      height={192} // Specify the original image height
      loading="lazy"
      className="hero-cricle-bg animate-spin"
      style={{
        transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(254.988deg) skew(0deg, 0deg)',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    />
  )
}