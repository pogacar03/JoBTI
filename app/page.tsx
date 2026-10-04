import { HomeHero } from '@/components/HomeHero';
import { createPreviewOrder } from '@/lib/preview';

export default function HomePage() {
  return <HomeHero initialOrder={createPreviewOrder()} />;
}
