import React from "react";
import { t } from "ttag";
import { Link } from "react-router";
import {
  Description,
  Header,
  Label,
  StyledCard,
  StyledIcon,
  MoreDetails,
} from "./EmbeddingOption.styled";

interface EmbeddingOptionProps {
  setting: {
    embedName: string;
    embedDescription: string;
    embedType: "standalone" | "full-app";
  };
}

export default function EmbeddingOption({ setting }: EmbeddingOptionProps) {
  return (
    <Link
      to={`/admin/settings/embedding_in_other_applications/${setting.embedType}`}
    >
      <StyledCard compact>
        {setting.embedType === "full-app" && <Label>{t`Paid`}</Label>}
        <Header>{setting.embedName}</Header>
        <Description>{setting.embedDescription}</Description>
        <div>
          <MoreDetails className="link">
            More details
            <StyledIcon name="triangle_right" size={7} />
          </MoreDetails>
        </div>
      </StyledCard>
    </Link>
  );
}
