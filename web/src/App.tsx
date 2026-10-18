import { CRM } from "@/components/atomic-crm/root/CRM";
import darkModeLogo from "@/components/atomic-crm/root/logos/logo_profiletter_dark.svg";
import lightModeLogo from "@/components/atomic-crm/root/logos/logo_profiletter_light.svg";

/**
 * Profiletter — Atomic CRM customized for Stranke, Leads, and Chat.
 */
const App = () => (
  <CRM
    title="Profiletter"
    currency="EUR"
    disableTelemetry
    darkModeLogo={darkModeLogo}
    lightModeLogo={lightModeLogo}
    dealStages={[
      { value: "opportunity", label: "New Lead" },
      { value: "proposal-sent", label: "Proposal Sent" },
      { value: "in-negociation", label: "In Negotiation" },
      { value: "won", label: "Won" },
      { value: "lost", label: "Lost" },
      { value: "delayed", label: "Delayed" },
    ]}
  />
);

export default App;
