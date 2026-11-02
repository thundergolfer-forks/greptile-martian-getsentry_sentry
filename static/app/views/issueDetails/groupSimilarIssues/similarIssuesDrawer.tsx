import {DrawerHeader} from '@sentry/scraps/drawer';

import {
  DrawerBreadcrumbs,
  EventDrawerBody,
  EventDrawerContainer,
} from 'sentry/components/events/eventDrawer';
import {t} from 'sentry/locale';
import {GroupSimilarIssues} from 'sentry/views/issueDetails/groupSimilarIssues/similarIssues';

export function SimilarIssuesDrawer() {
  return (
    <EventDrawerContainer>
      <DrawerHeader>
        <DrawerBreadcrumbs
          current={{
            label: t('Similar Issues'),
          }}
        />
      </DrawerHeader>
      <EventDrawerBody>
        <GroupSimilarIssues />
      </EventDrawerBody>
    </EventDrawerContainer>
  );
}
