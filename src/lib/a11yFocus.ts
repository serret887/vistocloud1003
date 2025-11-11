export function focusHeadingById(id: string) {
  const el = document.getElementById(id)
  if (el) {
    ;(el as HTMLElement).focus()
  }
}

export function announce(message: string) {
  let region = document.getElementById('aria-live-region')
  if (!region) {
    region = document.createElement('div')
    region.id = 'aria-live-region'
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-atomic', 'true')
    region.style.position = 'absolute'
    region.style.left = '-9999px'
    document.body.appendChild(region)
  }
  region.textContent = message
}


