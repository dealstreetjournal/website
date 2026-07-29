import React, { useEffect, useState } from 'react'
import axios from 'axios'
import redlionlogo from '../assets/redlion.jpg'
import config from '../config'
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import ConsentBanner from './ConsentBanner'

const Footer = () => {
  const date = new Date()
  const year = date.getFullYear()

  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const consentGiven = localStorage.getItem('userConsent')
    if (!consentGiven) {
      setShowConsent(true)
    } else {
      sendUserData()
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('userConsent', 'true')
    setShowConsent(false)
    sendUserData()
  }

  const sendUserData = async () => {
    try {
      // Better IP and location API with more accurate data
      const ipRes = await axios.get(config.IP_API_URL)
      const ipData = ipRes.data

      // More comprehensive device detection
      const getDeviceInfo = () => {
        const ua = navigator.userAgent
        const platform = navigator.platform

        // Check for mobile devices
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            ua
          ) ||
          /Mobile|Tablet/i.test(ua) ||
          (navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2 &&
            /MacIntel/.test(platform))

        // Check for tablet specifically
        const isTablet =
          /iPad/i.test(ua) ||
          (navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2 &&
            /MacIntel/.test(platform)) ||
          (/Android/i.test(ua) && !/Mobile/i.test(ua))

        // Determine device type
        let deviceType = 'Desktop'
        if (isTablet) {
          deviceType = 'Tablet'
        } else if (isMobile) {
          deviceType = 'Mobile'
        }

        // Get browser info
        const getBrowser = () => {
          if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
          if (ua.includes('Firefox')) return 'Firefox'
          if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
          if (ua.includes('Edg')) return 'Edge'
          return 'Unknown'
        }

        // Get OS info
        const getOS = () => {
          if (ua.includes('Windows')) return 'Windows'
          if (ua.includes('Mac OS X')) return 'macOS'
          if (ua.includes('Linux')) return 'Linux'
          if (ua.includes('Android')) return 'Android'
          if (
            ua.includes('iOS') ||
            ua.includes('iPhone') ||
            ua.includes('iPad')
          )
            return 'iOS'
          return 'Unknown'
        }

        return {
          type: deviceType,
          browser: getBrowser(),
          os: getOS(),
          userAgent: ua,
          platform: platform,
          screenResolution: `${screen.width}x${screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          touchSupport: navigator.maxTouchPoints > 0,
        }
      }

      const deviceInfo = getDeviceInfo()

      const payload = {
        // IP and location data
        ip: ipData.ip,
        location: {
          city: ipData.city,
          region: ipData.region,
          country: ipData.country_name,
          countryCode: ipData.country_code,
          latitude: ipData.latitude,
          longitude: ipData.longitude,
          timezone: ipData.timezone,
          isp: ipData.org,
        },

        // Enhanced device information
        device: {
          type: deviceInfo.type,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          userAgent: deviceInfo.userAgent,
          platform: deviceInfo.platform,
          screenResolution: deviceInfo.screenResolution,
          viewportSize: deviceInfo.viewportSize,
          touchSupport: deviceInfo.touchSupport,
          language: navigator.language,
          languages: navigator.languages,
          cookieEnabled: navigator.cookieEnabled,
          onlineStatus: navigator.onLine,
        },

        // Page information
        page: {
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
          domain: window.location.hostname,
        },

        // Timestamps
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString(),

        // Consent
        consent: true,
      }

      // console.log('Enhanced payload:', payload)

      await axios.post(config.COLLECT_URL, payload)


      return payload
    } catch (err) {
      console.error('Error collecting user data:', err)

      // Fallback with basic info if main API fails
      try {
        const fallbackPayload = {
          ip: 'unknown',
          location: 'unknown',
          device: {
            type: /Mobi|Android/i.test(navigator.userAgent)
              ? 'Mobile'
              : 'Desktop',
            userAgent: navigator.userAgent,
            language: navigator.language,
          },
          page: {
            url: window.location.href,
            title: document.title,
          },
          timestamp: new Date().toISOString(),
          consent: true,
          error: 'Primary data collection failed',
        }

        // console.log('Fallback payload:', fallbackPayload)
        return fallbackPayload
      } catch (fallbackErr) {
        console.error('Fallback data collection also failed:', fallbackErr)
        throw fallbackErr
      }
    }
  }

  return (
    <>
      {/* Consent Banner */}
      {showConsent && <ConsentBanner onAccept={handleAccept} />}

      {/* Footer */}
      <div className="bg-[#e0e3ea] py-5">
        <div className="max-w-7xl mx-auto flex sm:flex-row flex-col justify-between gap-5 p-5">
          {/* our office */}
          <div>
            <h4 className="font-aptos-bold mb-3 text-gray-800">Our Office</h4>
            <div className="font-aptos-regular flex flex-col gap-4 items-start">
              <div className="flex flex-col gap-2 text-gray-600 justify-center items-start">
                <p>
                  409, World Trade Centre, Babar Road, Connaught Place,
                  Delhi-110001
                </p>
                <p>+91 9560 - 7143 - 99</p>
                <p>(10am - 6pm, Monday - Saturday)</p>
                <p>support@dealstreetjournal.com</p>
              </div>

              <div className="flex items-center gap-5 text-gray-600">
                <FaXTwitter
                  size={20}
                  className="hover:text-black transition-colors cursor-pointer"
                />
                <FaLinkedin
                  size={20}
                  className="hover:text-blue-700 transition-colors cursor-pointer"
                />
                <FaInstagram
                  size={20}
                  className="hover:text-pink-500 transition-colors cursor-pointer"
                />
                <FaFacebook
                  size={20}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-5 sm:mt-0">
            <h4 className="font-aptos-bold mb-3 text-gray-800">Quick Links</h4>
            <div className="flex justify-between items-start sm:gap-x-8 font-aptos-regular">
              <div className="flex flex-col text-gray-600 gap-2">
                <Link to="preseed">Pre Seed</Link>
                <Link to="seed">Seed</Link>
                <Link to="growth">Growth</Link>
                <Link to="ma">M&A</Link>
              </div>
              <div className="flex flex-col text-gray-600 gap-2">
                <Link to="ipo">Ipo</Link>
                <Link to="world">World</Link>
                <Link to="blog">Opinion</Link>
                <Link to="login">Login</Link>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div className="mt-5 sm:mt-0">
            <h4 className="font-aptos-bold mb-3 text-gray-800">Explore</h4>
            <div className="flex flex-col justify-between text-gray-600 items-start gap-2 font-aptos-regular">
              <Link to="latest">Latest Deal</Link>
              <Link to="funding">Funding365</Link>
              <Link to="financial">Financial Insight</Link>
            </div>
          </div>

          {/* company */}
          <div className="mt-5 sm:mt-0">
            <h4 className="font-aptos-bold mb-3 text-gray-800">Company</h4>
            <div className="flex flex-col items-start gap-2 font-aptos-regular text-gray-600">
              <Link to="about-us">About Us</Link>
              <Link to="terms-of-services">Terms of Services</Link>
              <Link to="privacy-policy">Privacy Policy</Link>
              <Link to="refund-policy">Refund Policy</Link>
              <Link to="contact-us">Contact Us</Link>
            </div>
          </div>
        </div>

        {/* copyright Footer */}
        <div className="border-t border-t-gray-300 pt-5 flex flex-col sm:flex-row justify-center items-center">
          <div>
            <p>
              <span className="text-gray-600 font-aptos-regular">
                &copy; {year}
              </span>
              &nbsp;
              <span className="font-aptos-semibold text-gray-800">
                {' '}
                Deal Street Journal
              </span>
              &nbsp;
              <span className="text-gray-600 font-aptos-regular">
                Powered by
              </span>
            </p>
          </div>
          <div className="w-20 h-auto">
            <img
              src={redlionlogo}
              className="mix-blend-multiply"
              alt="redlion"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Footer
