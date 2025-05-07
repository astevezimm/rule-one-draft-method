import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import { LinksFunction } from "@remix-run/node"
import styles from "./index.css?url"
import Stars from '~/components/Stars'
import star_styles from '~/components/stars.css?url'

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: star_styles }]
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <p className="banner">This site is very much a work in progress</p>
        <Stars />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
