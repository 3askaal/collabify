/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Playlists from './index'
import { render } from '../../tests'

describe('Playlists Page', () => {
  it('App Router: Works with dynamic route segments', async () => {
    render(<Playlists />)
    expect(screen.getByRole('heading')).toHaveTextContent('Slug: Test')
  })
})
