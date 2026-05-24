import { createFileRoute } from "@tanstack/react-router";
import { LumoraApp } from "@/components/LumoraApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <LumoraApp />;
}
