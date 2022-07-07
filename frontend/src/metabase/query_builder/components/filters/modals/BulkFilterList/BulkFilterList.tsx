import React, { useMemo } from "react";
import { t } from "ttag";

import StructuredQuery, {
  DimensionOption,
  SegmentOption,
  isDimensionOption,
  isSegmentOption,
} from "metabase-lib/lib/queries/StructuredQuery";
import Dimension from "metabase-lib/lib/Dimension";
import EmptyState from "metabase/components/EmptyState";
import NoResults from "assets/img/no_results.svg";

import Filter from "metabase-lib/lib/queries/structured/Filter";
import { BulkFilterItem } from "../BulkFilterItem";
import { SegmentFilterSelect } from "../BulkFilterSelect";
import {
  ListRoot,
  ListRow,
  ListRowLabel,
  FilterDivider,
} from "./BulkFilterList.styled";
import { sortDimensions } from "./utils";

export interface BulkFilterListProps {
  query: StructuredQuery;
  filters: Filter[];
  isSearch?: boolean;
  options: (DimensionOption | SegmentOption)[];
  onAddFilter: (filter: Filter) => void;
  onChangeFilter: (filter: Filter, newFilter: Filter) => void;
  onRemoveFilter: (filter: Filter) => void;
  onClearSegments: () => void;
}

const BulkFilterList = ({
  query,
  filters,
  options,
  isSearch,
  onAddFilter,
  onChangeFilter,
  onRemoveFilter,
  onClearSegments,
}: BulkFilterListProps): JSX.Element => {
  const [dimensions, segments] = useMemo(
    () => [
      options.filter(isDimensionOption).sort(sortDimensions),
      options.filter(isSegmentOption),
    ],
    [options],
  );

  return (
    <ListRoot>
      {!!segments.length && (
        <SegmentListItem
          query={query}
          segments={segments}
          onAddFilter={onAddFilter}
          onRemoveFilter={onRemoveFilter}
          onClearSegments={onClearSegments}
        />
      )}
      {dimensions.map(({ dimension }, index) => (
        <BulkFilterListItem
          key={index}
          query={query}
          isSearch={isSearch}
          filters={filters}
          dimension={dimension}
          onAddFilter={onAddFilter}
          onChangeFilter={onChangeFilter}
          onRemoveFilter={onRemoveFilter}
        />
      ))}
      {!segments.length && !dimensions.length && (
        <EmptyState
          message={t`Didn't find anything`}
          illustrationElement={<img src={NoResults} />}
        />
      )}
    </ListRoot>
  );
};

interface BulkFilterListItemProps {
  query: StructuredQuery;
  filters: Filter[];
  isSearch?: boolean;
  dimension: Dimension;
  onAddFilter: (filter: Filter) => void;
  onChangeFilter: (filter: Filter, newFilter: Filter) => void;
  onRemoveFilter: (filter: Filter) => void;
}

const BulkFilterListItem = ({
  query,
  filters,
  isSearch,
  dimension,
  onAddFilter,
  onChangeFilter,
  onRemoveFilter,
}: BulkFilterListItemProps): JSX.Element => {
  const options = useMemo(() => {
    const filtersForThisDimension = filters.filter(f =>
      f.dimension()?.isSameBaseDimension(dimension),
    );
    return filtersForThisDimension.length
      ? filtersForThisDimension
      : [undefined];
  }, [filters, dimension]);

  return (
    <ListRow
      aria-label={`filter-field-${dimension.displayName()}`}
      data-testid="dimension-filter-row"
    >
      {options.map((filter, index) => (
        <>
          <BulkFilterItem
            key={index}
            query={query}
            isSearch={isSearch}
            filter={filter}
            dimension={dimension}
            onAddFilter={onAddFilter}
            onChangeFilter={onChangeFilter}
            onRemoveFilter={onRemoveFilter}
          />
          <FilterDivider />
        </>
      ))}
    </ListRow>
  );
};

interface SegmentListItemProps {
  query: StructuredQuery;
  segments: SegmentOption[];
  onAddFilter: (filter: Filter) => void;
  onRemoveFilter: (filter: Filter) => void;
  onClearSegments: () => void;
}

const SegmentListItem = ({
  query,
  segments,
  onAddFilter,
  onRemoveFilter,
  onClearSegments,
}: SegmentListItemProps): JSX.Element => (
  <>
    <ListRow
      aria-label="filter-field-Segments"
      data-testid="dimension-filter-row"
    >
      <ListRowLabel>{t`Segments`}</ListRowLabel>
      <SegmentFilterSelect
        query={query}
        segments={segments}
        onAddFilter={onAddFilter}
        onRemoveFilter={onRemoveFilter}
        onClearSegments={onClearSegments}
      />
    </ListRow>
  </>
);

export default BulkFilterList;
