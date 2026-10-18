import { useTranslate } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Welcome = () => {
  const translate = useTranslate();

  return (
    <Card>
      <CardHeader className="px-4">
        <CardTitle>{translate("crm.dashboard.welcome_title")}</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-sm mb-4">{translate("crm.dashboard.welcome_body")}</p>
        <p className="text-sm mb-4">
          {translate("crm.dashboard.welcome_ecosystem")}
        </p>
        <p className="text-sm text-muted-foreground">
          {translate("crm.dashboard.welcome_more")}{" "}
          <a
            href="https://profiletter.com/"
            className="text-primary underline hover:no-underline"
            target="_blank"
            rel="noreferrer"
          >
            profiletter.com
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
};
