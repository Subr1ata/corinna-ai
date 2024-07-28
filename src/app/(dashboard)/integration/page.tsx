import { onGetPaymentConnected } from "@/actions/settings";
import InfoBar from "@/components/infobar";
import IntegrationsList from "@/components/integrations";
export const dynamic = "force-dynamic";

const IntegrationsPage = async () => {
  const payment = await onGetPaymentConnected();

  const connections = {
    stripe: payment ? true : false,
  };

  return (
    <>
      <InfoBar />
      <IntegrationsList connections={connections} />
    </>
  );
};

export default IntegrationsPage;
