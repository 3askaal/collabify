import { useContext, useState } from 'react'
import { Box, ElementGroup, Button, Select, Title } from '3oilerplate'
import { orderBy, pull, startCase } from 'lodash'
import { SelectionLabel } from '..'
import { IntelContext } from '../../context/IntelContext'
import { IObject } from '../../../server/types/playlist'
import { ScrollContainer } from '../scrollContainer'

type DataTypes = 'artists' | 'tracks' | 'genres';
type TermTypes = 'short_term' | 'medium_term' | 'long_term';

export function FilterData() {
  const { data, excludeData, setExcludeData } = useContext(IntelContext)

  const [activeTab, setActiveTabState] = useState<DataTypes>('genres')
  const [activeTerm, setActiveTerm] = useState<{ artists: TermTypes, tracks: TermTypes, genres: TermTypes }>({ artists: 'short_term', tracks: 'short_term', genres: 'short_term' })

  const topTracks = data && data.tracks ? data.tracks[activeTerm.tracks] : []
  const topArtists = data && data.artists ? data.artists[activeTerm.artists] : []
  const topGenres = data && data.genres ? data.genres[activeTerm.genres] : []

  const setActiveTab = (activeTab: DataTypes) => {
    setActiveTabState(activeTab)
    setActiveTerm({...activeTerm, [activeTab]: 'short_term' })
  }

  const toggleItem = (type: DataTypes, id: string) => {
    let currentTypeData = excludeData[type] || []

    if (currentTypeData.includes(id)) {
      currentTypeData = pull(currentTypeData, id)
    } else {
      currentTypeData = [...currentTypeData, id]
    }

    setExcludeData({
      ...excludeData,
      [type]: currentTypeData
    })
  }

  const isIncluded = (id: string): boolean => {
    return !Object.values(excludeData).flat().includes(id)
  }

  const orderByIncluded = (items: IObject[]): IObject[] => {
    return orderBy(items, ({ id }) => Object.values(excludeData).flat().includes(id))
  }

  return (
    <Box s={{ display: 'grid', gridTemplateRows: data ? 'auto auto auto minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: 'm' }}>
      {!data ? (
        <Box s={{ display: 'grid', gridTemplateRows: '1fr', alignItems: 'center', justifyContent: 'center' }}>Wait a second while we fetch your data...</Box>
      ) : (
        <>
          <Box df jcc>
            <Title level="4">Filter your data</Title>
          </Box>

          <ElementGroup>
            <Button
              isBlock
              isOutline={activeTab !== 'genres'}
              onClick={() => setActiveTab('genres')}
            >
              Genres
            </Button>
            <Button
              isBlock
              isOutline={activeTab !== 'artists'}
              onClick={() => setActiveTab('artists')}
            >
              Artists
            </Button>
            <Button
              isBlock
              isOutline={activeTab !== 'tracks'}
              onClick={() => setActiveTab('tracks')}
            >
              Tracks
            </Button>
          </ElementGroup>

          <Select
            options={[
              {
                label: 'Short Term',
                value: 'short_term',

              },
              {
                label: 'Medium Term',
                value: 'medium_term',

              },
              {
                label: 'Long Term',
                value: 'long_term',

              },
            ]}
            value={activeTerm[activeTab]}
            onChange={(value: string) => setActiveTerm({...activeTerm, [activeTab]: value })}
          />

          <ScrollContainer>
            { activeTab === 'genres' && (
              <Box df fdr fww jcc>
                { orderByIncluded(topGenres).map(({ id, index, name }) => (
                  <SelectionLabel
                    onClick={() => toggleItem('genres', id)}
                    key={`genre-${index}`}
                    active={isIncluded(id)}
                  >
                    { startCase(name) }
                  </SelectionLabel>
                )) }
              </Box>
            ) }

            { activeTab === 'artists' && (
              <Box df fdr fww jcc>
                { orderByIncluded(topArtists).map(({ id, index, name }) => (
                  <SelectionLabel
                    onClick={() => toggleItem('artists', id)}
                    key={`artist-${index}`}
                    active={isIncluded(id)}
                  >
                    { name }
                  </SelectionLabel>
                )) }
              </Box>
            ) }

            { activeTab === 'tracks' && (
              <Box>
                { orderByIncluded(topTracks).map(({ id, index, artist, name }) => (
                  <SelectionLabel
                    onClick={() => toggleItem('tracks', id)}
                    key={`track-${index}`}
                    active={isIncluded(id)}
                  >
                    { artist } - { name }
                  </SelectionLabel>
                )) }
              </Box>
            ) }
          </ScrollContainer>
        </>
      )}
    </Box>
  )
}
