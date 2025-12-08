import { forwardRef } from 'react';
import Link from 'next/link';

// ----------------------------------------------------------------------

interface RouterLinkProps {
  href: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ href, ...other }, ref) => <Link ref={ref} href={href} {...other} />
);

RouterLink.displayName = 'RouterLink';

export { RouterLink };