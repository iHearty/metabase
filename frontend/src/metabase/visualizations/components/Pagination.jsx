/* eslint-disable react/prop-types */
import React from "react";
import cx from "classnames";
import Icon from "metabase/components/Icon";
import styles from "./Pagination.css";

const Pagination = ({
  total,
  page,
  pageSize = 10,
  pagerCount = 5,
  onPageClick,
  ...props
}) => {
  const maxPage = Math.ceil(total / pageSize);
  let pages = [];

  if (pagerCount >= maxPage) {
    pages = [...Array(maxPage)].map((d, i) => i + 1);
  } else {
    const halfPagerCount = (pagerCount - 3) / 2;
    const _temp = [...Array(pagerCount - 2)]
      .map((d, i) => i)
      .map(d => -1 * halfPagerCount + d);
    let middleParts = _temp.map(d => d + page);
    const offset = middleParts[0] - 2;
    middleParts =
      offset > 0 ? middleParts : middleParts.map(d => d + Math.abs(offset));

    if (middleParts[0] === 2) {
      pages = [1];
    } else if (middleParts[0] > 2) {
      pages = [1, "<*"];
    }

    if (middleParts[middleParts.length - 1] > maxPage) {
      const offset = middleParts[middleParts.length - 1] - maxPage;
      middleParts = middleParts.map(d => d - offset - 1);
      pages = [...pages, ...middleParts, maxPage];
    } else if (middleParts[middleParts.length - 1] === maxPage - 1) {
      pages = [...pages, ...middleParts, maxPage];
    } else {
      pages = [...pages, ...middleParts, "*>", maxPage];
    }
  }

  const onPageClick2 = p => onPageClick(p - 1);

  return (
    <ul className={cx(styles.Pagination)}>
      <li
        className={cx(
          "text-brand-hover px1 cursor-pointer",
          {
            disabled: page === 1,
          },
          styles.PaginationItem,
        )}
        onClick={() => onPageClick2(page - 1)}
      >
        <Icon name="triangle_left" size={10} />
      </li>
      {pages.map(d => {
        if (d === "<*") {
          return (
            <li
              className={cx(styles.PaginationItem)}
              key={d}
              onClick={() => onPageClick2(page - 5)}
            >
              <Icon name="chevronleft" size={10} />
            </li>
          );
        } else if (d === "*>") {
          return (
            <li
              className={cx(styles.PaginationItem)}
              key={d}
              onClick={() => onPageClick2(page + 5)}
            >
              <Icon name="chevronright" size={10} />
            </li>
          );
        } else {
          return (
            <li
              className={cx(styles.PaginationItem, {
                active: d === page,
              })}
              key={d}
              onClick={() => onPageClick2(d)}
            >
              {d}
            </li>
          );
        }
      })}
      <li
        className={cx(
          "text-brand-hover pr1 cursor-pointer",
          {
            disabled: maxPage === page,
          },
          styles.PaginationItem,
        )}
        onClick={() => onPageClick2(page + 1)}
      >
        <Icon name="triangle_right" size={10} />
      </li>
    </ul>
  );
};

export default Pagination;
