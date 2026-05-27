import { createFileRoute } from "@tanstack/react-router";
import { LumoraApp } from "@/components/LumoraApp";

export const Route = createFileRoute("/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();

  return <LumoraApp sessionId={sessionId} />;
}