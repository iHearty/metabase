import React, { useCallback, useMemo, useState } from "react";
import { t } from "ttag";
import Filter from "metabase-lib/lib/queries/structured/Filter";
import StructuredQuery, {
  FilterSection,
  DimensionOption,
} from "metabase-lib/lib/queries/StructuredQuery";

import Question from "metabase-lib/lib/Question";
import Button from "metabase/core/components/Button";
import Tab from "metabase/core/components/Tab";
import TabContent from "metabase/core/components/TabContent";
import Icon from "metabase/components/Icon";
import BulkFilterList from "../BulkFilterList";
import TextInput from "metabase/components/TextInput";
import {
  ModalBody,
  ModalCloseButton,
  ModalDivider,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  ModalTabList,
  ModalTabPanel,
  ModalTitle,
} from "./BulkFilterModal.styled";

import { fixBetweens, searchByDimensionName } from "./utils";

export interface BulkFilterModalProps {
  question: Question;
  onClose?: () => void;
}

const BulkFilterModal = ({
  question,
  onClose,
}: BulkFilterModalProps): JSX.Element | null => {
  const [query, setQuery] = useState(getQuery(question));
  const [isChanged, setIsChanged] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const filters = useMemo(() => {
    return query.topLevelFilters();
  }, [query]);

  const sections = useMemo(() => {
    return query.topLevelFilterFieldOptionSections(null, 2, true);
  }, [query]);

  const searchItems = useMemo(() => {
    console.log({ searchQuery });
    if (searchQuery === "") {
      return null;
    }

    return sections
      .map(s => s.items)
      .flat()
      .filter((option: DimensionOption) =>
        searchByDimensionName(option.dimension, searchQuery),
      );
  }, [searchQuery, sections]);

  const handleAddFilter = useCallback((filter: Filter) => {
    setQuery(filter.add());
    setIsChanged(true);
  }, []);

  const handleChangeFilter = useCallback(
    (filter: Filter, newFilter: Filter) => {
      setQuery(filter.replace(newFilter));
      setIsChanged(true);
    },
    [],
  );

  const handleRemoveFilter = useCallback((filter: Filter) => {
    setQuery(filter.remove());
    setIsChanged(true);
  }, []);

  const handleClearSegments = useCallback(() => {
    setQuery(query.clearSegments());
    setIsChanged(true);
  }, [query]);

  const handleApplyQuery = useCallback(() => {
    const preCleanedQuery = fixBetweens(query);
    preCleanedQuery.clean().update(undefined, { run: true });
    onClose?.();
  }, [query, onClose]);

  console.log(sections);

  return (
    <ModalRoot>
      <ModalHeader>
        <ModalTitle>{getTitle(question, query)}</ModalTitle>
        <FieldSearch value={searchQuery} onChange={setSearchQuery} />
        <ModalCloseButton onClick={onClose}>
          <Icon name="close" />
        </ModalCloseButton>
      </ModalHeader>
      {sections.length === 1 || searchItems ? (
        <BulkFilterModalSection
          query={query}
          filters={filters}
          section={searchItems ? { items: searchItems } : sections[0]} // FIXME
          isSearch={!!searchItems}
          onAddFilter={handleAddFilter}
          onChangeFilter={handleChangeFilter}
          onRemoveFilter={handleRemoveFilter}
          onClearSegments={handleClearSegments}
        />
      ) : (
        <BulkFilterModalSectionList
          query={query}
          filters={filters}
          sections={sections}
          onAddFilter={handleAddFilter}
          onChangeFilter={handleChangeFilter}
          onRemoveFilter={handleRemoveFilter}
          onClearSegments={handleClearSegments}
        />
      )}
      <ModalDivider />
      <ModalFooter>
        <Button onClick={onClose}>{t`Cancel`}</Button>
        <Button
          primary
          disabled={!isChanged}
          onClick={handleApplyQuery}
        >{t`Apply`}</Button>
      </ModalFooter>
    </ModalRoot>
  );
};

interface BulkFilterModalSectionProps {
  query: StructuredQuery;
  filters: Filter[];
  section: FilterSection;
  isSearch?: boolean;
  onAddFilter: (filter: Filter) => void;
  onChangeFilter: (filter: Filter, newFilter: Filter) => void;
  onRemoveFilter: (filter: Filter) => void;
  onClearSegments: () => void;
}

const BulkFilterModalSection = ({
  query,
  filters,
  section,
  isSearch,
  onAddFilter,
  onChangeFilter,
  onRemoveFilter,
  onClearSegments,
}: BulkFilterModalSectionProps): JSX.Element => {
  return (
    <ModalBody>
      <BulkFilterList
        query={query}
        filters={filters}
        options={section.items}
        onAddFilter={onAddFilter}
        onChangeFilter={onChangeFilter}
        onRemoveFilter={onRemoveFilter}
        onClearSegments={onClearSegments}
      />
    </ModalBody>
  );
};

interface BulkFilterModalSectionListProps {
  query: StructuredQuery;
  filters: Filter[];
  sections: FilterSection[];
  onAddFilter: (filter: Filter) => void;
  onChangeFilter: (filter: Filter, newFilter: Filter) => void;
  onRemoveFilter: (filter: Filter) => void;
  onClearSegments: () => void;
}

const BulkFilterModalSectionList = ({
  query,
  filters,
  sections,
  onAddFilter,
  onChangeFilter,
  onRemoveFilter,
  onClearSegments,
}: BulkFilterModalSectionListProps): JSX.Element => {
  const [tab, setTab] = useState(0);

  return (
    <TabContent value={tab} onChange={setTab}>
      <ModalTabList>
        {sections.map((section, index) => (
          <Tab key={index} value={index}>
            {section.name}
          </Tab>
        ))}
      </ModalTabList>
      <ModalDivider />
      {sections.map((section, index) => (
        <ModalTabPanel key={index} value={index}>
          <BulkFilterModalSection
            query={query}
            filters={filters}
            section={section}
            onAddFilter={onAddFilter}
            onChangeFilter={onChangeFilter}
            onRemoveFilter={onRemoveFilter}
            onClearSegments={onClearSegments}
          />
        </ModalTabPanel>
      ))}
    </TabContent>
  );
};

const getQuery = (question: Question) => {
  const query = question.query();

  if (query instanceof StructuredQuery) {
    return query;
  } else {
    throw new Error("Native queries are not supported");
  }
};

const getTitle = (question: Question, query: StructuredQuery) => {
  const table = query.table();

  if (question.isSaved()) {
    return t`Filter ${question.displayName()}`;
  } else if (table) {
    return t`Filter ${table.displayName()}`;
  } else {
    return t`Filter`;
  }
};

const FieldSearch = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): JSX.Element => {
  return (
    <div style={{ marginRight: 20 }}>
      <TextInput
        hasClearButton
        placeholder={t`Find a field`}
        value={value}
        onChange={onChange}
        padding="sm"
        borderRadius="md"
        icon={<Icon name="search" size={16} />}
      />
    </div>
  );
};

export default BulkFilterModal;
