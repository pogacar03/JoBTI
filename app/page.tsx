import { HomeHero } from '@/components/HomeHero';
import { createPreviewOrder } from '@/lib/preview';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <HomeHero initialOrder={createPreviewOrder()} />;
}
