import React from 'react'
import HomeSlider from '../components/HomeSlider'
import HomeWorldSection from '../components/HomeWorldSection'
import HomeDsjSlider from '../components/HomeDsjSlider'
import HomeSeedAndGrowthSection from '../components/HomeSeedAndGrowthSection'
import HomeMAAndPreeseedSection from '../components/HomeMAAndPreseedSection'
import HomeIpoAndDsjSection from '../components/HomeIpoAndDsjSection'
import { useQuery } from '@tanstack/react-query'
import { home } from '../api/homeApi'
import spinner from '../assets/spinner.png'
import ErrorPage from './ErrorPages'

const Home = () => {
  document.title = 'Deal Street Journal'

  const {
    isPending,
    isError,
    data: homeData,
    error,
  } = useQuery({
    queryKey: ['home'],
    queryFn: home,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img
          src={spinner}
          alt="Loading"
          loading="lazy"
          className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
        />
      </div>
    )
  }

  if (isError) {
    return <ErrorPage data={error.message} />
  }

  return (
    <>
      <HomeSlider data={homeData?.sliders} />
      <HomeWorldSection data={homeData?.worldDeals} />
      <HomeDsjSlider
        data={homeData?.dsjSliders.latest}
        heading="Latest Deal"
      />
      <HomeSeedAndGrowthSection
        seedData={homeData?.seedDeals}
        growthData={homeData?.growthDeals}
      />
      <HomeDsjSlider data={homeData?.dsjSliders.funding} heading="Funding 365" />
      <HomeMAAndPreeseedSection
        maData={homeData?.maDeals}
        preseedData={homeData?.preseedDeals}
      />
      <HomeIpoAndDsjSection data={homeData?.ipoDeals} />
    </>
  )
}

export default Home
