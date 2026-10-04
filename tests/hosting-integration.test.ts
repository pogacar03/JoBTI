import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('EdgeOne hosting integration', () => {
  it('does not inject the unavailable Vercel Analytics endpoint', () => {
    const layout = readFileSync(resolve(process.cwd(), 'app/layout.tsx'), 'utf8');
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));

    expect(layout).not.toContain('@vercel/analytics');
    expect(packageJson.dependencies).not.toHaveProperty('@vercel/analytics');
  });
});
