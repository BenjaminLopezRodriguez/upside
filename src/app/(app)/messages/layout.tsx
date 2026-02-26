/**
 * Messages page uses useSearchParams(); opting out of static prerender
 * so the route is rendered on demand.
 * @see https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
 */
export const dynamic = "force-dynamic";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
