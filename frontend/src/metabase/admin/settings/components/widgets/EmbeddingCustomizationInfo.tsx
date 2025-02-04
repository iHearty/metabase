import React from "react";
import { t, jt } from "ttag";
import MetabaseSettings from "metabase/lib/settings";
import ExternalLink from "metabase/core/components/ExternalLink";
import SettingHeader from "../SettingHeader";

export const EmbeddingCustomizationInfo = () => {
  const setting = {
    description: jt`In order to remove the Metabase logo from embeds, you can always upgrade to one of our ${(
      <ExternalLink href={MetabaseSettings.upgradeUrl()}>
        {t`paid plans.`}
      </ExternalLink>
    )}`,
  };

  return <SettingHeader id="embedding-customization-info" setting={setting} />;
};
