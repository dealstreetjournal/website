import React from 'react'
import HomeSlider from '../components/HomeSlider'
import HomeWorldSection from '../components/HomeWorldSection'
import HomeDsjSlider from '../components/HomeDsjSlider'
import HomeSeedAndGrowthSection from '../components/HomeSeedAndGrowthSection'
import HomeMAAndPreeseedSection from '../components/HomeMAAndPreseedSection'
import HomeIpoAndDsjSection from '../components/HomeIpoAndDsjSection'
import { useQuery } from '@tanstack/react-query'
import {
  getFunding,
  getIPO,
  getLatestDeals,
  getMAPreseed,
  getSeedGrowth,
  getSliders,
  getWorldDeals,
} from '../api/homeApi'
// import spinner from '../assets/spinner.png'
import ErrorPage from './ErrorPages'
import { useInView } from 'react-intersection-observer'

const Home = () => {
  document.title = 'Deal Street Journal'

  const slidersQuery = useQuery({
    queryKey: ['sliders'],
    queryFn: getSliders,
  })

  const worldQuery = useQuery({
    queryKey: ['worldDeals'],
    queryFn: getWorldDeals,
  })

  const latestQuery = useQuery({
    queryKey: ['latestQuery'],
    queryFn: getLatestDeals,
  })

  const { ref: seedRef, inView: seedInView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  })

  const { ref: maRef, inView: maInView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  })

  const seedGrowthQuery = useQuery({
    queryKey: ['seedGrowth'],
    queryFn: getSeedGrowth,
    enabled: seedInView, // 👈 only fetch when visible
  })

  const fundingQuery = useQuery({
    queryKey: ['funding'],
    queryFn: getFunding,
    enabled: seedInView,
  })

  const maQuery = useQuery({
    queryKey: ['ma'],
    queryFn: getMAPreseed,
    enabled: maInView,
  })

  const ipoQuery = useQuery({
    queryKey: ['ipo'],
    queryFn: getIPO,
    enabled: maInView,
  })

  // console.log('Sliders data:', slidersQuery.data)
  // console.log('World deals data:', worldQuery.data)
  // console.log('Latest deals data:', latestQuery.data)
  // console.log('Seed and Growth data:', seedGrowthQuery.data)
  // console.log('Funding data:', fundingQuery.data)
  // console.log('MA and Preseed data:', maQuery.data)
  // console.log('IPO data:', ipoQuery.data)

  return (
    <>
      {slidersQuery?.data && <HomeSlider data={slidersQuery.data} />}

      {worldQuery?.data && <HomeWorldSection data={worldQuery.data} />}

      {latestQuery?.data && (
        <HomeDsjSlider data={latestQuery.data} heading="Latest Deal" />
      )}

      <div ref={seedRef}>
        {seedGrowthQuery?.data && (
          <HomeSeedAndGrowthSection
            seedData={seedGrowthQuery.data?.seed}
            growthData={seedGrowthQuery.data?.growth}
          />
        )}

        {fundingQuery?.data && (
          <HomeDsjSlider data={fundingQuery.data} heading="Funding 365" />
        )}
      </div>

      <div ref={maRef}>
        {maQuery?.data && (
          <HomeMAAndPreeseedSection
            maData={maQuery.data?.ma}
            preseedData={maQuery.data?.preseed}
          />
        )}

        {ipoQuery?.data && <HomeIpoAndDsjSection data={ipoQuery.data} />}
      </div>
    </>
  )
}

export default Home
