import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { THEME } from '../style/theme'
import { ThemeProvider } from 'styled-components'
import { DataContext } from '../context/DataContext'

export const CustomRender = (
  ui: any,
  { history, theme: mockedTheme, mock, ...options }: any = {},
) =>
  render(
    <ThemeProvider theme={{ ...THEME, ...mockedTheme }}>
      <DataContext.Provider value={{ ...(mock?.intel || {}) }}>
        <MemoryRouter initialEntries={history} initialIndex={0}>
          {ui}
        </MemoryRouter>
      </DataContext.Provider>
    </ThemeProvider>,
    options
  )

export default CustomRender
