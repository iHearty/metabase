import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { t } from "ttag";

import CronExpressionInput from "./CronExpressionInput";
import CustomScheduleExplainer from "./CustomScheduleExplainer";
import {
  Root,
  WidgetsRow,
  WidgetContainer,
  StyledSettingSelect,
  SelectLabel,
} from "./ModelCachingScheduleWidget.styled";

const propTypes = {
  setting: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

function isCustomSchedule(setting) {
  const value = setting.value || setting.default;
  const defaultSchedules = setting.options.map(o => o.value);
  return !defaultSchedules.includes(value);
}

function formatCronExpression(cronExpression) {
  const parts = cronExpression.split(" ");
  const partsWithoutYear = parts.slice(0, -1);
  return partsWithoutYear.join(" ");
}

const PersistedModelRefreshIntervalWidget = ({
  setting,
  disabled,
  onChange,
}) => {
  const [isCustom, setCustom] = useState(isCustomSchedule(setting));
  const [customCronSchedule, setCustomCronSchedule] = useState(
    // We don't allow to specify the "year" component, but it's present in the value
    // So we need to cut it visually to avoid confusion
    isCustom ? formatCronExpression(setting.value) : "",
  );

  const handleScheduleChange = useCallback(
    nextValue => {
      if (nextValue === "custom") {
        setCustom(true);
      } else {
        setCustom(false);
        setCustomCronSchedule("");
        onChange(nextValue);
      }
    },
    [onChange],
  );

  return (
    <Root>
      <WidgetsRow>
        <WidgetContainer>
          <SelectLabel>{t`Refresh models every…`}</SelectLabel>
          <StyledSettingSelect
            className="SettingsInput--short"
            setting={{
              ...setting,
              value: isCustom ? "custom" : setting.value,
              defaultValue: setting.default,
            }}
            disabled={disabled}
            onChange={handleScheduleChange}
          />
        </WidgetContainer>
        {isCustom && (
          <WidgetContainer>
            <CronExpressionInput
              value={customCronSchedule}
              placeholder="For example 5   0   *   Aug   *"
              disabled={disabled}
              onChange={setCustomCronSchedule}
              onBlurChange={onChange}
            />
          </WidgetContainer>
        )}
      </WidgetsRow>
      {isCustom && customCronSchedule && (
        <CustomScheduleExplainer cronExpression={customCronSchedule} />
      )}
    </Root>
  );
};

PersistedModelRefreshIntervalWidget.propTypes = propTypes;

export default PersistedModelRefreshIntervalWidget;
