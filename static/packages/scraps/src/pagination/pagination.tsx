import type * as React from 'react';
import styled from '@emotion/styled';
import {IconChevron} from '@sentry/icons/chevron';

import {Button, ButtonBar, type ButtonProps} from '@sentry/scraps/button';
import {Flex} from '@sentry/scraps/layout';
import {useTranslation} from '@sentry/scraps/translation/useTranslation';

export type CursorHandler = (cursor: string | undefined, delta: -1 | 1) => void;

/** Opaque cursor and availability supplied by the consumer. */
export interface PaginationPage {
  cursor?: string;
  disabled?: boolean;
}

export interface PaginationProps {
  onCursor: CursorHandler;
  caption?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  next?: PaginationPage;
  previous?: PaginationPage;
  size?: ButtonProps['size'];
}

/** Controlled pagination; cursor formats and navigation belong to consumers. */
export function Pagination({
  className,
  onCursor,
  previous,
  next,
  size = 'sm',
  caption,
  disabled = false,
}: PaginationProps) {
  const {t} = useTranslation();
  const previousDisabled =
    disabled || previous === undefined || previous.disabled === true;
  const nextDisabled = disabled || next === undefined || next.disabled === true;

  return (
    <Flex
      justify="end"
      align="center"
      margin="2xl 0 0 0"
      className={className}
      data-test-id="pagination"
    >
      {caption && <PaginationCaption>{caption}</PaginationCaption>}
      <ButtonBar>
        <Button
          icon={<IconChevron direction="left" />}
          aria-label={t('Previous')}
          size={size}
          disabled={previousDisabled}
          onClick={() => {
            onCursor(previous?.cursor, -1);
          }}
        />
        <Button
          icon={<IconChevron direction="right" />}
          aria-label={t('Next')}
          size={size}
          disabled={nextDisabled}
          onClick={() => {
            onCursor(next?.cursor, 1);
          }}
        />
      </ButtonBar>
    </Flex>
  );
}

const PaginationCaption = styled('span')`
  color: ${p => p.theme.tokens.content.secondary};
  font-size: ${p => p.theme.font.size.md};
  margin-right: ${p => p.theme.space.xl};
`;
