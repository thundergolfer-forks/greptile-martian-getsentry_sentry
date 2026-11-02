import type * as React from 'react';
import {useCallback} from 'react';
import {useInRouterContext} from 'react-router';

import type {ButtonProps} from '@sentry/scraps/button';
import {Pagination as ControlledPagination} from '@sentry/scraps/pagination';
import {useTranslation} from '@sentry/scraps/translation';

import {parseCursor} from 'sentry/utils/cursor';
import {parseLinkHeader} from 'sentry/utils/parseLinkHeader';
import {useLocation} from 'sentry/utils/useLocation';
import {useNavigate} from 'sentry/utils/useNavigate';

type PaginationQuery = Record<string, string | string[] | undefined | null>;
export type CursorHandler = (
  cursor: string | undefined,
  path: string,
  query: PaginationQuery,
  delta: number
) => void;

type Props = {
  caption?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onCursor?: CursorHandler;
  pageLinks?: string | null;
  paginationAnalyticsEvent?: (direction: string) => void;
  size?: ButtonProps['size'];
};

/** Retain Sentry's Link-header and URL behavior outside the public package. */
export function Pagination(props: Props) {
  const hasRouter = useInRouterContext();
  if (!props.onCursor) {
    return <RoutedPagination {...props} />;
  }
  return hasRouter ? (
    <LocatedCursorPagination {...props} onCursor={props.onCursor} />
  ) : (
    <CursorPagination {...props} onCursor={props.onCursor} />
  );
}

function RoutedPagination(props: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const onCursor = useCallback<CursorHandler>(
    cursor => navigate({pathname: location.pathname, query: {...location.query, cursor}}),
    [navigate, location.pathname, location.query]
  );
  return (
    <CursorPagination
      {...props}
      onCursor={onCursor}
      path={location.pathname}
      query={location.query}
    />
  );
}

function LocatedCursorPagination(props: Props & {onCursor: CursorHandler}) {
  const location = useLocation();
  return <CursorPagination {...props} path={location.pathname} query={location.query} />;
}

function CursorPagination({
  pageLinks,
  onCursor,
  path = '',
  query = {},
  paginationAnalyticsEvent,
  ...props
}: Props & {onCursor: CursorHandler; path?: string; query?: PaginationQuery}) {
  if (pageLinks === undefined || pageLinks === null) {
    return null;
  }
  const links = parseLinkHeader(pageLinks);
  return (
    <ControlledPagination
      {...props}
      previous={{
        cursor: links.previous?.cursor,
        disabled: links.previous?.results === false,
      }}
      next={{cursor: links.next?.cursor, disabled: links.next?.results === false}}
      onCursor={(cursor, delta) => {
        onCursor(cursor, path, query, delta);
        paginationAnalyticsEvent?.(delta === -1 ? 'Previous' : 'Next');
      }}
    />
  );
}

type PaginationCaptionProps = {
  cursor: string | string[] | undefined | null;
  limit: number;
  pageLength: number;
  total: number;
};

/**
 * Returns a function that formats a pagination caption like "1-25 of 100".
 */
export function useGetPaginationCaption() {
  const {tct} = useTranslation();

  return useCallback(
    ({cursor, limit, pageLength, total}: PaginationCaptionProps): React.ReactNode => {
      if (pageLength === 0) {
        return '';
      }

      const currentCursor = parseCursor(cursor);
      const offset = currentCursor?.offset ?? 0;
      const start = offset * limit + 1;
      const end = start + pageLength - 1;

      return tct('[start]-[end] of [total]', {
        start: start.toLocaleString(),
        end: end.toLocaleString(),
        total: total.toLocaleString(),
      });
    },
    [tct]
  );
}
