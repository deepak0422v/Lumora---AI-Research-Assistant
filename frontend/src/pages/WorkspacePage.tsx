import AppLayout from "../components/layout/AppLayout";
import HeroSection from "../components/workspace/HeroSection";
import { useWorkspace } from "../hooks/useWorkspace";

export default function WorkspacePage() {
  const workspace = useWorkspace();

  return (
    <AppLayout workspace={workspace}>
      <HeroSection workspace={workspace} />
    </AppLayout>
  );
}