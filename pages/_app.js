import '../styles/globals.css'
import Nav from '../components/Nav'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '64px', position: 'relative', zIndex: 1 }}>
        <Component {...pageProps} />
      </main>
    </>
  )
}
