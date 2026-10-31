/* pages/public/home.jsx: the public home page: only a large hero, the partners and the footer (the rest is on About us) */
import { Public_page } from '../../shell/public_page.jsx';
import { Hero } from './hero.jsx';
import { Partners_sec } from './partners_sec.jsx';

export default function Home() {
  return <Public_page><Hero /><Partners_sec /></Public_page>;
}
