import { withAxiom } from 'next-axiom';

const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'cdn.midjourney.com', 'files.stripe.com'],
  },
};

export default withAxiom(nextConfig);
