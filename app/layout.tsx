import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'The Influence Experiment | Stats & Scribbles',description:'An interactive PageRank story about who knows whom, network influence, and the Silicon Valley shortcut.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
