import type * as React from 'react';
import {ThemeProvider} from '@emotion/react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {lightTheme} from '@sentry/scraps/theme';

import {Pagination} from './index';

function ThemeWrapper({children}: {children: React.ReactNode}) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

it('supports opaque cursors and keyboard navigation without a router', async () => {
  const onCursor = jest.fn();
  render(
    <Pagination
      previous={{cursor: 'before'}}
      next={{cursor: 'after'}}
      onCursor={onCursor}
    />,
    {wrapper: ThemeWrapper}
  );
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  expect(onCursor).toHaveBeenLastCalledWith('before', -1);
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  expect(onCursor).toHaveBeenLastCalledWith('after', 1);
});

it('disables unavailable directions and responds to controlled updates', async () => {
  const onCursor = jest.fn();
  const {rerender} = render(<Pagination next={{cursor: 'after'}} onCursor={onCursor} />, {
    wrapper: ThemeWrapper,
  });
  expect(screen.getByRole('button', {name: 'Previous'})).toBeDisabled();
  expect(screen.getByRole('button', {name: 'Next'})).toBeEnabled();
  rerender(
    <Pagination
      previous={{cursor: 'before'}}
      next={{cursor: 'after', disabled: true}}
      onCursor={onCursor}
    />
  );
  expect(screen.getByRole('button', {name: 'Previous'})).toBeEnabled();
  expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
  await userEvent.click(screen.getByRole('button', {name: 'Next'}));
  expect(onCursor).not.toHaveBeenCalled();
});

it('disables interaction during loading while preserving caption', async () => {
  const onCursor = jest.fn();
  render(
    <Pagination
      previous={{cursor: 'before'}}
      next={{cursor: 'after'}}
      onCursor={onCursor}
      disabled
      caption="1–25 of 100"
    />,
    {wrapper: ThemeWrapper}
  );
  expect(screen.getByText('1–25 of 100')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', {name: 'Next'}));
  await userEvent.click(screen.getByRole('button', {name: 'Previous'}));
  expect(onCursor).not.toHaveBeenCalled();
});

it('reports directions after enabled clicks', async () => {
  const onCursor = jest.fn();
  render(<Pagination previous={{}} next={{}} onCursor={onCursor} />, {
    wrapper: ThemeWrapper,
  });
  await userEvent.click(screen.getByRole('button', {name: 'Previous'}));
  expect(onCursor).toHaveBeenLastCalledWith(undefined, -1);
  await userEvent.click(screen.getByRole('button', {name: 'Next'}));
  expect(onCursor).toHaveBeenLastCalledWith(undefined, 1);
});
