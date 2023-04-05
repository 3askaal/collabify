import { useContext, useEffect, useState } from 'react'
import { Box, Wrapper, Container, Row, Col, Button, Spacer } from '3oilerplate'
import { User as UserIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'react-feather'
import Logo from '../../components/logo'
import Steps from '../../components/steps'
import useSpotifyApi from '../../hooks/useSpotifyApi'
import { flatten, uniq } from 'lodash'
import slugify from 'slugify'
import { Intel, IntelContext } from '../../context/IntelContext'

export default function Playlist() {
  const { spotifyApi, accessToken, logout } = useSpotifyApi()
  const { setIntel } = useContext(IntelContext)

  const [step, setStep] = useState(0);

  const onPrev = () => {
    setStep((currentStep) => currentStep - 1)
  }

  const onNext = () => {
    setStep((currentStep) => currentStep + 1)
  }

  const fetchers: {[key: string]: 'getMyTopArtists' | 'getMyTopTracks'} = {
    artists: 'getMyTopArtists',
    tracks: 'getMyTopTracks',
  }

  useEffect(() => {
    if (!spotifyApi) return
    if (!setIntel) return

    const collectData = async (): Promise<Intel> => await ['tracks', 'artists'].reduce(async (accumulatorPromise, instance): Promise<Intel> => {
      const accumulator = await accumulatorPromise

      const items = await ['short_term', 'medium_term', 'long_term'].reduce(async (accumulatorPromise, term: any): Promise<any> => {
        const accumulator = await accumulatorPromise

        const data = await spotifyApi[fetchers[instance]]({ time_range: term, limit: 50 })
        const items = data?.body?.items.map(({ name, uri, artists, genres }: any, index: number) => ({
          id: uri,
          index,
          name,
          include: true,
          ...(instance === 'tracks' && {
            artist: artists.map(({ name }: any) => name).join(', '),
          }),
          ...(instance === 'artists' && {
            genres,
          })
        }))

        return {
          ...accumulator,
          [term]: items
        }
      }, Promise.resolve({ short_term: [], medium_term: [], long_term: [] }) as Promise<Intel>)

      let genres = {}

      if (instance === 'artists') {
        genres = Object.entries(items).reduce((accumulator, [key, value]: any) => {
          const uniqueGenres: string[] = uniq(flatten(value.map(({ genres }: any) => genres)))
          const filteredGenres = uniqueGenres
            .filter((genre1) => uniqueGenres.some((genre2) => genre1 !== genre2 && genre2.includes(genre1)))
            .map((genre, index) => ({
              id: slugify(genre),
              include: true,
              name: genre,
              index
            }))

          return {
            ...accumulator,
            [key]: filteredGenres
          }
        }, {})
      }

      return {
        ...accumulator,
        [instance]: items,
        ...(instance === 'artists' && {
          genres
        })
      }
    }, Promise.resolve({ tracks: {}, artists: {} }) as any)

    collectData().then((data) => {
      setIntel(data)
    })
  }, [spotifyApi, accessToken, setIntel])

  return (
    <>
      <Wrapper s={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt: 'm' }}>

        <Box df w100p jcc>
          <Logo small />
        </Box>

        <Box posa r='0' t='0' s={{ p: 'm' }}>
          <Button isOutline onClick={logout} s={{ p: 's', borderRadius: '100%' }}>
            <UserIcon size="14" />
          </Button>
        </Box>

        <Container s={{ maxWidth: '480px', justifyContent: 'center', flexGrow: 1, overflowY: 'hidden', mt: 'm' }}>
          <Steps currentStep={step} />
        </Container>

        <Spacer s={{ justifyContent: 'center', flexDirection: 'row' }}>
          <Button onClick={onPrev} s={{ p: 's', borderRadius: '100%' }} isDisabled={step === 0}>
            <ArrowLeftIcon />
          </Button>
          <Button onClick={onNext} s={{ p: 's', borderRadius: '100%' }}>
            <ArrowRightIcon />
          </Button>
        </Spacer>

      </Wrapper>
    </>
  )
}
