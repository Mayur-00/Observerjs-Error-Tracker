import { ErrorView } from "../../../components/error-view";

export default async function ErrorPage({
  params,
}: {
  params: Promise<{ errorId: string }>;
}) {
  const { errorId } = await params;
  return <ErrorView errorId={errorId} />;
}
