const isMobileDeviceUserAgent = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

export { isMobileDeviceUserAgent }
