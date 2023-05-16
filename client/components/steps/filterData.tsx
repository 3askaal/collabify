import { useContext, useState } from 'react'
import { Spacer, Box, ElementGroup, Button, Select, Title } from '3oilerplate'
import { orderBy, remove, startCase } from 'lodash'
import { SelectionLabel } from '..'
import { IntelContext } from '../../context/IntelContext'
import { IData } from '../../../server/types/playlist'
import { ScrollContainer } from '../scrollContainer'

type DataTypes = 'artists' | 'tracks' | 'genres';
type TermTypes = 'short_term' | 'medium_term' | 'long_term';

export function FilterData() {
  const { data, setData } = useContext(IntelContext)

  const [activeTab, setActiveTabState] = useState<DataTypes>('genres')
  const [activeTerm, setActiveTerm] = useState<{ artists: TermTypes, tracks: TermTypes, genres: TermTypes }>({ artists: 'short_term', tracks: 'short_term', genres: 'short_term' })

  const topTracks = data && data.tracks ? data.tracks[activeTerm.tracks] : []
  const topArtists = data && data.artists ? data.artists[activeTerm.artists] : []
  const topGenres = data && data.genres ? data.genres[activeTerm.genres] : []

  const setActiveTab = (activeTab: DataTypes) => {
    setActiveTabState(activeTab)
    setActiveTerm({...activeTerm, [activeTab]: 'short_term' })
  }

  const toggleItem = (type: DataTypes, term: TermTypes, id: string) => {
    const currentTypeData = data![type]
    const currentTermData = currentTypeData ? currentTypeData[term] : []

    const currentItem = remove(currentTermData, { id })[0];
    currentItem.include = !currentItem.include;

    const updatedTracks = orderBy(
      [...currentTermData, currentItem],
      ['include', 'index'],
      ['desc', 'asc']
    );

    setData && setData((currentIntel: IData) => ({
      ...currentIntel,
      [type]: {
        ...currentIntel[type],
        [term]: updatedTracks
      }
    }))
  }

  return (
    <Box s={{ display: 'grid', gridTemplateRows: 'auto auto auto minmax(0, 1fr)', gap: 'm' }}>
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
        { activeTab === 'genres' ? (
          <Box df fdr fww jcc>
            { topGenres.map(({ id, index, name, include }) => (
              <SelectionLabel
                onClick={() => toggleItem('genres', activeTerm.genres, id)}
                key={`genre-${index}`}
                active={include}
              >
                { startCase(name) }
              </SelectionLabel>
            )) }
          </Box>
        ) : null }

        { activeTab === 'artists' ? (
          <Box df fdr fww jcc>
            { topArtists.map(({ id, index, name, include }) => (
              <SelectionLabel
                onClick={() => toggleItem('artists', activeTerm.artists, id)}
                key={`artist-${index}`}
                active={include}
              >
                { name }
              </SelectionLabel>
            )) }
          </Box>
        ) : null }

        { activeTab === 'tracks' ? (
          <Box>
            { topTracks.map(({ id, index, artist, name, include }) => (
              <SelectionLabel
                onClick={() => toggleItem('tracks', activeTerm.tracks, id)}
                key={`track-${index}`}
                active={include}
              >
                { artist } - { name }
              </SelectionLabel>
            )) }
          </Box>
        ) : null }
      </ScrollContainer>
    </Box>
  )
}
